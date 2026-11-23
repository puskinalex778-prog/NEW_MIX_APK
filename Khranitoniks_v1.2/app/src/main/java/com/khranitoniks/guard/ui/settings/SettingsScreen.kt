@file:OptIn(ExperimentalMaterial3Api::class)

package com.khranitoniks.guard.ui.settings

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
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
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.admin.GuardAdminReceiver
import com.khranitoniks.guard.core.CharacterArt
import com.khranitoniks.guard.core.CharacterKind
import com.khranitoniks.guard.core.Clip
import com.khranitoniks.guard.core.CodeCrypto
import com.khranitoniks.guard.core.LimitScope
import com.khranitoniks.guard.core.Names
import com.khranitoniks.guard.core.Rules
import com.khranitoniks.guard.core.extractKey
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.OverlayTheme
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.core.PinManager
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.core.TimeUtil
import com.khranitoniks.guard.service.Notifier
import com.khranitoniks.guard.ui.Sub
import com.khranitoniks.guard.ui.common.EmojiBubble
import com.khranitoniks.guard.ui.common.InfoText
import com.khranitoniks.guard.ui.common.Stepper
import com.khranitoniks.guard.ui.common.SwitchRow
import com.khranitoniks.guard.ui.common.digits
import kotlinx.coroutines.delay

@Composable
fun SettingsScreen(onOpen: (Sub) -> Unit) {
    val ctx = LocalContext.current
    val p = remember { Prefs.get(ctx) }
    // счётчик для перерисовки после изменения настроек
    var v by remember { mutableStateOf(0) }
    fun upd(block: () -> Unit) {
        block()
        Rules.invalidate()
        v++
    }
    @Suppress("UNUSED_VARIABLE") val tick = v

    var adminActive by remember { mutableStateOf(Perms.deviceAdmin(ctx)) }
    LaunchedEffect(Unit) {
        while (true) {
            adminActive = Perms.deviceAdmin(ctx)
            delay(1500)
        }
    }

    var showSettingsLockWarn by remember { mutableStateOf(false) }
    var showChangePin by remember { mutableStateOf(false) }
    var showKeyInput by remember { mutableStateOf(false) }
    var showNewKeyConfirm by remember { mutableStateOf(false) }
    var showUnpair by remember { mutableStateOf(false) }

    val mins: (Int) -> String = { ctx.getString(R.string.fmt_m, it) }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // ---------- ребёнок ----------
        item(key = "child_$tick") {
            Collapsible(stringResource(R.string.set_child), "👤", true) {
                TextSetting(stringResource(R.string.set_child_name), p.childName, stringResource(R.string.set_child_name_hint)) {
                    upd { p.childName = it.take(30) }
                }
                InfoText(stringResource(R.string.set_child_name_sub))
                Text(stringResource(R.string.set_character), style = MaterialTheme.typography.bodyLarge)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    CharacterKind.entries.forEach { k ->
                        val sel = p.characterKind == k
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { upd { p.character = k.name } },
                            shape = RoundedCornerShape(18.dp),
                            border = if (sel) BorderStroke(3.dp, MaterialTheme.colorScheme.primary) else null,
                            colors = CardDefaults.cardColors(
                                containerColor = if (sel) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Column(Modifier.padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Image(painterResource(CharacterArt.res(k, Mood.HAPPY)), contentDescription = null, modifier = Modifier.size(64.dp))
                                Text(characterName(ctx, k), style = MaterialTheme.typography.labelSmall, textAlign = TextAlign.Center, maxLines = 2)
                            }
                        }
                    }
                }
            }
        }

        // ---------- лимиты и перерывы ----------
        item(key = "limits_$tick") {
            Collapsible(stringResource(R.string.set_limits), "⏱", true) {
                SwitchRow(stringResource(R.string.set_limits_enabled), stringResource(R.string.set_limits_enabled_sub), p.limitsEnabled) {
                    upd { p.limitsEnabled = it }
                }
                Card(
                    onClick = { onOpen(Sub.APPS) },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(if (p.scope == LimitScope.DEVICE) "📱" else "🎮", fontSize = 26.sp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                stringResource(if (p.scope == LimitScope.DEVICE) R.string.scope_device else R.string.scope_apps),
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                stringResource(R.string.set_scope_summary, p.acAllowed.size, p.blockedApps.size),
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        Text("›", fontSize = 28.sp, color = MaterialTheme.colorScheme.primary)
                    }
                }
                Stepper(stringResource(R.string.set_daily_limit), p.dailyLimitMin, 5..720, 5, mins) { upd { p.dailyLimitMin = it } }
                Stepper(stringResource(R.string.set_break_every), p.breakEveryMin, 0..240, 5, {
                    if (it == 0) ctx.getString(R.string.set_breaks_none) else ctx.getString(R.string.fmt_m, it)
                }) { upd { p.breakEveryMin = it } }
                Stepper(stringResource(R.string.set_break_len), p.breakDurationMin, 1..60, 1, mins) { upd { p.breakDurationMin = it } }
                Text(stringResource(R.string.set_mode), style = MaterialTheme.typography.bodyLarge)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = !p.strictMode, onClick = { upd { p.strictMode = false } }, label = { Text(stringResource(R.string.set_mode_soft)) })
                    FilterChip(selected = p.strictMode, onClick = { upd { p.strictMode = true } }, label = { Text(stringResource(R.string.set_mode_strict)) })
                }
                InfoText(stringResource(if (p.strictMode) R.string.set_mode_strict_sub else R.string.set_mode_soft_sub))
                if (p.strictMode) {
                    SwitchRow(stringResource(R.string.set_auto_minimize), stringResource(R.string.set_auto_minimize_sub), p.autoMinimize) {
                        upd { p.autoMinimize = it }
                    }
                }
                TextSetting(stringResource(R.string.set_break_text), p.breakMessage, stringResource(R.string.ov_break_msg_default)) { upd { p.breakMessage = it } }
                TextSetting(stringResource(R.string.set_limit_text), p.limitMessage, stringResource(R.string.ov_limit_msg_device)) { upd { p.limitMessage = it } }
                TextButton(onClick = {
                    upd {
                        p.limitUsedMs = 0L
                        p.usageSinceBreakMs = 0L
                        p.breakUntil = 0L
                    }
                    Toast.makeText(ctx, R.string.done, Toast.LENGTH_SHORT).show()
                }) { Text(stringResource(R.string.set_reset_today)) }
            }
        }

        // ---------- ночной режим ----------
        item(key = "night_$tick") {
            Collapsible(stringResource(R.string.set_night), "🌙", false) {
                SwitchRow(stringResource(R.string.set_night_enabled), stringResource(R.string.set_night_sub), p.nightEnabled) { upd { p.nightEnabled = it } }
                Stepper(stringResource(R.string.set_night_start), p.nightStartMin, 0..1425, 15, { TimeUtil.hm(it) }) { upd { p.nightStartMin = it } }
                Stepper(stringResource(R.string.set_night_end), p.nightEndMin, 0..1425, 15, { TimeUtil.hm(it) }) { upd { p.nightEndMin = it } }
            }
        }

        // ---------- учебное время ----------
        item(key = "school_$tick") {
            Collapsible(stringResource(R.string.set_school), "🎒", false) {
                SwitchRow(stringResource(R.string.set_school_enabled), stringResource(R.string.set_school_sub), p.schoolEnabled) { upd { p.schoolEnabled = it } }
                Stepper(stringResource(R.string.set_school_start), p.schoolStartMin, 0..1425, 15, { TimeUtil.hm(it) }) { upd { p.schoolStartMin = it } }
                Stepper(stringResource(R.string.set_school_end), p.schoolEndMin, 0..1425, 15, { TimeUtil.hm(it) }) { upd { p.schoolEndMin = it } }
                val days = stringArrayDays(ctx)
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.fillMaxWidth()) {
                    days.forEachIndexed { i, label ->
                        val on = ((p.schoolDays shr i) and 1) == 1
                        FilterChip(
                            selected = on,
                            onClick = { upd { p.schoolDays = p.schoolDays xor (1 shl i) } },
                            label = { Text(label, maxLines = 1) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                InfoText(stringResource(R.string.set_school_info))
            }
        }

        // ---------- зарядка ----------
        item(key = "charge_$tick") {
            Collapsible(stringResource(R.string.set_charge), "🔋", false) {
                SwitchRow(stringResource(R.string.set_charge_lock), stringResource(R.string.set_charge_lock_sub), p.chargeLockEnabled) { upd { p.chargeLockEnabled = it } }
                Stepper(stringResource(R.string.set_charge_threshold), p.chargeThreshold, 30..100, 5, { "$it%" }) { upd { p.chargeThreshold = it } }
                TextSetting(stringResource(R.string.set_charge_text), p.chargeMessage, stringResource(R.string.ov_charge_msg_default, p.chargeThreshold)) { upd { p.chargeMessage = it } }
                HorizontalDivider()
                SwitchRow(stringResource(R.string.set_low_battery), stringResource(R.string.set_low_battery_sub), p.lowBatteryEnabled) { upd { p.lowBatteryEnabled = it } }
                Stepper(stringResource(R.string.set_low_level), p.lowBatteryLevel, 5..50, 5, { "$it%" }) { upd { p.lowBatteryLevel = it } }
            }
        }

        // ---------- оформление ----------
        item(key = "look_$tick") {
            Collapsible(stringResource(R.string.set_look), "🎨", false) {
                Text(stringResource(R.string.set_overlay_theme), style = MaterialTheme.typography.bodyLarge)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OverlayTheme.entries.forEach { t ->
                        FilterChip(
                            selected = p.overlayThemeKind == t,
                            onClick = { upd { p.overlayTheme = t.name } },
                            label = {
                                Text(
                                    stringResource(
                                        when (t) {
                                            OverlayTheme.DARK -> R.string.theme_dark
                                            OverlayTheme.LIGHT -> R.string.theme_light
                                            OverlayTheme.NEON -> R.string.theme_neon
                                        }
                                    )
                                )
                            }
                        )
                    }
                }
                OutlinedButton(onClick = {
                    Notifier.alert(
                        ctx, Notifier.ID_BREAK,
                        Names.title(ctx, R.string.ov_break_title, R.string.ov_break_title_named),
                        ctx.getString(R.string.test_notification_text), Mood.BREAK
                    )
                }) { Text(stringResource(R.string.set_test_notification)) }
            }
        }

        // ---------- защита ----------
        item(key = "protect_$tick") {
            Collapsible(stringResource(R.string.set_protect), "🛡️", false) {
                SwitchRow(stringResource(R.string.set_settings_lock), stringResource(R.string.set_settings_lock_sub), p.settingsLockEnabled) {
                    if (it) showSettingsLockWarn = true else upd { p.settingsLockEnabled = false }
                }
                HorizontalDivider()
                Text(stringResource(R.string.set_uninstall), style = MaterialTheme.typography.bodyLarge)
                InfoText(stringResource(R.string.set_uninstall_sub))
                Text(
                    stringResource(if (adminActive) R.string.state_on else R.string.state_off),
                    color = if (adminActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                    fontWeight = FontWeight.Bold
                )
                if (adminActive) {
                    OutlinedButton(onClick = {
                        val dpm = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
                        dpm.removeActiveAdmin(ComponentName(ctx, GuardAdminReceiver::class.java))
                    }) { Text(stringResource(R.string.set_uninstall_off)) }
                } else {
                    Button(onClick = { Perms.open(ctx, Perms.deviceAdminIntent(ctx)) }) { Text(stringResource(R.string.set_uninstall_on)) }
                }
                InfoText(Perms.vendorHint(ctx))
                OutlinedButton(onClick = { Perms.openAutostart(ctx) }) { Text(stringResource(R.string.set_autostart)) }
                HorizontalDivider()
                SwitchRow(stringResource(R.string.set_full_activity), stringResource(R.string.set_full_activity_sub), p.showFullActivity) {
                    upd { p.showFullActivity = it }
                }
            }
        }

        // ---------- связь с Хранитоникс Бокс ----------
        item(key = "pair_$tick") {
            Collapsible(stringResource(R.string.set_pair), "🔗", p.pairingKey.isEmpty()) {
                InfoText(stringResource(R.string.set_pair_info))
                if (p.pairingKey.isNotEmpty()) {
                    Text(stringResource(R.string.set_pair_key), style = MaterialTheme.typography.labelMedium)
                    Text(
                        p.pairingKey,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = {
                            Clip.copy(ctx, p.pairingKey, R.string.key_copied, sensitive = true)
                        }) { Text(stringResource(R.string.copy)) }
                        Button(onClick = {
                            val text = ctx.getString(R.string.share_key_text, p.pairingKey)
                            val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
                            ctx.startActivity(Intent.createChooser(send, ctx.getString(R.string.share)))
                        }) { Text(stringResource(R.string.share)) }
                    }
                    TextButton(onClick = { showUnpair = true }) {
                        Text(stringResource(R.string.set_pair_remove), color = MaterialTheme.colorScheme.error)
                    }
                } else {
                    Text(stringResource(R.string.set_pair_none), color = MaterialTheme.colorScheme.error)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = {
                        if (p.pairingKey.isNotEmpty()) showNewKeyConfirm = true
                        else upd { p.pairingKey = CodeCrypto.formatKey(CodeCrypto.generateKey()) }
                    }) { Text(stringResource(R.string.set_pair_new)) }
                    OutlinedButton(onClick = { showKeyInput = true }) { Text(stringResource(R.string.set_pair_enter)) }
                }
            }
        }

        // ---------- прочее ----------
        item(key = "other_$tick") {
            Collapsible(stringResource(R.string.set_other), "📚", true) {
                Button(onClick = { onOpen(Sub.GUIDE) }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.guide_title)) }
                OutlinedButton(onClick = { onOpen(Sub.APPS) }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.apps_title)) }
                OutlinedButton(onClick = { onOpen(Sub.PERMISSIONS) }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.perm_title)) }
                OutlinedButton(onClick = { onOpen(Sub.JOURNAL) }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.journal_title)) }
                OutlinedButton(onClick = { onOpen(Sub.TOOLS) }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.home_tools)) }
                OutlinedButton(onClick = { showChangePin = true }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.set_change_pin)) }
                OutlinedButton(onClick = {
                    val i = if (Build.VERSION.SDK_INT >= 33) {
                        Intent(Settings.ACTION_APP_LOCALE_SETTINGS, android.net.Uri.parse("package:" + ctx.packageName))
                    } else Intent(Settings.ACTION_LOCALE_SETTINGS)
                    Perms.open(ctx, i, Intent(Settings.ACTION_LOCALE_SETTINGS))
                }, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.set_language)) }
                InfoText(stringResource(R.string.set_language_sub))
            }
        }
    }

    // ---------- диалоги ----------
    if (showSettingsLockWarn) {
        AlertDialog(
            onDismissRequest = { showSettingsLockWarn = false },
            title = { Text(stringResource(R.string.set_settings_lock)) },
            text = { Text(stringResource(R.string.set_settings_lock_warn)) },
            confirmButton = {
                TextButton(onClick = {
                    upd { p.settingsLockEnabled = true }
                    showSettingsLockWarn = false
                }) { Text(stringResource(R.string.enable)) }
            },
            dismissButton = { TextButton(onClick = { showSettingsLockWarn = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
    if (showChangePin) {
        ChangePinDialog(onDismiss = { showChangePin = false })
    }
    if (showKeyInput) {
        KeyInputDialog(onDismiss = { showKeyInput = false }, onSaved = {
            showKeyInput = false
            v++
        })
    }
    if (showNewKeyConfirm) {
        AlertDialog(
            onDismissRequest = { showNewKeyConfirm = false },
            title = { Text(stringResource(R.string.set_pair_new)) },
            text = { Text(stringResource(R.string.set_pair_new_warn)) },
            confirmButton = {
                TextButton(onClick = {
                    upd { p.pairingKey = CodeCrypto.formatKey(CodeCrypto.generateKey()) }
                    showNewKeyConfirm = false
                }) { Text(stringResource(R.string.ok)) }
            },
            dismissButton = { TextButton(onClick = { showNewKeyConfirm = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
    if (showUnpair) {
        AlertDialog(
            onDismissRequest = { showUnpair = false },
            title = { Text(stringResource(R.string.set_pair_remove)) },
            text = { Text(stringResource(R.string.set_pair_remove_warn)) },
            confirmButton = {
                TextButton(onClick = {
                    upd { p.pairingKey = "" }
                    showUnpair = false
                }) { Text(stringResource(R.string.delete)) }
            },
            dismissButton = { TextButton(onClick = { showUnpair = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
}

/** Короткие названия дней недели, начиная с понедельника. */
private fun stringArrayDays(ctx: Context): List<String> =
    ctx.getString(R.string.weekdays_short).split(",").map { it.trim() }.take(7)

/** Раскрывающаяся секция настроек. */
@Composable
private fun Collapsible(title: String, emoji: String, initiallyOpen: Boolean, content: @Composable ColumnScope.() -> Unit) {
    var open by rememberSaveable(title) { mutableStateOf(initiallyOpen) }
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .clickable { open = !open }
                    .padding(vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                EmojiBubble(emoji, 38.dp)
                Spacer(Modifier.width(12.dp))
                Text(title, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                Icon(if (open) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown, contentDescription = null)
            }
            AnimatedVisibility(open) {
                Column(Modifier.padding(bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
            }
        }
    }
}

fun characterName(ctx: Context, k: CharacterKind): String = ctx.getString(
    when (k) {
        CharacterKind.SEMA -> R.string.char_sema
        CharacterKind.TIMMA -> R.string.char_timma
        CharacterKind.OLEZHKA -> R.string.char_olezhka
        CharacterKind.HRONI -> R.string.char_hroni
    }
)

@Composable
private fun TextSetting(title: String, value: String, placeholder: String, onSave: (String) -> Unit) {
    var text by remember(value) { mutableStateOf(value) }
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        OutlinedTextField(
            value = text,
            onValueChange = { text = it.take(240) },
            label = { Text(title) },
            placeholder = { Text(placeholder, maxLines = 2) },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 4
        )
        if (text != value) {
            Row {
                TextButton(onClick = { onSave(text.trim()) }) { Text(stringResource(R.string.save)) }
                TextButton(onClick = { text = value }) { Text(stringResource(R.string.cancel)) }
            }
        }
    }
}

@Composable
private fun ChangePinDialog(onDismiss: () -> Unit) {
    val ctx = LocalContext.current
    var a by remember { mutableStateOf("") }
    var b by remember { mutableStateOf("") }
    var err by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.set_change_pin)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = a, onValueChange = { a = digits(it, 4) },
                    label = { Text(stringResource(R.string.pin_new)) }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
                )
                OutlinedTextField(
                    value = b, onValueChange = { b = digits(it, 4) },
                    label = { Text(stringResource(R.string.pin_repeat)) }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
                )
                if (err.isNotEmpty()) Text(err, color = MaterialTheme.colorScheme.error)
            }
        },
        confirmButton = {
            TextButton(enabled = a.length == 4 && b.length == 4, onClick = {
                if (a != b) err = ctx.getString(R.string.pin_mismatch) else {
                    PinManager.setPin(ctx, a)
                    Toast.makeText(ctx, R.string.pin_changed, Toast.LENGTH_SHORT).show()
                    onDismiss()
                }
            }) { Text(stringResource(R.string.save)) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}

@Composable
private fun KeyInputDialog(onDismiss: () -> Unit, onSaved: () -> Unit) {
    val ctx = LocalContext.current
    var key by remember { mutableStateOf("") }
    var err by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.set_pair_enter)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoText(stringResource(R.string.set_pair_enter_sub))
                OutlinedTextField(
                    value = key,
                    onValueChange = { key = it.uppercase().take(24) },
                    label = { Text("XXXX-XXXX-XXXX-XXXX-X") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                TextButton(onClick = {
                    val k = extractKey(Clip.read(ctx))
                    if (k.isNullOrEmpty()) err = ctx.getString(R.string.paste_empty) else {
                        key = k
                        err = ""
                    }
                }) { Text(stringResource(R.string.paste)) }
                if (err.isNotEmpty()) Text(err, color = MaterialTheme.colorScheme.error)
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val bytes = CodeCrypto.parseKey(key)
                if (bytes == null) err = ctx.getString(R.string.key_invalid) else {
                    Prefs.get(ctx).pairingKey = CodeCrypto.formatKey(bytes)
                    onSaved()
                }
            }) { Text(stringResource(R.string.save)) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) } }
    )
}
