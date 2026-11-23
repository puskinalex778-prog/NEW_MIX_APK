package com.khranitoniks.guard.admin

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.EventLog
import com.khranitoniks.guard.core.LogType

/**
 * Администратор устройства. Пока он включён, систему не даст удалить «Хранитоникс»:
 * сначала нужно выключить переключатель в «Настройки → Безопасность → Администраторы устройства».
 * Вместе с «Замком на Настройки» этот переключатель защищён PIN-кодом.
 */
class GuardAdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        EventLog.add(context, LogType.ADMIN, context.getString(R.string.log_admin_on))
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence =
        context.getString(R.string.admin_disable_warning)

    override fun onDisabled(context: Context, intent: Intent) {
        EventLog.add(context, LogType.ADMIN, context.getString(R.string.log_admin_off))
    }
}
