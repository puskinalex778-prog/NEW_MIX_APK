package com.khranitoniks.guard.core

import com.khranitoniks.guard.R

/**
 * Соответствие персонаж + эмоция → картинка (res/drawable-nodpi/char_*.webp, 512×512, прозрачный фон).
 * Нарисовано 8 сюжетов на персонажа: низкий заряд, перерыв, лимит, зарядка завершена,
 * ночной режим, игровой режим, награда, перегрев. CHARGING и ANGRY используют ближайшие сюжеты.
 */
object CharacterArt {

    fun res(kind: CharacterKind, mood: Mood): Int = when (kind) {
        CharacterKind.SEMA -> when (mood) {
            Mood.HAPPY -> R.drawable.char_sema_happy
            Mood.CHARGED -> R.drawable.char_sema_charged
            Mood.BREAK -> R.drawable.char_sema_break
            Mood.STOP -> R.drawable.char_sema_stop
            Mood.CHARGING -> R.drawable.char_sema_charged
            Mood.LOW -> R.drawable.char_sema_low
            Mood.SLEEP -> R.drawable.char_sema_sleep
            Mood.ANGRY -> R.drawable.char_sema_stop
            Mood.GAMER -> R.drawable.char_sema_gamer
            Mood.HOT -> R.drawable.char_sema_hot
        }
        CharacterKind.TIMMA -> when (mood) {
            Mood.HAPPY -> R.drawable.char_timma_happy
            Mood.CHARGED -> R.drawable.char_timma_charged
            Mood.BREAK -> R.drawable.char_timma_break
            Mood.STOP -> R.drawable.char_timma_stop
            Mood.CHARGING -> R.drawable.char_timma_charged
            Mood.LOW -> R.drawable.char_timma_low
            Mood.SLEEP -> R.drawable.char_timma_sleep
            Mood.ANGRY -> R.drawable.char_timma_stop
            Mood.GAMER -> R.drawable.char_timma_gamer
            Mood.HOT -> R.drawable.char_timma_hot
        }
        CharacterKind.OLEZHKA -> when (mood) {
            Mood.HAPPY -> R.drawable.char_olezhka_happy
            Mood.CHARGED -> R.drawable.char_olezhka_charged
            Mood.BREAK -> R.drawable.char_olezhka_break
            Mood.STOP -> R.drawable.char_olezhka_stop
            Mood.CHARGING -> R.drawable.char_olezhka_charged
            Mood.LOW -> R.drawable.char_olezhka_low
            Mood.SLEEP -> R.drawable.char_olezhka_sleep
            Mood.ANGRY -> R.drawable.char_olezhka_stop
            Mood.GAMER -> R.drawable.char_olezhka_gamer
            Mood.HOT -> R.drawable.char_olezhka_hot
        }
        CharacterKind.HRONI -> when (mood) {
            Mood.HAPPY -> R.drawable.char_hroni_happy
            Mood.CHARGED -> R.drawable.char_hroni_charged
            Mood.BREAK -> R.drawable.char_hroni_break
            Mood.STOP -> R.drawable.char_hroni_stop
            Mood.CHARGING -> R.drawable.char_hroni_charged
            Mood.LOW -> R.drawable.char_hroni_low
            Mood.SLEEP -> R.drawable.char_hroni_sleep
            Mood.ANGRY -> R.drawable.char_hroni_stop
            Mood.GAMER -> R.drawable.char_hroni_gamer
            Mood.HOT -> R.drawable.char_hroni_hot
        }
    }
}
