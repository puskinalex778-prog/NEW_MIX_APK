package com.khranitoniks.guard.core

import android.content.Context
import android.content.SharedPreferences
import kotlin.properties.ReadWriteProperty
import kotlin.reflect.KProperty

/**
 * Все настройки и текущее состояние в SharedPreferences.
 * Один экземпляр на процесс (используется и сервисом, и UI).
 */
class Prefs private constructor(context: Context) {

    val sp: SharedPreferences =
        context.applicationContext.getSharedPreferences("khranitoniks_prefs", Context.MODE_PRIVATE)

    private fun bool(key: String, def: Boolean) = object : ReadWriteProperty<Any?, Boolean> {
        override fun getValue(thisRef: Any?, property: KProperty<*>) = sp.getBoolean(key, def)
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Boolean) {
            sp.edit().putBoolean(key, value).apply()
        }
    }

    private fun int(key: String, def: Int) = object : ReadWriteProperty<Any?, Int> {
        override fun getValue(thisRef: Any?, property: KProperty<*>) = sp.getInt(key, def)
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Int) {
            sp.edit().putInt(key, value).apply()
        }
    }

    private fun long(key: String, def: Long) = object : ReadWriteProperty<Any?, Long> {
        override fun getValue(thisRef: Any?, property: KProperty<*>) = sp.getLong(key, def)
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Long) {
            sp.edit().putLong(key, value).apply()
        }
    }

    private fun str(key: String, def: String) = object : ReadWriteProperty<Any?, String> {
        override fun getValue(thisRef: Any?, property: KProperty<*>) = sp.getString(key, def) ?: def
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
            sp.edit().putString(key, value).apply()
        }
    }

    private fun strSet(key: String) = object : ReadWriteProperty<Any?, Set<String>> {
        override fun getValue(thisRef: Any?, property: KProperty<*>): Set<String> =
            HashSet(sp.getStringSet(key, emptySet()) ?: emptySet())

        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Set<String>) {
            sp.edit().putStringSet(key, HashSet(value)).apply()
        }
    }

    // ---------- первичная настройка и PIN ----------
    var onboardingDone by bool("onboarding_done", false)
    var pinHash by str("pin_hash", "")
    var pinSalt by str("pin_salt", "")

    // ---------- лимиты и перерывы ----------
    var limitsEnabled by bool("limits_enabled", true)
    var dailyLimitMin by int("daily_limit_min", 60)
    var breakEveryMin by int("break_every_min", 20)
    var breakDurationMin by int("break_duration_min", 5)
    /** true — строгий режим (оверлей), false — мягкий (уведомления). */
    var strictMode by bool("strict_mode", true)
    /** Сразу отправлять заблокированное приложение в фон (видео останавливается), экран блокировки остаётся. */
    var autoMinimize by bool("auto_minimize", true)
    var breakMessage by str("break_message", "")
    var limitMessage by str("limit_message", "")

    // ---------- ночной режим ----------
    var nightEnabled by bool("night_enabled", true)
    var nightStartMin by int("night_start_min", 21 * 60)
    var nightEndMin by int("night_end_min", 7 * 60)

    // ---------- зарядка ----------
    var chargeLockEnabled by bool("charge_lock_enabled", true)
    var chargeThreshold by int("charge_threshold", 80)
    var chargeMessage by str("charge_message", "")
    var lowBatteryEnabled by bool("low_battery_enabled", true)
    var lowBatteryLevel by int("low_battery_level", 15)

    // ---------- оформление ----------
    var overlayTheme by str("overlay_theme", OverlayTheme.DARK.name)
    var character by str("character", CharacterKind.HRONI.name)
    /** Имя ребёнка (задаёт родитель). Если задано — приложение обращается по имени. */
    var childName by str("child_name", "")
    /** Пауза чёрного списка по PIN (до этого момента запрещённые приложения открываются). */
    var blockedPauseUntil by long("blocked_pause_until", 0L)

    // ---------- защита ----------
    var settingsLockEnabled by bool("settings_lock_enabled", false)
    var showFullActivity by bool("show_full_activity", true)

    // ---------- что считать в лимит ----------
    /** [LimitScope.DEVICE] — всё устройство (кроме разрешённых), [LimitScope.APPS] — только список приложений. */
    var limitScope by str("limit_scope", LimitScope.DEVICE.name)
    val scope: LimitScope get() = LimitScope.of(limitScope)
    /** Разрешённые всегда (не считаются в лимит и работают в перерыв, ночью, в учебное время). */
    var acAllowed by strSet("ac_allowed")
    /** Чёрный список: запрещены всегда. */
    var blockedApps by strSet("blocked_apps")

    // ---------- учебное время ----------
    var schoolEnabled by bool("school_enabled", false)
    var schoolStartMin by int("school_start_min", 8 * 60)
    var schoolEndMin by int("school_end_min", 14 * 60)
    /** Дни недели: бит 0 — понедельник … бит 6 — воскресенье. */
    var schoolDays by int("school_days", 0b0011111)
    var schoolOffUntil by long("school_off_until", 0L)

    // ---------- старый «контроль доступа» (v1.1), читается только для переноса настроек ----------
    private val acEnabledOld by bool("ac_enabled", false)
    private val acTotalOld by int("ac_total_min", 40)
    private val acSessionOld by int("ac_session_min", 10)
    private val acBreakOld by int("ac_break_min", 5)

    // ---------- игровой режим ----------
    var gameExclusions by strSet("game_exclusions")
    var gameDnd by bool("game_dnd", true)
    var gameActive by bool("game_active", false)
    var gamePackage by str("game_package", "")
    var gamePrevFilter by int("game_prev_filter", -1)
    var gameLastSeen by long("game_last_seen", 0L)
    var gameLastKill by long("game_last_kill", 0L)

    // ---------- сопряжение с «Хранитоникс Бокс» ----------
    var pairingKey by str("pairing_key", "")
    var usedCodes by str("used_codes", "")

    // ---------- приложения ----------
    var trackedJson by str("tracked_json", "")

    // ---------- состояние текущих суток ----------
    var dayKey by str("day_key", "")
    var bonusMinToday by int("bonus_min_today", 0)
    var unlimitedToday by bool("unlimited_today", false)
    var usageSinceBreakMs by long("usage_since_break_ms", 0L)
    var breakUntil by long("break_until", 0L)
    var softNotifiedAt by long("soft_notified_at", 0L)
    var nightUnlockUntil by long("night_unlock_until", 0L)
    var settingsUnlockUntil by long("settings_unlock_until", 0L)
    var screenMsToday by long("screen_ms_today", 0L)
    /** Время, засчитанное в дневной лимит сегодня (собственный счётчик службы). */
    var limitUsedMs by long("limit_used_ms", 0L)

    // ---------- счётчики для наград ----------
    var installedAt by long("installed_at", 0L)
    var breaksTotal by int("breaks_total", 0)
    var chargedTotal by int("charged_total", 0)
    var codesTotal by int("codes_total", 0)
    var prefsVersion by int("prefs_version", 0)
    var whatsNewSeen by bool("whats_new_12", false)

    // ---------- состояние зарядки ----------
    var chargeUnlockUntil by long("charge_unlock_until", 0L)
    var chargeUnlockUntilUnplug by bool("charge_unlock_unplug", false)
    var chargeSession by bool("charge_session", false)
    var wasPlugged by bool("was_plugged", false)
    var lastLowBatteryNotify by long("last_low_battery_notify", 0L)

    // ---------- попытки ввода ----------
    fun fails(prefix: String): Int = sp.getInt("${prefix}_fails", 0)
    fun setFails(prefix: String, v: Int) = sp.edit().putInt("${prefix}_fails", v).apply()
    fun lockUntil(prefix: String): Long = sp.getLong("${prefix}_lock_until", 0L)
    fun setLockUntil(prefix: String, v: Long) = sp.edit().putLong("${prefix}_lock_until", v).apply()

    /** Перенос настроек со старых версий. Вызывается при старте приложения и службы. */
    fun migrate() {
        if (installedAt == 0L) installedAt = System.currentTimeMillis()
        if (prefsVersion >= 2) return
        if (onboardingDone && acEnabledOld) {
            // старый «контроль доступа» = лимит на всё устройство с перерывами
            limitScope = LimitScope.DEVICE.name
            limitsEnabled = true
            dailyLimitMin = acTotalOld
            breakEveryMin = acSessionOld
            breakDurationMin = acBreakOld
        }
        sp.edit().putBoolean("ac_enabled", false).apply()
        prefsVersion = 2
    }

    val characterKind: CharacterKind get() = CharacterKind.of(character)
    val overlayThemeKind: OverlayTheme get() = OverlayTheme.of(overlayTheme)

    companion object {
        @Volatile
        private var instance: Prefs? = null

        fun get(context: Context): Prefs =
            instance ?: synchronized(this) {
                instance ?: Prefs(context).also { instance = it }
            }
    }
}
