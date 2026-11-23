package com.khranitoniks.guard.core

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import android.widget.Toast

/** Копирование и вставка ключей и кодов. */
object Clip {

    /** Копирует текст. sensitive = true скрывает превью в системной панели (Android 13+). */
    fun copy(context: Context, text: String, toast: Int, sensitive: Boolean = false) {
        try {
            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("khranitoniks", text)
            if (sensitive) {
                clip.description.extras = PersistableBundle().apply {
                    if (Build.VERSION.SDK_INT >= 33) putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true)
                    else putBoolean("android.content.extra.IS_SENSITIVE", true)
                }
            }
            cm.setPrimaryClip(clip)
            // Android 13+ сам показывает подтверждение копирования
            if (Build.VERSION.SDK_INT < 33) Toast.makeText(context, toast, Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            // буфер недоступен
        }
    }

    /** Текст из буфера обмена или null. */
    fun read(context: Context): String? = try {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.primaryClip?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.coerceToText(context)?.toString()
    } catch (e: Exception) {
        null
    }
}

/**
 * Находит 9-значный код в тексте: «389-876-082», «389 876 082», «Код: 389876082» и т. п.
 * Возвращает только цифры или null.
 */
fun extractCode(text: String?): String? {
    if (text.isNullOrBlank()) return null
    Regex("""(?<!\d)(\d{3})[\s\-–.]?(\d{3})[\s\-–.]?(\d{3})(?!\d)""").find(text)?.let {
        return it.groupValues[1] + it.groupValues[2] + it.groupValues[3]
    }
    val digits = text.filter { it.isDigit() }
    return if (digits.length == 9) digits else null
}

/** Находит ключ сопряжения вида XXXX-XXXX-XXXX-XXXX-X в тексте (или null). */
fun extractKey(text: String?): String? {
    if (text.isNullOrBlank()) return null
    val m = Regex("""[A-Za-z0-9]{4}(?:[\s\-][A-Za-z0-9]{4}){3}[\s\-][A-Za-z0-9]""").find(text)
    return (m?.value ?: text.trim()).uppercase().take(24)
}
