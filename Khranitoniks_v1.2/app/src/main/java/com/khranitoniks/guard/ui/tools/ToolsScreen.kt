package com.khranitoniks.guard.ui.tools

import android.content.Intent
import android.os.Build
import android.os.storage.StorageManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.CharacterArt
import com.khranitoniks.guard.core.InstalledApps
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.core.TrackedApps
import com.khranitoniks.guard.tools.GameMode
import com.khranitoniks.guard.tools.MemoryTools
import com.khranitoniks.guard.ui.common.AppIcon
import com.khranitoniks.guard.ui.common.AppMultiPickerDialog
import com.khranitoniks.guard.ui.common.AppSinglePickerDialog
import com.khranitoniks.guard.ui.common.InfoText
import com.khranitoniks.guard.ui.common.SectionCard
import com.khranitoniks.guard.ui.common.SwitchRow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** Память, очистка и игровой режим. */
@Composable
fun ToolsScreen() {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val p = remember { Prefs.get(ctx) }

    var mem by remember { mutableStateOf<MemoryTools.MemInfo?>(null) }
    var ramMsg by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var junk by remember { mutableStateOf<List<MemoryTools.JunkGroup>?>(null) }
    var checked by remember { mutableStateOf(setOf<MemoryTools.JunkKind>()) }
    var junkMsg by remember { mutableStateOf("") }
    var scanning by remember { mutableStateOf(false) }

    var gameActive by remember { mutableStateOf(p.gameActive) }
    var gamePkg by remember { mutableStateOf(p.gamePackage) }
    var gameDnd by remember { mutableStateOf(p.gameDnd) }
    var pickGame by remember { mutableStateOf(false) }
    var pickExcl by remember { mutableStateOf(false) }
    var vpn by remember { mutableStateOf<Set<String>>(emptySet()) }
    var gameMsg by remember { mutableStateOf("") }
    var games by remember { mutableStateOf<List<InstalledApps.Entry>>(emptyList()) }

    LaunchedEffect(Unit) {
        vpn = withContext(Dispatchers.IO) { GameMode.vpnPackages(ctx) }
        games = withContext(Dispatchers.IO) {
            TrackedApps.load(ctx).mapNotNull { a ->
                TrackedApps.installedPackage(ctx, a)?.let { InstalledApps.Entry(it, a.name) }
            }
        }
        while (true) {
            mem = withContext(Dispatchers.IO) { MemoryTools.read(ctx) }
            gameActive = p.gameActive
            delay(3000)
        }
    }

    val cacheLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // ---------- память ----------
        item {
            SectionCard(stringResource(R.string.tools_memory)) {
                val m = mem
                if (m == null) {
                    CircularProgressIndicator()
                } else {
                    val ramUsed = m.ramTotal - m.ramAvail
                    MemBar(
                        stringResource(R.string.tools_ram),
                        ramUsed, m.ramTotal,
                        stringResource(R.string.tools_used_of, MemoryTools.formatBytes(ramUsed), MemoryTools.formatBytes(m.ramTotal))
                    )
                    val stUsed = m.storageTotal - m.storageFree
                    MemBar(
                        stringResource(R.string.tools_storage),
                        stUsed, m.storageTotal,
                        stringResource(R.string.tools_used_of, MemoryTools.formatBytes(stUsed), MemoryTools.formatBytes(m.storageTotal))
                    )
                    if (m.lowMemory) Text(stringResource(R.string.tools_low_memory), color = MaterialTheme.colorScheme.error)
                }
                Button(enabled = !busy, onClick = {
                    busy = true
                    scope.launch {
                        val r = withContext(Dispatchers.IO) { MemoryTools.cleanRam(ctx) }
                        ramMsg = ctx.getString(R.string.tools_ram_done, r.count, MemoryTools.formatBytes(r.freedBytes))
                        mem = withContext(Dispatchers.IO) { MemoryTools.read(ctx) }
                        busy = false
                    }
                }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.tools_clean_ram)) }
                if (ramMsg.isNotEmpty()) Text(ramMsg, color = MaterialTheme.colorScheme.primary)
                InfoText(stringResource(R.string.tools_ram_note))
            }
        }

        // ---------- мусорные файлы ----------
        item {
            SectionCard(stringResource(R.string.tools_junk)) {
                val full = Perms.allFiles(ctx)
                if (!full) {
                    InfoText(stringResource(R.string.tools_junk_need_access))
                    OutlinedButton(onClick = { Perms.open(ctx, Perms.allFilesIntent(ctx), Perms.appDetailsIntent(ctx)) }) {
                        Text(stringResource(R.string.perm_grant))
                    }
                }
                Button(enabled = !scanning, onClick = {
                    scanning = true
                    junkMsg = ""
                    scope.launch {
                        val r = withContext(Dispatchers.IO) { MemoryTools.scan(ctx, Perms.allFiles(ctx)) }
                        junk = r
                        checked = r.filter {
                            it.bytes > 0 && it.kind != MemoryTools.JunkKind.APK && it.kind != MemoryTools.JunkKind.EMPTY_DIRS
                        }.map { it.kind }.toSet()
                        scanning = false
                    }
                }, modifier = Modifier.fillMaxWidth()) {
                    Text(stringResource(if (scanning) R.string.tools_scanning else R.string.tools_scan))
                }
                val list = junk
                if (list != null) {
                    list.forEach { g ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .clickable { checked = if (g.kind in checked) checked - g.kind else checked + g.kind },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(checked = g.kind in checked, onCheckedChange = { c ->
                                checked = if (c) checked + g.kind else checked - g.kind
                            })
                            Column(Modifier.weight(1f)) {
                                Text(stringResource(MemoryTools.junkTitle(ctx, g.kind)))
                                Text(
                                    stringResource(R.string.tools_junk_files, g.files.size, MemoryTools.formatBytes(g.bytes)),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                    val selBytes = list.filter { it.kind in checked }.sumOf { it.bytes }
                    Button(enabled = checked.isNotEmpty() && !busy, onClick = {
                        busy = true
                        scope.launch {
                            val freed = withContext(Dispatchers.IO) { MemoryTools.clean(ctx, list.filter { it.kind in checked }) }
                            junkMsg = ctx.getString(R.string.tools_junk_done, MemoryTools.formatBytes(freed))
                            junk = null
                            busy = false
                        }
                    }, modifier = Modifier.fillMaxWidth()) {
                        Text(stringResource(R.string.tools_junk_clean, MemoryTools.formatBytes(selBytes)))
                    }
                }
                if (junkMsg.isNotEmpty()) Text(junkMsg, color = MaterialTheme.colorScheme.primary)
                HorizontalDivider()
                OutlinedButton(onClick = {
                    var started = false
                    if (MemoryTools.supportsSystemCacheClear && Perms.allFiles(ctx)) {
                        try {
                            cacheLauncher.launch(Intent(StorageManager.ACTION_CLEAR_APP_CACHE))
                            started = true
                        } catch (e: Exception) {
                            started = false
                        }
                    }
                    if (!started) Perms.open(ctx, Intent(Settings.ACTION_INTERNAL_STORAGE_SETTINGS))
                }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.tools_system_cache)) }
                InfoText(stringResource(if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) R.string.tools_system_cache_sub else R.string.tools_system_cache_old))
            }
        }

        // ---------- игровой режим ----------
        item {
            SectionCard(stringResource(R.string.game_title)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Image(
                        painterResource(CharacterArt.res(p.characterKind, Mood.GAMER)),
                        contentDescription = null,
                        modifier = Modifier.size(84.dp)
                    )
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            stringResource(if (gameActive) R.string.game_state_on else R.string.game_state_off),
                            fontWeight = FontWeight.Bold,
                            color = if (gameActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                        )
                        InfoText(stringResource(R.string.game_info))
                    }
                }
                Text(stringResource(R.string.game_pick), style = MaterialTheme.typography.bodyLarge)
                games.forEach { g ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { gamePkg = g.pkg },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(checked = gamePkg == g.pkg, onCheckedChange = { gamePkg = if (it) g.pkg else "" })
                        AppIcon(g.pkg, g.label, 28.dp)
                        Spacer(Modifier.width(8.dp))
                        Text(g.label)
                    }
                }
                if (gamePkg.isNotEmpty() && games.none { it.pkg == gamePkg }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AppIcon(gamePkg, gamePkg, 28.dp)
                        Spacer(Modifier.width(8.dp))
                        Text(TrackedApps.label(ctx, gamePkg), fontWeight = FontWeight.SemiBold)
                    }
                }
                OutlinedButton(onClick = { pickGame = true }) { Text(stringResource(R.string.game_pick_other)) }
                SwitchRow(stringResource(R.string.game_dnd), stringResource(R.string.game_dnd_sub), gameDnd) {
                    gameDnd = it
                    p.gameDnd = it
                }
                if (gameDnd && !Perms.dnd(ctx)) {
                    OutlinedButton(onClick = { Perms.open(ctx, Perms.dndIntent()) }) { Text(stringResource(R.string.game_dnd_grant)) }
                }
                Text(
                    stringResource(R.string.game_vpn_found, vpn.size),
                    style = MaterialTheme.typography.bodyMedium
                )
                vpn.take(6).forEach { pkg ->
                    Text("• " + TrackedApps.label(ctx, pkg), style = MaterialTheme.typography.bodySmall)
                }
                OutlinedButton(onClick = { pickExcl = true }) {
                    Text(stringResource(R.string.game_exclusions, p.gameExclusions.size))
                }
                if (gameActive) {
                    Button(onClick = {
                        GameMode.disable(ctx)
                        gameActive = false
                        gameMsg = ""
                    }, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text(stringResource(R.string.game_off)) }
                } else {
                    Button(onClick = {
                        scope.launch {
                            val r = withContext(Dispatchers.IO) { GameMode.enable(ctx, gamePkg.ifEmpty { null }) }
                            gameActive = true
                            gameMsg = ctx.getString(R.string.game_on_done, r.count, MemoryTools.formatBytes(r.freedBytes))
                        }
                    }, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                        Text(stringResource(if (gamePkg.isEmpty()) R.string.game_on else R.string.game_on_launch))
                    }
                }
                if (gameMsg.isNotEmpty()) Text(gameMsg, color = MaterialTheme.colorScheme.primary)
            }
        }
    }

    if (pickGame) {
        AppSinglePickerDialog(
            title = stringResource(R.string.game_pick_other),
            onDismiss = { pickGame = false },
            onPick = {
                gamePkg = it.pkg
                pickGame = false
            }
        )
    }
    if (pickExcl) {
        AppMultiPickerDialog(
            title = stringResource(R.string.game_exclusions_title),
            initial = p.gameExclusions,
            highlight = vpn,
            onDismiss = { pickExcl = false },
            onSave = {
                p.gameExclusions = it
                pickExcl = false
            }
        )
    }
}

@Composable
private fun MemBar(title: String, used: Long, total: Long, caption: String) {
    val f = if (total > 0) (used.toFloat() / total).coerceIn(0f, 1f) else 0f
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row {
            Text(title, Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
            Text("${(f * 100).toInt()}%")
        }
        LinearProgressIndicator(
            progress = { f },
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .clip(RoundedCornerShape(5.dp)),
            color = if (f > 0.85f) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
        )
        Text(caption, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
