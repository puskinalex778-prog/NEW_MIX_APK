package com.khranitoniks.box

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import android.widget.Toast

/** Копирование и вставка кодов и ключей. */
object Clip {

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
            if (Build.VERSION.SDK_INT < 33) Toast.makeText(context, toast, Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            // буфер недоступен
        }
    }

    fun read(context: Context): String? = try {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.primaryClip?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.coerceToText(context)?.toString()
    } catch (e: Exception) {
        null
    }

    /** Ключ XXXX-XXXX-XXXX-XXXX-X из произвольного текста (например, из сообщения). */
    fun extractKey(text: String?): String? {
        if (text.isNullOrBlank()) return null
        val m = Regex("""[A-Za-z0-9]{4}(?:[\s\-][A-Za-z0-9]{4}){3}[\s\-][A-Za-z0-9]""").find(text)
        return (m?.value ?: text.trim()).uppercase().take(24)
    }
}
