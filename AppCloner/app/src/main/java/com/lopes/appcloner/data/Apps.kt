package com.lopes.appcloner.data

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.PermissionInfo
import android.os.Build
import android.util.LruCache
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.core.graphics.drawable.toBitmap
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

data class AppEntry(
    val packageName: String,
    val label: String,
    val versionName: String?,
    val versionCode: Long,
    val isSystem: Boolean,
    val sizeBytes: Long,
    val apkPaths: List<String>,
    val firstInstall: Long,
    val lastUpdate: Long,
    val minSdk: Int,
    val targetSdk: Int,
) {
    val splitCount: Int get() = apkPaths.size - 1
}

data class PermItem(
    val name: String,
    val label: String,
    val dangerous: Boolean,
)

data class CloneRecord(
    val packageName: String,
    val originalPackage: String,
    val label: String,
    val createdAt: Long,
)

@Suppress("DEPRECATION")
private fun PackageManager.packageInfoCompat(pkg: String, flags: Int): PackageInfo =
    if (Build.VERSION.SDK_INT >= 33) {
        getPackageInfo(pkg, PackageManager.PackageInfoFlags.of(flags.toLong()))
    } else {
        getPackageInfo(pkg, flags)
    }

@Suppress("DEPRECATION")
private fun PackageManager.installedPackagesCompat(): List<PackageInfo> =
    if (Build.VERSION.SDK_INT >= 33) {
        getInstalledPackages(PackageManager.PackageInfoFlags.of(0))
    } else {
        getInstalledPackages(0)
    }

object AppRepository {

    fun loadApps(ctx: Context): List<AppEntry> {
        val pm = ctx.packageManager
        return pm.installedPackagesCompat().mapNotNull { pi ->
            val ai = pi.applicationInfo ?: return@mapNotNull null
            if (pi.packageName == ctx.packageName) return@mapNotNull null
            val base = ai.sourceDir ?: return@mapNotNull null
            val paths = buildList {
                add(base)
                ai.splitSourceDirs?.let { addAll(it) }
            }
            if (!File(base).canRead()) return@mapNotNull null
            AppEntry(
                packageName = pi.packageName,
                label = runCatching { ai.loadLabel(pm).toString() }.getOrDefault(pi.packageName),
                versionName = pi.versionName,
                versionCode = versionCodeOf(pi),
                isSystem = (ai.flags and ApplicationInfo.FLAG_SYSTEM) != 0 &&
                        (ai.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0,
                sizeBytes = paths.sumOf { File(it).length() },
                apkPaths = paths,
                firstInstall = pi.firstInstallTime,
                lastUpdate = pi.lastUpdateTime,
                minSdk = if (Build.VERSION.SDK_INT >= 24) ai.minSdkVersion else 1,
                targetSdk = ai.targetSdkVersion,
            )
        }
    }

    @Suppress("DEPRECATION")
    private fun versionCodeOf(pi: PackageInfo): Long =
        if (Build.VERSION.SDK_INT >= 28) pi.longVersionCode else pi.versionCode.toLong()

    fun isInstalled(ctx: Context, pkg: String): Boolean =
        runCatching { ctx.packageManager.packageInfoCompat(pkg, 0); true }.getOrDefault(false)

    @Suppress("DEPRECATION")
    fun requestedPermissions(ctx: Context, pkg: String): List<PermItem> {
        val pm = ctx.packageManager
        val info = runCatching {
            pm.packageInfoCompat(pkg, PackageManager.GET_PERMISSIONS)
        }.getOrNull() ?: return emptyList()
        val names = info.requestedPermissions ?: return emptyList()
        return names.distinct().map { name ->
            val pInfo = runCatching { pm.getPermissionInfo(name, 0) }.getOrNull()
            val label = pInfo?.loadLabel(pm)?.toString()
                ?.replaceFirstChar { it.uppercase() }
                ?.takeIf { it != name }
                ?: name.substringAfterLast('.')
            val dangerous = pInfo != null && if (Build.VERSION.SDK_INT >= 28) {
                pInfo.protection == PermissionInfo.PROTECTION_DANGEROUS
            } else {
                val base = pInfo.protectionLevel and PermissionInfo.PROTECTION_MASK_BASE
                base == PermissionInfo.PROTECTION_DANGEROUS
            }
            PermItem(name, label, dangerous)
        }.sortedWith(compareByDescending<PermItem> { it.dangerous }.thenBy { it.label })
    }
}

/** Кэш иконок, чтобы список прокручивался плавно. */
object IconCache {
    private val cache = LruCache<String, ImageBitmap>(300)

    fun peek(pkg: String): ImageBitmap? = cache.get(pkg)

    fun get(ctx: Context, pkg: String, sizePx: Int = 144): ImageBitmap? {
        cache.get(pkg)?.let { return it }
        val bmp = runCatching {
            ctx.packageManager.getApplicationIcon(pkg).toBitmap(sizePx, sizePx).asImageBitmap()
        }.getOrNull() ?: return null
        cache.put(pkg, bmp)
        return bmp
    }

    fun invalidate(pkg: String) {
        cache.remove(pkg)
    }
}

/** Список созданных клонов в SharedPreferences. */
class ClonesStore(ctx: Context) {
    private val prefs = ctx.getSharedPreferences("clones", Context.MODE_PRIVATE)

    fun all(): List<CloneRecord> {
        val raw = prefs.getString("list", "[]") ?: "[]"
        val arr = runCatching { JSONArray(raw) }.getOrDefault(JSONArray())
        return (0 until arr.length()).mapNotNull { i ->
            val o = arr.optJSONObject(i) ?: return@mapNotNull null
            CloneRecord(
                packageName = o.optString("pkg"),
                originalPackage = o.optString("orig"),
                label = o.optString("label"),
                createdAt = o.optLong("time"),
            )
        }
    }

    fun add(r: CloneRecord) = save(all().filterNot { it.packageName == r.packageName } + r)

    fun remove(pkg: String) = save(all().filterNot { it.packageName == pkg })

    private fun save(list: List<CloneRecord>) {
        val arr = JSONArray()
        list.forEach {
            arr.put(
                JSONObject()
                    .put("pkg", it.packageName)
                    .put("orig", it.originalPackage)
                    .put("label", it.label)
                    .put("time", it.createdAt)
            )
        }
        prefs.edit().putString("list", arr.toString()).apply()
    }
}
