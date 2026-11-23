package com.khranitoniks.guard.ui.onboarding

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.CharacterArt
import com.khranitoniks.guard.core.CharacterKind
import com.khranitoniks.guard.core.Mood
import com.khranitoniks.guard.core.PinManager
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.ui.common.digits
import com.khranitoniks.guard.ui.permissions.PermissionsContent
import com.khranitoniks.guard.ui.settings.characterName

/** Мастер первого запуска: приветствие → PIN → разрешения → персонаж. */
@Composable
fun OnboardingScreen(onDone: () -> Unit) {
    val ctx = LocalContext.current
    var step by remember { mutableStateOf(if (PinManager.isSet(ctx)) 2 else 0) }
    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            Modifier
                .fillMaxSize()
                .systemBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            LinearProgressIndicator(progress = { (step + 1) / 4f }, modifier = Modifier.fillMaxWidth())
            when (step) {
                0 -> Welcome { step = 1 }
                1 -> PinSetup { step = 2 }
                2 -> {
                    Text(stringResource(R.string.onb_perm_title), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(stringResource(R.string.onb_perm_text), style = MaterialTheme.typography.bodyMedium)
                    PermissionsContent(showOptional = false)
                    Button(onClick = { step = 3 }, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                        Text(stringResource(R.string.next))
                    }
                    Text(
                        stringResource(R.string.onb_perm_later),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                else -> CharacterStep(onDone)
            }
        }
    }
}

@Composable
private fun Welcome(onNext: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Image(
            painterResource(R.drawable.scene_welcome),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1200f / 640f)
                .clip(RoundedCornerShape(28.dp))
        )
        Text(stringResource(R.string.app_name), fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
        Text(stringResource(R.string.onb_welcome), textAlign = TextAlign.Center, style = MaterialTheme.typography.bodyLarge)
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
            Text(stringResource(R.string.onb_features), Modifier.padding(16.dp), style = MaterialTheme.typography.bodyMedium)
        }
        Button(onClick = onNext, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text(stringResource(R.string.onb_start)) }
    }
}

@Composable
private fun PinSetup(onNext: () -> Unit) {
    val ctx = LocalContext.current
    var a by remember { mutableStateOf("") }
    var b by remember { mutableStateOf("") }
    var err by remember { mutableStateOf("") }
    Text(stringResource(R.string.onb_pin_title), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
    Text(stringResource(R.string.onb_pin_text), style = MaterialTheme.typography.bodyMedium)
    OutlinedTextField(
        value = a, onValueChange = { a = digits(it, 4) },
        label = { Text(stringResource(R.string.pin_new)) }, singleLine = true,
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
        modifier = Modifier.fillMaxWidth()
    )
    OutlinedTextField(
        value = b, onValueChange = { b = digits(it, 4) },
        label = { Text(stringResource(R.string.pin_repeat)) }, singleLine = true,
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
        modifier = Modifier.fillMaxWidth()
    )
    if (err.isNotEmpty()) Text(err, color = MaterialTheme.colorScheme.error)
    Button(
        enabled = a.length == 4 && b.length == 4,
        onClick = {
            if (a != b) err = ctx.getString(R.string.pin_mismatch) else {
                PinManager.setPin(ctx, a)
                onNext()
            }
        },
        modifier = Modifier.fillMaxWidth().height(52.dp)
    ) { Text(stringResource(R.string.save)) }
}

@Composable
private fun CharacterStep(onDone: () -> Unit) {
    val ctx = LocalContext.current
    val p = remember { Prefs.get(ctx) }
    var sel by remember { mutableStateOf(p.characterKind) }
    var name by remember { mutableStateOf(p.childName) }
    Text(stringResource(R.string.onb_char_title), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
    OutlinedTextField(
        value = name,
        onValueChange = {
            name = it.take(30)
            p.childName = name.trim()
        },
        label = { Text(stringResource(R.string.set_child_name)) },
        placeholder = { Text(stringResource(R.string.set_child_name_hint)) },
        singleLine = true,
        modifier = Modifier.fillMaxWidth()
    )
    Text(stringResource(R.string.onb_char_text), style = MaterialTheme.typography.bodyMedium)
    CharacterKind.entries.chunked(2).forEach { row ->
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            row.forEach { k ->
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable {
                            sel = k
                            p.character = k.name
                        },
                    shape = RoundedCornerShape(20.dp),
                    border = if (sel == k) BorderStroke(3.dp, MaterialTheme.colorScheme.primary) else null
                ) {
                    Column(Modifier.padding(10.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                        Image(painterResource(CharacterArt.res(k, if (sel == k) Mood.HAPPY else Mood.BREAK)), contentDescription = null, modifier = Modifier.size(120.dp))
                        Text(characterName(ctx, k), fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
    Spacer(Modifier.height(4.dp))
    Button(onClick = onDone, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text(stringResource(R.string.onb_finish)) }
    OutlinedButton(onClick = onDone, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.onb_skip)) }
}
