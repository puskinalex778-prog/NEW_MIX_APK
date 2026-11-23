package com.khranitoniks.guard.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.CharacterBitmaps
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.ui.MainActivity

/** Уведомления с картинками персонажей. */
object Notifier {

    const val CH_SERVICE = "guard_service"
    const val CH_ALERTS = "guard_alerts"
    const val CH_EVENTS = "guard_events"

    const val ID_SERVICE = 1001
    const val ID_BREAK = 1002
    const val ID_LIMIT = 1003
    const val ID_LOW_BATTERY = 1004
    const val ID_CHARGED = 1005
    const val ID_ACCESS = 1006
    const val ID_GAME = 1007

    fun createChannels(context: Context) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val service = NotificationChannel(CH_SERVICE, context.getString(R.string.ch_service), NotificationManager.IMPORTANCE_MIN).apply {
            setShowBadge(false)
            setSound(null, null)
            enableVibration(false)
        }
        val alerts = NotificationChannel(CH_ALERTS, context.getString(R.string.ch_alerts), NotificationManager.IMPORTANCE_HIGH).apply {
            enableVibration(true)
            setSound(
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build()
            )
        }
        val events = NotificationChannel(CH_EVENTS, context.getString(R.string.ch_events), NotificationManager.IMPORTANCE_DEFAULT)
        nm.createNotificationChannels(listOf(service, alerts, events))
    }

    private fun openApp(context: Context): PendingIntent =
        PendingIntent.getActivity(
            context, 0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

    fun serviceNotification(context: Context, text: String): Notification =
        Notification.Builder(context, CH_SERVICE)
            .setSmallIcon(R.drawable.ic_stat_guard)
            .setContentTitle(context.getString(R.string.service_title))
            .setContentText(text)
            .setOngoing(true)
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setContentIntent(openApp(context))
            .build()

    fun updateService(context: Context, text: String) {
        if (!Perms.notifications(context)) return
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(ID_SERVICE, serviceNotification(context, text))
    }

    /** Уведомление с персонажем, эмоция которого соответствует тексту. */
    fun alert(context: Context, id: Int, title: String, text: String, mood: Mood, channel: String = CH_ALERTS) {
        if (!Perms.notifications(context)) return
        val kind = Prefs.get(context).characterKind
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val large = CharacterBitmaps.render(context, kind, mood, 256)
        val banner = CharacterBitmaps.banner(context, kind, mood)
        val n = Notification.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_stat_guard)
            .setContentTitle(title)
            .setContentText(text)
            .setLargeIcon(large)
            .setStyle(
                Notification.BigPictureStyle()
                    .bigPicture(banner)
                    .setSummaryText(text)
            )
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_REMINDER)
            .setContentIntent(openApp(context))
            .build()
        nm.notify(id, n)
    }

    fun cancel(context: Context, id: Int) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(id)
    }

    /** Короткий приятный системный звук. */
    fun playChime(context: Context) {
        try {
            val r = RingtoneManager.getRingtone(context, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            r?.play()
        } catch (e: Exception) {
            // звук недоступен
        }
    }
}
