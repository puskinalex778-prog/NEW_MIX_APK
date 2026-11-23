package com.khranitoniks.guard.core

import android.content.Context
import com.khranitoniks.guard.R
import org.json.JSONObject

/** Выдача бонусных минут, разблокировки и приём кодов из «Хранитоникс Бокс». */
object Bonus {

    sealed class RedeemResult {
        data class Ok(val minutes: Int) : RedeemResult()
        /** Код-действие из Бокса (ночь, перерыв, зарядка, учёба, настройки). */
        data class Action(val action: Int) : RedeemResult()
        object NotPaired : RedeemResult()
        object Used : RedeemResult()
        data class Wrong(val attemptsLeft: Int) : RedeemResult()
        data class Locked(val seconds: Int) : RedeemResult()
    }

    /** Добавить минуты (лимит приложений и контроль доступа), завершить текущий перерыв. */
    fun grantMinutes(context: Context, minutes: Int, source: String) {
        val p = Prefs.get(context)
        Day.ensure(context)
        p.bonusMinToday = p.bonusMinToday + minutes
        endBreaks(p)
        EventLog.add(context, LogType.BONUS, context.getString(R.string.log_bonus_minutes, minutes, source))
    }

    fun grantUnlimited(context: Context, source: String) {
        val p = Prefs.get(context)
        Day.ensure(context)
        p.unlimitedToday = true
        endBreaks(p)
        EventLog.add(context, LogType.BONUS, context.getString(R.string.log_bonus_unlimited, source))
    }

    private fun endBreaks(p: Prefs) {
        p.breakUntil = 0L
        p.usageSinceBreakMs = 0L
        p.softNotifiedAt = 0L
    }

    fun redeem(context: Context, code: String): RedeemResult {
        val p = Prefs.get(context)
        val key = CodeCrypto.parseKey(p.pairingKey) ?: return RedeemResult.NotPaired
        val guard = AttemptGuard(context, "code")
        val locked = guard.lockedSeconds()
        if (locked > 0) return RedeemResult.Locked(locked)
        val v = CodeCrypto.verify(key, code) ?: CodeCrypto.verifyAction(key, code)
        if (v == null) {
            return when (val r = guard.failure(LogType.CODE_FAILED, context.getString(R.string.log_code_failed))) {
                is CheckResult.Locked -> RedeemResult.Locked(r.secondsLeft)
                is CheckResult.Wrong -> RedeemResult.Wrong(r.attemptsLeft)
                CheckResult.Ok -> RedeemResult.Wrong(0)
            }
        }
        val used = usedCodes(p)
        if (used.has(v.id)) return RedeemResult.Used
        guard.success()
        used.put(v.id, System.currentTimeMillis())
        // чистим старые записи (старше 3 суток)
        val now = System.currentTimeMillis()
        val keys = used.keys().asSequence().toList()
        keys.forEach { if (now - used.optLong(it) > 3 * TimeUtil.DAY) used.remove(it) }
        p.usedCodes = used.toString()
        p.codesTotal = p.codesTotal + 1
        val source = context.getString(R.string.source_box_code)
        EventLog.add(context, LogType.CODE_OK, context.getString(R.string.log_code_ok, CodeCrypto.prettyCode(code.filter { it.isDigit() })))
        if (v.action) {
            applyAction(context, v.optionIndex)
            return RedeemResult.Action(v.optionIndex)
        }
        if (v.minutes < 0) grantUnlimited(context, source) else grantMinutes(context, v.minutes, source)
        return RedeemResult.Ok(v.minutes)
    }

    /** Выполнить код-действие из Бокса. Индексы — [CodeCrypto.ACTIONS]. */
    fun applyAction(context: Context, action: Int) {
        val p = Prefs.get(context)
        val now = System.currentTimeMillis()
        when (action) {
            CodeCrypto.ACT_NIGHT_60 -> p.nightUnlockUntil = now + 60 * TimeUtil.MIN
            CodeCrypto.ACT_NIGHT_MORNING -> p.nightUnlockUntil = TimeUtil.nextOccurrence(p.nightEndMin, now)
            CodeCrypto.ACT_END_BREAK -> endBreaks(p)
            CodeCrypto.ACT_CHARGE_UNPLUG -> p.chargeUnlockUntilUnplug = true
            CodeCrypto.ACT_SCHOOL_OFF -> p.schoolOffUntil = TimeUtil.startOfDayOffset(1)
            CodeCrypto.ACT_SETTINGS_10 -> p.settingsUnlockUntil = now + 10 * TimeUtil.MIN
        }
        EventLog.add(context, LogType.BOX_ACTION, context.getString(R.string.log_box_action, actionLabel(context, action)))
    }

    fun actionLabel(context: Context, action: Int): String = context.getString(
        when (action) {
            CodeCrypto.ACT_NIGHT_60 -> R.string.act_night_60
            CodeCrypto.ACT_NIGHT_MORNING -> R.string.act_night_morning
            CodeCrypto.ACT_END_BREAK -> R.string.act_end_break
            CodeCrypto.ACT_CHARGE_UNPLUG -> R.string.act_charge_unplug
            CodeCrypto.ACT_SCHOOL_OFF -> R.string.act_school_off
            else -> R.string.act_settings_10
        }
    )

    private fun usedCodes(p: Prefs): JSONObject =
        try {
            if (p.usedCodes.isBlank()) JSONObject() else JSONObject(p.usedCodes)
        } catch (e: Exception) {
            JSONObject()
        }
}

/** Сброс суточных счётчиков в 00:00. */
object Day {
    fun ensure(context: Context, reader: UsageReader? = null): Boolean {
        val p = Prefs.get(context)
        val today = TimeUtil.dayKey()
        if (p.dayKey == today) return false
        val old = p.dayKey
        if (old.isNotEmpty()) {
            try {
                StatsStore.finalizeDay(context, old, p.screenMsToday, reader ?: UsageReader(context), p.limitUsedMs, StatsStore.currentLimitMs(p))
            } catch (e: Exception) {
                // пропускаем
            }
        }
        p.dayKey = today
        p.screenMsToday = 0L
        p.bonusMinToday = 0
        p.unlimitedToday = false
        p.usageSinceBreakMs = 0L
        p.breakUntil = 0L
        p.softNotifiedAt = 0L
        p.limitUsedMs = 0L
        return true
    }
}
