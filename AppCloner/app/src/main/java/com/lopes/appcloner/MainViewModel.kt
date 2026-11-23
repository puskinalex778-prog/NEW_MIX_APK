package com.lopes.appcloner

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.lopes.appcloner.core.CloneEngine
import com.lopes.appcloner.core.CloneOptions
import com.lopes.appcloner.data.AppEntry
import com.lopes.appcloner.data.AppRepository
import com.lopes.appcloner.data.CloneRecord
import com.lopes.appcloner.data.ClonesStore
import com.lopes.appcloner.data.IconCache
import com.lopes.appcloner.data.PermItem
import com.lopes.appcloner.install.InstallEvent
import com.lopes.appcloner.install.InstallEvents
import com.lopes.appcloner.install.Installer
import com.lopes.appcloner.install.SigningKeys
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

enum class SortMode(val title: String) { NAME("Имя"), SIZE("Размер"), RECENT("Новые") }

enum class CloneMode { INSTALL, EXPORT }

enum class Phase { WORKING, INSTALLING, CONFIRM, SUCCESS, EXPORT_READY, EXPORTED, ERROR }

data class CloneJob(
    val app: AppEntry,
    val newPackage: String,
    val newLabel: String,
    val mode: CloneMode,
    val phase: Phase = Phase.WORKING,
    val step: String = "Подготовка…",
    val progress: Float = 0f,
    val log: List<String> = emptyList(),
    val message: String? = null,
    val files: List<File> = emptyList(),
)

data class UiState(
    val loading: Boolean = true,
    val apps: List<AppEntry> = emptyList(),
    val query: String = "",
    val showSystem: Boolean = false,
    val sort: SortMode = SortMode.NAME,
    val clones: List<CloneRecord> = emptyList(),
) {
    val clonePackages: Set<String> get() = clones.mapTo(HashSet()) { it.packageName }

    val visibleApps: List<AppEntry>
        get() {
            val q = query.trim().lowercase()
            return apps.asSequence()
                .filter { showSystem || !it.isSystem }
                .filter {
                    q.isEmpty() || it.label.lowercase().contains(q) ||
                            it.packageName.lowercase().contains(q)
                }
                .let { seq ->
                    when (sort) {
                        SortMode.NAME -> seq.sortedBy { it.label.lowercase() }
                        SortMode.SIZE -> seq.sortedByDescending { it.sizeBytes }
                        SortMode.RECENT -> seq.sortedByDescending { it.lastUpdate }
                    }
                }
                .toList()
        }
}

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val ctx get() = getApplication<Application>()
    private val store = ClonesStore(app)

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state

    private val _job = MutableStateFlow<CloneJob?>(null)
    val job: StateFlow<CloneJob?> = _job

    private val _selected = MutableStateFlow<AppEntry?>(null)
    val selected: StateFlow<AppEntry?> = _selected

    private var engine: CloneEngine? = null
    private var worker: Job? = null

    init {
        refresh()
        viewModelScope.launch(Dispatchers.IO) { cleanupOldWork() }
        viewModelScope.launch {
            InstallEvents.events.collect { e -> onInstallEvent(e) }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            val (apps, clones) = withContext(Dispatchers.IO) {
                val apps = AppRepository.loadApps(ctx)
                val installed = apps.mapTo(HashSet()) { it.packageName }
                // в списке клонов — только реально установленные
                store.all().filter { it.packageName !in installed }.forEach { store.remove(it.packageName) }
                apps to store.all()
            }
            _state.update { it.copy(loading = false, apps = apps, clones = clones) }
        }
    }

    fun setQuery(q: String) = _state.update { it.copy(query = q) }
    fun toggleSystem() = _state.update { it.copy(showSystem = !it.showSystem) }
    fun setSort(s: SortMode) = _state.update { it.copy(sort = s) }

    fun select(app: AppEntry?) {
        _selected.value = app
        if (app == null && _job.value?.phase.let { it != Phase.WORKING && it != Phase.INSTALLING }) {
            _job.value = null
        }
    }

    fun appByPackage(pkg: String): AppEntry? = _state.value.apps.firstOrNull { it.packageName == pkg }

    suspend fun permissions(pkg: String): List<PermItem> =
        withContext(Dispatchers.IO) { AppRepository.requestedPermissions(ctx, pkg) }

    /** Свободное имя пакета вида original.clone1, original.clone2 … */
    fun suggestPackage(app: AppEntry): String {
        val taken = _state.value.apps.mapTo(HashSet()) { it.packageName } + _state.value.clonePackages
        val base = app.packageName.replace(Regex("\\.clone\\d+$"), "")
        for (n in 1..999) {
            val candidate = "$base.clone$n"
            if (candidate !in taken) return candidate
        }
        return "$base.clone${System.currentTimeMillis() % 100000}"
    }

    fun suggestLabel(app: AppEntry, pkg: String): String {
        val n = Regex("clone(\\d+)$").find(pkg)?.groupValues?.get(1)?.toIntOrNull()
        return if (n != null) "${app.label} ${n + 1}" else "${app.label} (клон)"
    }

    fun isInstalled(pkg: String) = _state.value.apps.any { it.packageName == pkg }

    fun startClone(app: AppEntry, options: CloneOptions, mode: CloneMode) {
        if (worker?.isActive == true) return
        val e = CloneEngine().also { engine = it }
        _job.value = CloneJob(app, options.newPackage, options.newLabel ?: app.label, mode)
        worker = viewModelScope.launch(Dispatchers.IO) {
            val work = File(ctx.cacheDir, "clones/${System.currentTimeMillis()}")
            try {
                val key = SigningKeys.get(ctx)
                val inputs = app.apkPaths.map { File(it) }
                addLog("Исходных APK: ${inputs.size} (${CloneEngine.human(app.sizeBytes)})")
                val out = e.run(inputs, work, options, key, object : CloneEngine.Listener {
                    override fun onProgress(step: String, progress: Float) {
                        _job.update { it?.copy(step = step, progress = progress * 0.9f) }
                    }

                    override fun onLog(line: String) = addLog(line)
                })
                when (mode) {
                    CloneMode.EXPORT -> _job.update {
                        it?.copy(
                            phase = Phase.EXPORT_READY, step = "Готово к сохранению",
                            progress = 1f, files = out.apks,
                        )
                    }

                    CloneMode.INSTALL -> {
                        _job.update {
                            it?.copy(phase = Phase.INSTALLING, step = "Установка…", progress = 0.95f, files = out.apks)
                        }
                        Installer.install(ctx, out.apks, options.newPackage)
                    }
                }
            } catch (ie: InterruptedException) {
                work.deleteRecursively()
                _job.update { it?.copy(phase = Phase.ERROR, step = "Отменено", message = "Операция отменена") }
            } catch (t: Throwable) {
                work.deleteRecursively()
                addLog("ОШИБКА: ${t.javaClass.simpleName}: ${t.message}")
                _job.update {
                    it?.copy(
                        phase = Phase.ERROR, step = "Ошибка",
                        message = t.message ?: t.javaClass.simpleName,
                    )
                }
            }
        }
    }

    fun cancel() {
        engine?.cancel()
    }

    fun dismissJob() {
        val j = _job.value ?: return
        if (j.phase == Phase.WORKING || j.phase == Phase.INSTALLING) return
        j.files.firstOrNull()?.parentFile?.deleteRecursively()
        _job.value = null
    }

    /** Сохраняет готовый клон: один APK — как .apk, несколько — архивом .apks (SAI / Split APKs Installer). */
    fun exportTo(uri: Uri) {
        val j = _job.value ?: return
        viewModelScope.launch(Dispatchers.IO) {
            try {
                ctx.contentResolver.openOutputStream(uri)?.use { os ->
                    if (j.files.size == 1) {
                        j.files[0].inputStream().use { it.copyTo(os, 1 shl 20) }
                    } else {
                        ZipOutputStream(os).use { zos ->
                            j.files.forEach { f ->
                                zos.putNextEntry(ZipEntry(f.name))
                                f.inputStream().use { it.copyTo(zos, 1 shl 20) }
                                zos.closeEntry()
                            }
                        }
                    }
                } ?: error("Не удалось открыть файл для записи")
                addLog("Сохранено: $uri")
                _job.update { it?.copy(phase = Phase.EXPORTED, step = "Файл сохранён", message = null) }
            } catch (t: Throwable) {
                _job.update { it?.copy(phase = Phase.ERROR, message = "Не удалось сохранить: ${t.message}") }
            }
        }
    }

    fun uninstallDone(pkg: String) {
        store.remove(pkg)
        IconCache.invalidate(pkg)
        refresh()
    }

    private fun onInstallEvent(e: InstallEvent) {
        val j = _job.value ?: return
        if (e.packageName != j.newPackage) return
        when (e) {
            is InstallEvent.NeedsConfirmation -> _job.update {
                it?.copy(phase = Phase.CONFIRM, step = "Подтвердите установку в системном окне")
            }

            is InstallEvent.Finished -> {
                addLog(e.message)
                if (e.success) {
                    store.add(
                        CloneRecord(j.newPackage, j.app.packageName, j.newLabel, System.currentTimeMillis())
                    )
                    IconCache.invalidate(j.newPackage)
                    j.files.firstOrNull()?.parentFile?.deleteRecursively()
                    _job.update {
                        it?.copy(phase = Phase.SUCCESS, step = "Клон установлен", progress = 1f, message = null, files = emptyList())
                    }
                    refresh()
                } else {
                    _job.update { it?.copy(phase = Phase.ERROR, step = "Не установлено", message = e.message) }
                }
            }
        }
    }

    private fun addLog(line: String) {
        _job.update { it?.copy(log = it.log + line) }
    }

    private fun cleanupOldWork() {
        val dir = File(ctx.cacheDir, "clones")
        val dayAgo = System.currentTimeMillis() - 24L * 3600 * 1000
        dir.listFiles()?.filter { it.lastModified() < dayAgo }?.forEach { it.deleteRecursively() }
    }
}
