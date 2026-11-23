package com.khranitoniks.guard.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ---------- фирменные цвета v1.2 ----------
val Violet = Color(0xFF6C5CE7)
val VioletDeep = Color(0xFF4834D4)
val VioletLight = Color(0xFFA29BFE)
val Sky = Color(0xFF00B8D4)
val Mint = Color(0xFF00C853)
val Sun = Color(0xFFFFB300)
val Coral = Color(0xFFFF6B6B)
val Pink = Color(0xFFEC407A)
val Night = Color(0xFF283593)
val Danger = Color(0xFFE53935)
val Good = Color(0xFF2E7D32)

// совместимость со старыми экранами
val Indigo = Violet
val IndigoLight = VioletLight
val Teal = Sky
val Amber = Sun

/** Градиенты карточек. */
object Grad {
    val hero = Brush.linearGradient(listOf(Color(0xFF6C5CE7), Color(0xFF00B8D4)))
    val code = Brush.linearGradient(listOf(Color(0xFFFF9F1C), Color(0xFFFF4D8D)))
    val good = Brush.linearGradient(listOf(Color(0xFF00C853), Color(0xFF00B8D4)))
    val warn = Brush.linearGradient(listOf(Color(0xFFFF8A65), Color(0xFFFF4081)))
    val night = Brush.linearGradient(listOf(Color(0xFF283593), Color(0xFF6A1B9A)))
    val school = Brush.linearGradient(listOf(Color(0xFF00897B), Color(0xFF3949AB)))
    val gold = Brush.linearGradient(listOf(Color(0xFFFFC107), Color(0xFFFF6F00)))
    val bar = Brush.horizontalGradient(listOf(Color(0xFF6C5CE7), Color(0xFF8E7CFF), Color(0xFF00B8D4)))
}

private val LightColors = lightColorScheme(
    primary = Violet,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE6E2FF),
    onPrimaryContainer = Color(0xFF1E1065),
    secondary = Sky,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD3F5FB),
    onSecondaryContainer = Color(0xFF003640),
    tertiary = Sun,
    onTertiary = Color(0xFF3E2A00),
    tertiaryContainer = Color(0xFFFFEBC2),
    onTertiaryContainer = Color(0xFF3E2A00),
    background = Color(0xFFF6F5FF),
    onBackground = Color(0xFF1B1B24),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF1B1B24),
    surfaceVariant = Color(0xFFECEAF8),
    onSurfaceVariant = Color(0xFF5C5A70),
    outline = Color(0xFFC9C6DD),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002)
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFB4ABFF),
    onPrimary = Color(0xFF24158A),
    primaryContainer = Color(0xFF3B2DA8),
    onPrimaryContainer = Color(0xFFE6E2FF),
    secondary = Color(0xFF5CE1F5),
    onSecondary = Color(0xFF003640),
    secondaryContainer = Color(0xFF004E5C),
    onSecondaryContainer = Color(0xFFD3F5FB),
    tertiary = Color(0xFFFFCA5C),
    onTertiary = Color(0xFF3E2A00),
    tertiaryContainer = Color(0xFF5A3F00),
    onTertiaryContainer = Color(0xFFFFEBC2),
    background = Color(0xFF0F0E17),
    onBackground = Color(0xFFE7E5F5),
    surface = Color(0xFF1A1926),
    onSurface = Color(0xFFE7E5F5),
    surfaceVariant = Color(0xFF292838),
    onSurfaceVariant = Color(0xFFC3C0D8),
    outline = Color(0xFF4A4860)
)

private val KhShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

private val Base = Typography()
private val KhType = Base.copy(
    headlineLarge = Base.headlineLarge.copy(fontWeight = FontWeight.ExtraBold),
    headlineMedium = Base.headlineMedium.copy(fontWeight = FontWeight.ExtraBold),
    headlineSmall = Base.headlineSmall.copy(fontWeight = FontWeight.Bold),
    titleLarge = Base.titleLarge.copy(fontWeight = FontWeight.Bold),
    titleMedium = Base.titleMedium.copy(fontWeight = FontWeight.Bold),
    labelLarge = TextStyle(fontSize = 15.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 0.2.sp)
)

@Composable
fun KhTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        shapes = KhShapes,
        typography = KhType,
        content = content
    )
}
