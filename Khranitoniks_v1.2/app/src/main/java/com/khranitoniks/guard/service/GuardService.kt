package com.khranitoniks.guard.service

import android.app.AlarmManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.media.AudioManager
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.BlockReason
import com.khranitoniks.guard.core.Bonus
import com.khranitoniks.guard.core.Day
import com.khranitoniks.guard.core.EventLog
import com.khranitoniks.guard.core.GuardState
import com.khranitoniks.guard.core.LimitScope
import com.khranitoniks.guard.core.LogType
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.Names
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.core.Rules
import com.khranitoniks.guard.core.StatsStore
import com.khranitoniks.guard.core.TimeUtil
import com.khranitoniks.guard.core.TrackedApp
import com.khranitoniks.guard.core.TrackedApps
import com.khranitoniks.guard.core.UsageReader
import com.khranitoniks.guard.tools.GameMode
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Фоновый мониторинг (ForegroundService, тип specialUse).
 * Каждую секунду при включённом экране определяет активное приложение и применяет правила:
 * чёрный список, ночной режим, учебное время, личные лимиты приложений, дневной лимит и перерывы,
 * замок настроек, блокировку при зарядке.
 *
 * v1.2: дневной лимит по умолчанию считается для ВСЕГО устройства (кроме разрешённых приложений),
 * поэтому Instagram, YouTube и любые другие приложения, не добавленные в список, тоже тратят время.
 */
class GuardService : Service(), OverlayListener {

    private val handler = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private lateinit var prefs: Prefs
    private lateinit var reader: UsageReader
    private lateinit var bgReader: UsageReader
    private lateinit var overlay: OverlayController
    private lateinit var audio: AudioManager

    @Volatile private var todayUsage: Map<String, Long> = emptyMap()
    @Volatile private var usageAt = 0L
    @Volatile private var usageLoading = false

    private var screenOn = true
    private var lastTick = 0L
    private var lastNotifText = ""
    private var lastNotifAt = 0L
    private var lastStatsSave = 0L
    private var tracked: List<TrackedApp> = emptyList()
    private var trackedAt = 0L

    /**
     * «Липкая» блокировка: после срабатывания экран блокировки остаётся и поверх рабочего стола,
     * и поверх списка недавних приложений, пока ребёнок не нажмёт «Понятно» или условие не закончится.
     */
    private var sticky: BlockReason? = null
    private var lastSpec: OverlaySpec? = null
    private var lastBlockedPkg: String? = null
    private var lastLimitGroup: TrackedApp? = null
    private var lastHomeAt = 0L
    private var lastBlockLogged = ""

    // состояние батареи
    private var batteryLevel = -1
    private var plugged = false
    private var temperature = 0.0

    private val tick = object : Runnable {
        override fun run() {
            try {
                onTick()
            } catch (t: Throwable) {
                // не даём сервису упасть
            }
            val delay = when {
                !screenOn -> TICK_OFF_MS
                overlay.isShowing || sticky != null -> TICK_FAST_MS
                else -> TICK_MS
            }
            handler.postDelayed(this, delay)
        }
    }

    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val now = System.currentTimeMillis()
            when (intent.action) {
                Intent.ACTION_SCREEN_ON, Intent.ACTION_USER_PRESENT -> {
                    if (!screenOn) {
                        screenOn = true
                        lastTick = now
                        reader.resetForeground()
                        handler.removeCallbacks(tick)
                        handler.post(tick)
                    }
                }
                Intent.ACTION_SCREEN_OFF -> {
                    if (screenOn) {
                        if (lastTick > 0) addScreenTime((now - lastTick).coerceIn(0L, 5_000L))
                        screenOn = false
                        lastTick = now
                        sticky = null
                        overlay.hide()
                    }
                }
            }
        }
    }

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == Intent.ACTION_BATTERY_CHANGED) {
                readBattery(intent)
            } else {
                registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))?.let { readBattery(it) }
            }
            handleCharging(System.currentTimeMillis())
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        prefs = Prefs.get(this)
        prefs.migrate()
        reader = UsageReader(this)
        bgReader = UsageReader(this)
        overlay = OverlayController(this, this)
        audio = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        Notifier.createChannels(this)
        goForeground()
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        screenOn = pm.isInteractive
        registerReceiver(screenReceiver, IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_USER_PRESENT)
        })
        registerReceiver(batteryReceiver, IntentFilter().apply {
            addAction(Intent.ACTION_BATTERY_CHANGED)
            addAction(Intent.ACTION_POWER_CONNECTED)
            addAction(Intent.ACTION_POWER_DISCONNECTED)
        })?.let { readBattery(it) }
        scheduleWatchdog(this)
        lastTick = System.currentTimeMillis()
        handler.post(tick)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        goForeground()
        return START_STICKY
    }

    private fun goForeground() {
        val n = Notifier.serviceNotification(this, getString(R.string.service_text_start))
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(Notifier.ID_SERVICE, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            } else {
                startForeground(Notifier.ID_SERVICE, n)
            }
        } catch (e: Exception) {
            // система не разрешила — сервис будет перезапущен сторожем
        }
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        scheduleRestart(this)
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        try {
            unregisterReceiver(screenReceiver)
        } catch (e: Exception) {
        }
        try {
            unregisterReceiver(batteryReceiver)
        } catch (e: Exception) {
        }
        overlay.hide()
        io.shutdown()
        GuardState.lastTickAt = 0L
        if (prefs.onboardingDone) scheduleRestart(this)
        super.onDestroy()
    }

    // =====================================================================
    //  основной цикл
    // =====================================================================
    private fun onTick() {
        val now = System.currentTimeMillis()
        val dt = if (lastTick == 0L) 0L else (now - lastTick).coerceIn(0L, 5_000L)
        lastTick = now
        GuardState.lastTickAt = now
        if (Day.ensure(this, bgReader)) {
            todayUsage = emptyMap()
            usageAt = 0L
        }
        handleCharging(now)
        if (!screenOn) {
            overlay.hide()
            updateNotification(now)
            return
        }
        addScreenTime(dt)
        refreshUsage(now)
        if (now - trackedAt > 10_000L) {
            tracked = TrackedApps.load(this)
            trackedAt = now
        }
        val fg = if (Perms.usage(this)) reader.foreground() else null
        val visible = if (fg != null) reader.visiblePackages() else emptySet()
        GuardState.foreground = fg
        gameUpkeep(fg, now)

        // Во время звонка оверлей не мешает — но только если на экране звонилка/разрешённое приложение.
        // Иначе любой VoIP-звонок (Discord, Telegram) был бы «ключом» от блокировки.
        val callSafe = isInCall() && (fg == null || fg in Rules.allowed(this))
        var spec = if (callSafe) null else decide(fg, visible, now, dt)

        val stuck = sticky
        if (spec != null) {
            if (spec.reason in STICKY_REASONS) sticky = spec.reason
            lastSpec = spec
        } else if (stuck != null && !callSafe) {
            when {
                fg == packageName -> Unit // своё приложение: экран не показываем, но и не сбрасываем
                fg != null && !isNeutral(fg) -> sticky = null
                else -> {
                    spec = stickySpec(stuck, now)
                    if (spec == null) sticky = null
                }
            }
        }
        if (spec == null) {
            overlay.hide()
        } else {
            GuardState.status = GuardState.Status.BLOCKED
            GuardState.reason = spec.reason
            overlay.show(spec)
            maybeMinimize(spec, fg, now)
        }
        if (fg != null && fg != packageName && !isNeutral(fg)) {
            GuardState.lastApp = fg
            GuardState.lastAppStatus = if (spec != null) GuardState.Status.BLOCKED else GuardState.status
        }

        updateNotification(now)
        if (now - lastStatsSave > 60_000L) {
            lastStatsSave = now
            io.execute {
                try {
                    StatsStore.day(this, 0, bgReader)
                } catch (e: Exception) {
                }
            }
        }
    }

    private fun addScreenTime(dt: Long) {
        if (dt > 0) prefs.screenMsToday = prefs.screenMsToday + dt
    }

    private fun refreshUsage(now: Long) {
        if (usageLoading || now - usageAt < 15_000L || !Perms.usage(this)) return
        usageLoading = true
        io.execute {
            try {
                val u = bgReader.todayUsage()
                val t = System.currentTimeMillis()
                handler.post {
                    todayUsage = u
                    usageAt = t
                }
            } catch (e: Exception) {
            } finally {
                usageLoading = false
            }
        }
    }

    /**
     * Время, засчитанное в дневной лимит сегодня.
     * Берётся максимум из собственного посекундного счётчика службы и системной статистики Android —
     * так время не «теряется», даже если прошивка ненадолго усыпила защиту.
     */
    private fun usedToday(): Long {
        val stats = Rules.countedFromStats(this, todayUsage, tracked)
        return maxOf(prefs.limitUsedMs, stats)
    }

    /** Время в одной группе приложений сегодня (для личного лимита). */
    private fun groupToday(g: TrackedApp, fg: String?, now: Long): Long {
        var sum = g.packages.sumOf { todayUsage[it] ?: 0L }
        if (fg != null && fg in g.packages && usageAt > 0) sum += (now - usageAt).coerceAtLeast(0L)
        return sum
    }

    private fun isInCall(): Boolean {
        val m = audio.mode
        return m == AudioManager.MODE_RINGTONE || m == AudioManager.MODE_IN_CALL ||
            m == AudioManager.MODE_IN_COMMUNICATION || m == 4 || m == 5 || m == 6
    }

    // =====================================================================
    //  правила
    // =====================================================================
    /**
     * @param fg активное приложение
     * @param visible все видимые окна (активное + «картинка в картинке», разделённый экран, плавающие окна)
     */
    private fun decide(fg: String?, visible: Set<String>, now: Long, dt: Long): OverlaySpec? {
        val own = fg == packageName
        if (chargeLockActive(now) && !own) return chargingSpec()
        if (fg == null) {
            GuardState.status = GuardState.Status.NONE
            return null
        }
        val others = visible - packageName
        if (others.isEmpty()) {
            GuardState.status = GuardState.Status.OWN
            return null
        }

        if (prefs.settingsLockEnabled && now > prefs.settingsUnlockUntil && others.any { it in Rules.SETTINGS_PACKAGES }) {
            return settingsSpec()
        }

        // чёрный список — всегда, даже при «без ограничений сегодня»
        if (now >= prefs.blockedPauseUntil) {
            val blocked = prefs.blockedApps
            val b = others.firstOrNull { it in blocked }
            if (b != null) {
                lastBlockedPkg = b
                if (lastBlockLogged != b) {
                    lastBlockLogged = b
                    EventLog.add(this, LogType.BLOCKED, getString(R.string.log_blocked_open, TrackedApps.label(this, b)))
                }
                return blockedSpec(b)
            }
        }

        val scope = prefs.scope
        val counted = others.filter { Rules.isCounted(this, it, tracked, scope) }
        if (counted.isEmpty()) {
            GuardState.status = GuardState.Status.ALLOWED
            return null
        }
        val main = if (fg in counted) fg else counted.first()
        lastBlockedPkg = main

        if (nightActive(now)) return nightSpec()
        if (schoolActive(now)) return schoolSpec()

        if (!prefs.unlimitedToday) {
            // личные лимиты приложений (например, TikTok — не больше 30 минут)
            for (pkg in counted) {
                val g = TrackedApps.groupOf(tracked, pkg) ?: continue
                if (g.limitMin <= 0) continue
                val used = groupToday(g, fg, now)
                if (used >= (g.limitMin + prefs.bonusMinToday) * TimeUtil.MIN) {
                    lastLimitGroup = g
                    val s = appLimitOrSoft(now, g, used)
                    if (s != null) return s
                }
            }
        }

        if (prefs.limitsEnabled && !prefs.unlimitedToday) {
            val limitMs = (prefs.dailyLimitMin + prefs.bonusMinToday) * TimeUtil.MIN
            if (now < prefs.breakUntil) return breakOrSoft(now)
            val used = usedToday()
            if (used >= limitMs) return limitOrSoft(now, used, main)
            prefs.limitUsedMs = prefs.limitUsedMs + dt
            prefs.usageSinceBreakMs = prefs.usageSinceBreakMs + dt
            if (prefs.breakEveryMin > 0 && prefs.breakDurationMin > 0 &&
                prefs.usageSinceBreakMs >= prefs.breakEveryMin * TimeUtil.MIN
            ) {
                prefs.usageSinceBreakMs = 0L
                prefs.breakUntil = now + prefs.breakDurationMin * TimeUtil.MIN
                prefs.softNotifiedAt = 0L
                prefs.breaksTotal = prefs.breaksTotal + 1
                return breakOrSoft(now)
            }
        } else {
            // лимит выключен — время всё равно считаем для статистики и наград
            prefs.limitUsedMs = prefs.limitUsedMs + dt
        }
        GuardState.status = GuardState.Status.COUNTED
        GuardState.reason = null
        return null
    }

    private fun nightActive(now: Long): Boolean =
        prefs.nightEnabled && now > prefs.nightUnlockUntil &&
            TimeUtil.inInterval(TimeUtil.minuteOfDay(now), prefs.nightStartMin, prefs.nightEndMin)

    private fun schoolActive(now: Long): Boolean {
        if (!prefs.schoolEnabled || now < prefs.schoolOffUntil) return false
        if (!TimeUtil.inInterval(TimeUtil.minuteOfDay(now), prefs.schoolStartMin, prefs.schoolEndMin)) return false
        return isSchoolDay(prefs.schoolDays, now)
    }

    private fun chargeLockActive(now: Long): Boolean =
        prefs.chargeLockEnabled && plugged && batteryLevel in 0 until prefs.chargeThreshold &&
            !prefs.chargeUnlockUntilUnplug && now >= prefs.chargeUnlockUntil

    /** Рабочий стол, экран «Недавние», шторка — «нейтральная» территория для липкой блокировки. */
    private fun isNeutral(pkg: String): Boolean = pkg in Rules.homes(this)

    /** Повторно строит экран липкой блокировки, если её условие ещё действует. */
    private fun stickySpec(reason: BlockReason, now: Long): OverlaySpec? = when (reason) {
        BlockReason.BREAK ->
            if (prefs.limitsEnabled && !prefs.unlimitedToday && prefs.strictMode && now < prefs.breakUntil) breakOrSoft(now) else null
        BlockReason.LIMIT -> {
            val limitMs = (prefs.dailyLimitMin + prefs.bonusMinToday) * TimeUtil.MIN
            val used = usedToday()
            val pkg = lastBlockedPkg
            if (pkg != null && prefs.limitsEnabled && !prefs.unlimitedToday && prefs.strictMode && used >= limitMs) {
                limitOrSoft(now, used, pkg)
            } else null
        }
        BlockReason.APP_LIMIT -> {
            val g = lastLimitGroup
            if (g != null && !prefs.unlimitedToday && prefs.strictMode) {
                val fresh = tracked.firstOrNull { it.id == g.id }
                if (fresh != null && fresh.limitMin > 0 &&
                    groupToday(fresh, null, now) >= (fresh.limitMin + prefs.bonusMinToday) * TimeUtil.MIN
                ) lastSpec else null
            } else null
        }
        BlockReason.BLOCKED -> {
            val b = lastBlockedPkg
            if (b != null && b in prefs.blockedApps && now >= prefs.blockedPauseUntil) lastSpec else null
        }
        BlockReason.NIGHT -> if (nightActive(now)) nightSpec() else null
        BlockReason.SCHOOL -> if (schoolActive(now)) schoolSpec() else null
        BlockReason.SETTINGS_LOCK ->
            if (prefs.settingsLockEnabled && now > prefs.settingsUnlockUntil) settingsSpec() else null
        BlockReason.CHARGING -> null
    }

    /** Отправляет заблокированное приложение в фон: видео/игра останавливаются, а экран блокировки остаётся. */
    private fun maybeMinimize(spec: OverlaySpec, fg: String?, now: Long) {
        if (!prefs.autoMinimize || spec.reason !in STICKY_REASONS) return
        if (fg == null || fg == packageName || isNeutral(fg)) return
        if (now - lastHomeAt < 1_500L) return
        lastHomeAt = now
        goHome()
    }

    private fun goHome() {
        try {
            startActivity(
                Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            )
        } catch (e: Exception) {
            // нет лаунчера или запуск запрещён
        }
    }

    override fun onHome() {
        sticky = null
        goHome()
        handler.post { overlay.hide() }
    }

    private fun bonusOptions(): List<OverlayOption> = listOf(
        OverlayOption("m10", getString(R.string.opt_plus_min, 10)),
        OverlayOption("m15", getString(R.string.opt_plus_min, 15)),
        OverlayOption("m30", getString(R.string.opt_plus_min, 30)),
        OverlayOption("unlimited", getString(R.string.opt_unlimited_today))
    )

    private fun breakOrSoft(now: Long): OverlaySpec? {
        val msg = prefs.breakMessage.ifBlank { getString(R.string.ov_break_msg_default) }
        val title = Names.title(this, R.string.ov_break_title, R.string.ov_break_title_named)
        if (!prefs.strictMode) {
            if (now - prefs.softNotifiedAt > 2 * TimeUtil.MIN) {
                prefs.softNotifiedAt = now
                Notifier.alert(this, Notifier.ID_BREAK, title, msg, Mood.BREAK)
            }
            return null
        }
        return OverlaySpec(
            reason = BlockReason.BREAK,
            title = title,
            message = msg,
            big = TimeUtil.countdown(prefs.breakUntil - now),
            progress = null,
            sub = getString(R.string.ov_break_sub),
            warning = null,
            mood = Mood.BREAK,
            pinLabel = getString(R.string.ov_btn_pin),
            showCode = true,
            showHome = true,
            optionsTitle = getString(R.string.ov_options_bonus),
            options = bonusOptions()
        )
    }

    private fun limitOrSoft(now: Long, used: Long, pkg: String): OverlaySpec? {
        val msg = prefs.limitMessage.ifBlank {
            getString(if (prefs.scope == LimitScope.DEVICE) R.string.ov_limit_msg_device else R.string.ov_limit_msg_default)
        }
        val title = Names.title(this, R.string.ov_limit_title, R.string.ov_limit_title_named)
        if (!prefs.strictMode) {
            if (now - prefs.softNotifiedAt > 5 * TimeUtil.MIN) {
                prefs.softNotifiedAt = now
                Notifier.alert(this, Notifier.ID_LIMIT, title, msg, Mood.STOP)
            }
            return null
        }
        return OverlaySpec(
            reason = BlockReason.LIMIT,
            title = title,
            message = msg,
            big = null,
            progress = null,
            sub = getString(R.string.ov_limit_sub, appName(pkg), TimeUtil.duration(this, used)),
            warning = null,
            mood = Mood.STOP,
            pinLabel = getString(R.string.ov_btn_pin),
            showCode = true,
            showHome = true,
            optionsTitle = getString(R.string.ov_options_bonus),
            options = bonusOptions()
        )
    }

    private fun appLimitOrSoft(now: Long, g: TrackedApp, used: Long): OverlaySpec? {
        val title = Names.title(this, R.string.ov_app_limit_title, R.string.ov_app_limit_title_named)
        val msg = getString(R.string.ov_app_limit_msg, g.name, g.limitMin)
        if (!prefs.strictMode) {
            if (now - prefs.softNotifiedAt > 5 * TimeUtil.MIN) {
                prefs.softNotifiedAt = now
                Notifier.alert(this, Notifier.ID_LIMIT, title, msg, Mood.STOP)
            }
            return null
        }
        return OverlaySpec(
            reason = BlockReason.APP_LIMIT,
            title = title,
            message = msg,
            big = null,
            progress = null,
            sub = getString(R.string.ov_limit_sub, g.name, TimeUtil.duration(this, used)),
            warning = null,
            mood = Mood.STOP,
            pinLabel = getString(R.string.ov_btn_pin),
            showCode = true,
            showHome = true,
            optionsTitle = getString(R.string.ov_options_bonus),
            options = bonusOptions()
        )
    }

    private fun blockedSpec(pkg: String): OverlaySpec = OverlaySpec(
        reason = BlockReason.BLOCKED,
        title = Names.title(this, R.string.ov_blocked_title, R.string.ov_blocked_title_named),
        message = getString(R.string.ov_blocked_msg, appName(pkg)),
        big = null,
        progress = null,
        sub = null,
        warning = null,
        mood = Mood.ANGRY,
        pinLabel = getString(R.string.ov_btn_pin),
        showCode = false,
        showHome = true,
        optionsTitle = getString(R.string.ov_options_blocked),
        options = listOf(
            OverlayOption("b15", getString(R.string.opt_for_min, 15)),
            OverlayOption("b60", getString(R.string.opt_for_min, 60))
        )
    )

    private fun nightSpec(): OverlaySpec = OverlaySpec(
        reason = BlockReason.NIGHT,
        title = Names.title(this, R.string.ov_night_title, R.string.ov_night_title_named),
        message = getString(R.string.ov_night_msg, TimeUtil.hm(prefs.nightEndMin)),
        big = null,
        progress = null,
        sub = null,
        warning = null,
        mood = Mood.SLEEP,
        pinLabel = getString(R.string.ov_btn_pin),
        showCode = true,
        showHome = true,
        optionsTitle = getString(R.string.ov_options_night),
        options = listOf(
            OverlayOption("n15", getString(R.string.opt_for_min, 15)),
            OverlayOption("n30", getString(R.string.opt_for_min, 30)),
            OverlayOption("n60", getString(R.string.opt_for_min, 60)),
            OverlayOption("nall", getString(R.string.opt_until_morning))
        )
    )

    private fun schoolSpec(): OverlaySpec = OverlaySpec(
        reason = BlockReason.SCHOOL,
        title = Names.title(this, R.string.ov_school_title, R.string.ov_school_title_named),
        message = getString(R.string.ov_school_msg, TimeUtil.hm(prefs.schoolEndMin)),
        big = null,
        progress = null,
        sub = null,
        warning = null,
        mood = Mood.BREAK,
        pinLabel = getString(R.string.ov_btn_pin),
        showCode = true,
        showHome = true,
        optionsTitle = getString(R.string.ov_options_night),
        options = listOf(
            OverlayOption("s30", getString(R.string.opt_for_min, 30)),
            OverlayOption("sday", getString(R.string.opt_school_off_today))
        )
    )

    private fun settingsSpec(): OverlaySpec = OverlaySpec(
        reason = BlockReason.SETTINGS_LOCK,
        title = getString(R.string.ov_settings_title),
        message = getString(R.string.ov_settings_msg),
        big = null,
        progress = null,
        sub = null,
        warning = null,
        mood = Mood.ANGRY,
        pinLabel = getString(R.string.ov_btn_pin),
        showCode = false,
        showHome = true,
        optionsTitle = "",
        options = listOf(OverlayOption("unlock", getString(R.string.ov_btn_pin)))
    )

    private fun chargingSpec(): OverlaySpec {
        val threshold = prefs.chargeThreshold
        val hot = temperature > OVERHEAT_C
        val msg = prefs.chargeMessage.ifBlank { getString(R.string.ov_charge_msg_default, threshold) }
        return OverlaySpec(
            reason = BlockReason.CHARGING,
            title = Names.title(this, R.string.ov_charge_title, R.string.ov_charge_title_named),
            message = msg,
            big = "$batteryLevel%",
            progress = if (threshold > 0) batteryLevel * 100 / threshold else 0,
            sub = getString(R.string.ov_charge_sub, threshold, String.format(Locale.getDefault(), "%.1f", temperature)),
            warning = if (hot) getString(R.string.ov_overheat) else null,
            mood = if (hot) Mood.HOT else Mood.CHARGING,
            pinLabel = getString(R.string.ov_btn_emergency),
            showCode = false,
            showHome = false,
            optionsTitle = getString(R.string.ov_options_charge),
            options = listOf(
                OverlayOption("c5", getString(R.string.opt_for_min, 5)),
                OverlayOption("c15", getString(R.string.opt_for_min, 15)),
                OverlayOption("cunplug", getString(R.string.opt_until_unplug))
            )
        )
    }

    private fun appName(pkg: String): String =
        TrackedApps.groupOf(tracked, pkg)?.name ?: TrackedApps.label(this, pkg)

    // ---------- обработка выбора после PIN ----------
    override fun onOption(reason: BlockReason, optionId: String) {
        val now = System.currentTimeMillis()
        sticky = null
        val source = getString(R.string.source_pin)
        when (optionId) {
            "m10" -> Bonus.grantMinutes(this, 10, source)
            "m15" -> Bonus.grantMinutes(this, 15, source)
            "m30" -> Bonus.grantMinutes(this, 30, source)
            "unlimited" -> Bonus.grantUnlimited(this, source)
            "n15", "n30", "n60", "nall" -> {
                prefs.nightUnlockUntil = when (optionId) {
                    "n15" -> now + 15 * TimeUtil.MIN
                    "n30" -> now + 30 * TimeUtil.MIN
                    "n60" -> now + 60 * TimeUtil.MIN
                    else -> TimeUtil.nextOccurrence(prefs.nightEndMin, now)
                }
                EventLog.add(this, LogType.NIGHT_UNLOCK, getString(R.string.log_night_unlock, TimeUtil.clock(prefs.nightUnlockUntil)))
            }
            "s30", "sday" -> {
                prefs.schoolOffUntil = if (optionId == "s30") now + 30 * TimeUtil.MIN else TimeUtil.startOfDayOffset(1)
                EventLog.add(this, LogType.SCHOOL, getString(R.string.log_school_unlock, TimeUtil.clock(prefs.schoolOffUntil)))
            }
            "b15", "b60" -> {
                prefs.blockedPauseUntil = now + (if (optionId == "b15") 15 else 60) * TimeUtil.MIN
                EventLog.add(this, LogType.BLOCKED, getString(R.string.log_blocked_pause, TimeUtil.clock(prefs.blockedPauseUntil)))
            }
            "c5", "c15" -> {
                val m = if (optionId == "c5") 5 else 15
                prefs.chargeUnlockUntil = now + m * TimeUtil.MIN
                EventLog.add(this, LogType.EMERGENCY_UNLOCK, getString(R.string.log_emergency_min, m, batteryLevel))
            }
            "cunplug" -> {
                prefs.chargeUnlockUntilUnplug = true
                EventLog.add(this, LogType.EMERGENCY_UNLOCK, getString(R.string.log_emergency_unplug, batteryLevel))
            }
            "unlock" -> {
                prefs.settingsUnlockUntil = now + 5 * TimeUtil.MIN
                EventLog.add(this, LogType.SETTINGS_UNLOCK, getString(R.string.log_settings_unlock))
            }
        }
        handler.post { overlay.hide() }
    }

    override fun onCode(code: String): String? =
        when (val r = Bonus.redeem(this, code)) {
            is Bonus.RedeemResult.Ok, is Bonus.RedeemResult.Action -> {
                sticky = null
                handler.post { overlay.hide() }
                null
            }
            Bonus.RedeemResult.NotPaired -> getString(R.string.code_not_paired)
            Bonus.RedeemResult.Used -> getString(R.string.code_used)
            is Bonus.RedeemResult.Wrong -> getString(R.string.code_wrong_left, r.attemptsLeft)
            is Bonus.RedeemResult.Locked -> getString(R.string.pin_locked_sec, r.seconds)
        }

    // =====================================================================
    //  батарея
    // =====================================================================
    private fun readBattery(i: Intent) {
        val level = i.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = i.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
        if (level >= 0 && scale > 0) batteryLevel = level * 100 / scale
        plugged = i.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0) != 0
        temperature = i.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) / 10.0
    }

    private fun handleCharging(now: Long) {
        if (batteryLevel < 0) return
        val threshold = prefs.chargeThreshold
        if (plugged && !prefs.wasPlugged) {
            prefs.wasPlugged = true
            prefs.chargeSession = batteryLevel < threshold
            prefs.chargeUnlockUntilUnplug = false
            Notifier.cancel(this, Notifier.ID_LOW_BATTERY)
        } else if (!plugged && prefs.wasPlugged) {
            prefs.wasPlugged = false
            if (prefs.chargeLockEnabled && prefs.chargeSession && batteryLevel < threshold) {
                EventLog.add(
                    this, LogType.CHARGE_INTERRUPTED,
                    getString(R.string.log_charge_interrupted, batteryLevel, TimeUtil.clock(now))
                )
            }
            prefs.chargeSession = false
            prefs.chargeUnlockUntilUnplug = false
            prefs.chargeUnlockUntil = 0L
            if (overlay.reason == BlockReason.CHARGING) overlay.hide()
        }
        if (plugged && batteryLevel < threshold && !prefs.chargeSession) prefs.chargeSession = true
        if (plugged && batteryLevel >= threshold && prefs.chargeSession) {
            prefs.chargeSession = false
            if (overlay.reason == BlockReason.CHARGING) overlay.hide()
            if (prefs.chargeLockEnabled) {
                prefs.chargedTotal = prefs.chargedTotal + 1
                Notifier.alert(
                    this, Notifier.ID_CHARGED, Names.title(this, R.string.charged_title, R.string.charged_title_named),
                    getString(R.string.charged_text, threshold), Mood.CHARGED, Notifier.CH_EVENTS
                )
                Notifier.playChime(this)
                EventLog.add(this, LogType.CHARGED, getString(R.string.log_charged, threshold, TimeUtil.clock(now)))
            }
        }
        // напоминание о низком заряде (каждые 2 минуты)
        if (prefs.lowBatteryEnabled && !plugged && batteryLevel <= prefs.lowBatteryLevel &&
            now - prefs.lastLowBatteryNotify >= LOW_BATTERY_INTERVAL
        ) {
            prefs.lastLowBatteryNotify = now
            Notifier.alert(
                this, Notifier.ID_LOW_BATTERY, Names.title(this, R.string.low_battery_title, R.string.low_battery_title_named),
                getString(R.string.low_battery_text, batteryLevel), Mood.LOW
            )
        }
    }

    // =====================================================================
    //  игровой режим
    // =====================================================================
    private fun gameUpkeep(fg: String?, now: Long) {
        if (!prefs.gameActive) return
        val game = prefs.gamePackage
        if (game.isNotEmpty() && fg == game) {
            prefs.gameLastSeen = now
            if (now - prefs.gameLastKill > 120_000L) {
                prefs.gameLastKill = now
                io.execute {
                    try {
                        GameMode.killBackground(this, game)
                    } catch (e: Exception) {
                    }
                }
            }
        }
        if (game.isNotEmpty() && now - prefs.gameLastSeen > 5 * TimeUtil.MIN) {
            GameMode.disable(this)
        }
    }

    // =====================================================================
    //  постоянное уведомление
    // =====================================================================
    private fun updateNotification(now: Long) {
        if (now - lastNotifAt < 30_000L) return
        lastNotifAt = now
        val text = getString(
            R.string.service_text,
            TimeUtil.duration(this, prefs.screenMsToday),
            TimeUtil.duration(this, usedToday())
        )
        if (text != lastNotifText) {
            lastNotifText = text
            Notifier.updateService(this, text)
        }
    }

    companion object {
        private const val TICK_MS = 1_000L
        private const val TICK_FAST_MS = 500L
        private const val TICK_OFF_MS = 30_000L
        private const val LOW_BATTERY_INTERVAL = 2 * 60_000L
        const val OVERHEAT_C = 42.0
        const val ACTION_WATCHDOG = "com.khranitoniks.guard.WATCHDOG"

        /** Причины, при которых блокировка «липкая» и приложение сворачивается. */
        private val STICKY_REASONS = setOf(
            BlockReason.BREAK, BlockReason.LIMIT, BlockReason.NIGHT, BlockReason.SETTINGS_LOCK,
            BlockReason.APP_LIMIT, BlockReason.BLOCKED, BlockReason.SCHOOL
        )

        /** Учебный ли сегодня день: бит 0 — понедельник … бит 6 — воскресенье. */
        fun isSchoolDay(mask: Int, now: Long): Boolean {
            val c = Calendar.getInstance()
            c.timeInMillis = now
            val idx = (c.get(Calendar.DAY_OF_WEEK) + 5) % 7 // MONDAY(2)→0 … SUNDAY(1)→6
            return ((mask shr idx) and 1) == 1
        }

        fun start(context: Context) {
            if (!Prefs.get(context).onboardingDone) return
            try {
                context.startForegroundService(Intent(context, GuardService::class.java))
            } catch (e: Exception) {
                // запуск в фоне запрещён — сработает сторож
            }
        }

        private fun watchdogIntent(context: Context, code: Int): PendingIntent =
            PendingIntent.getBroadcast(
                context, code,
                Intent(context, StartReceiver::class.java).setAction(ACTION_WATCHDOG),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

        fun scheduleWatchdog(context: Context) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            am.setInexactRepeating(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + AlarmManager.INTERVAL_FIFTEEN_MINUTES,
                AlarmManager.INTERVAL_FIFTEEN_MINUTES,
                watchdogIntent(context, 1)
            )
        }

        fun scheduleRestart(context: Context) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            am.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime() + 3_000L, watchdogIntent(context, 2))
        }
    }
}
