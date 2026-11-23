package com.khranitoniks.guard.service

import android.content.ClipboardManager
import android.content.Context
import android.view.KeyEvent
import android.widget.FrameLayout
import android.content.res.ColorStateList
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.provider.Settings
import android.util.TypedValue
import android.view.ContextThemeWrapper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.BlockReason
import com.khranitoniks.guard.core.CharacterArt
import com.khranitoniks.guard.core.CheckResult
import com.khranitoniks.guard.core.extractCode
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.OverlayTheme
import com.khranitoniks.guard.core.PinManager
import com.khranitoniks.guard.core.Prefs

data class OverlayOption(val id: String, val label: String)

/** Описание того, что показать на экране блокировки. */
data class OverlaySpec(
    val reason: BlockReason,
    val title: String,
    val message: String,
    val big: String?,
    val progress: Int?,
    val sub: String?,
    val warning: String?,
    val mood: Mood,
    val pinLabel: String?,
    val showCode: Boolean,
    val showHome: Boolean,
    val optionsTitle: String,
    val options: List<OverlayOption>
)

interface OverlayListener {
    /** Выбран вариант после правильного PIN. */
    fun onOption(reason: BlockReason, optionId: String)

    /** Введён код из «Хранитоникс Бокс». Возвращает текст ошибки или null при успехе. */
    fun onCode(code: String): String?

    /** Нажато «Понятно, на главный экран». */
    fun onHome()
}

/**
 * Оверлей поверх других приложений (TYPE_APPLICATION_OVERLAY) на классических View/XML.
 * Compose здесь намеренно не используется — внутри Service нет LifecycleOwner.
 */
class OverlayController(private val context: Context, private val listener: OverlayListener) {

    private enum class Panel { MAIN, PIN, CODE, OPTIONS }

    private val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var root: View? = null
    private var spec: OverlaySpec? = null
    private var panel = Panel.MAIN
    private val input = StringBuilder()
    private var pinError: String = ""
    private var focusRequest: AudioFocusRequest? = null

    val isShowing: Boolean get() = root != null
    val reason: BlockReason? get() = if (root != null) spec?.reason else null

    fun show(newSpec: OverlaySpec) {
        if (!Settings.canDrawOverlays(context)) return
        if (root == null) {
            if (!attach()) return
            panel = Panel.MAIN
            input.setLength(0)
            pinError = ""
            requestAudioFocus()
        } else if (spec?.reason != newSpec.reason) {
            panel = Panel.MAIN
            input.setLength(0)
            pinError = ""
        }
        spec = newSpec
        render()
    }

    fun hide() {
        val v = root ?: return
        try {
            wm.removeView(v)
        } catch (e: Exception) {
            // уже удалён
        }
        root = null
        spec = null
        panel = Panel.MAIN
        input.setLength(0)
        abandonAudioFocus()
    }

    /**
     * Корневой контейнер оверлея. Окно фокусируемое, поэтому кнопка «Назад» приходит сюда,
     * а не в заблокированное приложение: ею нельзя «пролистать» блокировку.
     */
    private inner class Root(ctx: Context) : FrameLayout(ctx) {
        override fun dispatchKeyEvent(event: KeyEvent): Boolean {
            if (event.keyCode == KeyEvent.KEYCODE_BACK) {
                if (event.action == KeyEvent.ACTION_UP && panel != Panel.MAIN) {
                    panel = Panel.MAIN
                    input.setLength(0)
                    pinError = ""
                    render()
                }
                return true
            }
            return super.dispatchKeyEvent(event)
        }
    }

    private fun attach(): Boolean {
        val themed = ContextThemeWrapper(context, android.R.style.Theme_Material_NoActionBar)
        val v = Root(themed)
        LayoutInflater.from(themed).inflate(R.layout.overlay_block, v, true)
        v.isFocusable = true
        v.isFocusableInTouchMode = true
        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            PixelFormat.TRANSLUCENT
        )
        lp.gravity = Gravity.TOP or Gravity.START
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }
        return try {
            wm.addView(v, lp)
            root = v
            wireButtons(v)
            v.requestFocus()
            true
        } catch (e: Exception) {
            root = null
            false
        }
    }

    private fun wireButtons(v: View) {
        v.find<Button>(R.id.btn_pin).setOnClickListener {
            panel = Panel.PIN
            input.setLength(0)
            pinError = ""
            render()
        }
        v.find<Button>(R.id.btn_code).setOnClickListener {
            panel = Panel.CODE
            input.setLength(0)
            pinError = ""
            render()
        }
        v.find<Button>(R.id.btn_home).setOnClickListener { listener.onHome() }
        v.find<Button>(R.id.btn_paste).setOnClickListener { pasteCode() }
        v.find<Button>(R.id.btn_pin_cancel).setOnClickListener {
            panel = Panel.MAIN
            input.setLength(0)
            render()
        }
        v.find<Button>(R.id.btn_options_cancel).setOnClickListener {
            panel = Panel.MAIN
            render()
        }
        val keys = mapOf(
            R.id.key_0 to '0', R.id.key_1 to '1', R.id.key_2 to '2', R.id.key_3 to '3', R.id.key_4 to '4',
            R.id.key_5 to '5', R.id.key_6 to '6', R.id.key_7 to '7', R.id.key_8 to '8', R.id.key_9 to '9'
        )
        keys.forEach { (id, ch) ->
            v.find<Button>(id).setOnClickListener {
                val max = if (panel == Panel.CODE) 9 else 4
                if (input.length < max) input.append(ch)
                render()
            }
        }
        v.find<Button>(R.id.key_back).setOnClickListener {
            if (input.isNotEmpty()) input.setLength(input.length - 1)
            render()
        }
        v.find<Button>(R.id.key_ok).setOnClickListener { submit() }
    }

    private fun submit() {
        val s = spec ?: return
        if (panel == Panel.PIN) {
            when (val r = PinManager.verify(context, input.toString())) {
                is CheckResult.Ok -> {
                    input.setLength(0)
                    pinError = ""
                    if (s.options.size == 1) {
                        listener.onOption(s.reason, s.options[0].id)
                        panel = Panel.MAIN
                    } else {
                        panel = Panel.OPTIONS
                    }
                }
                is CheckResult.Wrong -> {
                    input.setLength(0)
                    pinError = context.getString(R.string.pin_wrong_left, r.attemptsLeft)
                }
                is CheckResult.Locked -> {
                    input.setLength(0)
                    pinError = context.getString(R.string.pin_locked_sec, r.secondsLeft)
                }
            }
        } else if (panel == Panel.CODE) {
            val err = listener.onCode(input.toString())
            input.setLength(0)
            if (err == null) {
                panel = Panel.MAIN
                pinError = ""
            } else {
                pinError = err
            }
        }
        if (root != null) render()
    }

    /** Вставка кода из буфера обмена (код прислали в мессенджере). Работает, пока окно в фокусе. */
    private fun pasteCode() {
        val text = try {
            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            cm.primaryClip?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.coerceToText(context)?.toString()
        } catch (e: Exception) {
            null
        }
        val code = extractCode(text)
        if (code == null) {
            pinError = context.getString(R.string.paste_no_code)
        } else {
            input.setLength(0)
            input.append(code)
            pinError = ""
        }
        render()
    }

    // ---------- отрисовка ----------
    private data class Palette(
        val bg: Int, val text: Int, val sub: Int, val accent: Int,
        val btn: Int, val btnText: Int, val primary: Int, val primaryText: Int, val track: Int
    )

    private fun palette(theme: OverlayTheme): Palette = when (theme) {
        OverlayTheme.DARK -> Palette(
            0xF5121820.toInt(), 0xFFFFFFFF.toInt(), 0xFFB0BEC5.toInt(), 0xFF4DD0E1.toInt(),
            0xFF263238.toInt(), 0xFFFFFFFF.toInt(), 0xFF4DD0E1.toInt(), 0xFF00131A.toInt(), 0xFF37474F.toInt()
        )
        OverlayTheme.LIGHT -> Palette(
            0xFAF7F9FC.toInt(), 0xFF1A1C1E.toInt(), 0xFF546E7A.toInt(), 0xFF3949AB.toInt(),
            0xFFE3E7EF.toInt(), 0xFF1A1C1E.toInt(), 0xFF3949AB.toInt(), 0xFFFFFFFF.toInt(), 0xFFCFD8DC.toInt()
        )
        OverlayTheme.NEON -> Palette(
            0xF70D0221.toInt(), 0xFFF8F8FF.toInt(), 0xFFC792EA.toInt(), 0xFFFF2BD6.toInt(),
            0xFF24103D.toInt(), 0xFF00F5FF.toInt(), 0xFF00F5FF.toInt(), 0xFF0D0221.toInt(), 0xFF3A1C63.toInt()
        )
    }

    private fun dp(v: Float): Float =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, context.resources.displayMetrics)

    private fun styleButton(b: Button, bg: Int, fg: Int, stroke: Int? = null) {
        val d = GradientDrawable()
        d.cornerRadius = dp(16f)
        d.setColor(bg)
        if (stroke != null) d.setStroke(dp(1.5f).toInt(), stroke)
        b.background = d
        b.setTextColor(fg)
        b.stateListAnimator = null
    }

    private fun render() {
        val v = root ?: return
        val s = spec ?: return
        val prefs = Prefs.get(context)
        val p = palette(prefs.overlayThemeKind)

        v.setBackgroundColor(p.bg)
        v.find<ImageView>(R.id.img_character).setImageResource(CharacterArt.res(prefs.characterKind, s.mood))

        val title = v.find<TextView>(R.id.txt_title)
        title.text = s.title
        title.setTextColor(if (prefs.overlayThemeKind == OverlayTheme.NEON) p.accent else p.text)

        val msg = v.find<TextView>(R.id.txt_message)
        msg.text = s.message
        msg.setTextColor(p.sub)

        val big = v.find<TextView>(R.id.txt_big)
        big.visibility = if (s.big.isNullOrEmpty()) View.GONE else View.VISIBLE
        big.text = s.big ?: ""
        big.setTextColor(if (prefs.overlayThemeKind == OverlayTheme.NEON) 0xFF00F5FF.toInt() else p.text)

        val pb = v.find<ProgressBar>(R.id.progress)
        pb.visibility = if (s.progress == null) View.GONE else View.VISIBLE
        pb.progress = (s.progress ?: 0).coerceIn(0, 100)
        pb.progressTintList = ColorStateList.valueOf(p.accent)
        pb.progressBackgroundTintList = ColorStateList.valueOf(p.track)

        val sub = v.find<TextView>(R.id.txt_sub)
        sub.visibility = if (s.sub.isNullOrEmpty()) View.GONE else View.VISIBLE
        sub.text = s.sub ?: ""
        sub.setTextColor(p.sub)

        val warn = v.find<TextView>(R.id.txt_warning)
        warn.visibility = if (s.warning.isNullOrEmpty()) View.GONE else View.VISIBLE
        warn.text = s.warning ?: ""
        warn.background = GradientDrawable().apply {
            cornerRadius = dp(14f)
            setColor(0xFFD32F2F.toInt())
        }

        // панели
        val main = v.find<LinearLayout>(R.id.panel_main)
        val pinPanel = v.find<LinearLayout>(R.id.panel_pin)
        val optPanel = v.find<LinearLayout>(R.id.panel_options)
        main.visibility = if (panel == Panel.MAIN) View.VISIBLE else View.GONE
        pinPanel.visibility = if (panel == Panel.PIN || panel == Panel.CODE) View.VISIBLE else View.GONE
        optPanel.visibility = if (panel == Panel.OPTIONS) View.VISIBLE else View.GONE

        val bPin = v.find<Button>(R.id.btn_pin)
        bPin.visibility = if (s.pinLabel == null) View.GONE else View.VISIBLE
        bPin.text = s.pinLabel ?: ""
        styleButton(bPin, p.primary, p.primaryText)
        val bCode = v.find<Button>(R.id.btn_code)
        bCode.visibility = if (s.showCode && prefs.pairingKey.isNotEmpty()) View.VISIBLE else View.GONE
        bCode.text = context.getString(R.string.overlay_btn_code)
        // яркая градиентная кнопка «🎁 Время по коду» — её должно быть видно сразу
        bCode.background = GradientDrawable(
            GradientDrawable.Orientation.LEFT_RIGHT,
            intArrayOf(0xFFFF9F1C.toInt(), 0xFFFF4D8D.toInt())
        ).apply { cornerRadius = dp(28f) }
        bCode.setTextColor(0xFFFFFFFF.toInt())
        bCode.textSize = 18f
        bCode.stateListAnimator = null
        val bHome = v.find<Button>(R.id.btn_home)
        bHome.visibility = if (s.showHome) View.VISIBLE else View.GONE
        bHome.text = context.getString(R.string.overlay_btn_home)
        v.find<TextView>(R.id.txt_hint).apply {
            visibility = if (s.showHome) View.VISIBLE else View.GONE
            setTextColor(p.sub)
        }
        styleButton(bHome, p.btn, p.btnText)

        if (panel == Panel.PIN || panel == Panel.CODE) {
            val t = v.find<TextView>(R.id.txt_pin_title)
            t.text = context.getString(if (panel == Panel.PIN) R.string.overlay_enter_pin else R.string.overlay_enter_code)
            t.setTextColor(p.text)
            val value = v.find<TextView>(R.id.txt_pin_value)
            value.text = if (panel == Panel.PIN) {
                "●".repeat(input.length) + "○".repeat((4 - input.length).coerceAtLeast(0))
            } else {
                val raw = input.toString().padEnd(9, '_')
                raw.chunked(3).joinToString(" ")
            }
            value.setTextColor(p.text)
            v.find<TextView>(R.id.txt_pin_error).text = pinError
            val paste = v.find<Button>(R.id.btn_paste)
            paste.visibility = if (panel == Panel.CODE) View.VISIBLE else View.GONE
            styleButton(paste, p.btn, p.btnText, p.accent)
            val ids = intArrayOf(
                R.id.key_0, R.id.key_1, R.id.key_2, R.id.key_3, R.id.key_4, R.id.key_5,
                R.id.key_6, R.id.key_7, R.id.key_8, R.id.key_9, R.id.key_back
            )
            ids.forEach { styleButton(v.find<Button>(it), p.btn, p.btnText) }
            styleButton(v.find<Button>(R.id.key_ok), p.primary, p.primaryText)
            styleButton(v.find<Button>(R.id.btn_pin_cancel), p.btn, p.sub)
        }

        if (panel == Panel.OPTIONS) {
            val t = v.find<TextView>(R.id.txt_options_title)
            t.text = s.optionsTitle
            t.setTextColor(p.text)
            val box = v.find<LinearLayout>(R.id.options_container)
            box.removeAllViews()
            s.options.forEach { opt ->
                val b = Button(ContextThemeWrapper(context, android.R.style.Theme_Material_NoActionBar))
                b.text = opt.label
                b.isAllCaps = false
                b.textSize = 17f
                styleButton(b, p.primary, p.primaryText)
                val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(56f).toInt())
                lp.topMargin = dp(10f).toInt()
                b.layoutParams = lp
                b.setOnClickListener {
                    val reasonNow = spec?.reason ?: return@setOnClickListener
                    panel = Panel.MAIN
                    listener.onOption(reasonNow, opt.id)
                    if (root != null) render()
                }
                box.addView(b)
            }
            styleButton(v.find<Button>(R.id.btn_options_cancel), p.btn, p.sub)
        }
    }

    @Suppress("UNNECESSARY_NOT_NULL_ASSERTION")
    private fun <T : View> View.find(id: Int): T = findViewById<T>(id)!!

    // ---------- аудиофокус: ставим на паузу видео/музыку под оверлеем ----------
    private fun requestAudioFocus() {
        try {
            val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setOnAudioFocusChangeListener { }
                .build()
            audio.requestAudioFocus(req)
            focusRequest = req
        } catch (e: Exception) {
            focusRequest = null
        }
    }

    private fun abandonAudioFocus() {
        val r = focusRequest ?: return
        try {
            audio.abandonAudioFocusRequest(r)
        } catch (e: Exception) {
            // пропуск
        }
        focusRequest = null
    }
}
