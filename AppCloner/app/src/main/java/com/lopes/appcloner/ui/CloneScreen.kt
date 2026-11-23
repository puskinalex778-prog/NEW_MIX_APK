package com.lopes.appcloner.ui

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.AutoFixHigh
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Error
import androidx.compose.material.icons.rounded.ExpandLess
import androidx.compose.material.icons.rounded.ExpandMore
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lopes.appcloner.CloneJob
import com.lopes.appcloner.CloneMode
import com.lopes.appcloner.MainViewModel
import com.lopes.appcloner.Phase
import com.lopes.appcloner.core.CloneEngine
import com.lopes.appcloner.core.CloneOptions
import com.lopes.appcloner.data.AppEntry
import com.lopes.appcloner.data.PermItem
import com.lopes.appcloner.install.Installer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CloneScreen(vm: MainViewModel, app: AppEntry, onBack: () -> Unit) {
    val ctx = LocalContext.current
    val job by vm.job.collectAsStateWithLifecycle()
    val activeJob = job?.takeIf { it.app.packageName == app.packageName }

    var pkg by rememberSaveable(app.packageName) { mutableStateOf(vm.suggestPackage(app)) }
    var label by rememberSaveable(app.packageName) { mutableStateOf(vm.suggestLabel(app, pkg)) }
    var labelEdited by rememberSaveable(app.packageName) { mutableStateOf(false) }
    var debuggable by rememberSaveable { mutableStateOf(false) }
    var allowBackup by rememberSaveable { mutableStateOf(false) }
    var permsOpen by rememberSaveable { mutableStateOf(false) }
    var needInstallPermission by remember { mutableStateOf(false) }
    val removed = remember(app.packageName) { mutableStateListOf<String>() }
    var perms by remember(app.packageName) { mutableStateOf<List<PermItem>?>(null) }

    LaunchedEffect(app.packageName) { perms = vm.permissions(app.packageName) }

    val pkgValid = CloneOptions.isValidPackageName(pkg) && pkg != app.packageName
    val pkgExists = pkgValid && vm.isInstalled(pkg)
    val canStart = pkgValid && label.isNotBlank() && activeJob == null

    fun options() = CloneOptions(pkg.trim(), label.trim()).also {
        it.debuggable = debuggable
        it.allowBackup = allowBackup
        it.removePermissions.addAll(removed)
    }

    val exportApk = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/vnd.android.package-archive")
    ) { uri -> if (uri != null) vm.exportTo(uri) }
    val exportApks = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/octet-stream")
    ) { uri -> if (uri != null) vm.exportTo(uri) }

    // Как только APK готов к сохранению — сразу открываем диалог выбора файла
    LaunchedEffect(activeJob?.phase) {
        val j = activeJob ?: return@LaunchedEffect
        if (j.phase == Phase.EXPORT_READY) {
            if (j.files.size > 1) exportApks.launch("${j.newPackage}.apks")
            else exportApk.launch("${j.newPackage}.apk")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Новый клон") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Rounded.ArrowBack, "Назад") }
                },
            )
        },
        bottomBar = {
            if (activeJob == null) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceContainer)
                        .navigationBarsPadding()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    OutlinedButton(
                        onClick = { vm.startClone(app, options(), CloneMode.EXPORT) },
                        enabled = canStart,
                        modifier = Modifier.height(52.dp),
                    ) {
                        Icon(Icons.Rounded.Download, null)
                        Spacer(Modifier.width(6.dp))
                        Text("APK")
                    }
                    Button(
                        onClick = {
                            if (!Installer.canInstall(ctx)) needInstallPermission = true
                            else vm.startClone(app, options(), CloneMode.INSTALL)
                        },
                        enabled = canStart,
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                    ) {
                        Icon(Icons.Rounded.AutoFixHigh, null)
                        Spacer(Modifier.width(8.dp))
                        Text(if (pkgExists) "Обновить клон" else "Клонировать", fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
    ) { pad ->
        Column(
            Modifier
                .padding(pad)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            HeroCard(app, label, pkg)

            if (activeJob != null) {
                JobCard(
                    job = activeJob,
                    onCancel = vm::cancel,
                    onClose = vm::dismissJob,
                    onOpen = { launchApp(ctx, activeJob.newPackage) },
                    onDone = { vm.dismissJob(); onBack() },
                )
            } else {
                Section("Основное") {
                    OutlinedTextField(
                        value = label,
                        onValueChange = { label = it; labelEdited = true },
                        label = { Text("Название на рабочем столе") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Spacer(Modifier.height(10.dp))
                    OutlinedTextField(
                        value = pkg,
                        onValueChange = { v ->
                            pkg = v.trim()
                            if (!labelEdited) label = vm.suggestLabel(app, pkg)
                        },
                        label = { Text("Имя пакета") },
                        singleLine = true,
                        isError = !pkgValid,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                        supportingText = {
                            when {
                                !pkgValid -> Text("Латиница, цифры и точки, например com.app.clone1")
                                pkgExists -> Text("Уже установлен — клон будет обновлён (если подписан этим клонером)")
                                else -> Text("Уникальный идентификатор клона")
                            }
                        },
                        textStyle = MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace),
                        modifier = Modifier.fillMaxWidth(),
                    )
                }

                Section("Дополнительно") {
                    ToggleRow(
                        "Режим отладки",
                        "android:debuggable — для разработчиков и отладки через adb",
                        debuggable,
                    ) { debuggable = it }
                    ToggleRow(
                        "Разрешить резервное копирование",
                        "android:allowBackup — данные клона можно сохранить через adb backup",
                        allowBackup,
                    ) { allowBackup = it }
                }

                PermissionsSection(
                    perms = perms,
                    removed = removed,
                    open = permsOpen,
                    onToggleOpen = { permsOpen = !permsOpen },
                )

                if (app.splitCount > 0) {
                    InfoNote(
                        Icons.Rounded.Warning,
                        "Приложение состоит из ${app.splitCount + 1} APK (split). Все части будут " +
                                "переподписаны и установлены одной сессией.",
                    )
                }
                InfoNote(
                    Icons.Rounded.Shield,
                    "Клон — отдельное приложение со своими данными и аккаунтами. Приложения с защитой " +
                            "от модификации или входом через Google могут работать некорректно.",
                )
                Spacer(Modifier.height(8.dp))
            }
        }
    }

    if (needInstallPermission) {
        AlertDialog(
            onDismissRequest = { needInstallPermission = false },
            icon = { Icon(Icons.Rounded.Shield, null) },
            title = { Text("Нужно разрешение") },
            text = {
                Text("Чтобы устанавливать клоны, разрешите Клонеру установку приложений из неизвестных источников.")
            },
            confirmButton = {
                TextButton(onClick = {
                    needInstallPermission = false
                    ctx.startActivity(
                        Intent(
                            Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                            Uri.parse("package:${ctx.packageName}"),
                        )
                    )
                }) { Text("Открыть настройки") }
            },
            dismissButton = { TextButton(onClick = { needInstallPermission = false }) { Text("Отмена") } },
        )
    }
}

@Composable
private fun HeroCard(app: AppEntry, label: String, pkg: String) {
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .background(BrandGradient)
                .padding(20.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AppIcon(app.packageName, 64.dp)
                    Spacer(Modifier.width(12.dp))
                    Icon(Icons.AutoMirrored.Rounded.ArrowForward, null, tint = Color.White)
                    Spacer(Modifier.width(12.dp))
                    Box {
                        AppIcon(app.packageName, 64.dp)
                        Text(
                            "2",
                            color = Color.White, fontWeight = FontWeight.Black, fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .clip(RoundedCornerShape(50))
                                .background(Color(0xFF1A1440))
                                .padding(horizontal = 7.dp, vertical = 1.dp),
                        )
                    }
                }
                Spacer(Modifier.height(14.dp))
                Text(
                    label.ifBlank { app.label }, color = Color.White,
                    fontWeight = FontWeight.Black, fontSize = 22.sp,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Text(
                    pkg, color = Color.White.copy(alpha = 0.85f), fontFamily = FontFamily.Monospace,
                    fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Tag(app.versionName ?: "v${app.versionCode}", Color.White)
                    Tag(CloneEngine.human(app.sizeBytes), Color.White)
                    Tag("SDK ${app.minSdk}–${app.targetSdk}", Color.White)
                }
            }
        }
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(
                title, style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(10.dp))
            content()
        }
    }
}

@Composable
private fun ToggleRow(title: String, subtitle: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onChange(!checked) }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Medium)
            Text(
                subtitle, style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Spacer(Modifier.width(12.dp))
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

@Composable
private fun PermissionsSection(
    perms: List<PermItem>?,
    removed: MutableList<String>,
    open: Boolean,
    onToggleOpen: () -> Unit,
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        modifier = Modifier.animateContentSize(),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggleOpen),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        "Приватность: разрешения", style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold,
                    )
                    Text(
                        when {
                            perms == null -> "Загрузка…"
                            removed.isEmpty() -> "${perms.size} разрешений · отметьте те, что нужно вырезать из клона"
                            else -> "Будет вырезано: ${removed.size} из ${perms.size}"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Icon(if (open) Icons.Rounded.ExpandLess else Icons.Rounded.ExpandMore, null)
            }
            AnimatedVisibility(open && perms != null) {
                Column(Modifier.padding(top = 8.dp)) {
                    perms.orEmpty().forEach { p ->
                        val checked = p.name in removed
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { if (checked) removed.remove(p.name) else removed.add(p.name) }
                                .padding(vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Checkbox(
                                checked = checked,
                                onCheckedChange = { if (it) removed.add(p.name) else removed.remove(p.name) },
                            )
                            Column(Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        p.label, style = MaterialTheme.typography.bodyMedium,
                                        maxLines = 1, overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f, fill = false),
                                    )
                                    if (p.dangerous) {
                                        Spacer(Modifier.width(6.dp))
                                        Tag("опасное", MaterialTheme.colorScheme.error)
                                    }
                                }
                                Text(
                                    p.name, fontSize = 11.sp, fontFamily = FontFamily.Monospace,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                                )
                            }
                        }
                    }
                    if (removed.isNotEmpty()) {
                        Text(
                            "Если приложение без проверки вызывает вырезанное разрешение, оно может закрыться с ошибкой.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(top = 8.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoNote(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.10f))
            .padding(14.dp),
    ) {
        Icon(icon, null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(10.dp))
        Text(text, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun JobCard(
    job: CloneJob,
    onCancel: () -> Unit,
    onClose: () -> Unit,
    onOpen: () -> Unit,
    onDone: () -> Unit,
) {
    val accent = when (job.phase) {
        Phase.SUCCESS, Phase.EXPORTED -> MaterialTheme.colorScheme.tertiary
        Phase.ERROR -> MaterialTheme.colorScheme.error
        else -> MaterialTheme.colorScheme.primary
    }
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        modifier = Modifier.animateContentSize(),
    ) {
        Column(Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                when (job.phase) {
                    Phase.SUCCESS, Phase.EXPORTED ->
                        Icon(Icons.Rounded.CheckCircle, null, tint = accent, modifier = Modifier.size(28.dp))

                    Phase.ERROR -> Icon(Icons.Rounded.Error, null, tint = accent, modifier = Modifier.size(28.dp))
                    else -> Icon(Icons.Rounded.AutoFixHigh, null, tint = accent, modifier = Modifier.size(28.dp))
                }
                Spacer(Modifier.width(12.dp))
                Text(job.step, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            }
            Spacer(Modifier.height(14.dp))
            val running = job.phase == Phase.WORKING || job.phase == Phase.INSTALLING
            if (running && job.progress <= 0f) {
                LinearProgressIndicator(Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(50)))
            } else {
                LinearProgressIndicator(
                    progress = { if (job.phase == Phase.ERROR) 1f else job.progress },
                    color = accent,
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(50)),
                )
            }

            job.message?.let {
                Spacer(Modifier.height(12.dp))
                Text(it, color = accent, style = MaterialTheme.typography.bodyMedium)
            }

            if (job.log.isNotEmpty()) {
                Spacer(Modifier.height(12.dp))
                HorizontalDivider()
                Spacer(Modifier.height(8.dp))
                Column(
                    Modifier
                        .fillMaxWidth()
                        .heightIn(max = 220.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    job.log.forEach {
                        Text(
                            "› $it", fontFamily = FontFamily.Monospace, fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            Spacer(Modifier.height(14.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                when (job.phase) {
                    Phase.WORKING -> OutlinedButton(onClick = onCancel) { Text("Отмена") }
                    Phase.INSTALLING -> Unit
                    Phase.CONFIRM -> OutlinedButton(onClick = onClose) { Text("Скрыть") }
                    Phase.SUCCESS -> {
                        Button(onClick = onOpen, modifier = Modifier.weight(1f)) {
                            Icon(Icons.AutoMirrored.Rounded.OpenInNew, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Открыть клон")
                        }
                        OutlinedButton(onClick = onDone) { Text("Готово") }
                    }

                    Phase.EXPORT_READY -> OutlinedButton(onClick = onClose) { Text("Закрыть") }
                    Phase.EXPORTED -> Button(onClick = onDone) { Text("Готово") }
                    Phase.ERROR -> Button(onClick = onClose) { Text("Назад к настройкам") }
                }
            }
        }
    }
}
