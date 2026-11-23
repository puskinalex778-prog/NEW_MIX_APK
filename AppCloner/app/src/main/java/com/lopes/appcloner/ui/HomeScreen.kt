package com.lopes.appcloner.ui

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Apps
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.ContentCopy
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Layers
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lopes.appcloner.MainViewModel
import com.lopes.appcloner.SortMode
import com.lopes.appcloner.core.CloneEngine
import com.lopes.appcloner.data.AppEntry
import com.lopes.appcloner.data.CloneRecord
import java.text.DateFormat
import java.util.Date

@Composable
fun HomeScreen(vm: MainViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var showInfo by rememberSaveable { mutableStateOf(false) }

    Scaffold(
        topBar = {
            Header(
                apps = state.apps.count { !it.isSystem },
                clones = state.clones.size,
                onInfo = { showInfo = true },
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == 0, onClick = { tab = 0 },
                    icon = { Icon(Icons.Rounded.Apps, null) },
                    label = { Text("Приложения") },
                )
                NavigationBarItem(
                    selected = tab == 1, onClick = { tab = 1 },
                    icon = { Icon(Icons.Rounded.Layers, null) },
                    label = { Text("Клоны (${state.clones.size})") },
                )
            }
        },
    ) { pad ->
        Box(Modifier.padding(pad).fillMaxSize()) {
            if (tab == 0) AppsTab(vm) else ClonesTab(vm)
        }
    }

    if (showInfo) InfoDialog { showInfo = false }
}

@Composable
private fun Header(apps: Int, clones: Int, onInfo: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(start = 20.dp, end = 8.dp, top = 12.dp, bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(BrandGradient),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Rounded.ContentCopy, null, tint = Color.White)
        }
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(
                buildAnnotatedString {
                    append("App ")
                    withStyle(SpanStyle(color = MaterialTheme.colorScheme.primary)) { append("Cloner") }
                },
                fontSize = 24.sp, fontWeight = FontWeight.Black,
            )
            Text(
                "$apps приложений · $clones клонов",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        IconButton(onClick = onInfo) { Icon(Icons.Rounded.Info, "О программе") }
    }
}

@Composable
private fun AppsTab(vm: MainViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()
    val apps = state.visibleApps
    val clonePkgs = state.clonePackages

    Column(Modifier.fillMaxSize()) {
        TextField(
            value = state.query,
            onValueChange = vm::setQuery,
            placeholder = { Text("Поиск по имени или пакету") },
            leadingIcon = { Icon(Icons.Rounded.Search, null) },
            trailingIcon = {
                AnimatedVisibility(state.query.isNotEmpty()) {
                    IconButton(onClick = { vm.setQuery("") }) { Icon(Icons.Rounded.Close, "Очистить") }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(50),
            colors = TextFieldDefaults.colors(
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
        )
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            item {
                FilterChip(
                    selected = state.showSystem, onClick = vm::toggleSystem,
                    label = { Text("Системные") },
                )
            }
            items(SortMode.entries) { s ->
                FilterChip(selected = state.sort == s, onClick = { vm.setSort(s) }, label = { Text(s.title) })
            }
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }

            apps.isEmpty() -> EmptyState("Ничего не найдено", "Попробуйте другой запрос или включите системные приложения")

            else -> LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(apps, key = { it.packageName }) { app ->
                    AppRow(app, isClone = app.packageName in clonePkgs) { vm.select(app) }
                }
            }
        }
    }
}

@Composable
private fun AppRow(app: AppEntry, isClone: Boolean, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AppIcon(app.packageName, 48.dp)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    app.label, fontWeight = FontWeight.SemiBold,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Text(
                    app.packageName, style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Tag(app.versionName?.let { "v$it" } ?: "v${app.versionCode}")
                    Tag(CloneEngine.human(app.sizeBytes))
                    if (app.splitCount > 0) Tag("split ×${app.splitCount + 1}", MaterialTheme.colorScheme.secondary)
                    if (isClone) Tag("КЛОН", MaterialTheme.colorScheme.tertiary)
                    if (app.isSystem) Tag("система", MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun Tag(text: String, color: Color = MaterialTheme.colorScheme.primary) {
    Text(
        text,
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        color = color,
        maxLines = 1,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.14f))
            .padding(horizontal = 7.dp, vertical = 2.dp),
    )
}

@Composable
private fun ClonesTab(vm: MainViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()
    val ctx = LocalContext.current
    if (state.clones.isEmpty()) {
        EmptyState(
            "Клонов пока нет",
            "Выберите приложение на вкладке «Приложения» и создайте его копию — она появится здесь",
        )
        return
    }
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(state.clones.sortedByDescending { it.createdAt }, key = { it.packageName }) { c ->
            CloneCard(
                c,
                originalLabel = vm.appByPackage(c.originalPackage)?.label ?: c.originalPackage,
                onOpen = { launchApp(ctx, c.packageName) },
                onSettings = {
                    ctx.startActivity(
                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${c.packageName}"))
                    )
                },
                onDelete = {
                    ctx.startActivity(Intent(Intent.ACTION_DELETE, Uri.parse("package:${c.packageName}")))
                },
                onReclone = { vm.appByPackage(c.originalPackage)?.let { vm.select(it) } },
            )
        }
    }
}

@Composable
private fun CloneCard(
    c: CloneRecord,
    originalLabel: String,
    onOpen: () -> Unit,
    onSettings: () -> Unit,
    onDelete: () -> Unit,
    onReclone: () -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        shape = RoundedCornerShape(24.dp),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box {
                    AppIcon(c.packageName, 52.dp)
                    Box(
                        Modifier
                            .align(Alignment.BottomEnd)
                            .size(18.dp)
                            .clip(CircleShape)
                            .background(BrandGradient),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Rounded.ContentCopy, null, tint = Color.White, modifier = Modifier.size(11.dp))
                    }
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(c.label, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(
                        c.packageName, style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        "Копия «$originalLabel» · " +
                                DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(c.createdAt)),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.clickable(onClick = onReclone),
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilledTonalButton(onClick = onOpen, modifier = Modifier.weight(1f)) {
                    Icon(Icons.AutoMirrored.Rounded.OpenInNew, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Открыть")
                }
                OutlinedButton(onClick = onSettings) { Icon(Icons.Rounded.Settings, "Настройки") }
                OutlinedButton(onClick = onDelete) {
                    Icon(Icons.Rounded.Delete, "Удалить", tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun EmptyState(title: String, text: String, icon: ImageVector = Icons.Rounded.Layers) {
    Column(
        Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            Modifier
                .size(88.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(BrandGradient),
            contentAlignment = Alignment.Center,
        ) { Icon(icon, null, tint = Color.White, modifier = Modifier.size(40.dp)) }
        Spacer(Modifier.height(20.dp))
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(
            text, style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
        )
    }
}

@Composable
private fun InfoDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = { TextButton(onClick = onDismiss) { Text("Понятно") } },
        icon = { Icon(Icons.Rounded.Info, null) },
        title = { Text("Как это работает") },
        text = {
            Text(
                "Клонер берёт APK выбранного приложения (включая split-части), меняет имя пакета " +
                        "в манифесте, переименовывает провайдеры и собственные разрешения, " +
                        "подписывает своим ключом и ставит как отдельное приложение со своими данными.\n\n" +
                        "Ограничения:\n" +
                        "• Приложения с проверкой подписи (банки, некоторые игры, защита от модификации) могут не запуститься.\n" +
                        "• Вход через Google, карты Google и Push (Firebase) в клоне обычно не работают — они привязаны к оригинальной подписи.\n" +
                        "• Системные приложения и приложения с защитой Play Integrity клонировать бесполезно.\n\n" +
                        "Используйте только для приложений, которыми вы законно пользуетесь.",
            )
        },
    )
}

fun launchApp(ctx: Context, pkg: String) {
    val i = ctx.packageManager.getLaunchIntentForPackage(pkg)
    if (i == null) {
        Toast.makeText(ctx, "У приложения нет экрана запуска", Toast.LENGTH_SHORT).show()
    } else {
        runCatching { ctx.startActivity(i) }
            .onFailure { Toast.makeText(ctx, "Не удалось запустить: ${it.message}", Toast.LENGTH_LONG).show() }
    }
}
