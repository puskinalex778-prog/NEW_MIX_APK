package com.khranitoniks.guard.ui.rewards

import androidx.compose.foundation.Image
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.Achievement
import com.khranitoniks.guard.core.Achievements
import com.khranitoniks.guard.core.Names
import com.khranitoniks.guard.core.StatsStore
import com.khranitoniks.guard.core.TimeUtil
import com.khranitoniks.guard.ui.common.GradientCard
import com.khranitoniks.guard.ui.theme.Grad
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Экран наград: медали за баланс, перерывы, зарядку и серию дней в рамках лимита. */
@Composable
fun RewardsScreen() {
    val ctx = LocalContext.current
    var list by remember { mutableStateOf<List<Achievement>?>(null) }
    var streak by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) {
        val res = withContext(Dispatchers.IO) {
            Pair(Achievements.load(ctx), Achievements.streak(StatsStore.allDays(ctx), TimeUtil.dayKey()))
        }
        list = res.first
        streak = res.second
    }
    val l = list
    if (l == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }
    val done = l.count { it.done }
    val name = Names.name(ctx)
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Image(
                painterResource(R.drawable.scene_rewards),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1200f / 640f)
                    .clip(RoundedCornerShape(28.dp))
            )
        }
        item {
            GradientCard(Grad.gold) {
                Text(
                    if (name.isNotEmpty()) stringResource(R.string.rewards_hello_named, name) else stringResource(R.string.rewards_hello),
                    color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold
                )
                Text(stringResource(R.string.rewards_count, done, l.size), color = Color.White)
                Text(stringResource(R.string.rewards_streak, streak), color = Color.White, fontWeight = FontWeight.Bold)
                LinearProgressIndicator(
                    progress = { done.toFloat() / l.size },
                    modifier = Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)),
                    color = Color.White,
                    trackColor = Color.White.copy(alpha = 0.3f)
                )
            }
        }
        items(l.chunked(2)) { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { a -> Medal(a, Modifier.weight(1f)) }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
        item {
            Text(
                stringResource(R.string.rewards_hint),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun Medal(a: Achievement, modifier: Modifier) {
    val gray = remember { ColorFilter.colorMatrix(ColorMatrix().apply { setToSaturation(0f) }) }
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (a.done) MaterialTheme.colorScheme.tertiaryContainer else MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Image(
                painterResource(a.image),
                contentDescription = null,
                colorFilter = if (a.done) null else gray,
                modifier = Modifier
                    .size(96.dp)
                    .alpha(if (a.done) 1f else 0.55f)
            )
            Text(stringResource(a.title), fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Text(
                stringResource(a.desc),
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (!a.done && a.goal > 1) {
                LinearProgressIndicator(
                    progress = { a.progress.toFloat() / a.goal },
                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp))
                )
                Text("${a.progress} / ${a.goal}", style = MaterialTheme.typography.labelSmall)
            }
            if (a.done) Text("✓", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        }
    }
}
