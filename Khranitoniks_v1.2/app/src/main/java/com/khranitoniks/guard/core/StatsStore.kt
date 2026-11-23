package com.khranitoniks.guard.core

import android.content.Context
import org.json.JSONObject
import java.io.File

/** История использования по дням (хранится 14 дней в JSON-файле). */
object StatsStore {

    private const val KEEP_DAYS = 14
    private val lock = Any()

    private fun file(context: Context) = File(context.applicationContext.filesDir, "stats.json")

    private fun readAll(context: Context): JSONObject =
        try {
            val f = file(context)
            if (f.exists()) JSONObject(f.readText()) else JSONObject()
        } catch (e: Exception) {
            JSONObject()
        }

    private fun writeAll(context: Context, root: JSONObject) {
        try {
            val f = file(context)
            val tmp = File(f.parentFile, "stats.json.tmp")
            tmp.writeText(root.toString())
            if (!tmp.renameTo(f)) {
                f.writeText(root.toString())
                tmp.delete()
            }
        } catch (e: Exception) {
            // хранилище недоступно — пропускаем
        }
    }

    private fun parse(day: String, o: JSONObject): DayRecord {
        val apps = HashMap<String, Long>()
        val a = o.optJSONObject("apps")
        if (a != null) {
            val it = a.keys()
            while (it.hasNext()) {
                val k = it.next()
                apps[k] = a.optLong(k)
            }
        }
        return DayRecord(day, o.optLong("screen"), apps, o.optLong("used", -1L), o.optLong("limit", -1L))
    }

    fun get(context: Context, day: String): DayRecord? = synchronized(lock) {
        val root = readAll(context)
        val o = root.optJSONObject(day) ?: return null
        parse(day, o)
    }

    fun put(context: Context, record: DayRecord) = synchronized(lock) {
        val root = readAll(context)
        val apps = JSONObject()
        record.apps.forEach { (k, v) -> if (v >= 1000) apps.put(k, v) }
        root.put(
            record.day,
            JSONObject().put("screen", record.screenMs).put("apps", apps)
                .put("used", record.usedMs).put("limit", record.limitMs)
        )
        // удаляем старые дни
        val cutoff = TimeUtil.dayKey(TimeUtil.startOfDayOffset(-KEEP_DAYS))
        val keys = root.keys().asSequence().toList()
        keys.filter { it < cutoff }.forEach { root.remove(it) }
        writeAll(context, root)
    }

    /**
     * Запись за день по смещению (0 — сегодня). Если сохранённой записи нет,
     * она вычисляется из системной статистики использования.
     */
    fun day(context: Context, offset: Int, reader: UsageReader): DayRecord {
        val start = TimeUtil.startOfDayOffset(offset)
        val end = TimeUtil.endOfDay(start)
        val key = TimeUtil.dayKey(start)
        val prefs = Prefs.get(context)
        if (offset == 0) {
            val apps = reader.appUsage(start, System.currentTimeMillis())
            val own = if (prefs.dayKey == key) prefs.screenMsToday else 0L
            val sys = reader.screenTime(start, System.currentTimeMillis())
            val today = prefs.dayKey == key
            val rec = DayRecord(
                key, maxOf(own, sys), apps,
                if (today) prefs.limitUsedMs else -1L,
                if (today) currentLimitMs(prefs) else -1L
            )
            put(context, rec)
            return rec
        }
        val saved = get(context, key)
        if (saved != null && saved.apps.isNotEmpty()) return saved
        val apps = reader.appUsage(start, end)
        val sys = reader.screenTime(start, end)
        val rec = DayRecord(key, maxOf(saved?.screenMs ?: 0L, sys), apps, saved?.usedMs ?: -1L, saved?.limitMs ?: -1L)
        if (apps.isNotEmpty() || rec.screenMs > 0) put(context, rec)
        return rec
    }

    /** Окончательное сохранение прошедшего дня (вызывается при смене суток). */
    fun finalizeDay(context: Context, dayKey: String, ownScreenMs: Long, reader: UsageReader, usedMs: Long = -1L, limitMs: Long = -1L) {
        val start = TimeUtil.parseDay(dayKey)
        val end = TimeUtil.endOfDay(start)
        val apps = reader.appUsage(start, end)
        val sys = reader.screenTime(start, end)
        put(context, DayRecord(dayKey, maxOf(ownScreenMs, sys), apps, usedMs, limitMs))
    }

    /** Действующий сегодня лимит в мс, или -1, если лимит выключен / снят. */
    fun currentLimitMs(p: Prefs): Long =
        if (p.limitsEnabled && !p.unlimitedToday) (p.dailyLimitMin + p.bonusMinToday) * TimeUtil.MIN else -1L

    /** Все сохранённые дни (для наград). */
    fun allDays(context: Context): List<DayRecord> = synchronized(lock) {
        val root = readAll(context)
        root.keys().asSequence().toList().sorted().mapNotNull { k -> root.optJSONObject(k)?.let { parse(k, it) } }
    }
}
