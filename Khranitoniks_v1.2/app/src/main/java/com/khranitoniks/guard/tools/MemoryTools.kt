package com.khranitoniks.guard.tools

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.EventLog
import com.khranitoniks.guard.core.LogType
import java.io.File

/** Просмотр памяти устройства и очистка (оперативная память и мусорные файлы). */
object MemoryTools {

    data class MemInfo(
        val ramTotal: Long,
        val ramAvail: Long,
        val lowMemory: Boolean,
        val storageTotal: Long,
        val storageFree: Long
    )

    fun read(context: Context): MemInfo {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val mi = ActivityManager.MemoryInfo()
        am.getMemoryInfo(mi)
        val st = StatFs(Environment.getDataDirectory().path)
        return MemInfo(mi.totalMem, mi.availMem, mi.lowMemory, st.totalBytes, st.availableBytes)
    }

    fun cleanRam(context: Context): GameMode.KillResult {
        val r = GameMode.killBackground(context, null)
        EventLog.add(context, LogType.CLEAN, context.getString(R.string.log_ram_clean, r.count, formatBytes(r.freedBytes)))
        return r
    }

    fun formatBytes(b: Long): String {
        val v = b.toDouble()
        return when {
            v >= 1024.0 * 1024 * 1024 -> String.format("%.1f GB", v / (1024.0 * 1024 * 1024))
            v >= 1024.0 * 1024 -> String.format("%.1f MB", v / (1024.0 * 1024))
            v >= 1024.0 -> String.format("%.0f KB", v / 1024.0)
            else -> "$b B"
        }
    }

    // ---------- мусорные файлы ----------
    enum class JunkKind { APP_CACHE, TEMP, LOGS, THUMBS, EMPTY_DIRS, APK }

    data class JunkGroup(val kind: JunkKind, val files: List<File>, val bytes: Long)

    private const val MAX_FILES = 30000
    private const val MAX_DEPTH = 9

    /** Сканирование. Без доступа ко всем файлам находит только собственный кэш. */
    fun scan(context: Context, fullAccess: Boolean): List<JunkGroup> {
        val result = HashMap<JunkKind, MutableList<File>>()
        JunkKind.entries.forEach { result[it] = ArrayList() }
        // собственный кэш
        listOfNotNull(context.cacheDir, context.externalCacheDir, context.codeCacheDir).forEach { dir ->
            dir.listFiles()?.forEach { collectAll(it, result[JunkKind.APP_CACHE]!!) }
        }
        if (fullAccess) {
            @Suppress("DEPRECATION")
            val root = Environment.getExternalStorageDirectory()
            var counter = 0
            fun walk(dir: File, depth: Int) {
                if (depth > MAX_DEPTH || counter > MAX_FILES) return
                val children = dir.listFiles() ?: return
                if (children.isEmpty() && depth > 1) {
                    result[JunkKind.EMPTY_DIRS]!!.add(dir)
                    return
                }
                for (f in children) {
                    counter++
                    if (f.isDirectory) {
                        val name = f.name.lowercase()
                        if (depth == 0 && name == "android") continue
                        if (name == ".thumbnails" || name == ".thumbcache" || name == ".cache") {
                            collectAll(f, result[JunkKind.THUMBS]!!)
                            continue
                        }
                        walk(f, depth + 1)
                    } else {
                        val n = f.name.lowercase()
                        when {
                            n.endsWith(".tmp") || n.endsWith(".temp") || n.startsWith("~") || n.endsWith(".part") ||
                                n.endsWith(".crdownload") -> result[JunkKind.TEMP]!!.add(f)
                            n.endsWith(".log") || n.endsWith(".log.txt") || n.endsWith(".trace") -> result[JunkKind.LOGS]!!.add(f)
                            n.endsWith(".apk") && f.parentFile?.name.equals("download", true) -> result[JunkKind.APK]!!.add(f)
                        }
                    }
                }
            }
            walk(root, 0)
        }
        return JunkKind.entries.map { k ->
            val files = result[k]!!
            JunkGroup(k, files, files.sumOf { if (it.isFile) it.length() else 0L })
        }
    }

    private fun collectAll(f: File, out: MutableList<File>) {
        if (out.size > MAX_FILES) return
        if (f.isDirectory) f.listFiles()?.forEach { collectAll(it, out) } else out.add(f)
    }

    fun clean(context: Context, groups: List<JunkGroup>): Long {
        var freed = 0L
        groups.forEach { g ->
            g.files.forEach { f ->
                try {
                    val len = if (f.isFile) f.length() else 0L
                    if (f.delete()) freed += len
                } catch (e: Exception) {
                    // нет доступа
                }
            }
        }
        EventLog.add(context, LogType.CLEAN, context.getString(R.string.log_junk_clean, formatBytes(freed)))
        return freed
    }

    fun junkTitle(context: Context, kind: JunkKind): Int = when (kind) {
        JunkKind.APP_CACHE -> R.string.junk_app_cache
        JunkKind.TEMP -> R.string.junk_temp
        JunkKind.LOGS -> R.string.junk_logs
        JunkKind.THUMBS -> R.string.junk_thumbs
        JunkKind.EMPTY_DIRS -> R.string.junk_empty
        JunkKind.APK -> R.string.junk_apk
    }

    val supportsSystemCacheClear: Boolean get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
}
