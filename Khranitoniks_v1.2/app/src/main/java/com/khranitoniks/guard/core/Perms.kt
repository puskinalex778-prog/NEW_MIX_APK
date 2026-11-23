package com.khranitoniks.guard.core

import android.Manifest
import android.app.AppOpsManager
import android.app.NotificationManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import com.khranitoniks.guard.R
import com.khranitoniks.guard.admin.GuardAdminReceiver

/** Проверка и выдача разрешений. */
object Perms {

    fun usage(context: Context): Boolean {
        val ops = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
        } else {
            @Suppress("DEPRECATION")
            ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
        }
        return if (mode == AppOpsManager.MODE_DEFAULT) {
            context.checkCallingOrSelfPermission(Manifest.permission.PACKAGE_USAGE_STATS) == PackageManager.PERMISSION_GRANTED
        } else mode == AppOpsManager.MODE_ALLOWED
    }

    fun overlay(context: Context): Boolean = Settings.canDrawOverlays(context)

    fun battery(context: Context): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun notifications(context: Context): Boolean {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val runtime = if (Build.VERSION.SDK_INT >= 33) {
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        } else true
        return runtime && nm.areNotificationsEnabled()
    }

    fun allRequired(context: Context): Boolean =
        usage(context) && overlay(context) && battery(context) && notifications(context)

    fun deviceAdmin(context: Context): Boolean {
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        return dpm.isAdminActive(ComponentName(context, GuardAdminReceiver::class.java))
    }

    fun dnd(context: Context): Boolean {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        return nm.isNotificationPolicyAccessGranted
    }

    fun allFiles(context: Context): Boolean =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) Environment.isExternalStorageManager()
        else context.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED

    // ---------- интенты ----------
    private fun pkgUri(context: Context) = Uri.parse("package:" + context.packageName)

    fun usageIntent(context: Context) = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)

    fun overlayIntent(context: Context) = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, pkgUri(context))

    fun batteryIntent(context: Context) =
        Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, pkgUri(context))

    fun notificationSettingsIntent(context: Context) =
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)

    fun dndIntent() = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)

    fun allFilesIntent(context: Context): Intent =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R)
            Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, pkgUri(context))
        else Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkgUri(context))

    fun appDetailsIntent(context: Context) = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkgUri(context))

    fun deviceAdminIntent(context: Context) =
        Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
            .putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, ComponentName(context, GuardAdminReceiver::class.java))
            .putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, context.getString(R.string.admin_explanation))

    /** Безопасный запуск с запасным вариантом. */
    fun open(context: Context, intent: Intent, fallback: Intent? = null): Boolean {
        val flags = if (context is android.app.Activity) 0 else Intent.FLAG_ACTIVITY_NEW_TASK
        return try {
            context.startActivity(intent.addFlags(flags))
            true
        } catch (e: Exception) {
            if (fallback != null) {
                try {
                    context.startActivity(fallback.addFlags(flags))
                    true
                } catch (e2: Exception) {
                    false
                }
            } else false
        }
    }

    /** Экраны «Автозапуск» у разных производителей (Huawei, Honor, Infinix/Tecno, Xiaomi, Samsung, Oppo, Vivo). */
    private val AUTOSTART = listOf(
        ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
        ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"),
        ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.appcontrol.activity.StartupAppControlActivity"),
        ComponentName("com.hihonor.systemmanager", "com.hihonor.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
        ComponentName("com.transsion.phonemaster", "com.cyin.himgr.autostart.AutoStartActivity"),
        ComponentName("com.transsion.phonemaster", "com.cyin.himgr.applicationmanager.view.activities.AppManagerActivity"),
        ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
        ComponentName("com.samsung.android.lool", "com.samsung.android.sm.battery.ui.BatteryActivity"),
        ComponentName("com.samsung.android.sm", "com.samsung.android.sm.ui.battery.BatteryActivity"),
        ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"),
        ComponentName("com.oplus.safecenter", "com.oplus.safecenter.permission.startup.StartupAppListActivity"),
        ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity")
    )

    fun openAutostart(context: Context): Boolean {
        for (c in AUTOSTART) {
            val i = Intent().setComponent(c).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            try {
                context.startActivity(i)
                return true
            } catch (e: Exception) {
                // пробуем следующий
            }
        }
        return open(context, appDetailsIntent(context))
    }

    /** Подсказка для конкретного производителя. */
    fun vendorHint(context: Context): String {
        val m = Build.MANUFACTURER.lowercase()
        return when {
            m.contains("samsung") -> context.getString(R.string.vendor_samsung)
            m.contains("huawei") || m.contains("honor") -> context.getString(R.string.vendor_huawei)
            m.contains("infinix") || m.contains("tecno") || m.contains("itel") -> context.getString(R.string.vendor_infinix)
            m.contains("xiaomi") || m.contains("redmi") || m.contains("poco") -> context.getString(R.string.vendor_xiaomi)
            else -> context.getString(R.string.vendor_other)
        }
    }
}
