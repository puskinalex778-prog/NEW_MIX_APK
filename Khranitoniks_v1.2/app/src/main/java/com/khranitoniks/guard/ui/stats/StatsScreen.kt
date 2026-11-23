@file:OptIn(ExperimentalMaterial3Api::class)

package com.khranitoniks.guard.ui.stats

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.DayRecord
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.core.StatsStore
import com.khranitoniks.guard.core.TimeUtil
import com.khranitoniks.guard.core.TrackedApp
import com.khranitoniks.guard.core.TrackedApps
import com.khranitoniks.guard.core.UsageReader
import com.khranitoniks.guard.ui.common.AppIcon
import com.khranitoniks.guard.ui.common.SectionCard
import com.khranitoniks.guard.ui.common.fmt
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private data class StatsData(
    val days: List<Pair<Long, DayRecord>>,
    val tracked: List<TrackedApp>,
    val labels: Map<String, String>
)

private fun appMs(rec: DayRecord, app: TrackedApp): Long = app.packages.sumOf { rec.apps[it] ?: 0L }

@Composable
fun StatsScreen() {
    val ctx = LocalContext.current
    var data by remember { mutableStateOf<StatsData?>(null) }
    var selected by remember { mutableStateOf(6) }
    val showAll = remember { Prefs.get(ctx).showFullActivity }

    LaunchedEffect(Unit) {
        data = withContext(Dispatchers.IO) {
            val reader = UsageReader(ctx)
            val days = (-6..0).map { off ->
                val start = TimeUtil.startOfDayOffset(off)
                start to StatsStore.day(ctx, off, reader)
            }
            val labels = HashMap<String, String>()
            days.forEach { (_, r) -> r.apps.keys.forEach { pkg -> if (pkg !in labels) labels[pkg] = TrackedApps.label(ctx, pkg) } }
            StatsData(days, TrackedApps.load(ctx), labels)
        }
    }

    val d = data
    if (d == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }
    val (dayStart, rec) = d.days[selected.coerceIn(0, d.days.size - 1)]
    val entertainment = d.tracked.sumOf { appMs(rec, it) }
    val allApps = rec.apps.entries.filter { it.value >= 60_000L }.sortedByDescending { it.value }
    val maxApp = allApps.firstOrNull()?.value ?: 1L

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            SectionCard(stringResource(R.string.stats_week)) {
                WeekChart(d, selected) { selected = it }
                Legend(d.tracked)
                Text(stringResource(R.string.stats_tap_hint), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        item {
            SectionCard(TimeUtil.longDate(dayStart)) {
                Row {
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.stats_screen), style = MaterialTheme.typography.labelMedium)
                        Text(fmt(ctx, rec.screenMs), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    }
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.stats_fun), style = MaterialTheme.typography.labelMedium)
                        Text(fmt(ctx, entertainment), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    }
                }
                HorizontalDivider()
                d.tracked.forEach { app ->
                    val ms = appMs(rec, app)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(Color(app.color))
                        )
                        Spacer(Modifier.width(10.dp))
                        Text(app.name, Modifier.weight(1f))
                        Text(fmt(ctx, ms), fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
        if (showAll) {
            item {
                Text(stringResource(R.string.stats_all_activity), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            if (allApps.isEmpty()) {
                item { Text(stringResource(R.string.stats_no_data), color = MaterialTheme.colorScheme.onSurfaceVariant) }
            }
            items(allApps, key = { it.key }) { e ->
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    val label = d.labels[e.key] ?: e.key
                    AppIcon(e.key, label, 36.dp)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        LinearProgressIndicator(
                            progress = { (e.value.toFloat() / maxApp).coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp)
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                        )
                    }
                    Spacer(Modifier.width(12.dp))
                    Text(fmt(ctx, e.value), fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
private fun WeekChart(d: StatsData, selected: Int, onSelect: (Int) -> Unit) {
    val ctx = LocalContext.current
    val screenColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.22f)
    val selColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.10f)
    val maxMs = d.days.maxOfOrNull { (_, r) -> maxOf(r.screenMs, d.tracked.sumOf { appMs(r, it) }) }?.coerceAtLeast(30 * TimeUtil.MIN)
        ?: (30 * TimeUtil.MIN)
    Column {
        Text(
            stringResource(R.string.stats_max, fmt(ctx, maxMs)),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Canvas(
            Modifier
                .fillMaxWidth()
                .height(200.dp)
                .pointerInput(d) {
                    detectTapGestures { offset ->
                        val idx = (offset.x / (size.width / 7f)).toInt().coerceIn(0, 6)
                        onSelect(idx)
                    }
                }
        ) {
            val slot = size.width / 7f
            val barW = slot * 0.56f
            val h = size.height
            // сетка
            for (i in 1..3) {
                val y = h - h * i / 4f
                drawLine(Color.Gray.copy(alpha = 0.2f), Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
            }
            d.days.forEachIndexed { i, (_, r) ->
                val x = slot * i + (slot - barW) / 2f
                if (i == selected) {
                    drawRoundRect(selColor, Offset(slot * i + 2f, 0f), Size(slot - 4f, h), CornerRadius(16f, 16f))
                }
                val sh = (r.screenMs.toFloat() / maxMs) * h
                drawRoundRect(screenColor, Offset(x, h - sh), Size(barW, sh), CornerRadius(10f, 10f))
                var y = h
                d.tracked.forEach { app ->
                    val ms = appMs(r, app)
                    if (ms > 0) {
                        val bh = (ms.toFloat() / maxMs) * h
                        drawRect(Color(app.color), Offset(x + barW * 0.15f, y - bh), Size(barW * 0.7f, bh))
                        y -= bh
                    }
                }
            }
        }
        Row(Modifier.fillMaxWidth()) {
            d.days.forEachIndexed { i, (start, _) ->
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        TimeUtil.weekday(start),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = if (i == selected) FontWeight.Bold else FontWeight.Normal,
                        color = if (i == selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                        textAlign = TextAlign.Center
                    )
                    Text(TimeUtil.shortDate(start), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

@Composable
private fun Legend(tracked: List<TrackedApp>) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(12.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.22f))
            )
            Spacer(Modifier.width(6.dp))
            Text(stringResource(R.string.stats_legend_screen), style = MaterialTheme.typography.labelSmall)
        }
        tracked.chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { app ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier
                                .size(12.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(Color(app.color))
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(app.name, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}
