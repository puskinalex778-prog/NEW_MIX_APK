@file:OptIn(ExperimentalMaterial3Api::class)

package com.khranitoniks.guard.ui.common

import android.content.Context
import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.IconButton
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import com.khranitoniks.guard.ui.theme.Grad
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.graphics.drawable.toBitmap
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.Bonus
import com.khranitoniks.guard.core.Clip
import com.khranitoniks.guard.core.extractCode
import com.khranitoniks.guard.core.CheckResult
import com.khranitoniks.guard.core.InstalledApps
import com.khranitoniks.guard.core.PinManager
import com.khranitoniks.guard.core.TimeUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

fun fmt(context: Context, ms: Long): String = TimeUtil.duration(context, ms)

/** Только ASCII-цифры. */
fun digits(s: String, max: Int): String = s.filter { it in '0'..'9' }.take(max)

@Composable
fun SectionCard(
    title: String,
    modifier: Modifier = Modifier,
    container: Color = MaterialTheme.colorScheme.surface,
    emoji: String? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = container),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (title.isNotEmpty()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (emoji != null) {
                        EmojiBubble(emoji, 36.dp)
                        Spacer(Modifier.width(10.dp))
                    }
                    Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
            }
            content()
        }
    }
}

/** Эмодзи в цветном кружке. */
@Composable
fun EmojiBubble(emoji: String, size: Dp = 40.dp, bg: Color = MaterialTheme.colorScheme.primaryContainer) {
    Box(
        Modifier
            .size(size)
            .clip(CircleShape)
            .background(bg),
        contentAlignment = Alignment.Center
    ) {
        Text(emoji, fontSize = (size.value * 0.5f).sp)
    }
}

/** Карточка с градиентным фоном. */
@Composable
fun GradientCard(
    brush: Brush,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(28.dp)
    Column(
        modifier
            .fillMaxWidth()
            .shadow(8.dp, shape, clip = false)
            .clip(shape)
            .background(brush)
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        content = content
    )
}

/** Кольцо прогресса с градиентом. */
@Composable
fun RingProgress(
    progress: Float,
    modifier: Modifier = Modifier,
    stroke: Dp = 14.dp,
    track: Color = Color.White.copy(alpha = 0.25f),
    colors: List<Color> = listOf(Color.White, Color(0xFFFFF59D)),
    content: @Composable () -> Unit = {}
) {
    Box(modifier, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val sw = stroke.toPx()
            val inset = sw / 2
            val arcSize = Size(size.width - sw, size.height - sw)
            drawArc(track, -90f, 360f, false, topLeft = Offset(inset, inset), size = arcSize, style = Stroke(sw, cap = StrokeCap.Round))
            val sweep = 360f * progress.coerceIn(0f, 1f)
            if (sweep > 0f) {
                drawArc(
                    Brush.sweepGradient(colors + colors.first()),
                    -90f, sweep, false,
                    topLeft = Offset(inset, inset), size = arcSize,
                    style = Stroke(sw, cap = StrokeCap.Round)
                )
            }
        }
        content()
    }
}

/** Большая яркая кнопка «Время по коду». */
@Composable
fun CodeButton(modifier: Modifier = Modifier, onClick: () -> Unit) {
    GradientCard(Grad.code, modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.25f)),
                contentAlignment = Alignment.Center
            ) { Text("🎁", fontSize = 30.sp) }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    stringResource(R.string.home_enter_code),
                    color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold
                )
                Text(
                    stringResource(R.string.home_enter_code_sub),
                    color = Color.White.copy(alpha = 0.9f), style = MaterialTheme.typography.bodySmall
                )
            }
            Box(
                Modifier
                    .clip(RoundedCornerShape(50))
                    .background(Color.White)
                    .padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                Text(stringResource(R.string.code_enter_btn), color = Color(0xFFFF4D8D), fontWeight = FontWeight.Bold)
            }
        }
    }
}

/** Верхняя панель с градиентом (под строкой состояния). */
@Composable
fun GradientTopBar(title: String, subtitle: String? = null, onBack: (() -> Unit)? = null, actions: @Composable () -> Unit = {}) {
    Box(
        Modifier
            .fillMaxWidth()
            .background(Grad.hero)
            .statusBarsPadding()
            .padding(horizontal = 8.dp, vertical = 10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back), tint = Color.White)
                }
            } else {
                Spacer(Modifier.width(12.dp))
            }
            Column(Modifier.weight(1f)) {
                Text(title, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1)
                if (!subtitle.isNullOrEmpty()) {
                    Text(subtitle, color = Color.White.copy(alpha = 0.85f), style = MaterialTheme.typography.bodySmall, maxLines = 1)
                }
            }
            actions()
        }
    }
}

/** Небольшая «таблетка»-метка. */
@Composable
fun Pill(text: String, bg: Color, fg: Color) {
    Box(
        Modifier
            .clip(RoundedCornerShape(50))
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) { Text(text, color = fg, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold) }
}

@Composable
fun SwitchRow(title: String, subtitle: String? = null, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable { onChange(!checked) },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            if (!subtitle.isNullOrEmpty()) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Spacer(Modifier.width(8.dp))
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

/** Числовой переключатель «− значение +». */
@Composable
fun Stepper(
    title: String,
    value: Int,
    range: IntRange,
    step: Int,
    display: (Int) -> String,
    onChange: (Int) -> Unit
) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(title, Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
        FilledTonalIconButton(onClick = { onChange((value - step).coerceIn(range.first, range.last)) }) {
            Text("−", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }
        Text(
            display(value),
            Modifier.width(92.dp),
            textAlign = TextAlign.Center,
            fontWeight = FontWeight.SemiBold
        )
        FilledTonalIconButton(onClick = { onChange((value + step).coerceIn(range.first, range.last)) }) {
            Icon(Icons.Filled.Add, contentDescription = null)
        }
    }
}

/** Иконка установленного приложения (или первая буква названия). */
@Composable
fun AppIcon(pkg: String?, fallback: String, size: Dp = 40.dp, tint: Color = MaterialTheme.colorScheme.primary) {
    val ctx = LocalContext.current
    val bmp: Bitmap? = remember(pkg) {
        if (pkg == null) null else try {
            ctx.packageManager.getApplicationIcon(pkg).toBitmap(96, 96)
        } catch (e: Exception) {
            null
        }
    }
    if (bmp != null) {
        Image(bitmap = bmp.asImageBitmap(), contentDescription = null, modifier = Modifier.size(size).clip(RoundedCornerShape(10.dp)))
    } else {
        Box(
            Modifier
                .size(size)
                .clip(RoundedCornerShape(10.dp))
                .background(tint),
            contentAlignment = Alignment.Center
        ) {
            Text(fallback.take(1).uppercase(), color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}

/** Диалог проверки PIN с защитой от подбора. */
@Composable
fun PinDialog(title: String, onDismiss: () -> Unit, onSuccess: () -> Unit) {
    val ctx = LocalContext.current
    var pin by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }
    var lockLeft by remember { mutableStateOf(0) }
    LaunchedEffect(lockLeft) {
        if (lockLeft > 0) {
            delay(1000)
            lockLeft -= 1
            error = if (lockLeft > 0) ctx.getString(R.string.pin_locked_sec, lockLeft) else ""
        }
    }
    fun check() {
        when (val r = PinManager.verify(ctx, pin)) {
            is CheckResult.Ok -> onSuccess()
            is CheckResult.Wrong -> {
                error = ctx.getString(R.string.pin_wrong_left, r.attemptsLeft)
                pin = ""
            }
            is CheckResult.Locked -> {
                lockLeft = r.secondsLeft
                error = ctx.getString(R.string.pin_locked_sec, r.secondsLeft)
                pin = ""
            }
        }
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = pin,
                    onValueChange = { pin = digits(it, 4) },
                    label = { Text(stringResource(R.string.pin_label)) },
                    singleLine = true,
                    enabled = lockLeft == 0,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    modifier = Modifier.fillMaxWidth()
                )
                if (error.isNotEmpty()) Text(error, color = MaterialTheme.colorScheme.error)
            }
        },
        confirmButton = {
            TextButton(onClick = { check() }, enabled = pin.length == 4 && lockLeft == 0) { Text(stringResource(R.string.ok)) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}

/** Ввод кода времени из «Хранитоникс Бокс». */
@Composable
fun CodeDialog(onDismiss: () -> Unit) {
    val ctx = LocalContext.current
    var code by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var ok by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.code_dialog_title)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(stringResource(R.string.code_dialog_text), style = MaterialTheme.typography.bodyMedium)
                OutlinedTextField(
                    value = code,
                    onValueChange = { code = digits(it, 9) },
                    label = { Text("123-456-789") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                if (!ok) {
                    TextButton(onClick = {
                        val c = extractCode(Clip.read(ctx))
                        if (c == null) {
                            message = ctx.getString(R.string.paste_no_code)
                        } else {
                            code = c
                            message = ""
                        }
                    }) { Text(stringResource(R.string.paste_code)) }
                }
                if (message.isNotEmpty()) {
                    Text(message, color = if (ok) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                }
            }
        },
        confirmButton = {
            if (ok) {
                TextButton(onClick = onDismiss) { Text(stringResource(R.string.done)) }
            } else {
                TextButton(enabled = code.length == 9, onClick = {
                    message = when (val r = Bonus.redeem(ctx, code)) {
                        is Bonus.RedeemResult.Ok -> {
                            ok = true
                            if (r.minutes < 0) ctx.getString(R.string.code_ok_unlimited)
                            else ctx.getString(R.string.code_ok_minutes, r.minutes)
                        }
                        is Bonus.RedeemResult.Action -> {
                            ok = true
                            ctx.getString(R.string.code_ok_action, Bonus.actionLabel(ctx, r.action))
                        }
                        Bonus.RedeemResult.NotPaired -> ctx.getString(R.string.code_not_paired)
                        Bonus.RedeemResult.Used -> ctx.getString(R.string.code_used)
                        is Bonus.RedeemResult.Wrong -> ctx.getString(R.string.code_wrong_left, r.attemptsLeft)
                        is Bonus.RedeemResult.Locked -> ctx.getString(R.string.pin_locked_sec, r.seconds)
                    }
                    code = ""
                }) { Text(stringResource(R.string.code_apply)) }
            }
        },
        dismissButton = { if (!ok) TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}

/** Множественный выбор приложений (белый список, исключения). */
@Composable
fun AppMultiPickerDialog(
    title: String,
    initial: Set<String>,
    highlight: Set<String> = emptySet(),
    onDismiss: () -> Unit,
    onSave: (Set<String>) -> Unit
) {
    val ctx = LocalContext.current
    var apps by remember { mutableStateOf<List<InstalledApps.Entry>?>(null) }
    var selected by remember { mutableStateOf(initial) }
    var query by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { apps = withContext(Dispatchers.IO) { InstalledApps.launchable(ctx) } }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text(stringResource(R.string.search)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                val list = apps
                if (list == null) {
                    Box(Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                } else {
                    val filtered = list.filter { query.isBlank() || it.label.contains(query, true) || it.pkg.contains(query, true) }
                    LazyColumn(Modifier.heightIn(max = 380.dp)) {
                        items(filtered, key = { it.pkg }) { e ->
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selected = if (e.pkg in selected) selected - e.pkg else selected + e.pkg
                                    }
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                AppIcon(e.pkg, e.label, 32.dp)
                                Spacer(Modifier.width(10.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(e.label, maxLines = 1)
                                    if (e.pkg in highlight) {
                                        Text(stringResource(R.string.game_vpn_detected), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                                    }
                                }
                                Checkbox(checked = e.pkg in selected, onCheckedChange = { c ->
                                    selected = if (c) selected + e.pkg else selected - e.pkg
                                })
                            }
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = { onSave(selected) }) { Text(stringResource(R.string.save)) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}

/** Выбор одного приложения. */
@Composable
fun AppSinglePickerDialog(title: String, onDismiss: () -> Unit, onPick: (InstalledApps.Entry) -> Unit) {
    val ctx = LocalContext.current
    var apps by remember { mutableStateOf<List<InstalledApps.Entry>?>(null) }
    var query by remember { mutableStateOf("") }
    LaunchedEffect(Unit) { apps = withContext(Dispatchers.IO) { InstalledApps.launchable(ctx) } }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text(stringResource(R.string.search)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                val list = apps
                if (list == null) {
                    Box(Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                } else {
                    val filtered = list.filter { query.isBlank() || it.label.contains(query, true) || it.pkg.contains(query, true) }
                    LazyColumn(Modifier.heightIn(max = 380.dp)) {
                        items(filtered, key = { it.pkg }) { e ->
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .clickable { onPick(e) }
                                    .padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                AppIcon(e.pkg, e.label, 32.dp)
                                Spacer(Modifier.width(10.dp))
                                Text(e.label, maxLines = 1)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}

@Composable
fun InfoText(text: String) {
    Text(text, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
}
