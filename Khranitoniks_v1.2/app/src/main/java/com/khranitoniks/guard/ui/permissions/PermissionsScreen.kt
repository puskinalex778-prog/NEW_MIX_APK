package com.khranitoniks.guard.ui.permissions

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.Perms
import com.khranitoniks.guard.service.GuardService
import com.khranitoniks.guard.ui.common.InfoText
import kotlinx.coroutines.delay

private data class PermState(
    val usage: Boolean = false,
    val overlay: Boolean = false,
    val battery: Boolean = false,
    val notif: Boolean = false,
    val admin: Boolean = false,
    val dnd: Boolean = false,
    val files: Boolean = false
)

/** Экран выдачи разрешений с индикаторами «Выдано / Не выдано». */
@Composable
fun PermissionsScreen() {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        PermissionsContent(showOptional = true)
    }
}

@Composable
fun PermissionsContent(showOptional: Boolean) {
    val ctx = LocalContext.current
    var st by remember { mutableStateOf(PermState()) }
    LaunchedEffect(Unit) {
        while (true) {
            val n = PermState(
                usage = Perms.usage(ctx),
                overlay = Perms.overlay(ctx),
                battery = Perms.battery(ctx),
                notif = Perms.notifications(ctx),
                admin = Perms.deviceAdmin(ctx),
                dnd = Perms.dnd(ctx),
                files = Perms.allFiles(ctx)
            )
            if (n != st && n.usage && n.overlay) GuardService.start(ctx)
            st = n
            delay(1000)
        }
    }
    val notifLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (!granted) Perms.open(ctx, Perms.notificationSettingsIntent(ctx), Perms.appDetailsIntent(ctx))
    }
    val storageLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(stringResource(R.string.perm_required), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        PermItem(1, stringResource(R.string.perm_usage), stringResource(R.string.perm_usage_sub), st.usage) {
            Perms.open(ctx, Perms.usageIntent(ctx), Perms.appDetailsIntent(ctx))
        }
        PermItem(2, stringResource(R.string.perm_overlay), stringResource(R.string.perm_overlay_sub), st.overlay) {
            Perms.open(ctx, Perms.overlayIntent(ctx), Perms.appDetailsIntent(ctx))
        }
        PermItem(3, stringResource(R.string.perm_battery), stringResource(R.string.perm_battery_sub), st.battery) {
            Perms.open(ctx, Perms.batteryIntent(ctx), Perms.appDetailsIntent(ctx))
        }
        PermItem(4, stringResource(R.string.perm_notif), stringResource(R.string.perm_notif_sub), st.notif) {
            if (Build.VERSION.SDK_INT >= 33) notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            else Perms.open(ctx, Perms.notificationSettingsIntent(ctx), Perms.appDetailsIntent(ctx))
        }
        if (showOptional) {
            Spacer(Modifier.size(8.dp))
            Text(stringResource(R.string.perm_optional), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            PermItem(5, stringResource(R.string.perm_admin), stringResource(R.string.perm_admin_sub), st.admin) {
                Perms.open(ctx, Perms.deviceAdminIntent(ctx))
            }
            PermItem(6, stringResource(R.string.perm_dnd), stringResource(R.string.perm_dnd_sub), st.dnd) {
                Perms.open(ctx, Perms.dndIntent(), Perms.appDetailsIntent(ctx))
            }
            PermItem(7, stringResource(R.string.perm_files), stringResource(R.string.perm_files_sub), st.files) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) Perms.open(ctx, Perms.allFilesIntent(ctx), Perms.appDetailsIntent(ctx))
                else storageLauncher.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            }
            Card(shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(stringResource(R.string.perm_autostart), fontWeight = FontWeight.Bold)
                    InfoText(Perms.vendorHint(ctx))
                    OutlinedButton(onClick = { Perms.openAutostart(ctx) }) { Text(stringResource(R.string.set_autostart)) }
                }
            }
        }
    }
}

@Composable
private fun PermItem(n: Int, title: String, subtitle: String, granted: Boolean, onGrant: () -> Unit) {
    Card(shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(36.dp)
                    .background(if (granted) Color(0xFF2E7D32) else Color(0xFFD32F2F), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(if (granted) Icons.Filled.Check else Icons.Filled.Close, contentDescription = null, tint = Color.White)
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text("$n. $title", fontWeight = FontWeight.SemiBold)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(
                    stringResource(if (granted) R.string.perm_granted else R.string.perm_not_granted),
                    style = MaterialTheme.typography.labelMedium,
                    color = if (granted) Color(0xFF2E7D32) else Color(0xFFD32F2F),
                    fontWeight = FontWeight.Bold
                )
            }
            if (!granted) {
                Spacer(Modifier.width(8.dp))
                Button(onClick = onGrant) { Text(stringResource(R.string.perm_grant)) }
            }
        }
    }
}
