@file:OptIn(ExperimentalMaterial3Api::class)

package com.khranitoniks.guard.ui.apps

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.InstalledApps
import com.khranitoniks.guard.core.LimitScope
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.core.Rules
import com.khranitoniks.guard.core.TrackedApp
import com.khranitoniks.guard.core.TrackedApps
import com.khranitoniks.guard.core.UsageReader
import com.khranitoniks.guard.ui.common.AppIcon
import com.khranitoniks.guard.ui.common.AppMultiPickerDialog
import com.khranitoniks.guard.ui.common.InfoText
import com.khranitoniks.guard.ui.common.SectionCard
import com.khranitoniks.guard.ui.common.Stepper
import com.khranitoniks.guard.ui.common.fmt
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * «Приложения» (открывается по PIN): что считать в лимит, разрешённые и запрещённые приложения,
 * список отслеживаемых с личными лимитами и удалением.
 */
@Composable
fun AppsScreen() {
    val ctx = LocalContext.current
    val p = remember { Prefs.get(ctx) }
    var v by remember { mutableStateOf(0) }
    fun upd(block: () -> Unit) {
        block()
        Rules.invalidate()
        v++
    }
    @Suppress("UNUSED_VARIABLE") val tick = v

    var usage by remember { mutableStateOf<Map<String, Long>>(emptyMap()) }
    LaunchedEffect(Unit) {
        usage = withContext(Dispatchers.IO) { if (Perms.usage(ctx)) UsageReader(ctx).todayUsage() else emptyMap() }
    }

    var showAllowed by remember { mutableStateOf(false) }
    var showBlocked by remember { mutableStateOf(false) }
    var showAdd by remember { mutableStateOf(false) }
    var toRemove by remember { mutableStateOf<TrackedApp?>(null) }

    val tracked = TrackedApps.load(ctx)

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Image(
                painterResource(R.drawable.scene_apps),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1200f / 640f)
                    .clip(RoundedCornerShape(28.dp))
            )
        }

        // ---------- что считать ----------
        item(key = "scope_$tick") {
            SectionCard(stringResource(R.string.scope_title), emoji = "🎯") {
                ScopeOption(
                    "📱", stringResource(R.string.scope_device), stringResource(R.string.scope_device_sub),
                    p.scope == LimitScope.DEVICE
                ) { upd { p.limitScope = LimitScope.DEVICE.name } }
                ScopeOption(
                    "🎮", stringResource(R.string.scope_apps), stringResource(R.string.scope_apps_sub),
                    p.scope == LimitScope.APPS
                ) { upd { p.limitScope = LimitScope.APPS.name } }
            }
        }

        // ---------- разрешённые ----------
        item(key = "allowed_$tick") {
            SectionCard(stringResource(R.string.allowed_title), emoji = "✅") {
                InfoText(stringResource(R.string.allowed_sub))
                PkgChips(p.acAllowed) { pkg -> upd { p.acAllowed = p.acAllowed - pkg } }
                Button(onClick = { showAllowed = true }, modifier = Modifier.fillMaxWidth()) {
                    Text(stringResource(R.string.allowed_choose, p.acAllowed.size))
                }
            }
        }

        // ---------- запрещённые ----------
        item(key = "blocked_$tick") {
            SectionCard(stringResource(R.string.blocked_title), emoji = "⛔") {
                InfoText(stringResource(R.string.blocked_sub))
                PkgChips(p.blockedApps) { pkg -> upd { p.blockedApps = p.blockedApps - pkg } }
                OutlinedButton(onClick = { showBlocked = true }, modifier = Modifier.fillMaxWidth()) {
                    Text(stringResource(R.string.blocked_choose, p.blockedApps.size))
                }
            }
        }

        // ---------- отслеживаемые ----------
        item(key = "tracked_head_$tick") {
            SectionCard(stringResource(R.string.tracked_title), emoji = "⭐") {
                InfoText(stringResource(R.string.tracked_sub))
                if (tracked.isEmpty()) InfoText(stringResource(R.string.home_apps_empty))
                tracked.forEachIndexed { i, app ->
                    if (i > 0) HorizontalDivider()
                    val pkg = TrackedApps.installedPackage(ctx, app)
                    val ms = app.packages.sumOf { usage[it] ?: 0L }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AppIcon(pkg, app.name, 40.dp, Color(app.color))
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(app.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                stringResource(R.string.tracked_today, fmt(ctx, ms)) +
                                    if (pkg == null) " · " + stringResource(R.string.not_installed) else "",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(onClick = { toRemove = app }) {
                            Icon(Icons.Filled.Delete, contentDescription = stringResource(R.string.delete), tint = MaterialTheme.colorScheme.error)
                        }
                    }
                    Stepper(
                        stringResource(R.string.app_limit),
                        app.limitMin, 0..600, 5,
                        { if (it == 0) ctx.getString(R.string.app_limit_none) else ctx.getString(R.string.fmt_m, it) }
                    ) { m -> upd { TrackedApps.setLimit(ctx, app.id, m) } }
                }
                Button(onClick = { showAdd = true }, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Filled.Add, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(R.string.home_add_app))
                }
                if (TrackedApps.DEFAULTS.any { d -> tracked.none { it.id == d.id } }) {
                    TextButton(onClick = { upd { TrackedApps.restoreDefaults(ctx) } }) {
                        Text(stringResource(R.string.tracked_restore))
                    }
                }
            }
        }
        item { Spacer(Modifier.padding(4.dp)) }
    }

    if (showAllowed) {
        AppMultiPickerDialog(
            title = stringResource(R.string.allowed_title),
            initial = p.acAllowed,
            onDismiss = { showAllowed = false },
            onSave = {
                upd {
                    p.acAllowed = it
                    p.blockedApps = p.blockedApps - it
                }
                showAllowed = false
            }
        )
    }
    if (showBlocked) {
        AppMultiPickerDialog(
            title = stringResource(R.string.blocked_title),
            initial = p.blockedApps,
            onDismiss = { showBlocked = false },
            onSave = {
                upd {
                    p.blockedApps = it
                    p.acAllowed = p.acAllowed - it
                }
                showBlocked = false
            }
        )
    }
    if (showAdd) AddAppDialog(onDismiss = {
        showAdd = false
        v++
    })
    val rm = toRemove
    if (rm != null) {
        AlertDialog(
            onDismissRequest = { toRemove = null },
            title = { Text(stringResource(R.string.home_remove_app, rm.name)) },
            text = { Text(stringResource(R.string.remove_app_text)) },
            confirmButton = {
                TextButton(onClick = {
                    upd { TrackedApps.remove(ctx, rm.id) }
                    toRemove = null
                    Toast.makeText(ctx, R.string.done, Toast.LENGTH_SHORT).show()
                }) { Text(stringResource(R.string.delete), color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { toRemove = null }) { Text(stringResource(R.string.cancel)) } }
        )
    }
}

@Composable
private fun ScopeOption(emoji: String, title: String, sub: String, selected: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        border = if (selected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        colors = CardDefaults.cardColors(
            containerColor = if (selected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(emoji, fontSize = 28.sp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(sub, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(if (selected) "●" else "○", fontSize = 22.sp, color = MaterialTheme.colorScheme.primary)
        }
    }
}

/** Список выбранных приложений с кнопкой удаления. */
@Composable
private fun PkgChips(pkgs: Set<String>, onRemove: (String) -> Unit) {
    val ctx = LocalContext.current
    if (pkgs.isEmpty()) return
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        pkgs.sortedBy { TrackedApps.label(ctx, it).lowercase() }.forEach { pkg ->
            val label = TrackedApps.label(ctx, pkg)
            Row(verticalAlignment = Alignment.CenterVertically) {
                AppIcon(pkg, label, 28.dp)
                Spacer(Modifier.width(10.dp))
                Text(label, Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                IconButton(onClick = { onRemove(pkg) }) {
                    Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.delete))
                }
            }
        }
    }
}

/** Добавление приложения: популярные + любое установленное. */
@Composable
private fun AddAppDialog(onDismiss: () -> Unit) {
    val ctx = LocalContext.current
    var apps by remember { mutableStateOf<List<InstalledApps.Entry>?>(null) }
    var query by remember { mutableStateOf("") }
    val current = remember { TrackedApps.allPackages(TrackedApps.load(ctx)) }
    LaunchedEffect(Unit) { apps = withContext(Dispatchers.IO) { InstalledApps.launchable(ctx) } }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.home_add_app)) },
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
                LazyColumn(Modifier.heightIn(max = 400.dp)) {
                    val sugg = TrackedApps.SUGGESTED.filter { s ->
                        s.packages.none { it in current } && (query.isBlank() || s.name.contains(query, true))
                    }
                    if (sugg.isNotEmpty()) {
                        item {
                            Text(stringResource(R.string.add_popular), style = MaterialTheme.typography.labelLarge, modifier = Modifier.padding(vertical = 6.dp))
                        }
                        items(sugg, key = { "s_" + it.id }) { s ->
                            val pkg = TrackedApps.installedPackage(ctx, s)
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        TrackedApps.add(ctx, s)
                                        onDismiss()
                                    }
                                    .padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                AppIcon(pkg, s.name, 32.dp, Color(s.color))
                                Spacer(Modifier.width(10.dp))
                                Column {
                                    Text(s.name)
                                    Text(
                                        stringResource(if (pkg != null) R.string.installed else R.string.not_installed),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                    item {
                        Text(stringResource(R.string.add_installed), style = MaterialTheme.typography.labelLarge, modifier = Modifier.padding(vertical = 6.dp))
                    }
                    if (list == null) {
                        item { CircularProgressIndicator(Modifier.padding(16.dp)) }
                    } else {
                        val filtered = list.filter {
                            it.pkg !in current && (query.isBlank() || it.label.contains(query, true) || it.pkg.contains(query, true))
                        }
                        items(filtered, key = { "i_" + it.pkg }) { e ->
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        TrackedApps.addPackage(ctx, e.pkg, e.label)
                                        onDismiss()
                                    }
                                    .padding(vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                AppIcon(e.pkg, e.label, 32.dp)
                                Spacer(Modifier.width(10.dp))
                                Text(e.label, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.close)) } }
    )
}
