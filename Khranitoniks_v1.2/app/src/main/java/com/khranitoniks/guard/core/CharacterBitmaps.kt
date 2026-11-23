package com.khranitoniks.guard.core

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader

/** Отрисовка векторных персонажей в Bitmap для уведомлений. */
object CharacterBitmaps {

    fun render(context: Context, kind: CharacterKind, mood: Mood, size: Int): Bitmap {
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val d = context.getDrawable(CharacterArt.res(kind, mood)) ?: return bmp
        d.setBounds(0, 0, size, size)
        d.draw(Canvas(bmp))
        return bmp
    }

    /** Широкая картинка 2:1 для BigPictureStyle: цветной фон + персонаж. */
    fun banner(context: Context, kind: CharacterKind, mood: Mood): Bitmap {
        val w = 960
        val h = 480
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val c = Canvas(bmp)
        val (c1, c2) = moodColors(mood)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        p.shader = LinearGradient(0f, 0f, w.toFloat(), h.toFloat(), c1, c2, Shader.TileMode.CLAMP)
        c.drawRoundRect(RectF(0f, 0f, w.toFloat(), h.toFloat()), 48f, 48f, p)
        val dots = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0x33FFFFFF }
        for (i in 0 until 14) {
            val x = (i * 137 % w).toFloat()
            val y = (i * 89 % h).toFloat()
            c.drawCircle(x, y, (12 + i % 4 * 6).toFloat(), dots)
        }
        val d = context.getDrawable(CharacterArt.res(kind, mood))
        if (d != null) {
            val s = 440
            val left = (w - s) / 2
            d.setBounds(left, 20, left + s, 20 + s)
            d.draw(c)
        }
        return bmp
    }

    private fun moodColors(mood: Mood): Pair<Int, Int> = when (mood) {
        Mood.HAPPY, Mood.CHARGED -> 0xFFB9F6CA.toInt() to 0xFF69F0AE.toInt()
        Mood.BREAK -> 0xFFFFE0B2.toInt() to 0xFFFFCC80.toInt()
        Mood.STOP, Mood.ANGRY -> 0xFFFFCDD2.toInt() to 0xFFEF9A9A.toInt()
        Mood.CHARGING -> 0xFFB3E5FC.toInt() to 0xFF81D4FA.toInt()
        Mood.LOW -> 0xFFFFF9C4.toInt() to 0xFFFFE082.toInt()
        Mood.SLEEP -> 0xFFC5CAE9.toInt() to 0xFF9FA8DA.toInt()
        Mood.GAMER -> 0xFFD1C4E9.toInt() to 0xFFB39DDB.toInt()
        Mood.HOT -> 0xFFFFCCBC.toInt() to 0xFFFF8A65.toInt()
    }
}
