@file:OptIn(ExperimentalMaterial3Api::class)

package com.khranitoniks.box

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(statusBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT))
        super.onCreate(savedInstanceState)
        setContent { BoxTheme { BoxRoot() } }
    }
}

// =====================================================================
//  оформление
// =====================================================================
private val Teal = Color(0xFF00A896)
private val GradHero = Brush.linearGradient(listOf(Color(0xFF00A896), Color(0xFF0088D1)))
private val GradCode = Brush.linearGradient(listOf(Color(0xFFFF9F1C), Color(0xFFFF4D8D)))
private val GradTime = Brush.linearGradient(listOf(Color(0xFF6C5CE7), Color(0xFF00B8D4)))
private val GradNight = Brush.linearGradient(listOf(Color(0xFF283593), Color(0xFF6A1B9A)))

@Composable
private fun BoxTheme(content: @Composable () -> Unit) {
    val light = lightColorScheme(
        primary = Teal,
        onPrimary = Color.White,
        primaryContainer = Color(0xFFC8F2EC),
        onPrimaryContainer = Color(0xFF00201C),
        secondary = Color(0xFFFF8F00),
        secondaryContainer = Color(0xFFFFE6C2),
        onSecondaryContainer = Color(0xFF3E2600),
        tertiaryContainer = Color(0xFFE6E2FF),
        background = Color(0xFFF2F8F7),
        surface = Color.White,
        surfaceVariant = Color(0xFFE3EEEC),
        outline = Color(0xFFBFD3CF)
    )
    val dark = darkColorScheme(
        primary = Color(0xFF5EE0CF),
        onPrimary = Color(0xFF00382F),
        primaryContainer = Color(0xFF00504A),
        onPrimaryContainer = Color(0xFFC8F2EC),
        secondary = Color(0xFFFFC46B),
        secondaryContainer = Color(0xFF5A3A00),
        onSecondaryContainer = Color(0xFFFFE6C2),
        tertiaryContainer = Color(0xFF3B2DA8),
        background = Color(0xFF0E1413),
        surface = Color(0xFF18201F),
        surfaceVariant = Color(0xFF26302E),
        outline = Color(0xFF3E4C49)
    )
    MaterialTheme(colorScheme = if (isSystemInDarkTheme()) dark else light, content = content)
}

fun optionLabel(ctx: Context, minutes: Int): String =
    if (minutes < 0) ctx.getString(R.string.opt_unlimited) else ctx.getString(R.string.opt_minutes, minutes)

fun actionLabel(ctx: Context, action: Int): String = ctx.getString(
    when (action) {
        CodeCrypto.ACT_NIGHT_60 -> R.string.act_night_60
        CodeCrypto.ACT_NIGHT_MORNING -> R.string.act_night_morning
        CodeCrypto.ACT_END_BREAK -> R.string.act_end_break
        CodeCrypto.ACT_CHARGE_UNPLUG -> R.string.act_charge_unplug
        CodeCrypto.ACT_SCHOOL_OFF -> R.string.act_school_off
        else -> R.string.act_settings_10
    }
)

private fun actionEmoji(action: Int): String = when (action) {
    CodeCrypto.ACT_NIGHT_60 -> "🌙"
    CodeCrypto.ACT_NIGHT_MORNING -> "🌅"
    CodeCrypto.ACT_END_BREAK -> "⏩"
    CodeCrypto.ACT_CHARGE_UNPLUG -> "🔌"
    CodeCrypto.ACT_SCHOOL_OFF -> "🎒"
    else -> "⚙️"
}

private fun avatarRes(key: String): Int = when (key) {
    "sema" -> R.drawable.char_sema_happy
    "timma" -> R.drawable.char_timma_happy
    "olezhka" -> R.drawable.char_olezhka_happy
    else -> R.drawable.char_hroni_happy
}

private fun issuedLabel(ctx: Context, h: Issued): String =
    if (h.action >= 0) actionLabel(ctx, h.action) else optionLabel(ctx, h.minutes)

private fun startOfDay(offsetDays: Int = 0): Long {
    val c = Calendar.getInstance()
    c.set(Calendar.HOUR_OF_DAY, 0)
    c.set(Calendar.MINUTE, 0)
    c.set(Calendar.SECOND, 0)
    c.set(Calendar.MILLISECOND, 0)
    c.add(Calendar.DAY_OF_YEAR, offsetDays)
    return c.timeInMillis
}

private fun fmtTime(t: Long): String = SimpleDateFormat("dd.MM HH:mm", Locale.getDefault()).format(Date(t))

/** Выданный код, который показываем в диалоге. */
private data class Shown(val child: Child, val code: String, val label: String, val time: Long)

// =====================================================================
//  общие компоненты
// =====================================================================
@Composable
private fun TopBar(title: String, subtitle: String? = null, onBack: (() -> Unit)? = null, actions: @Composable () -> Unit = {}) {
    Box(
        Modifier
            .fillMaxWidth()
            .background(GradHero)
            .statusBarsPadding()
            .padding(horizontal = 8.dp, vertical = 10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back), tint = Color.White)
                }
            } else Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                if (!subtitle.isNullOrEmpty()) Text(subtitle, color = Color.White.copy(alpha = 0.85f), style = MaterialTheme.typography.bodySmall)
            }
            actions()
        }
    }
}

@Composable
private fun GradCard(brush: Brush, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    val shape = RoundedCornerShape(26.dp)
    Column(
        modifier
            .fillMaxWidth()
            .shadow(6.dp, shape, clip = false)
            .clip(shape)
            .background(brush)
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        content = content
    )
}

@Composable
private fun Section(title: String, emoji: String? = null, content: @Composable ColumnScope.() -> Unit) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (emoji != null) {
                    Box(
                        Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) { Text(emoji, fontSize = 17.sp) }
                    Spacer(Modifier.width(10.dp))
                }
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            content()
        }
    }
}

@Composable
private fun Avatar(key: String, size: Dp) {
    Box(
        Modifier
            .size(size)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.primaryContainer),
        contentAlignment = Alignment.Center
    ) {
        Image(painterResource(avatarRes(key)), contentDescription = null, modifier = Modifier.size(size * 0.92f))
    }
}

@Composable
private fun Banner(res: Int, ratio: Float) {
    Image(
        painterResource(res),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(ratio)
            .clip(RoundedCornerShape(26.dp))
    )
}

// =====================================================================
//  корень
// =====================================================================
@Composable
private fun BoxRoot() {
    val ctx = LocalContext.current
    val store = remember { BoxStore(ctx) }
    var unlocked by remember { mutableStateOf(!store.hasPin) }
    if (!unlocked) {
        LockScreen(store) { unlocked = true }
    } else {
        MainScreen(store)
    }
}

@Composable
private fun LockScreen(store: BoxStore, onOk: () -> Unit) {
    val ctx = LocalContext.current
    var pin by remember { mutableStateOf("") }
    var err by remember { mutableStateOf("") }
    Column(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .systemBarsPadding()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Banner(R.drawable.box_hero, 2f)
        Spacer(Modifier.height(20.dp))
        Text(stringResource(R.string.lock_title), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = pin,
            onValueChange = { pin = it.filter { c -> c in '0'..'9' }.take(4) },
            label = { Text(stringResource(R.string.pin_label)) },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
        )
        if (err.isNotEmpty()) Text(err, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
        Spacer(Modifier.height(16.dp))
        Button(enabled = pin.length == 4, modifier = Modifier.fillMaxWidth().height(52.dp), onClick = {
            val locked = store.lockedSeconds()
            if (locked > 0) {
                err = ctx.getString(R.string.pin_locked, locked)
            } else if (store.checkPin(pin)) {
                onOk()
            } else {
                val l = store.lockedSeconds()
                err = if (l > 0) ctx.getString(R.string.pin_locked, l) else ctx.getString(R.string.pin_wrong)
            }
            pin = ""
        }) { Text(stringResource(R.string.unlock)) }
    }
}

@Composable
private fun MainScreen(store: BoxStore) {
    val ctx = LocalContext.current
    var tab by remember { mutableStateOf(0) }
    var children by remember { mutableStateOf(store.children()) }
    var history by remember { mutableStateOf(store.history()) }
    var selected by remember { mutableStateOf<Child?>(null) }
    var showAdd by remember { mutableStateOf(false) }
    var shown by remember { mutableStateOf<Shown?>(null) }

    fun refresh() {
        children = store.children()
        history = store.history()
    }

    BackHandler(enabled = selected != null || tab != 0) {
        if (selected != null) selected = null else tab = 0
    }

    val sel = selected
    val title = when {
        sel != null -> sel.name
        tab == 1 -> stringResource(R.string.history)
        tab == 2 -> stringResource(R.string.guide_title)
        tab == 3 -> stringResource(R.string.settings)
        else -> stringResource(R.string.app_name)
    }
    val subtitle = if (sel == null && tab == 0) stringResource(R.string.main_subtitle) else null

    Scaffold(
        topBar = { TopBar(title, subtitle, onBack = if (sel != null) ({ selected = null }) else null) },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                val colors = NavigationBarItemDefaults.colors(
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary
                )
                NavigationBarItem(tab == 0 && sel == null, { tab = 0; selected = null }, { Icon(Icons.Filled.Face, null) }, label = { Text(stringResource(R.string.tab_children)) }, colors = colors)
                NavigationBarItem(tab == 1 && sel == null, { tab = 1; selected = null }, { Icon(Icons.Filled.List, null) }, label = { Text(stringResource(R.string.tab_history)) }, colors = colors)
                NavigationBarItem(tab == 2 && sel == null, { tab = 2; selected = null }, { Icon(Icons.Filled.Info, null) }, label = { Text(stringResource(R.string.tab_guide)) }, colors = colors)
                NavigationBarItem(tab == 3 && sel == null, { tab = 3; selected = null }, { Icon(Icons.Filled.Settings, null) }, label = { Text(stringResource(R.string.settings)) }, colors = colors)
            }
        }
    ) { padding ->
        Box(
            Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                sel != null -> ChildScreen(
                    store, sel,
                    onIssued = { s ->
                        shown = s
                        refresh()
                    },
                    onChanged = {
                        refresh()
                        selected = store.children().firstOrNull { it.id == sel.id }
                    }
                )
                tab == 1 -> HistoryScreen(store, children, history, onChanged = { refresh() })
                tab == 2 -> GuideScreen()
                tab == 3 -> SettingsScreen(store, onChanged = { refresh() }, onGuide = { tab = 2 })
                else -> ChildrenScreen(store, children, history, onSelect = { selected = it }, onAdd = { showAdd = true }, onGuide = { tab = 2 })
            }
        }
    }

    if (showAdd) {
        AddChildDialog(store, onDismiss = { showAdd = false }, onAdded = {
            showAdd = false
            refresh()
        })
    }
    val s = shown
    if (s != null) CodeDialog(s) { shown = null }
}

// =====================================================================
//  дети
// =====================================================================
@Composable
private fun ChildrenScreen(
    store: BoxStore,
    children: List<Child>,
    history: List<Issued>,
    onSelect: (Child) -> Unit,
    onAdd: () -> Unit,
    onGuide: () -> Unit
) {
    @Suppress("UNUSED_VARIABLE") val h = history.size // перерисовка после выдачи кода
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            GradCard(GradHero) {
                Image(
                    painterResource(R.drawable.box_hero),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(2f)
                        .clip(RoundedCornerShape(20.dp))
                )
                Text(stringResource(R.string.intro_title), color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                Text(
                    stringResource(if (children.isEmpty()) R.string.intro_text_empty else R.string.intro_text),
                    color = Color.White.copy(alpha = 0.92f), style = MaterialTheme.typography.bodySmall
                )
            }
        }
        if (!store.guideSeen) {
            item {
                Card(
                    onClick = onGuide,
                    shape = RoundedCornerShape(22.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("📖", fontSize = 28.sp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(stringResource(R.string.guide_card_title), fontWeight = FontWeight.Bold)
                            Text(stringResource(R.string.guide_card_text), style = MaterialTheme.typography.bodySmall)
                        }
                        Text("›", fontSize = 28.sp)
                    }
                }
            }
        }
        items(children, key = { it.id }) { c ->
            val today = store.minutesSince(c, startOfDay())
            val week = store.minutesSince(c, startOfDay(-6))
            Card(
                onClick = { onSelect(c) },
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Avatar(c.avatar, 64.dp)
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(c.name, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                        Text(stringResource(R.string.child_given, today, week), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(50))
                            .background(GradCode)
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) { Text(stringResource(R.string.give_time_btn), color = Color.White, fontWeight = FontWeight.Bold) }
                }
            }
        }
        item {
            Button(onClick = onAdd, modifier = Modifier.fillMaxWidth().height(54.dp)) {
                Icon(Icons.Filled.Add, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.add_child))
            }
        }
    }
}

@Composable
private fun ChildScreen(store: BoxStore, child: Child, onIssued: (Shown) -> Unit, onChanged: () -> Unit) {
    val ctx = LocalContext.current
    var showKey by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var rename by remember { mutableStateOf(false) }
    var openActions by remember { mutableStateOf(false) }
    val tasks = remember { store.tasks() }

    fun give(idx: Int, note: String = "") {
        val c = store.issue(child, idx, note)
        if (c != null) onIssued(Shown(child, c, optionLabel(ctx, CodeCrypto.OPTIONS[idx]) + if (note.isNotEmpty()) " · $note" else "", System.currentTimeMillis()))
    }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            GradCard(GradTime) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Avatar(child.avatar, 72.dp)
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text(child.name, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                        Text(
                            stringResource(R.string.child_given, store.minutesSince(child, startOfDay()), store.minutesSince(child, startOfDay(-6))),
                            color = Color.White.copy(alpha = 0.9f), style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }

        // ---------- быстрые кнопки времени ----------
        item {
            Section(stringResource(R.string.choose_time), "⏱") {
                CodeCrypto.OPTIONS.indices.toList().chunked(3).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        row.forEach { idx ->
                            val m = CodeCrypto.OPTIONS[idx]
                            Box(
                                Modifier
                                    .weight(1f)
                                    .height(58.dp)
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(if (m < 0) GradCode else GradTime)
                                    .clickable { give(idx) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    if (m < 0) "∞" else optionLabel(ctx, m),
                                    color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = if (m < 0) 26.sp else 17.sp,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                        repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
                Text(stringResource(R.string.unlimited_hint), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        // ---------- задания-награды ----------
        item {
            Section(stringResource(R.string.tasks_title), "🏅") {
                Text(stringResource(R.string.tasks_sub), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                tasks.forEach { t ->
                    Card(
                        onClick = { give(t.option, t.title) },
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(t.emoji, fontSize = 24.sp)
                            Spacer(Modifier.width(12.dp))
                            Text(t.title, Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                            Text(optionLabel(ctx, CodeCrypto.OPTIONS[t.option]), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // ---------- коды-действия ----------
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .clickable { openActions = !openActions },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🪄", fontSize = 22.sp)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(stringResource(R.string.actions_title), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(stringResource(R.string.actions_sub), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Icon(if (openActions) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown, contentDescription = null)
                    }
                    AnimatedVisibility(openActions) {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            CodeCrypto.ACTIONS.forEach { a ->
                                Card(
                                    onClick = {
                                        val c = store.issueAction(child, a)
                                        if (c != null) onIssued(Shown(child, c, actionLabel(ctx, a), System.currentTimeMillis()))
                                    },
                                    shape = RoundedCornerShape(18.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Text(actionEmoji(a), fontSize = 22.sp)
                                        Spacer(Modifier.width(12.dp))
                                        Text(actionLabel(ctx, a).replaceFirstChar { it.uppercase() }, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }
                            Text(stringResource(R.string.actions_note), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        // ---------- профиль ----------
        item {
            Section(stringResource(R.string.child_profile), "👤") {
                Text(stringResource(R.string.avatar_choose), style = MaterialTheme.typography.labelLarge)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    BoxStore.AVATARS.forEach { a ->
                        Box(
                            Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(18.dp))
                                .background(if (a == child.avatar) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable {
                                    store.setAvatar(child.id, a)
                                    onChanged()
                                }
                                .padding(6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(painterResource(avatarRes(a)), contentDescription = null, modifier = Modifier.size(56.dp))
                        }
                    }
                }
                HorizontalDivider()
                Text(stringResource(R.string.pair_key), style = MaterialTheme.typography.titleSmall)
                Text(
                    if (showKey) child.key else "••••-••••-••••-••••-•",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = { showKey = !showKey }) { Text(stringResource(if (showKey) R.string.hide else R.string.show)) }
                    TextButton(onClick = { Clip.copy(ctx, child.key, R.string.key_copied, sensitive = true) }) { Text(stringResource(R.string.copy)) }
                    TextButton(onClick = { rename = true }) { Text(stringResource(R.string.rename)) }
                }
                TextButton(onClick = { confirmDelete = true }) {
                    Icon(Icons.Filled.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.width(6.dp))
                    Text(stringResource(R.string.delete), color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text(stringResource(R.string.delete)) },
            text = { Text(stringResource(R.string.delete_child_q, child.name)) },
            confirmButton = {
                TextButton(onClick = {
                    store.removeChild(child.id)
                    confirmDelete = false
                    onChanged()
                }) { Text(stringResource(R.string.delete), color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
    if (rename) {
        var name by remember { mutableStateOf(child.name) }
        AlertDialog(
            onDismissRequest = { rename = false },
            title = { Text(stringResource(R.string.rename)) },
            text = {
                OutlinedTextField(value = name, onValueChange = { name = it.take(30) }, singleLine = true, label = { Text(stringResource(R.string.child_name)) })
            },
            confirmButton = {
                TextButton(onClick = {
                    store.renameChild(child.id, name)
                    rename = false
                    onChanged()
                }) { Text(stringResource(R.string.save)) }
            },
            dismissButton = { TextButton(onClick = { rename = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
}

/** Большой код в диалоге: копировать, SMS, отправить. */
@Composable
private fun CodeDialog(s: Shown, onDismiss: () -> Unit) {
    val ctx = LocalContext.current
    val pretty = CodeCrypto.prettyCode(s.code)
    val msg = ctx.getString(R.string.code_message_named, s.child.name, s.label, pretty)
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.close)) } },
        text = {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Avatar(s.child.avatar, 72.dp)
                Text(stringResource(R.string.code_for, s.child.name, s.label), textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold)
                Box(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(22.dp))
                        .background(GradCode)
                        .clickable { Clip.copy(ctx, pretty, R.string.copied) }
                        .padding(vertical = 18.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(pretty, color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold, fontFamily = FontFamily.Monospace)
                }
                Text(
                    stringResource(R.string.code_expires, fmtTime(s.time + CodeCrypto.VALID_HOURS * 3_600_000L)),
                    style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = { Clip.copy(ctx, pretty, R.string.copied) }, modifier = Modifier.weight(1f)) { Text(stringResource(R.string.copy)) }
                    OutlinedButton(onClick = { Clip.copy(ctx, msg, R.string.message_copied) }, modifier = Modifier.weight(1f)) {
                        Text(stringResource(R.string.copy_message), textAlign = TextAlign.Center, maxLines = 2)
                    }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = {
                        val i = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:")).putExtra("sms_body", msg)
                        try {
                            ctx.startActivity(i)
                        } catch (e: Exception) {
                            Toast.makeText(ctx, R.string.no_sms_app, Toast.LENGTH_SHORT).show()
                        }
                    }, modifier = Modifier.weight(1f)) { Text(stringResource(R.string.sms)) }
                    OutlinedButton(onClick = {
                        val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, msg)
                        ctx.startActivity(Intent.createChooser(send, ctx.getString(R.string.share)))
                    }, modifier = Modifier.weight(1f)) { Text(stringResource(R.string.share)) }
                }
                Text(stringResource(R.string.code_valid), style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center)
            }
        }
    )
}

@Composable
private fun AddChildDialog(store: BoxStore, onDismiss: () -> Unit, onAdded: () -> Unit) {
    val ctx = LocalContext.current
    var name by remember { mutableStateOf("") }
    var avatar by remember { mutableStateOf("hroni") }
    var mode by remember { mutableStateOf(0) }
    var keyText by remember { mutableStateOf("") }
    val generated = remember { CodeCrypto.formatKey(CodeCrypto.generateKey()) }
    var err by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.add_child)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it.take(30) },
                    label = { Text(stringResource(R.string.child_name)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    BoxStore.AVATARS.forEach { a ->
                        Box(
                            Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (a == avatar) MaterialTheme.colorScheme.primaryContainer else Color.Transparent)
                                .clickable { avatar = a }
                                .padding(4.dp),
                            contentAlignment = Alignment.Center
                        ) { Image(painterResource(avatarRes(a)), contentDescription = null, modifier = Modifier.size(44.dp)) }
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = mode == 0, onClick = { mode = 0 }, label = { Text(stringResource(R.string.mode_enter)) })
                    FilterChip(selected = mode == 1, onClick = { mode = 1 }, label = { Text(stringResource(R.string.mode_create)) })
                }
                if (mode == 0) {
                    Text(stringResource(R.string.mode_enter_hint), style = MaterialTheme.typography.bodySmall)
                    OutlinedTextField(
                        value = keyText,
                        onValueChange = { keyText = it.uppercase().take(24) },
                        label = { Text("XXXX-XXXX-XXXX-XXXX-X") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    TextButton(onClick = {
                        val k = Clip.extractKey(Clip.read(ctx))
                        if (k.isNullOrEmpty()) err = ctx.getString(R.string.paste_empty) else {
                            keyText = k
                            err = ""
                        }
                    }) { Text(stringResource(R.string.paste)) }
                } else {
                    Text(stringResource(R.string.mode_create_hint), style = MaterialTheme.typography.bodySmall)
                    Text(generated, fontFamily = FontFamily.Monospace, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { Clip.copy(ctx, generated, R.string.key_copied, sensitive = true) }) { Text(stringResource(R.string.copy)) }
                        OutlinedButton(onClick = {
                            val send = Intent(Intent.ACTION_SEND).setType("text/plain")
                                .putExtra(Intent.EXTRA_TEXT, ctx.getString(R.string.key_share_text, generated))
                            ctx.startActivity(Intent.createChooser(send, ctx.getString(R.string.share)))
                        }) { Text(stringResource(R.string.share)) }
                    }
                }
                if (err.isNotEmpty()) Text(err, color = MaterialTheme.colorScheme.error)
            }
        },
        confirmButton = {
            TextButton(enabled = name.isNotBlank(), onClick = {
                val c = store.addChild(name, if (mode == 0) keyText else generated, avatar)
                if (c == null) err = ctx.getString(R.string.key_invalid) else onAdded()
            }) { Text(stringResource(R.string.save)) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}

// =====================================================================
//  история
// =====================================================================
@Composable
private fun HistoryScreen(store: BoxStore, children: List<Child>, history: List<Issued>, onChanged: () -> Unit) {
    val ctx = LocalContext.current
    var filter by remember { mutableStateOf<String?>(null) }
    val list = history.filter { h -> filter == null || h.childId == filter || (h.childId.isEmpty() && children.firstOrNull { it.id == filter }?.name == h.childName) }
    val avatars = children.associateBy({ it.id }, { it.avatar })
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        if (children.size > 1) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = filter == null, onClick = { filter = null }, label = { Text(stringResource(R.string.all)) })
                    children.forEach { c ->
                        FilterChip(selected = filter == c.id, onClick = { filter = c.id }, label = { Text(c.name, maxLines = 1) })
                    }
                }
            }
        }
        item { Text(stringResource(R.string.history_tap_copy), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        if (list.isEmpty()) {
            item {
                Column(Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Image(painterResource(R.drawable.char_sema_sleep), contentDescription = null, modifier = Modifier.size(140.dp))
                    Text(stringResource(R.string.history_empty), textAlign = TextAlign.Center)
                }
            }
        }
        items(list.take(150)) { h ->
            Card(
                onClick = { Clip.copy(ctx, CodeCrypto.prettyCode(h.code), R.string.copied) },
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Avatar(avatars[h.childId] ?: "hroni", 42.dp)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            "${h.childName}: " + (if (h.action >= 0) actionEmoji(h.action) + " " else "") + issuedLabel(ctx, h),
                            fontWeight = FontWeight.SemiBold, maxLines = 2
                        )
                        Text(
                            fmtTime(h.time) + if (h.note.isNotEmpty()) " · " + h.note else "",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(CodeCrypto.prettyCode(h.code), fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                }
            }
        }
        if (history.isNotEmpty()) {
            item {
                TextButton(onClick = {
                    store.clearHistory()
                    onChanged()
                }) { Text(stringResource(R.string.clear_history), color = MaterialTheme.colorScheme.error) }
            }
        }
    }
}

// =====================================================================
//  инструкция
// =====================================================================
private data class GStep(val image: Int, val title: Int, val text: Int)

private val GUIDE = listOf(
    GStep(R.drawable.box_guide_1, R.string.bg_s1, R.string.bg_s1_t),
    GStep(R.drawable.box_guide_2, R.string.bg_s2, R.string.bg_s2_t),
    GStep(R.drawable.box_guide_3, R.string.bg_s3, R.string.bg_s3_t),
    GStep(R.drawable.box_guide_4, R.string.bg_s4, R.string.bg_s4_t),
    GStep(R.drawable.box_guide_5, R.string.bg_s5, R.string.bg_s5_t)
)

private val BOX_FAQ = listOf(
    R.string.bfaq_q1 to R.string.bfaq_a1,
    R.string.bfaq_q2 to R.string.bfaq_a2,
    R.string.bfaq_q3 to R.string.bfaq_a3,
    R.string.bfaq_q4 to R.string.bfaq_a4,
    R.string.bfaq_q5 to R.string.bfaq_a5
)

@Composable
private fun GuideScreen() {
    val ctx = LocalContext.current
    LaunchedEffect(Unit) { BoxStore(ctx).guideSeen = true }
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Banner(R.drawable.box_hero, 2f) }
        item { Text(stringResource(R.string.guide_intro), style = MaterialTheme.typography.bodyMedium) }
        items(GUIDE) { s ->
            Card(shape = RoundedCornerShape(26.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column {
                    Image(
                        painterResource(s.image), contentDescription = null, contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxWidth().aspectRatio(1000f / 560f)
                    )
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(stringResource(s.title), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(stringResource(s.text), style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
        item { Text(stringResource(R.string.faq_title), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        items(BOX_FAQ) { qa -> FaqItem(qa.first, qa.second) }
        item {
            Section(stringResource(R.string.how_title), "🔐") {
                Text(stringResource(R.string.how_text), style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
private fun FaqItem(q: Int, a: Int) {
    var open by remember { mutableStateOf(false) }
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            Modifier
                .clickable { open = !open }
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(q), fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                Icon(if (open) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown, contentDescription = null)
            }
            AnimatedVisibility(open) {
                Text(stringResource(a), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 8.dp))
            }
        }
    }
}

// =====================================================================
//  настройки
// =====================================================================
@Composable
private fun SettingsScreen(store: BoxStore, onChanged: () -> Unit, onGuide: () -> Unit) {
    val ctx = LocalContext.current
    var hasPin by remember { mutableStateOf(store.hasPin) }
    var pinA by remember { mutableStateOf("") }
    var pinB by remember { mutableStateOf("") }
    var msg by remember { mutableStateOf("") }
    var tasks by remember { mutableStateOf(store.tasks()) }
    var showAddTask by remember { mutableStateOf(false) }
    LaunchedEffect(msg) {
        if (msg.isNotEmpty()) {
            delay(3000)
            msg = ""
        }
    }
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Section(stringResource(R.string.pin_section), "🔒") {
                Text(stringResource(R.string.pin_section_sub), style = MaterialTheme.typography.bodySmall)
                Text(stringResource(if (hasPin) R.string.pin_on else R.string.pin_off), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = pinA, onValueChange = { pinA = it.filter { c -> c in '0'..'9' }.take(4) },
                    label = { Text(stringResource(R.string.pin_new)) }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = pinB, onValueChange = { pinB = it.filter { c -> c in '0'..'9' }.take(4) },
                    label = { Text(stringResource(R.string.pin_repeat)) }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(enabled = pinA.length == 4 && pinB.length == 4, onClick = {
                        if (pinA != pinB) msg = ctx.getString(R.string.pin_mismatch) else {
                            store.setPin(pinA)
                            hasPin = true
                            pinA = ""
                            pinB = ""
                            msg = ctx.getString(R.string.saved)
                        }
                    }) { Text(stringResource(R.string.save)) }
                    if (hasPin) {
                        OutlinedButton(onClick = {
                            store.setPin(null)
                            hasPin = false
                            msg = ctx.getString(R.string.saved)
                        }) { Text(stringResource(R.string.pin_remove)) }
                    }
                }
                if (msg.isNotEmpty()) Text(msg, color = MaterialTheme.colorScheme.primary)
            }
        }
        item {
            Section(stringResource(R.string.tasks_title), "🏅") {
                Text(stringResource(R.string.tasks_settings_sub), style = MaterialTheme.typography.bodySmall)
                tasks.forEach { t ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(t.emoji, fontSize = 22.sp)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(t.title, fontWeight = FontWeight.SemiBold)
                            Text(optionLabel(ctx, CodeCrypto.OPTIONS[t.option]), style = MaterialTheme.typography.labelSmall)
                        }
                        IconButton(onClick = {
                            store.removeTask(t.id)
                            tasks = store.tasks()
                        }) { Icon(Icons.Filled.Delete, contentDescription = stringResource(R.string.delete)) }
                    }
                }
                OutlinedButton(onClick = { showAddTask = true }, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Filled.Add, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text(stringResource(R.string.task_add))
                }
            }
        }
        item {
            Section(stringResource(R.string.guide_title), "📖") {
                Text(stringResource(R.string.guide_intro), style = MaterialTheme.typography.bodySmall)
                Button(onClick = onGuide, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.open_guide)) }
            }
        }
        item {
            OutlinedButton(onClick = {
                store.clearHistory()
                onChanged()
                msg = ctx.getString(R.string.saved)
            }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.clear_history)) }
        }
        item {
            Text(stringResource(R.string.about), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }

    if (showAddTask) {
        var emoji by remember { mutableStateOf("⭐") }
        var title by remember { mutableStateOf("") }
        var opt by remember { mutableStateOf(3) }
        AlertDialog(
            onDismissRequest = { showAddTask = false },
            title = { Text(stringResource(R.string.task_add)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("⭐", "📚", "🧹", "📖", "⚽", "🎹", "🐶", "🍽️").forEach { e ->
                            Box(
                                Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(if (e == emoji) MaterialTheme.colorScheme.primaryContainer else Color.Transparent)
                                    .clickable { emoji = e },
                                contentAlignment = Alignment.Center
                            ) { Text(e, fontSize = 18.sp) }
                        }
                    }
                    OutlinedTextField(
                        value = title, onValueChange = { title = it.take(40) },
                        label = { Text(stringResource(R.string.task_name)) }, singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text(stringResource(R.string.choose_time), style = MaterialTheme.typography.labelLarge)
                    CodeCrypto.OPTIONS.indices.filter { CodeCrypto.OPTIONS[it] > 0 }.chunked(3).forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            row.forEach { i ->
                                FilterChip(
                                    selected = opt == i,
                                    onClick = { opt = i },
                                    label = { Text(optionLabel(ctx, CodeCrypto.OPTIONS[i])) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(enabled = title.isNotBlank(), onClick = {
                    store.addTask(emoji, title, opt)
                    tasks = store.tasks()
                    showAddTask = false
                }) { Text(stringResource(R.string.save)) }
            },
            dismissButton = { TextButton(onClick = { showAddTask = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
}

@Suppress("unused")
private val UnusedBorder = BorderStroke(1.dp, Color.Transparent)
