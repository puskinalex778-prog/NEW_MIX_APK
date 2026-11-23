package com.khranitoniks.guard.core

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/** Журнал событий: прерванные зарядки, разблокировки, бонусы, ошибки PIN. */
object EventLog {

    private const val MAX = 400
    private const val KEEP_MS = 14 * TimeUtil.DAY
    private val lock = Any()

    private fun file(context: Context) = File(context.applicationContext.filesDir, "events.json")

    fun all(context: Context): List<LogEntry> = synchronized(lock) {
        try {
            val f = file(context)
            if (!f.exists()) return emptyList()
            val arr = JSONArray(f.readText())
            (0 until arr.length()).map {
                val o = arr.getJSONObject(it)
                LogEntry(o.getLong("t"), o.optString("y"), o.optString("x"))
            }.sortedByDescending { it.time }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun add(context: Context, type: String, text: String) = synchronized(lock) {
        val now = System.currentTimeMillis()
        val list = ArrayList(all(context).filter { now - it.time < KEEP_MS })
        list.add(0, LogEntry(now, type, text))
        val arr = JSONArray()
        list.take(MAX).forEach { arr.put(JSONObject().put("t", it.time).put("y", it.type).put("x", it.text)) }
        try {
            file(context).writeText(arr.toString())
        } catch (e: Exception) {
            // нет места — пропускаем
        }
    }

    fun clear(context: Context) = synchronized(lock) {
        file(context).delete()
    }
}
