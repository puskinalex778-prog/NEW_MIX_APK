@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)

package com.khranitoniks.guard.ui.home

import android.widget.Toast
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.AppStat
import com.khranitoniks.guard.core.CharacterArt
import com.khranitoniks.guard.core.Dashboard
import com.khranitoniks.guard.core.DashboardData
import com.khranitoniks.guard.core.GuardState
import com.khranitoniks.guard.core.LimitScope
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.core.TimeUtil
import com.khranitoniks.guard.core.TrackedApps
import com.khranitoniks.guard.ui.Sub
import com.khranitoniks.guard.ui.common.AppIcon
import com.khranitoniks.guard.ui.common.CodeButton
import com.khranitoniks.guard.ui.common.CodeDialog
import com.khranitoniks.guard.ui.common.EmojiBubble
import com.khranitoniks.guard.ui.common.GradientCard
import com.khranitoniks.guard.ui.common.Pill
import com.khranitoniks.guard.ui.common.RingProgress
import com.khranitoniks.guard.ui.common.fmt
import com.khranitoniks.guard.ui.theme.Grad
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

@Composable
fun HomeScreen(onOpen: (Sub) -> Unit) {
    val ctx = LocalContext.current
    var data by remember { mutableStateOf<DashboardData?>(null) }
    var reload by remember { mutableStateOf(0) }
    var showCode by remember { mutableStateOf(false) }

    LaunchedEffect(reload) {
        while (true) {
            data = withContext(Dispatchers.IO) { Dashboard.load(ctx) }
            delay(3000)
        }
    }

    val d = data
    if (d == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (!d.permsOk) item { PermissionBanner { onOpen(Sub.PERMISSIONS) } }
        if (d.whatsNew) item {
            WhatsNewCard(onGuide = { onOpen(Sub.GUIDE) }, onClose = {
                Prefs.get(ctx).whatsNewSeen = true
                reload++
            })
        }
        item { HeroCard(d) }
        item { CodeButton { showCode = true } }
        item { StatusGrid(d) }
        item { HealthCard(d) { onOpen(Sub.PERMISSIONS) } }
        if (d.top.isNotEmpty()) item { TopAppsCard(d) }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    stringResource(R.string.home_apps_title),
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                TextButton(onClick = { onOpen(Sub.APPS) }) {
                    Icon(Icons.Filled.Edit, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(stringResource(R.string.home_manage_apps))
                }
            }
        }
        if (d.apps.isEmpty()) {
            item {
                Text(
                    stringResource(R.string.home_apps_empty),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        items(d.apps.chunked(2)) { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { s ->
                    AppCard(
                        stat = s,
                        bonusMin = d.bonusMin,
                        modifier = Modifier.weight(1f),
                        onOpen = {
                            if (!TrackedApps.launch(ctx, s.app)) {
                                Toast.makeText(ctx, ctx.getString(R.string.not_installed), Toast.LENGTH_SHORT).show()
                            }
                        },
                        onLongPress = { onOpen(Sub.APPS) }
                    )
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
        item {
            OutlinedButton(onClick = { onOpen(Sub.APPS) }, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                Icon(Icons.Filled.Add, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.home_add_app))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                QuickTile("📖", stringResource(R.string.guide_title), Modifier.weight(1f)) { onOpen(Sub.GUIDE) }
                QuickTile("🚀", stringResource(R.string.home_tools), Modifier.weight(1f)) { onOpen(Sub.TOOLS) }
            }
        }
        item { Spacer(Modifier.height(8.dp)) }
    }

    if (showCode) CodeDialog(onDismiss = {
        showCode = false
        reload++
    })
}

private fun moodOf(d: DashboardData): Mood = when {
    d.nightActive -> Mood.SLEEP
    d.breakLeftMs > 0 -> Mood.BREAK
    d.limitsEnabled && !d.unlimited && d.usedMs >= d.limitMs -> Mood.STOP
    d.gameActive -> Mood.GAMER
    d.plugged && d.chargeLockEnabled && d.batteryLevel in 0 until d.chargeThreshold -> Mood.CHARGING
    else -> Mood.HAPPY
}

@Composable
private fun HeroCard(d: DashboardData) {
    val ctx = LocalContext.current
    val kind = Prefs.get(ctx).characterKind
    val limited = d.limitsEnabled && !d.unlimited
    val left = (d.limitMs - d.usedMs).coerceAtLeast(0L)
    val progress = if (limited && d.limitMs > 0) (d.usedMs.toFloat() / d.limitMs) else 0f
    GradientCard(if (limited && left == 0L) Grad.warn else Grad.hero) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            RingProgress(
                progress = if (limited) 1f - progress else 1f,
                modifier = Modifier.size(150.dp),
                stroke = 14.dp
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        when {
                            !limited -> "∞"
                            else -> TimeUtil.duration(ctx, left)
                        },
                        color = Color.White,
                        fontSize = if (limited) 24.sp else 44.sp,
                        fontWeight = FontWeight.ExtraBold,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        stringResource(if (limited) R.string.home_left else R.string.home_no_limit),
                        color = Color.White.copy(alpha = 0.9f),
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }
            Spacer(Modifier.width(8.dp))
            Image(
                painter = painterResource(CharacterArt.res(kind, moodOf(d))),
                contentDescription = null,
                modifier = Modifier.weight(1f).aspectRatio(1f)
            )
        }
        Text(
            stringResource(R.string.home_used_of, fmt(ctx, d.usedMs), if (limited) fmt(ctx, d.limitMs) else "∞"),
            color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp
        )
        Text(
            stringResource(R.string.home_screen_total, fmt(ctx, d.screenMs)),
            color = Color.White.copy(alpha = 0.9f), style = MaterialTheme.typography.bodySmall
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Pill(
                stringResource(if (d.scope == LimitScope.DEVICE) R.string.scope_device_short else R.string.scope_apps_short),
                Color.White.copy(alpha = 0.22f), Color.White
            )
            if (d.bonusMin > 0) Pill(stringResource(R.string.home_bonus, d.bonusMin), Color.White.copy(alpha = 0.22f), Color.White)
            if (d.unlimited) Pill(stringResource(R.string.home_unlimited_pill), Color.White.copy(alpha = 0.22f), Color.White)
        }
    }
}

@Composable
private fun StatusGrid(d: DashboardData) {
    val ctx = LocalContext.current
    val breakText = when {
        !d.limitsEnabled || d.unlimited || d.breakEveryMin <= 0 -> stringResource(R.string.status_breaks_off)
        d.breakLeftMs > 0 -> stringResource(R.string.status_break_now, TimeUtil.countdown(d.breakLeftMs))
        else -> stringResource(R.string.status_until_break, fmt(ctx, d.untilBreakMs))
    }
    val battery = when {
        d.batteryLevel < 0 -> stringResource(R.string.status_battery_unknown)
        d.plugged && d.chargeLockEnabled && d.batteryLevel < d.chargeThreshold ->
            stringResource(R.string.status_charging_lock, d.batteryLevel, d.chargeThreshold)
        d.plugged -> stringResource(R.string.status_charging, d.batteryLevel)
        else -> stringResource(R.string.status_battery, d.batteryLevel)
    }
    val night = when {
        !d.nightEnabled -> stringResource(R.string.status_night_off)
        d.nightActive -> stringResource(R.string.status_night_active, TimeUtil.hm(d.nightEnd))
        else -> stringResource(R.string.status_night_planned, TimeUtil.hm(d.nightStart), TimeUtil.hm(d.nightEnd))
    }
    val school = when {
        !d.schoolEnabled -> stringResource(R.string.status_school_off)
        d.schoolActive -> stringResource(R.string.status_school_active, TimeUtil.hm(d.schoolEnd))
        else -> stringResource(R.string.status_school_planned, TimeUtil.hm(d.schoolStart), TimeUtil.hm(d.schoolEnd))
    }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatusTile("⏱", stringResource(R.string.tile_break), breakText, Modifier.weight(1f), d.breakLeftMs > 0)
            StatusTile(if (d.plugged) "⚡" else "🔋", stringResource(R.string.tile_battery), battery, Modifier.weight(1f), false)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatusTile("🌙", stringResource(R.string.tile_night), night, Modifier.weight(1f), d.nightActive)
            StatusTile("🎒", stringResource(R.string.tile_school), school, Modifier.weight(1f), d.schoolActive)
        }
        if (d.gameActive) StatusTile("🎮", stringResource(R.string.tile_game), stringResource(R.string.status_game_on), Modifier.fillMaxWidth(), true)
    }
}

@Composable
private fun StatusTile(emoji: String, title: String, text: String, modifier: Modifier, active: Boolean) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (active) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.surface
        )
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                EmojiBubble(emoji, 32.dp)
                Spacer(Modifier.width(8.dp))
                Text(title, style = MaterialTheme.typography.labelLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text(text, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 3)
        }
    }
}

/** «Проверка защиты»: работает ли служба и как она видит последнее открытое приложение. */
@Composable
private fun HealthCard(d: DashboardData, onPerms: () -> Unit) {
    val ok = d.serviceAlive && d.permsOk
    Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (ok) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.errorContainer
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(if (ok) "🛡️" else "⚠️", fontSize = 22.sp)
                Spacer(Modifier.width(10.dp))
                Text(
                    stringResource(if (ok) R.string.health_ok else R.string.health_bad),
                    fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f)
                )
            }
            val app = d.fgLabel
            if (app != null) {
                val st = when (d.fgStatus) {
                    GuardState.Status.COUNTED -> stringResource(R.string.health_counted)
                    GuardState.Status.ALLOWED -> stringResource(R.string.health_allowed)
                    GuardState.Status.BLOCKED -> stringResource(R.string.health_blocked)
                    else -> stringResource(R.string.health_unknown)
                }
                Text(stringResource(R.string.health_last_app, app, st), style = MaterialTheme.typography.bodySmall)
            } else {
                Text(stringResource(R.string.health_no_app), style = MaterialTheme.typography.bodySmall)
            }
            if (!ok) {
                Text(stringResource(R.string.health_fix), style = MaterialTheme.typography.bodySmall)
                Button(onClick = onPerms) { Text(stringResource(R.string.banner_perms_btn)) }
            }
        }
    }
}

@Composable
private fun TopAppsCard(d: DashboardData) {
    val ctx = LocalContext.current
    val max = d.top.maxOf { it.ms }.coerceAtLeast(1L)
    Card(shape = RoundedCornerShape(22.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(stringResource(R.string.home_top_title), style = MaterialTheme.typography.titleMedium)
            d.top.forEach { t ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AppIcon(t.pkg, t.label, 32.dp)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Row {
                            Text(t.label, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                            Text(fmt(ctx, t.ms), style = MaterialTheme.typography.labelLarge)
                        }
                        Spacer(Modifier.height(4.dp))
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Box(
                                Modifier
                                    .fillMaxWidth(t.ms.toFloat() / max)
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Grad.bar)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AppCard(stat: AppStat, bonusMin: Int, modifier: Modifier, onOpen: () -> Unit, onLongPress: () -> Unit) {
    val ctx = LocalContext.current
    val color = Color(stat.app.color)
    Card(
        shape = RoundedCornerShape(24.dp),
        modifier = modifier.combinedClickable(onClick = onOpen, onLongClick = onLongPress),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AppIcon(stat.installedPkg, stat.app.name, 40.dp, color)
                Spacer(Modifier.width(10.dp))
                Text(stat.app.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text(fmt(ctx, stat.ms), fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
            if (stat.app.limitMin > 0) {
                val lim = (stat.app.limitMin + bonusMin) * TimeUtil.MIN
                LinearProgressIndicator(
                    progress = { (stat.ms.toFloat() / lim).coerceIn(0f, 1f) },
                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                    color = if (stat.ms >= lim) MaterialTheme.colorScheme.error else color,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
                Text(
                    stringResource(R.string.app_limit_of, fmt(ctx, lim)),
                    style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (stat.installedPkg != null) {
                FilledTonalButton(onClick = onOpen, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Filled.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(stringResource(R.string.open))
                }
            } else {
                Text(stringResource(R.string.not_installed), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
private fun QuickTile(emoji: String, title: String, modifier: Modifier, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            EmojiBubble(emoji, 36.dp)
            Spacer(Modifier.width(10.dp))
            Text(title, style = MaterialTheme.typography.labelLarge, maxLines = 2)
        }
    }
}

@Composable
private fun WhatsNewCard(onGuide: () -> Unit, onClose: () -> Unit) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Image(
                painterResource(R.drawable.scene_welcome),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().aspectRatio(1200f / 640f)
            )
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(stringResource(R.string.whats_new_title), style = MaterialTheme.typography.titleMedium)
                Text(stringResource(R.string.whats_new_text), style = MaterialTheme.typography.bodySmall)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onGuide) { Text(stringResource(R.string.guide_title)) }
                    TextButton(onClick = onClose) { Text(stringResource(R.string.close)) }
                }
            }
        }
    }
}

@Composable
private fun PermissionBanner(onClick: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.onErrorContainer)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.banner_perms_title), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onErrorContainer)
                Text(stringResource(R.string.banner_perms_text), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onErrorContainer)
            }
            Spacer(Modifier.width(8.dp))
            Button(onClick = onClick) { Text(stringResource(R.string.banner_perms_btn)) }
        }
    }
}

@Suppress("unused")
@Composable
private fun ConfirmDialog(title: String, text: String, onOk: () -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(text) },
        confirmButton = { TextButton(onClick = onOk) { Text(stringResource(R.string.ok)) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}
