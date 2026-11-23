package com.khranitoniks.guard.core

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import org.json.JSONArray
import org.json.JSONObject

/** Список отслеживаемых приложений (TikTok, Likee, Roblox и добавленные пользователем). */
object TrackedApps {

    val DEFAULTS = listOf(
        TrackedApp(
            "tiktok", "TikTok",
            listOf(
                "com.zhiliaoapp.musically", "com.ss.android.ugc.trill",
                "com.zhiliaoapp.musically.go", "com.ss.android.ugc.aweme", "com.ss.android.ugc.tiktok.lite"
            ),
            true, 0xFF111827
        ),
        TrackedApp("likee", "Likee", listOf("video.like", "video.like.lite"), true, 0xFFFF5A36),
        TrackedApp("roblox", "Roblox", listOf("com.roblox.client"), true, 0xFF3B4252)
    )

    /** Популярные приложения, которые можно добавить одним нажатием. */
    val SUGGESTED = listOf(
        TrackedApp("youtube", "YouTube", listOf("com.google.android.youtube", "app.revanced.android.youtube"), false, 0xFFE53935),
        TrackedApp("minecraft", "Minecraft", listOf("com.mojang.minecraftpe"), false, 0xFF43A047),
        TrackedApp("brawlstars", "Brawl Stars", listOf("com.supercell.brawlstars"), false, 0xFFFFB300),
        TrackedApp("standoff2", "Standoff 2", listOf("com.axlebolt.standoff2"), false, 0xFF546E7A),
        TrackedApp("freefire", "Free Fire", listOf("com.dts.freefireth", "com.dts.freefiremax"), false, 0xFFFF7043),
        TrackedApp("pubg", "PUBG Mobile", listOf("com.tencent.ig", "com.pubg.krmobile", "com.vng.pubgmobile"), false, 0xFFF9A825),
        TrackedApp("instagram", "Instagram", listOf("com.instagram.android", "com.instagram.lite"), false, 0xFFD81B60),
        TrackedApp("vk", "VK", listOf("com.vkontakte.android"), false, 0xFF1E88E5),
        TrackedApp("vkvideo", "VK Видео", listOf("com.vk.vkvideo"), false, 0xFF0D47A1),
        TrackedApp("snapchat", "Snapchat", listOf("com.snapchat.android"), false, 0xFFFDD835),
        TrackedApp("twitch", "Twitch", listOf("tv.twitch.android.app"), false, 0xFF7E57C2),
        TrackedApp("subway", "Subway Surfers", listOf("com.kiloo.subwaysurf"), false, 0xFF26A69A)
    )

    private val PALETTE = longArrayOf(
        0xFF5C6BC0, 0xFF26A69A, 0xFFEF6C00, 0xFF8E24AA, 0xFF00897B, 0xFFC62828, 0xFF3949AB, 0xFF6D4C41
    )

    fun load(context: Context): List<TrackedApp> {
        val json = Prefs.get(context).trackedJson
        if (json.isBlank()) return DEFAULTS
        return try {
            val arr = JSONArray(json)
            val list = ArrayList<TrackedApp>()
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                val pk = o.getJSONArray("p")
                val pkgs = (0 until pk.length()).map { pk.getString(it) }
                list.add(
                    TrackedApp(
                        o.getString("id"), o.getString("n"), pkgs, o.optBoolean("b"),
                        o.optLong("c", PALETTE[0]), o.optInt("l", 0)
                    )
                )
            }
            // пустой список — это осознанный выбор родителя (всё удалено), а не «вернуть стандартные»
            list
        } catch (e: Exception) {
            DEFAULTS
        }
    }

    fun save(context: Context, list: List<TrackedApp>) {
        val arr = JSONArray()
        list.forEach { a ->
            arr.put(JSONObject().apply {
                put("id", a.id)
                put("n", a.name)
                put("p", JSONArray(a.packages))
                put("b", a.builtIn)
                put("c", a.color)
                put("l", a.limitMin)
            })
        }
        Prefs.get(context).trackedJson = arr.toString()
    }

    fun add(context: Context, app: TrackedApp) {
        val list = load(context).toMutableList()
        if (list.any { it.id == app.id || it.packages.intersect(app.packages.toSet()).isNotEmpty() }) return
        list.add(app)
        save(context, list)
    }

    fun addPackage(context: Context, pkg: String, label: String) {
        val color = PALETTE[(pkg.hashCode() and 0x7fffffff) % PALETTE.size]
        add(context, TrackedApp("pkg_$pkg", label, listOf(pkg), false, color))
    }

    fun remove(context: Context, id: String) {
        save(context, load(context).filterNot { it.id == id })
    }

    /** Личный лимит приложения (минуты, 0 — нет). */
    fun setLimit(context: Context, id: String, minutes: Int) {
        save(context, load(context).map { if (it.id == id) it.copy(limitMin = minutes.coerceAtLeast(0)) else it })
    }

    /** Вернуть стандартный набор (TikTok, Likee, Roblox), не трогая добавленные приложения. */
    fun restoreDefaults(context: Context) {
        val list = load(context).toMutableList()
        DEFAULTS.forEach { d -> if (list.none { it.id == d.id }) list.add(d) }
        save(context, list)
    }

    fun allPackages(list: List<TrackedApp>): Set<String> = list.flatMap { it.packages }.toSet()

    fun groupOf(list: List<TrackedApp>, pkg: String?): TrackedApp? =
        if (pkg == null) null else list.firstOrNull { pkg in it.packages }

    fun isInstalled(context: Context, pkg: String): Boolean =
        try {
            @Suppress("DEPRECATION")
            context.packageManager.getPackageInfo(pkg, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }

    /** Первый установленный пакет из группы, у которого есть экран запуска. */
    fun installedPackage(context: Context, app: TrackedApp): String? =
        app.packages.firstOrNull { isInstalled(context, it) && context.packageManager.getLaunchIntentForPackage(it) != null }
            ?: app.packages.firstOrNull { isInstalled(context, it) }

    fun launch(context: Context, app: TrackedApp): Boolean {
        val pkg = installedPackage(context, app) ?: return false
        val intent = context.packageManager.getLaunchIntentForPackage(pkg) ?: return false
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return try {
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun label(context: Context, pkg: String): String =
        try {
            val pm = context.packageManager
            @Suppress("DEPRECATION")
            pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
        } catch (e: Exception) {
            pkg
        }
}
