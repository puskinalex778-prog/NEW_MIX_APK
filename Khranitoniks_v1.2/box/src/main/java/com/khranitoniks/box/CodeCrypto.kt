package com.khranitoniks.box

import java.security.SecureRandom
import java.util.Locale
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * Офлайн-коды времени между «Хранитоникс» (телефон ребёнка) и «Хранитоникс Бокс» (телефон родителя).
 *
 * 1. Ключ сопряжения: 10 случайных байт → 16 символов Crockford Base32 + 1 контрольный символ
 *    (формат XXXX-XXXX-XXXX-XXXX-C). Ключ один раз вводится в оба приложения.
 * 2. Код времени: 9 цифр = [вариант времени: 1 цифра][номер: 2 цифры][HMAC-SHA256: 6 цифр].
 *    HMAC считается от ключа, номера часа (UTC) и варианта, поэтому код:
 *    — нельзя подделать без ключа; — действует 24 часа; — одноразовый (телефон ребёнка запоминает использованные).
 *
 * 3. Код-действие (v1.2): тот же формат, но HMAC считается с меткой «KHA1». Первая цифра — номер действия
 *    из [ACTIONS] (снять ночной режим, закончить перерыв, разрешить телефон на зарядке…).
 *    Старые версии такие коды просто не принимают, а коды времени остались прежними.
 *
 * ВАЖНО: этот файл одинаков в обоих приложениях.
 */
object CodeCrypto {

    private const val ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    const val KEY_BYTES = 10
    const val VALID_HOURS = 24

    /** Варианты времени: индекс → минуты (-1 = без ограничений до конца дня). */
    val OPTIONS = intArrayOf(10, 15, 20, 30, 45, 60, 90, 120, 180, -1)

    // ---------- коды-действия ----------
    const val ACT_NIGHT_60 = 0
    const val ACT_NIGHT_MORNING = 1
    const val ACT_END_BREAK = 2
    const val ACT_CHARGE_UNPLUG = 3
    const val ACT_SCHOOL_OFF = 4
    const val ACT_SETTINGS_10 = 5
    val ACTIONS = intArrayOf(ACT_NIGHT_60, ACT_NIGHT_MORNING, ACT_END_BREAK, ACT_CHARGE_UNPLUG, ACT_SCHOOL_OFF, ACT_SETTINGS_10)

    private val random = SecureRandom()

    fun generateKey(): ByteArray = ByteArray(KEY_BYTES).also { random.nextBytes(it) }

    private fun base32(bytes: ByteArray): String {
        val sb = StringBuilder()
        var buffer = 0
        var bits = 0
        for (b in bytes) {
            buffer = (buffer shl 8) or (b.toInt() and 0xff)
            bits += 8
            while (bits >= 5) {
                sb.append(ALPHABET[(buffer shr (bits - 5)) and 31])
                bits -= 5
            }
        }
        if (bits > 0) sb.append(ALPHABET[(buffer shl (5 - bits)) and 31])
        return sb.toString()
    }

    private fun unbase32(text: String): ByteArray? {
        val out = java.io.ByteArrayOutputStream()
        var buffer = 0
        var bits = 0
        for (c in text) {
            val v = ALPHABET.indexOf(c)
            if (v < 0) return null
            buffer = (buffer shl 5) or v
            bits += 5
            if (bits >= 8) {
                out.write((buffer shr (bits - 8)) and 0xff)
                bits -= 8
            }
        }
        return out.toByteArray()
    }

    private fun checksum(data: String): Char {
        var sum = 0
        data.forEachIndexed { i, c -> sum += (i + 1) * ALPHABET.indexOf(c) }
        return ALPHABET[sum % 32]
    }

    /** Ключ в виде XXXX-XXXX-XXXX-XXXX-C. */
    fun formatKey(key: ByteArray): String {
        val data = base32(key)
        val full = data + checksum(data)
        return full.chunked(4).joinToString("-")
    }

    /** Нормализация ввода: регистр, пробелы, похожие символы (O→0, I/L→1, U→V). */
    fun normalize(text: String): String =
        text.uppercase()
            .replace('O', '0').replace('I', '1').replace('L', '1').replace('U', 'V')
            .filter { it in ALPHABET }

    /** Разбор ключа; null — если формат или контрольный символ неверны. */
    fun parseKey(text: String): ByteArray? {
        val n = normalize(text)
        if (n.length != 17) return null
        val data = n.substring(0, 16)
        if (checksum(data) != n[16]) return null
        val bytes = unbase32(data) ?: return null
        return if (bytes.size >= KEY_BYTES) bytes.copyOf(KEY_BYTES) else null
    }

    fun hourSlot(timeMillis: Long): Long = timeMillis / 3_600_000L

    private fun mac6(key: ByteArray, slot: Long, option: Int, nonce: Int, tag: String = "KHR1"): Int {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        val h = mac.doFinal("$tag|$slot|$option|$nonce".toByteArray(Charsets.UTF_8))
        val off = h[h.size - 1].toInt() and 0x0f
        val v = ((h[off].toInt() and 0x7f) shl 24) or
            ((h[off + 1].toInt() and 0xff) shl 16) or
            ((h[off + 2].toInt() and 0xff) shl 8) or
            (h[off + 3].toInt() and 0xff)
        return v % 1_000_000
    }

    /** Создание кода (используется в «Хранитоникс Бокс»). */
    fun makeCode(key: ByteArray, optionIndex: Int, now: Long = System.currentTimeMillis(), nonce: Int = random.nextInt(100)): String {
        require(optionIndex in OPTIONS.indices)
        val slot = hourSlot(now)
        val m = mac6(key, slot, optionIndex, nonce)
        return optionIndex.toString() + String.format(Locale.US, "%02d", nonce) + String.format(Locale.US, "%06d", m)
    }

    fun prettyCode(code: String): String = code.chunked(3).joinToString("-")

    /** Создание кода-действия (используется в «Хранитоникс Бокс»). */
    fun makeActionCode(key: ByteArray, action: Int, now: Long = System.currentTimeMillis(), nonce: Int = random.nextInt(100)): String {
        require(action in ACTIONS)
        val slot = hourSlot(now)
        val m = mac6(key, slot, action, nonce, "KHA1")
        return action.toString() + String.format(Locale.US, "%02d", nonce) + String.format(Locale.US, "%06d", m)
    }

    data class Verified(val optionIndex: Int, val minutes: Int, val nonce: Int, val slot: Long, val action: Boolean = false) {
        val id: String get() = if (action) "$slot:A$optionIndex:$nonce" else "$slot:$optionIndex:$nonce"
    }

    /** Проверка кода-действия. */
    fun verifyAction(key: ByteArray, codeInput: String, now: Long = System.currentTimeMillis()): Verified? {
        val code = codeInput.filter { it.isDigit() }
        if (code.length != 9) return null
        val action = code[0].digitToInt()
        if (action !in ACTIONS) return null
        val nonce = code.substring(1, 3).toInt()
        val m = code.substring(3).toInt()
        val cur = hourSlot(now)
        for (slot in (cur + 2) downTo (cur - VALID_HOURS)) {
            if (mac6(key, slot, action, nonce, "KHA1") == m) return Verified(action, 0, nonce, slot, action = true)
        }
        return null
    }

    /** Проверка кода (используется в «Хранитоникс»). Допуск по часам: 24 ч назад и 2 ч вперёд. */
    fun verify(key: ByteArray, codeInput: String, now: Long = System.currentTimeMillis()): Verified? {
        val code = codeInput.filter { it.isDigit() }
        if (code.length != 9) return null
        val option = code[0].digitToInt()
        val nonce = code.substring(1, 3).toInt()
        val m = code.substring(3).toInt()
        val cur = hourSlot(now)
        for (slot in (cur + 2) downTo (cur - VALID_HOURS)) {
            if (mac6(key, slot, option, nonce) == m) {
                return Verified(option, OPTIONS[option], nonce, slot)
            }
        }
        return null
    }
}
