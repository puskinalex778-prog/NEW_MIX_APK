package com.khranitoniks.guard.core

import android.content.Context
import com.khranitoniks.guard.R
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

object TimeUtil {

    const val MIN = 60_000L
    const val HOUR = 3_600_000L
    const val DAY = 86_400_000L

    fun dayKey(time: Long = System.currentTimeMillis()): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(time))

    fun startOfDay(time: Long = System.currentTimeMillis()): Long {
        val c = Calendar.getInstance()
        c.timeInMillis = time
        c.set(Calendar.HOUR_OF_DAY, 0)
        c.set(Calendar.MINUTE, 0)
        c.set(Calendar.SECOND, 0)
        c.set(Calendar.MILLISECOND, 0)
        return c.timeInMillis
    }

    /** Начало суток со смещением в днях (0 — сегодня, -1 — вчера ...). */
    fun startOfDayOffset(offset: Int): Long {
        val c = Calendar.getInstance()
        c.timeInMillis = startOfDay()
        c.add(Calendar.DAY_OF_YEAR, offset)
        return c.timeInMillis
    }

    fun endOfDay(start: Long): Long {
        val c = Calendar.getInstance()
        c.timeInMillis = start
        c.add(Calendar.DAY_OF_YEAR, 1)
        return c.timeInMillis
    }

    fun parseDay(key: String): Long =
        try {
            SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(key)?.time ?: startOfDay()
        } catch (e: Exception) {
            startOfDay()
        }

    fun minuteOfDay(time: Long = System.currentTimeMillis()): Int {
        val c = Calendar.getInstance()
        c.timeInMillis = time
        return c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)
    }

    /** Входит ли время в интервал [start, end) с переходом через полночь. */
    fun inInterval(minute: Int, start: Int, end: Int): Boolean =
        if (start == end) false
        else if (start < end) minute in start until end
        else minute >= start || minute < end

    /** Ближайший момент наступления минуты суток [minute] после [from]. */
    fun nextOccurrence(minute: Int, from: Long = System.currentTimeMillis()): Long {
        val c = Calendar.getInstance()
        c.timeInMillis = from
        c.set(Calendar.HOUR_OF_DAY, minute / 60)
        c.set(Calendar.MINUTE, minute % 60)
        c.set(Calendar.SECOND, 0)
        c.set(Calendar.MILLISECOND, 0)
        if (c.timeInMillis <= from) c.add(Calendar.DAY_OF_YEAR, 1)
        return c.timeInMillis
    }

    fun hm(minuteOfDay: Int): String = String.format(Locale.US, "%02d:%02d", minuteOfDay / 60, minuteOfDay % 60)

    fun clock(time: Long): String = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date(time))

    fun dateTime(time: Long): String = SimpleDateFormat("dd.MM HH:mm:ss", Locale.getDefault()).format(Date(time))

    fun shortDate(dayStart: Long): String = SimpleDateFormat("dd.MM", Locale.getDefault()).format(Date(dayStart))

    fun weekday(dayStart: Long): String =
        SimpleDateFormat("EE", Locale.getDefault()).format(Date(dayStart))
            .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }

    fun longDate(dayStart: Long): String =
        SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(Date(dayStart))
            .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }

    /** «1 ч 05 мин» / «12 мин». */
    fun duration(context: Context, ms: Long): String {
        val totalMin = (ms.coerceAtLeast(0L) / MIN).toInt()
        val h = totalMin / 60
        val m = totalMin % 60
        return if (h > 0) context.getString(R.string.fmt_hm, h, m) else context.getString(R.string.fmt_m, m)
    }

    /** «04:59» обратный отсчёт. */
    fun countdown(ms: Long): String {
        val s = (ms.coerceAtLeast(0L) + 999) / 1000
        val h = s / 3600
        val m = (s % 3600) / 60
        val sec = s % 60
        return if (h > 0) String.format(Locale.US, "%d:%02d:%02d", h, m, sec)
        else String.format(Locale.US, "%02d:%02d", m, sec)
    }
}
