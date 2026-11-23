package com.khranitoniks.guard.ui.guide

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.khranitoniks.guard.R

private data class Step(val image: Int, val title: Int, val text: Int)

private val STEPS = listOf(
    Step(R.drawable.guide_1, R.string.guide_s1, R.string.guide_s1_t),
    Step(R.drawable.guide_2, R.string.guide_s2, R.string.guide_s2_t),
    Step(R.drawable.guide_3, R.string.guide_s3, R.string.guide_s3_t),
    Step(R.drawable.guide_4, R.string.guide_s4, R.string.guide_s4_t),
    Step(R.drawable.guide_5, R.string.guide_s5, R.string.guide_s5_t),
    Step(R.drawable.guide_6, R.string.guide_s6, R.string.guide_s6_t)
)

private val FAQ = listOf(
    R.string.faq_q1 to R.string.faq_a1,
    R.string.faq_q2 to R.string.faq_a2,
    R.string.faq_q3 to R.string.faq_a3,
    R.string.faq_q4 to R.string.faq_a4,
    R.string.faq_q5 to R.string.faq_a5,
    R.string.faq_q6 to R.string.faq_a6
)

/** Инструкция для родителя: 6 шагов с картинками и частые вопросы. */
@Composable
fun GuideScreen() {
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Image(
                painterResource(R.drawable.scene_guide),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1200f / 640f)
                    .clip(RoundedCornerShape(28.dp))
            )
        }
        item { Text(stringResource(R.string.guide_intro), style = MaterialTheme.typography.bodyMedium) }
        itemsIndexed(STEPS) { _, s ->
            Card(shape = RoundedCornerShape(26.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column {
                    Image(
                        painterResource(s.image),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxWidth().aspectRatio(1000f / 560f)
                    )
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(stringResource(s.title), style = MaterialTheme.typography.titleMedium)
                        Text(stringResource(s.text), style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
        item { Text(stringResource(R.string.faq_title), style = MaterialTheme.typography.titleLarge) }
        itemsIndexed(FAQ) { _, qa -> FaqItem(qa.first, qa.second) }
    }
}

@Composable
private fun FaqItem(q: Int, a: Int) {
    var open by remember { mutableStateOf(false) }
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            Modifier
                .clickable { open = !open }
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(q), fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                Icon(if (open) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown, contentDescription = null)
            }
            AnimatedVisibility(open) {
                Text(stringResource(a), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 8.dp))
            }
        }
    }
}
