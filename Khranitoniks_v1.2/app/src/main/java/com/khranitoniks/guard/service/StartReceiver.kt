package com.khranitoniks.guard.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Автозапуск после перезагрузки, обновления приложения и по «сторожу» AlarmManager. */
class StartReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON",
            GuardService.ACTION_WATCHDOG -> {
                GuardService.start(context)
                GuardService.scheduleWatchdog(context)
            }
        }
    }
}
