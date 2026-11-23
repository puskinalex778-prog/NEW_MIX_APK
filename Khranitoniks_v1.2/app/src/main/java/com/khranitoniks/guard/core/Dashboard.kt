package com.khranitoniks.guard.core

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.khranitoniks.guard.service.GuardService

/** Данные для главного экрана (собираются в фоне). */
data class AppStat(val app: TrackedApp, val installedPkg: String?, val ms: Long)

/** Самые «прожорливые» приложения дня (засчитанные в лимит). */
data class TopApp(val pkg: String, val label: String, val ms: Long)

data class DashboardData(
    val childName: String,
    val screenMs: Long,
    val usedMs: Long,
    val limitMs: Long,
    val limitsEnabled: Boolean,
    val unlimited: Boolean,
    val bonusMin: Int,
    val scope: LimitScope,
    val apps: List<AppStat>,
    val top: List<TopApp>,
    val breakLeftMs: Long,
    val untilBreakMs: Long,
    val breakEveryMin: Int,
    val batteryLevel: Int,
    val plugged: Boolean,
    val temperature: Double,
    val chargeLockEnabled: Boolean,
    val chargeThreshold: Int,
    val nightEnabled: Boolean,
    val nightActive: Boolean,
    val nightStart: Int,
    val nightEnd: Int,
    val schoolEnabled: Boolean,
    val schoolActive: Boolean,
    val schoolStart: Int,
    val schoolEnd: Int,
    val permsOk: Boolean,
    val gameActive: Boolean,
    val paired: Boolean,
    val serviceAlive: Boolean,
    val fgLabel: String?,
    val fgStatus: GuardState.Status,
    val blockedCount: Int,
    val allowedCount: Int,
    val whatsNew: Boolean
)

object Dashboard {

    fun load(context: Context): DashboardData {
        val p = Prefs.get(context)
        p.migrate()
        Day.ensure(context)
        val now = System.currentTimeMillis()
        val reader = UsageReader(context)
        val usageOk = Perms.usage(context)
        val usage = if (usageOk) reader.todayUsage() else emptyMap()
        val tracked = TrackedApps.load(context)
        val stats = tracked.map { a ->
            AppStat(a, TrackedApps.installedPackage(context, a), a.packages.sumOf { usage[it] ?: 0L })
        }
        val used = maxOf(p.limitUsedMs, Rules.countedFromStats(context, usage, tracked))
        val scope = p.scope
        val top = usage.entries
            .filter { it.value >= 60_000L && Rules.isCounted(context, it.key, tracked, scope) }
            .sortedByDescending { it.value }
            .take(5)
            .map { TopApp(it.key, TrackedApps.label(context, it.key), it.value) }
        val sysScreen = if (usageOk) reader.screenTime(TimeUtil.startOfDay(), now) else -1L
        val screenMs = maxOf(p.screenMsToday, sysScreen)

        val battery = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        var level = -1
        var plugged = false
        var temp = 0.0
        if (battery != null) {
            val l = battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val s = battery.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
            if (l >= 0 && s > 0) level = l * 100 / s
            plugged = battery.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0) != 0
            temp = battery.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) / 10.0
        }
        val nightActive = p.nightEnabled && now > p.nightUnlockUntil &&
            TimeUtil.inInterval(TimeUtil.minuteOfDay(now), p.nightStartMin, p.nightEndMin)
        val schoolActive = p.schoolEnabled && now >= p.schoolOffUntil &&
            TimeUtil.inInterval(TimeUtil.minuteOfDay(now), p.schoolStartMin, p.schoolEndMin) &&
            GuardService.isSchoolDay(p.schoolDays, now)
        val fg = GuardState.lastApp
        return DashboardData(
            childName = p.childName.trim(),
            screenMs = screenMs,
            usedMs = used,
            limitMs = (p.dailyLimitMin + p.bonusMinToday) * TimeUtil.MIN,
            limitsEnabled = p.limitsEnabled,
            unlimited = p.unlimitedToday,
            bonusMin = p.bonusMinToday,
            scope = scope,
            apps = stats,
            top = top,
            breakLeftMs = (p.breakUntil - now).coerceAtLeast(0L),
            untilBreakMs = (p.breakEveryMin * TimeUtil.MIN - p.usageSinceBreakMs).coerceAtLeast(0L),
            breakEveryMin = p.breakEveryMin,
            batteryLevel = level,
            plugged = plugged,
            temperature = temp,
            chargeLockEnabled = p.chargeLockEnabled,
            chargeThreshold = p.chargeThreshold,
            nightEnabled = p.nightEnabled,
            nightActive = nightActive,
            nightStart = p.nightStartMin,
            nightEnd = p.nightEndMin,
            schoolEnabled = p.schoolEnabled,
            schoolActive = schoolActive,
            schoolStart = p.schoolStartMin,
            schoolEnd = p.schoolEndMin,
            permsOk = Perms.allRequired(context),
            gameActive = p.gameActive,
            paired = p.pairingKey.isNotEmpty(),
            serviceAlive = GuardState.alive(now),
            fgLabel = fg?.let { TrackedApps.label(context, it) },
            fgStatus = GuardState.lastAppStatus,
            blockedCount = p.blockedApps.size,
            allowedCount = p.acAllowed.size,
            whatsNew = !p.whatsNewSeen
        )
    }
}

/** Список установленных приложений с экраном запуска. */
object InstalledApps {

    data class Entry(val pkg: String, val label: String)

    fun launchable(context: Context): List<Entry> {
        val pm = context.packageManager
        val i = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        return try {
            @Suppress("DEPRECATION")
            pm.queryIntentActivities(i, 0)
                .mapNotNull { ri ->
                    val pkg = ri.activityInfo?.packageName ?: return@mapNotNull null
                    if (pkg == context.packageName) null else Entry(pkg, ri.loadLabel(pm).toString())
                }
                .distinctBy { it.pkg }
                .sortedBy { it.label.lowercase() }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
