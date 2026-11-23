package com.khranitoniks.guard.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.EventLog
import com.khranitoniks.guard.core.LogType
import com.khranitoniks.guard.core.TimeUtil

private fun emojiFor(type: String): String = when (type) {
    LogType.CHARGE_INTERRUPTED -> "🔌"
    LogType.CHARGED -> "🔋"
    LogType.EMERGENCY_UNLOCK -> "🚨"
    LogType.BONUS -> "⭐"
    LogType.PIN_FAILED, LogType.CODE_FAILED -> "❌"
    LogType.PIN_LOCKOUT -> "⛔"
    LogType.CODE_OK -> "🎁"
    LogType.NIGHT_UNLOCK -> "🌙"
    LogType.SETTINGS_UNLOCK -> "⚙"
    LogType.ADMIN -> "🛡"
    LogType.GAME_MODE -> "🎮"
    LogType.CLEAN -> "🧹"
    else -> "ℹ"
}

/** Журнал событий за последние дни. */
@Composable
fun JournalScreen() {
    val ctx = LocalContext.current
    var entries by remember { mutableStateOf(EventLog.all(ctx)) }
    var confirm by remember { mutableStateOf(false) }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            OutlinedButton(onClick = { confirm = true }, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.journal_clear))
            }
        }
        if (entries.isEmpty()) {
            item {
                Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    Text(stringResource(R.string.journal_empty), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        items(entries) { e ->
            Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(emojiFor(e.type), fontSize = 24.sp)
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(e.text, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                        Text(TimeUtil.dateTime(e.time), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }

    if (confirm) {
        AlertDialog(
            onDismissRequest = { confirm = false },
            title = { Text(stringResource(R.string.journal_clear)) },
            text = { Text(stringResource(R.string.journal_clear_q)) },
            confirmButton = {
                TextButton(onClick = {
                    EventLog.clear(ctx)
                    entries = emptyList()
                    confirm = false
                }) { Text(stringResource(R.string.delete)) }
            },
            dismissButton = { TextButton(onClick = { confirm = false }) { Text(stringResource(R.string.cancel)) } }
        )
    }
}
