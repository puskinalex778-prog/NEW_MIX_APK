package com.khranitoniks.guard.core

import android.content.Context
import com.khranitoniks.guard.R

/** Награды для ребёнка: считаются по статистике дней, журналу и счётчикам. */
data class Achievement(
    val id: String,
    val image: Int,
    val title: Int,
    val desc: Int,
    val progress: Int,
    val goal: Int
) {
    val done: Boolean get() = progress >= goal
}

object Achievements {

    /** День «в рамках»: есть данные, лимит действовал и не был превышен. */
    private fun inLimit(r: DayRecord): Boolean = r.usedMs >= 0 && r.limitMs > 0 && r.usedMs <= r.limitMs

    /** Текущая серия дней в рамках лимита (вчера и раньше, плюс сегодня, если пока в рамках). */
    fun streak(days: List<DayRecord>, todayKey: String): Int {
        var n = 0
        for (r in days.sortedByDescending { it.day }) {
            if (r.day == todayKey) {
                if (inLimit(r)) n++
                continue
            }
            if (inLimit(r)) n++ else break
        }
        return n
    }

    fun load(context: Context): List<Achievement> {
        val p = Prefs.get(context)
        val days = try {
            StatsStore.allDays(context)
        } catch (e: Exception) {
            emptyList()
        }
        val today = TimeUtil.dayKey()
        val past = days.filter { it.day != today }
        val goodDays = past.count { inLimit(it) }
        val st = streak(days, today)
        val installedDays = ((System.currentTimeMillis() - p.installedAt) / TimeUtil.DAY).toInt() + 1
        val quietNights = try {
            EventLog.all(context).count { it.type == LogType.NIGHT_UNLOCK }
        } catch (e: Exception) {
            0
        }
        return listOf(
            Achievement("first", R.drawable.badge_first, R.string.ach_first, R.string.ach_first_d, minOf(installedDays, 1), 1),
            Achievement("balance", R.drawable.badge_balance, R.string.ach_balance, R.string.ach_balance_d, minOf(goodDays, 1), 1),
            Achievement("streak", R.drawable.badge_streak, R.string.ach_streak, R.string.ach_streak_d, minOf(st, 3), 3),
            Achievement("week", R.drawable.badge_week, R.string.ach_week, R.string.ach_week_d, minOf(st, 7), 7),
            Achievement("breaks", R.drawable.badge_breaks, R.string.ach_breaks, R.string.ach_breaks_d, minOf(p.breaksTotal, 10), 10),
            Achievement("charge", R.drawable.badge_charge, R.string.ach_charge, R.string.ach_charge_d, minOf(p.chargedTotal, 5), 5),
            Achievement("codes", R.drawable.badge_codes, R.string.ach_codes, R.string.ach_codes_d, minOf(p.codesTotal, 5), 5),
            Achievement(
                "night", R.drawable.badge_night, R.string.ach_night, R.string.ach_night_d,
                if (p.nightEnabled && installedDays >= 7 && quietNights == 0) 1 else 0, 1
            )
        )
    }
}
