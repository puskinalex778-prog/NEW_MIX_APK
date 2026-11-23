package com.khranitoniks.guard.core

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import android.provider.Telephony
import com.khranitoniks.guard.tools.GameMode

/**
 * Общие правила «что считается в лимит», которыми пользуются и служба, и экраны приложения.
 *
 * Режим [LimitScope.DEVICE]: считается ВСЁ, кроме разрешённых приложений:
 *  — выбранных родителем («Разрешённые всегда»);
 *  — системных: звонилка, SMS, рабочий стол, клавиатура, шторка, экраны разрешений;
 *  — системных Настроек (их закрывает отдельный «Замок настроек»).
 * Режим [LimitScope.APPS]: считаются только приложения из списка «Отслеживаемые».
 */
object Rules {

    /** Системные настройки и «оптимизаторы» производителей. */
    val SETTINGS_PACKAGES = setOf(
        "com.android.settings",
        "com.android.settings.intelligence",
        "com.google.android.packageinstaller",
        "com.android.packageinstaller",
        "com.samsung.android.packageinstaller",
        "com.miui.securitycenter",
        "com.samsung.android.lool",
        "com.samsung.android.sm",
        "com.samsung.android.sm_cn",
        "com.huawei.systemmanager",
        "com.hihonor.systemmanager",
        "com.transsion.phonemaster",
        "com.coloros.safecenter",
        "com.oplus.safecenter",
        "com.coloros.phonemanager",
        "com.vivo.permissionmanager",
        "com.iqoo.secure",
        "com.oneplus.security",
        "com.google.android.apps.wellbeing"
    )

    val ALWAYS_ALLOWED = setOf(
        "com.android.systemui", "com.android.phone", "com.android.server.telecom",
        "com.android.incallui", "com.google.android.dialer", "com.samsung.android.incallui",
        "com.android.dialer", "com.samsung.android.dialer", "com.android.emergency",
        "com.google.android.apps.safetyhub", "com.android.contacts", "com.android.mms",
        "com.google.android.apps.messaging", "com.samsung.android.messaging",
        "com.android.permissioncontroller", "com.google.android.permissioncontroller",
        "com.google.android.contacts", "com.samsung.android.app.contacts",
        "com.android.stk", "com.android.cellbroadcastreceiver", "com.google.android.cellbroadcastreceiver"
    )

    @Volatile private var allowedCache: Set<String> = emptySet()
    @Volatile private var homeCache: Set<String> = emptySet()
    @Volatile private var systemCache: Set<String> = emptySet()
    @Volatile private var cacheAt = 0L
    @Volatile private var cacheSig = ""

    fun invalidate() {
        cacheAt = 0L
    }

    private fun refresh(context: Context) {
        val p = Prefs.get(context)
        val sig = p.acAllowed.sorted().joinToString(",")
        val now = System.currentTimeMillis()
        if (now - cacheAt < 60_000L && sig == cacheSig && allowedCache.isNotEmpty()) return
        val pm = context.packageManager

        // рабочие столы (без «FallbackHome» системных Настроек)
        val homes = HashSet<String>()
        val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
        try {
            @Suppress("DEPRECATION")
            pm.resolveActivity(home, PackageManager.MATCH_DEFAULT_ONLY)?.activityInfo?.packageName?.let { homes.add(it) }
            @Suppress("DEPRECATION")
            pm.queryIntentActivities(home, 0).forEach { ri -> ri.activityInfo?.packageName?.let { homes.add(it) } }
        } catch (e: Exception) {
        }
        homes.removeAll(SETTINGS_PACKAGES)
        homes.add("com.android.systemui")

        val system = HashSet<String>(ALWAYS_ALLOWED)
        system.add(context.packageName)
        system.addAll(homes)
        try {
            GameMode.dialerPackage(context)?.let { system.add(it) }
        } catch (e: Exception) {
        }
        try {
            Telephony.Sms.getDefaultSmsPackage(context)?.let { system.add(it) }
        } catch (e: Exception) {
        }
        try {
            Settings.Secure.getString(context.contentResolver, Settings.Secure.DEFAULT_INPUT_METHOD)
                ?.substringBefore('/')?.let { system.add(it) }
        } catch (e: Exception) {
        }

        val all = HashSet<String>(system)
        all.addAll(p.acAllowed)
        homeCache = homes
        systemCache = system
        allowedCache = all
        cacheSig = sig
        cacheAt = now
    }

    /** Приложения, которые работают всегда (перерыв, лимит, ночь, учёба). */
    fun allowed(context: Context): Set<String> {
        refresh(context)
        return allowedCache
    }

    /** Системные разрешённые (без выбора родителя) — показываются в списке как «всегда разрешено». */
    fun system(context: Context): Set<String> {
        refresh(context)
        return systemCache
    }

    /** Рабочий стол, шторка, «Недавние». */
    fun homes(context: Context): Set<String> {
        refresh(context)
        return homeCache
    }

    /** Засчитывается ли приложение в дневной лимит (и блокируется ли в перерыв / ночью / в учебное время). */
    fun isCounted(context: Context, pkg: String, tracked: List<TrackedApp>, scope: LimitScope = Prefs.get(context).scope): Boolean {
        if (pkg == context.packageName) return false
        if (pkg in SETTINGS_PACKAGES) return false
        return when (scope) {
            LimitScope.DEVICE -> pkg !in allowed(context)
            LimitScope.APPS -> TrackedApps.groupOf(tracked, pkg) != null && pkg !in Prefs.get(context).acAllowed
        }
    }

    /** Сумма засчитанного времени по системной статистике. */
    fun countedFromStats(context: Context, usage: Map<String, Long>, tracked: List<TrackedApp>): Long {
        val scope = Prefs.get(context).scope
        var sum = 0L
        usage.forEach { (pkg, ms) -> if (isCounted(context, pkg, tracked, scope)) sum += ms }
        return sum
    }
}

/** Живое состояние службы для экрана «Проверка защиты» (тот же процесс, без записи на диск). */
object GuardState {
    enum class Status { NONE, ALLOWED, COUNTED, BLOCKED, OWN }

    @Volatile var lastTickAt = 0L
    @Volatile var foreground: String? = null
    @Volatile var status: Status = Status.NONE
    @Volatile var reason: BlockReason? = null
    /** Последнее открытое «обычное» приложение (не Хранитоникс и не рабочий стол) и его статус. */
    @Volatile var lastApp: String? = null
    @Volatile var lastAppStatus: Status = Status.NONE

    fun alive(now: Long = System.currentTimeMillis()): Boolean = now - lastTickAt < 15_000L
}
