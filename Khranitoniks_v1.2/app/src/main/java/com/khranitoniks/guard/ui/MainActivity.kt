@file:OptIn(ExperimentalMaterial3Api::class)

package com.khranitoniks.guard.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import com.khranitoniks.guard.R
import com.khranitoniks.guard.core.Names
import com.khranitoniks.guard.core.Prefs
import com.khranitoniks.guard.service.GuardService
import com.khranitoniks.guard.ui.apps.AppsScreen
import com.khranitoniks.guard.ui.common.GradientTopBar
import com.khranitoniks.guard.ui.common.PinDialog
import com.khranitoniks.guard.ui.guide.GuideScreen
import com.khranitoniks.guard.ui.home.HomeScreen
import com.khranitoniks.guard.ui.onboarding.OnboardingScreen
import com.khranitoniks.guard.ui.permissions.PermissionsScreen
import com.khranitoniks.guard.ui.rewards.RewardsScreen
import com.khranitoniks.guard.ui.settings.JournalScreen
import com.khranitoniks.guard.ui.settings.SettingsScreen
import com.khranitoniks.guard.ui.stats.StatsScreen
import com.khranitoniks.guard.ui.theme.KhTheme
import com.khranitoniks.guard.ui.tools.ToolsScreen

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(statusBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT))
        super.onCreate(savedInstanceState)
        Prefs.get(this).migrate()
        setContent {
            KhTheme { Root() }
        }
    }

    override fun onResume() {
        super.onResume()
        GuardService.start(this)
    }
}

/** Вложенные экраны. APPS, TOOLS и JOURNAL открываются только по PIN. */
enum class Sub { NONE, PERMISSIONS, TOOLS, JOURNAL, APPS, GUIDE }

@Composable
private fun Root() {
    val ctx = LocalContext.current
    var onboarded by remember { mutableStateOf(Prefs.get(ctx).onboardingDone) }
    if (!onboarded) {
        OnboardingScreen(onDone = {
            Prefs.get(ctx).onboardingDone = true
            GuardService.start(ctx)
            onboarded = true
        })
    } else {
        MainScaffold()
    }
}

private val PROTECTED = setOf(Sub.TOOLS, Sub.JOURNAL, Sub.APPS)

@Composable
private fun MainScaffold() {
    val ctx = LocalContext.current
    var tab by remember { mutableStateOf(0) }
    var sub by remember { mutableStateOf(Sub.NONE) }
    var unlocked by remember { mutableStateOf(false) }
    var askPin by remember { mutableStateOf(false) }
    var pendingSub by remember { mutableStateOf(Sub.NONE) }
    var pendingTab by remember { mutableStateOf(-1) }

    /** Открыть вложенный экран (защищённые — через PIN). */
    fun open(s: Sub) {
        if (s in PROTECTED && !unlocked) {
            pendingSub = s
            pendingTab = -1
            askPin = true
        } else sub = s
    }

    fun openTab(t: Int) {
        sub = Sub.NONE
        if (t == 3 && !unlocked) {
            pendingTab = 3
            pendingSub = Sub.NONE
            askPin = true
        } else {
            tab = t
            if (t != 3) unlocked = false
        }
    }

    BackHandler(enabled = sub != Sub.NONE || tab != 0) {
        if (sub != Sub.NONE) sub = Sub.NONE else {
            tab = 0
            unlocked = false
        }
    }

    val name = Names.name(ctx)
    val title = when (sub) {
        Sub.PERMISSIONS -> stringResource(R.string.perm_title)
        Sub.TOOLS -> stringResource(R.string.tools_title)
        Sub.JOURNAL -> stringResource(R.string.journal_title)
        Sub.APPS -> stringResource(R.string.apps_title)
        Sub.GUIDE -> stringResource(R.string.guide_title)
        Sub.NONE -> when (tab) {
            1 -> stringResource(R.string.nav_stats_long)
            2 -> stringResource(R.string.rewards_title)
            3 -> stringResource(R.string.nav_settings)
            else -> if (name.isNotEmpty()) stringResource(R.string.home_hello_named, name) else stringResource(R.string.app_name)
        }
    }
    val subtitle = if (sub == Sub.NONE && tab == 0) stringResource(R.string.home_subtitle) else null

    Scaffold(
        topBar = {
            GradientTopBar(
                title = title,
                subtitle = subtitle,
                onBack = if (sub != Sub.NONE) ({ sub = Sub.NONE }) else null
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                val colors = NavigationBarItemDefaults.colors(
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary
                )
                NavigationBarItem(
                    selected = tab == 0 && sub == Sub.NONE,
                    onClick = { openTab(0) },
                    icon = { Icon(Icons.Filled.Home, contentDescription = null) },
                    label = { Text(stringResource(R.string.nav_home)) },
                    colors = colors
                )
                NavigationBarItem(
                    selected = tab == 1 && sub == Sub.NONE,
                    onClick = { openTab(1) },
                    icon = { Icon(Icons.Filled.DateRange, contentDescription = null) },
                    label = { Text(stringResource(R.string.nav_stats)) },
                    colors = colors
                )
                NavigationBarItem(
                    selected = tab == 2 && sub == Sub.NONE,
                    onClick = { openTab(2) },
                    icon = { Icon(Icons.Filled.Star, contentDescription = null) },
                    label = { Text(stringResource(R.string.nav_rewards)) },
                    colors = colors
                )
                NavigationBarItem(
                    selected = tab == 3 && sub == Sub.NONE,
                    onClick = { openTab(3) },
                    icon = { Icon(if (unlocked) Icons.Filled.Settings else Icons.Filled.Lock, contentDescription = null) },
                    label = { Text(stringResource(R.string.nav_settings)) },
                    colors = colors
                )
            }
        }
    ) { padding ->
        Box(
            Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (sub) {
                Sub.PERMISSIONS -> PermissionsScreen()
                Sub.TOOLS -> ToolsScreen()
                Sub.JOURNAL -> JournalScreen()
                Sub.APPS -> AppsScreen()
                Sub.GUIDE -> GuideScreen()
                Sub.NONE -> when (tab) {
                    1 -> StatsScreen()
                    2 -> RewardsScreen()
                    3 -> SettingsScreen(
                        onOpen = { open(it) }
                    )
                    else -> HomeScreen(onOpen = { open(it) })
                }
            }
        }
    }

    if (askPin) {
        PinDialog(
            title = stringResource(R.string.pin_enter_title),
            onDismiss = { askPin = false },
            onSuccess = {
                askPin = false
                unlocked = true
                if (pendingTab >= 0) {
                    tab = pendingTab
                    sub = Sub.NONE
                } else if (pendingSub != Sub.NONE) {
                    sub = pendingSub
                }
                pendingTab = -1
                pendingSub = Sub.NONE
            }
        )
    }
}
