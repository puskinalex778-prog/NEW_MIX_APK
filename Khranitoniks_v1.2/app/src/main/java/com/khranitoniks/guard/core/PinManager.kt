package com.khranitoniks.guard.core

import android.content.Context
import com.khranitoniks.guard.R
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Locale

/** Результат проверки PIN или кода. */
sealed class CheckResult {
    object Ok : CheckResult()
    data class Wrong(val attemptsLeft: Int) : CheckResult()
    data class Locked(val secondsLeft: Int) : CheckResult()
}

/** Защита от подбора: 3 неверные попытки подряд → блокировка ввода на 60 секунд. */
class AttemptGuard(private val context: Context, private val prefix: String) {

    private val prefs = Prefs.get(context)

    fun lockedSeconds(): Int {
        val left = prefs.lockUntil(prefix) - System.currentTimeMillis()
        return if (left > 0) ((left + 999) / 1000).toInt() else 0
    }

    fun success() {
        prefs.setFails(prefix, 0)
    }

    /** Регистрирует неудачу; возвращает Wrong или Locked. */
    fun failure(logType: String, logText: String): CheckResult {
        val fails = prefs.fails(prefix) + 1
        EventLog.add(context, logType, logText + " " + context.getString(R.string.log_attempt_n, fails))
        return if (fails >= MAX_ATTEMPTS) {
            prefs.setFails(prefix, 0)
            prefs.setLockUntil(prefix, System.currentTimeMillis() + LOCK_MS)
            EventLog.add(context, LogType.PIN_LOCKOUT, context.getString(R.string.log_input_locked, LOCK_MS / 1000))
            CheckResult.Locked((LOCK_MS / 1000).toInt())
        } else {
            prefs.setFails(prefix, fails)
            CheckResult.Wrong(MAX_ATTEMPTS - fails)
        }
    }

    companion object {
        const val MAX_ATTEMPTS = 3
        const val LOCK_MS = 60_000L
    }
}

/** PIN-код хранится только в виде SHA-256 хеша (с солью). */
object PinManager {

    fun sha256(text: String): String =
        MessageDigest.getInstance("SHA-256").digest(text.toByteArray(Charsets.UTF_8))
            .joinToString("") { String.format(Locale.US, "%02x", it) }

    fun isSet(context: Context): Boolean = Prefs.get(context).pinHash.isNotEmpty()

    fun setPin(context: Context, pin: String) {
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }.joinToString("") { String.format(Locale.US, "%02x", it) }
        val prefs = Prefs.get(context)
        prefs.pinSalt = salt
        prefs.pinHash = sha256(salt + pin)
        prefs.setFails("pin", 0)
        prefs.setLockUntil("pin", 0L)
    }

    fun verify(context: Context, pin: String): CheckResult {
        val guard = AttemptGuard(context, "pin")
        val locked = guard.lockedSeconds()
        if (locked > 0) return CheckResult.Locked(locked)
        val prefs = Prefs.get(context)
        return if (prefs.pinHash.isNotEmpty() && sha256(prefs.pinSalt + pin) == prefs.pinHash) {
            guard.success()
            CheckResult.Ok
        } else {
            guard.failure(LogType.PIN_FAILED, context.getString(R.string.log_pin_failed))
        }
    }
}
