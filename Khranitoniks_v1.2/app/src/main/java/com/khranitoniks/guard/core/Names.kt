package com.khranitoniks.guard.core

import android.content.Context

/** Обращение к ребёнку по имени, если родитель его задал. */
object Names {

    fun name(context: Context): String = Prefs.get(context).childName.trim()

    /** Строка с именем ([named] содержит %1$s в начале) или обычная, если имя не задано. */
    fun title(context: Context, plain: Int, named: Int): String {
        val n = name(context)
        return if (n.isEmpty()) context.getString(plain) else context.getString(named, n)
    }
}
