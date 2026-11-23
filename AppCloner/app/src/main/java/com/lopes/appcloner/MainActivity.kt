package com.lopes.appcloner

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.lopes.appcloner.ui.AppClonerTheme
import com.lopes.appcloner.ui.CloneScreen
import com.lopes.appcloner.ui.HomeScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            AppClonerTheme {
                AppRoot()
            }
        }
    }
}

@Composable
private fun AppRoot(vm: MainViewModel = viewModel()) {
    val selected by vm.selected.collectAsStateWithLifecycle()

    // Обновляем список при возврате в приложение (после установки/удаления)
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { vm.refresh() }

    BackHandler(enabled = selected != null) { vm.select(null) }

    AnimatedContent(
        targetState = selected,
        transitionSpec = {
            if (targetState != null) {
                (slideInHorizontally { it / 3 } + fadeIn()) togetherWith fadeOut()
            } else {
                fadeIn() togetherWith (slideOutHorizontally { it / 3 } + fadeOut())
            }
        },
        contentKey = { it?.packageName },
        label = "root",
    ) { app ->
        if (app == null) {
            HomeScreen(vm)
        } else {
            CloneScreen(vm, app, onBack = { vm.select(null) })
        }
    }
}
