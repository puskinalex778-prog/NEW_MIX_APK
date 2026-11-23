package com.lopes.appcloner.ui

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import com.lopes.appcloner.data.IconCache
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

val Violet = Color(0xFF6C4DFF)
val Cyan = Color(0xFF00C2FF)
val Mint = Color(0xFF2EE6A6)
val Coral = Color(0xFFFF5C7A)

val BrandGradient = Brush.linearGradient(listOf(Violet, Cyan))

private val DarkColors = darkColorScheme(
    primary = Color(0xFF9F8CFF),
    onPrimary = Color(0xFF1A0B66),
    primaryContainer = Color(0xFF3A2A99),
    onPrimaryContainer = Color(0xFFE6E0FF),
    secondary = Cyan,
    tertiary = Mint,
    background = Color(0xFF0F1020),
    surface = Color(0xFF0F1020),
    surfaceContainer = Color(0xFF181A30),
    surfaceContainerHigh = Color(0xFF20223B),
    surfaceContainerHighest = Color(0xFF292B47),
    surfaceContainerLow = Color(0xFF141529),
    error = Coral,
)

private val LightColors = lightColorScheme(
    primary = Violet,
    secondary = Color(0xFF0091C2),
    tertiary = Color(0xFF0E9C6E),
    error = Color(0xFFD93A57),
)

@Composable
fun AppClonerTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    val ctx = LocalContext.current
    val colors = when {
        Build.VERSION.SDK_INT >= 31 && dark -> dynamicDarkColorScheme(ctx)
        Build.VERSION.SDK_INT >= 31 -> dynamicLightColorScheme(ctx)
        dark -> DarkColors
        else -> LightColors
    }
    MaterialTheme(
        colorScheme = colors,
        shapes = Shapes(
            small = RoundedCornerShape(12.dp),
            medium = RoundedCornerShape(20.dp),
            large = RoundedCornerShape(28.dp),
        ),
        content = content,
    )
}

/** Иконка приложения с асинхронной загрузкой и кэшем. */
@Composable
fun AppIcon(packageName: String, size: Dp, modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val bmp by produceState(initialValue = IconCache.peek(packageName), packageName) {
        value = withContext(Dispatchers.IO) { IconCache.get(ctx, packageName) }
    }
    val shape = RoundedCornerShape(size * 0.28f)
    if (bmp != null) {
        Image(
            bitmap = bmp!!,
            contentDescription = null,
            filterQuality = FilterQuality.Medium,
            modifier = modifier.size(size).clip(shape),
        )
    } else {
        Box(
            modifier
                .size(size)
                .clip(shape)
                .background(MaterialTheme.colorScheme.surfaceContainerHighest)
        )
    }
}
