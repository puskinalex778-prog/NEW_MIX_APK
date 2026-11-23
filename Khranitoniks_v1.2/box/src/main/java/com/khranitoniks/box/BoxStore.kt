package com.khranitoniks.box

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest
import java.util.Locale
import java.util.UUID

/** Ребёнок: имя, ключ сопряжения, аватар (персонаж). */
data class Child(val id: String, val name: String, val key: String, val created: Long, val avatar: String = "hroni")

/**
 * Выданный код. [minutes] — минуты (-1 — без ограничений) для кода времени;
 * для кода-действия [action] >= 0, а [minutes] = 0. [note] — за что выдано (задание).
 */
data class Issued(
    val time: Long,
    val childName: String,
    val minutes: Int,
    val code: String,
    val childId: String = "",
    val action: Int = -1,
    val note: String = ""
)

/** Задание-награда: «Сделал уроки» → +30 мин. [option] — индекс в [CodeCrypto.OPTIONS]. */
data class Task(val id: String, val emoji: String, val title: String, val option: Int)

/** Хранилище «Хранитоникс Бокс»: дети (ключи сопряжения), история кодов, PIN родителя. */
class BoxStore(context: Context) {

    private val sp = context.applicationContext.getSharedPreferences("box_prefs", Context.MODE_PRIVATE)

    fun children(): List<Child> = try {
        val arr = JSONArray(sp.getString("children", "[]"))
        (0 until arr.length()).map {
            val o = arr.getJSONObject(it)
            Child(o.getString("id"), o.getString("name"), o.getString("key"), o.optLong("created"), o.optString("avatar", "hroni"))
        }
    } catch (e: Exception) {
        emptyList()
    }

    private fun saveChildren(list: List<Child>) {
        val arr = JSONArray()
        list.forEach {
            arr.put(
                JSONObject().put("id", it.id).put("name", it.name).put("key", it.key)
                    .put("created", it.created).put("avatar", it.avatar)
            )
        }
        sp.edit().putString("children", arr.toString()).apply()
    }

    /** Добавить ребёнка; ключ проверяется и нормализуется. Возвращает null при неверном ключе. */
    fun addChild(name: String, keyText: String, avatar: String = "hroni"): Child? {
        val bytes = CodeCrypto.parseKey(keyText) ?: return null
        val c = Child(UUID.randomUUID().toString(), name.trim().ifEmpty { "?" }, CodeCrypto.formatKey(bytes), System.currentTimeMillis(), avatar)
        saveChildren(children() + c)
        return c
    }

    fun removeChild(id: String) = saveChildren(children().filterNot { it.id == id })

    fun renameChild(id: String, name: String) =
        saveChildren(children().map { if (it.id == id) it.copy(name = name.trim().ifEmpty { it.name }) else it })

    fun setAvatar(id: String, avatar: String) =
        saveChildren(children().map { if (it.id == id) it.copy(avatar = avatar) else it })

    /** Создать код времени для ребёнка и записать в историю. */
    fun issue(child: Child, optionIndex: Int, note: String = ""): String? {
        val key = CodeCrypto.parseKey(child.key) ?: return null
        val code = CodeCrypto.makeCode(key, optionIndex)
        addHistory(Issued(System.currentTimeMillis(), child.name, CodeCrypto.OPTIONS[optionIndex], code, child.id, -1, note))
        return code
    }

    /** Создать код-действие (снять ночь, закончить перерыв…). */
    fun issueAction(child: Child, action: Int): String? {
        val key = CodeCrypto.parseKey(child.key) ?: return null
        val code = CodeCrypto.makeActionCode(key, action)
        addHistory(Issued(System.currentTimeMillis(), child.name, 0, code, child.id, action, ""))
        return code
    }

    private fun addHistory(item: Issued) {
        val list = listOf(item) + history()
        val arr = JSONArray()
        list.take(200).forEach {
            arr.put(
                JSONObject().put("t", it.time).put("n", it.childName).put("m", it.minutes).put("c", it.code)
                    .put("id", it.childId).put("a", it.action).put("note", it.note)
            )
        }
        sp.edit().putString("history", arr.toString()).apply()
    }

    fun history(): List<Issued> = try {
        val arr = JSONArray(sp.getString("history", "[]"))
        (0 until arr.length()).map {
            val o = arr.getJSONObject(it)
            Issued(
                o.getLong("t"), o.optString("n"), o.optInt("m"), o.optString("c"),
                o.optString("id"), o.optInt("a", -1), o.optString("note")
            )
        }
    } catch (e: Exception) {
        emptyList()
    }

    /** Сколько минут выдано ребёнку начиная с [since] (без «без ограничений» и действий). */
    fun minutesSince(child: Child, since: Long): Int =
        history().filter { (it.childId == child.id || (it.childId.isEmpty() && it.childName == child.name)) && it.time >= since && it.action < 0 && it.minutes > 0 }
            .sumOf { it.minutes }

    // ---------- задания-награды ----------
    fun tasks(): List<Task> {
        val raw = sp.getString("tasks", null)
        if (raw == null) return DEFAULT_TASKS
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map {
                val o = arr.getJSONObject(it)
                Task(o.getString("id"), o.optString("e", "⭐"), o.optString("t"), o.optInt("o", 3).coerceIn(0, CodeCrypto.OPTIONS.size - 1))
            }
        } catch (e: Exception) {
            DEFAULT_TASKS
        }
    }

    private fun saveTasks(list: List<Task>) {
        val arr = JSONArray()
        list.forEach { arr.put(JSONObject().put("id", it.id).put("e", it.emoji).put("t", it.title).put("o", it.option)) }
        sp.edit().putString("tasks", arr.toString()).apply()
    }

    fun addTask(emoji: String, title: String, option: Int) =
        saveTasks(tasks() + Task(UUID.randomUUID().toString(), emoji.ifBlank { "⭐" }, title.trim(), option))

    fun removeTask(id: String) = saveTasks(tasks().filterNot { it.id == id })

    // ---------- первый запуск ----------
    var guideSeen: Boolean
        get() = sp.getBoolean("guide_seen", false)
        set(v) = sp.edit().putBoolean("guide_seen", v).apply()

    fun clearHistory() = sp.edit().remove("history").apply()

    // ---------- PIN родителя (необязательный, SHA-256) ----------
    val hasPin: Boolean get() = sp.getString("pin_hash", "").orEmpty().isNotEmpty()

    fun setPin(pin: String?) {
        if (pin.isNullOrEmpty()) {
            sp.edit().remove("pin_hash").remove("pin_salt").apply()
            return
        }
        val salt = UUID.randomUUID().toString()
        sp.edit().putString("pin_salt", salt).putString("pin_hash", sha256(salt + pin)).apply()
    }

    fun checkPin(pin: String): Boolean {
        val lock = sp.getLong("lock_until", 0L)
        if (System.currentTimeMillis() < lock) return false
        val ok = sha256(sp.getString("pin_salt", "").orEmpty() + pin) == sp.getString("pin_hash", "")
        if (ok) {
            sp.edit().putInt("fails", 0).apply()
        } else {
            val f = sp.getInt("fails", 0) + 1
            if (f >= 3) sp.edit().putInt("fails", 0).putLong("lock_until", System.currentTimeMillis() + 60_000L).apply()
            else sp.edit().putInt("fails", f).apply()
        }
        return ok
    }

    fun lockedSeconds(): Int {
        val left = sp.getLong("lock_until", 0L) - System.currentTimeMillis()
        return if (left > 0) ((left + 999) / 1000).toInt() else 0
    }

    companion object {
        /** Индексы OPTIONS: 0→10, 1→15, 2→20, 3→30, 4→45, 5→60 мин. */
        val DEFAULT_TASKS = listOf(
            Task("t_homework", "📚", "Сделал(а) уроки", 3),
            Task("t_room", "🧹", "Убрал(а) комнату", 1),
            Task("t_read", "📖", "Почитал(а) книгу", 2),
            Task("t_sport", "⚽", "Спорт / прогулка", 3),
            Task("t_help", "🤝", "Помог(ла) по дому", 1)
        )
        val AVATARS = listOf("hroni", "sema", "timma", "olezhka")
    }

    private fun sha256(s: String): String =
        MessageDigest.getInstance("SHA-256").digest(s.toByteArray(Charsets.UTF_8))
            .joinToString("") { String.format(Locale.US, "%02x", it) }
}
