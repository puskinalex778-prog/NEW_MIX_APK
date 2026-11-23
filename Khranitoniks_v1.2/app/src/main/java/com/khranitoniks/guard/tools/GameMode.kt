package com.khranitoniks.guard.tools

import android.app.ActivityManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.provider.Settings
import android.telecom.TelecomManager
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.EventLog
import com.khranitoniks.guard.core.LogType
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.core.Prefs

/**
 * Игровой режим без root:
 *  • «Не беспокоить» (режим «Только важные» — звонки работают по системным правилам);
 *  • выгрузка фоновых процессов других приложений (killBackgroundProcesses);
 *  • НЕ трогаются: VPN и прокси, приложения из исключений, сама игра, лаунчер, клавиатура, звонилка, системные.
 */
object GameMode {

    /** Подсказки в названиях пакетов прокси/VPN-клиентов. */
    private val PROXY_HINTS = listOf(
        "vpn", "proxy", "v2ray", "xray", "clash", "shadowsocks", "wireguard", "outline", "psiphon",
        "torproject", "orbot", "nekobox", "hiddify", "amnezia", "openvpn", "sing-box", "singbox",
        "lantern", "onedotonedotonedotone", "trojan", "tunnel", "windscribe", "protonvpn", "adguard"
    )

    /** Приложения, объявившие VpnService. */
    fun vpnPackages(context: Context): Set<String> {
        val pm = context.packageManager
        return try {
            @Suppress("DEPRECATION")
            pm.queryIntentServices(Intent("android.net.VpnService"), PackageManager.GET_META_DATA)
                .mapNotNull { it.serviceInfo?.packageName }
                .toSet()
        } catch (e: Exception) {
            emptySet()
        }
    }

    fun isProxyLike(pkg: String): Boolean {
        val p = pkg.lowercase()
        return PROXY_HINTS.any { p.contains(it) }
    }

    private fun launcherPackages(context: Context): Set<String> {
        val i = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
        return try {
            @Suppress("DEPRECATION")
            context.packageManager.queryIntentActivities(i, 0).mapNotNull { it.activityInfo?.packageName }.toSet()
        } catch (e: Exception) {
            emptySet()
        }
    }

    private fun imePackage(context: Context): String? =
        try {
            Settings.Secure.getString(context.contentResolver, Settings.Secure.DEFAULT_INPUT_METHOD)
                ?.substringBefore('/')
        } catch (e: Exception) {
            null
        }

    fun dialerPackage(context: Context): String? =
        try {
            (context.getSystemService(Context.TELECOM_SERVICE) as TelecomManager).defaultDialerPackage
        } catch (e: Exception) {
            null
        }

    /** Пакеты, которые никогда не выгружаются. */
    fun protectedPackages(context: Context, game: String?): Set<String> {
        val prefs = Prefs.get(context)
        val set = HashSet<String>()
        set.addAll(vpnPackages(context))
        set.addAll(prefs.gameExclusions)
        set.addAll(launcherPackages(context))
        imePackage(context)?.let { set.add(it) }
        dialerPackage(context)?.let { set.add(it) }
        set.add(context.packageName)
        set.add("com.android.systemui")
        set.add("com.google.android.gms")
        if (!game.isNullOrEmpty()) set.add(game)
        return set
    }

    data class KillResult(val count: Int, val freedBytes: Long)

    fun killBackground(context: Context, game: String?): KillResult {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val before = ActivityManager.MemoryInfo().also { am.getMemoryInfo(it) }.availMem
        val protect = protectedPackages(context, game)
        var count = 0
        @Suppress("DEPRECATION")
        val apps = try {
            context.packageManager.getInstalledApplications(0)
        } catch (e: Exception) {
            emptyList<ApplicationInfo>()
        }
        for (app in apps) {
            val pkg = app.packageName
            val system = (app.flags and ApplicationInfo.FLAG_SYSTEM) != 0 &&
                (app.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0
            if (system || pkg in protect || isProxyLike(pkg)) continue
            try {
                am.killBackgroundProcesses(pkg)
                count++
            } catch (e: Exception) {
                // нет доступа на этой прошивке
            }
        }
        val after = ActivityManager.MemoryInfo().also { am.getMemoryInfo(it) }.availMem
        return KillResult(count, (after - before).coerceAtLeast(0L))
    }

    /** Включить игровой режим и (если указана) запустить игру. */
    fun enable(context: Context, game: String?): KillResult {
        val prefs = Prefs.get(context)
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (prefs.gameDnd && Perms.dnd(context)) {
            if (!prefs.gameActive) prefs.gamePrevFilter = nm.currentInterruptionFilter
            try {
                nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
            } catch (e: Exception) {
                // нет доступа
            }
        }
        prefs.gameActive = true
        prefs.gamePackage = game ?: ""
        prefs.gameLastSeen = System.currentTimeMillis()
        prefs.gameLastKill = System.currentTimeMillis()
        val r = killBackground(context, game)
        EventLog.add(context, LogType.GAME_MODE, context.getString(R.string.log_game_on, r.count))
        if (!game.isNullOrEmpty()) {
            context.packageManager.getLaunchIntentForPackage(game)?.let {
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                try {
                    context.startActivity(it)
                } catch (e: Exception) {
                    // не удалось запустить
                }
            }
        }
        return r
    }

    fun disable(context: Context) {
        val prefs = Prefs.get(context)
        if (!prefs.gameActive) return
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Perms.dnd(context) && prefs.gamePrevFilter > 0) {
            try {
                nm.setInterruptionFilter(prefs.gamePrevFilter)
            } catch (e: Exception) {
                // нет доступа
            }
        }
        prefs.gamePrevFilter = -1
        prefs.gameActive = false
        EventLog.add(context, LogType.GAME_MODE, context.getString(R.string.log_game_off))
    }
}
