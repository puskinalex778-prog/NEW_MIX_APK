package com.khranitoniks.guard.core

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build

/**
 * Точный подсчёт времени по событиям UsageStatsManager.queryEvents():
 * сопоставляются пары ACTIVITY_RESUMED / ACTIVITY_PAUSED (MOVE_TO_FOREGROUND / MOVE_TO_BACKGROUND),
 * а для экрана — SCREEN_INTERACTIVE / SCREEN_NON_INTERACTIVE.
 */
class UsageReader(context: Context) {

    private val ctx = context.applicationContext
    private val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

    // Коды событий (числа, чтобы не зависеть от уровня API при компиляции констант)
    private val RESUMED = 1          // ACTIVITY_RESUMED == MOVE_TO_FOREGROUND
    private val PAUSED = 2           // ACTIVITY_PAUSED == MOVE_TO_BACKGROUND
    private val SCREEN_ON = 15       // SCREEN_INTERACTIVE (API 28)
    private val SCREEN_OFF = 16      // SCREEN_NON_INTERACTIVE (API 28)
    private val SHUTDOWN = 26        // DEVICE_SHUTDOWN (API 29)

    /** Время в каждом приложении за интервал [start, end). */
    fun appUsage(start: Long, end: Long): Map<String, Long> {
        val result = HashMap<String, Long>()
        val events = try {
            usm.queryEvents(start, end)
        } catch (e: Exception) {
            null
        } ?: return result
        val e = UsageEvents.Event()
        var cur: String? = null
        var curStart = 0L
        val seen = HashSet<String>()

        fun close(t: Long) {
            val c = cur ?: return
            val d = t - curStart
            if (d > 0) result[c] = (result[c] ?: 0L) + d
            cur = null
        }

        while (events.hasNextEvent()) {
            events.getNextEvent(e)
            val pkg = e.packageName ?: continue
            val t = e.timeStamp
            when (e.eventType) {
                RESUMED -> {
                    if (cur != pkg) {
                        close(t)
                        cur = pkg
                        curStart = t
                    }
                    seen.add(pkg)
                }
                PAUSED -> {
                    if (cur == pkg) {
                        close(t)
                    } else if (cur == null && pkg !in seen) {
                        // приложение было открыто ещё до начала интервала (например, до 00:00)
                        val d = t - start
                        if (d > 0) result[pkg] = (result[pkg] ?: 0L) + d
                    }
                    seen.add(pkg)
                }
                SCREEN_OFF, SHUTDOWN -> close(t)
            }
        }
        val now = System.currentTimeMillis()
        if (cur != null) close(minOf(end, now))
        return result
    }

    fun todayUsage(): Map<String, Long> = appUsage(TimeUtil.startOfDay(), System.currentTimeMillis())

    /** Время включённого экрана по системным событиям (Android 9+), либо -1 если недоступно. */
    fun screenTime(start: Long, end: Long): Long {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return -1L
        val events = try {
            usm.queryEvents(start, end)
        } catch (e: Exception) {
            null
        } ?: return -1L
        val e = UsageEvents.Event()
        var onSince = -1L
        var total = 0L
        var any = false
        var first = true
        while (events.hasNextEvent()) {
            events.getNextEvent(e)
            when (e.eventType) {
                SCREEN_ON -> {
                    any = true
                    if (onSince < 0) onSince = e.timeStamp
                    first = false
                }
                SCREEN_OFF, SHUTDOWN -> {
                    any = true
                    if (onSince >= 0) {
                        total += e.timeStamp - onSince
                    } else if (first) {
                        total += e.timeStamp - start
                    }
                    onSince = -1
                    first = false
                }
            }
        }
        if (onSince >= 0) total += minOf(end, System.currentTimeMillis()) - onSince
        return if (any) total else -1L
    }

    // ---------- текущее активное приложение ----------
    private var fgPackage: String? = null
    private var lastQuery = 0L

    /**
     * Видимые сейчас окна приложений: «пакет/класс» → время ACTIVITY_RESUMED.
     * Окно удаляется только по ACTIVITY_STOPPED (Android 10+), поэтому сюда попадают
     * и приложения в «картинке в картинке», в разделённом экране и в плавающем окне —
     * их нельзя «свернуть», чтобы обойти блокировку.
     */
    private val visibleWindows = HashMap<String, Long>()

    /** Активное приложение на экране (инкрементальный опрос событий). */
    fun foreground(): String? {
        val now = System.currentTimeMillis()
        val from = if (lastQuery == 0L) now - 6 * TimeUtil.HOUR else lastQuery - 1500
        val events = try {
            usm.queryEvents(from, now)
        } catch (e: Exception) {
            null
        }
        lastQuery = now
        if (events != null) {
            val e = UsageEvents.Event()
            while (events.hasNextEvent()) {
                events.getNextEvent(e)
                val pkg = e.packageName ?: continue
                when (e.eventType) {
                    RESUMED -> {
                        fgPackage = pkg
                        visibleWindows[pkg + "/" + (e.className ?: "")] = e.timeStamp
                    }
                    STOPPED -> visibleWindows.remove(pkg + "/" + (e.className ?: ""))
                }
            }
        }
        return fgPackage
    }

    /**
     * Все пакеты, чьи окна сейчас видны (включая активное).
     * Вызывать после [foreground]. На Android 9 и ниже событий STOPPED нет — возвращается только активное.
     */
    fun visiblePackages(): Set<String> {
        val fg = fgPackage
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return if (fg != null) setOf(fg) else emptySet()
        val now = System.currentTimeMillis()
        // страховка от «зависших» записей (процесс убит без события STOPPED)
        visibleWindows.entries.removeAll { (k, t) -> k.substringBefore('/') != fg && now - t > STALE_MS }
        val out = HashSet<String>()
        visibleWindows.keys.forEach { out.add(it.substringBefore('/')) }
        if (fg != null) out.add(fg)
        return out
    }

    fun resetForeground() {
        fgPackage = null
        lastQuery = 0L
        visibleWindows.clear()
    }

    private companion object {
        const val STOPPED = 23        // ACTIVITY_STOPPED (API 29)
        const val STALE_MS = 3 * 60 * 60 * 1000L
    }
}
