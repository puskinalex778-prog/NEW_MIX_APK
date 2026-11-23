package com.lopes.appcloner.install

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.content.pm.PackageManager
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Log
import androidx.core.content.IntentCompat
import com.lopes.appcloner.core.CloneEngine
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import java.io.File
import java.math.BigInteger
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.cert.X509Certificate
import java.util.Calendar
import javax.security.auth.x500.X500Principal

/**
 * Ключ, которым подписываются все клоны.
 * Один и тот же ключ на всё время жизни приложения — поэтому клон можно
 * пересоздать «поверх» (обновить), не удаляя его.
 */
object SigningKeys {
    private const val ASSET = "cloner_key.p12"
    private const val PASS = "cloner"
    private const val ALIAS = "cloner"
    private const val KS_ALIAS = "appcloner_signing"

    @Volatile
    private var cached: CloneEngine.SigningKey? = null

    @Synchronized
    fun get(ctx: Context): CloneEngine.SigningKey {
        cached?.let { return it }
        val key = runCatching { fromPkcs12(ctx) }
            .onFailure { Log.w("AppCloner", "PKCS12 key unavailable, using AndroidKeyStore", it) }
            .getOrNull() ?: fromAndroidKeyStore()
        cached = key
        return key
    }

    /** Ключ из assets копируется во внутреннюю память один раз и дальше не меняется. */
    private fun fromPkcs12(ctx: Context): CloneEngine.SigningKey {
        val file = File(ctx.filesDir, "signing.p12")
        if (!file.exists()) {
            ctx.assets.open(ASSET).use { input -> file.outputStream().use { input.copyTo(it) } }
        }
        val ks = KeyStore.getInstance("PKCS12")
        file.inputStream().use { ks.load(it, PASS.toCharArray()) }
        val alias = if (ks.containsAlias(ALIAS)) ALIAS else ks.aliases().nextElement()
        val pk = ks.getKey(alias, PASS.toCharArray()) as PrivateKey
        val cert = ks.getCertificate(alias) as X509Certificate
        return CloneEngine.SigningKey(pk, cert)
    }

    /** Запасной вариант: ключ генерируется в аппаратном хранилище устройства. */
    private fun fromAndroidKeyStore(): CloneEngine.SigningKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        if (!ks.containsAlias(KS_ALIAS)) {
            val end = Calendar.getInstance().apply { add(Calendar.YEAR, 50) }
            val spec = KeyGenParameterSpec.Builder(KS_ALIAS, KeyProperties.PURPOSE_SIGN)
                .setKeySize(2048)
                .setDigests(
                    KeyProperties.DIGEST_SHA1,
                    KeyProperties.DIGEST_SHA256,
                    KeyProperties.DIGEST_SHA512,
                )
                .setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PKCS1)
                .setCertificateSubject(X500Principal("CN=AppCloner"))
                .setCertificateSerialNumber(BigInteger.valueOf(System.currentTimeMillis()))
                .setCertificateNotAfter(end.time)
                .build()
            KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, "AndroidKeyStore").run {
                initialize(spec)
                generateKeyPair()
            }
        }
        val pk = ks.getKey(KS_ALIAS, null) as PrivateKey
        val cert = ks.getCertificate(KS_ALIAS) as X509Certificate
        return CloneEngine.SigningKey(pk, cert)
    }
}

sealed interface InstallEvent {
    val packageName: String

    data class NeedsConfirmation(override val packageName: String) : InstallEvent
    data class Finished(
        override val packageName: String,
        val success: Boolean,
        val message: String,
    ) : InstallEvent
}

object InstallEvents {
    private val _events = MutableSharedFlow<InstallEvent>(extraBufferCapacity = 16)
    val events: SharedFlow<InstallEvent> = _events

    fun emit(e: InstallEvent) {
        _events.tryEmit(e)
    }
}

object Installer {
    const val EXTRA_PKG = "com.lopes.appcloner.PKG"

    fun canInstall(ctx: Context): Boolean = ctx.packageManager.canRequestPackageInstalls()

    /** Ставит набор APK (base + split) одной сессией. Результат придёт в [InstallEvents]. */
    fun install(ctx: Context, apks: List<File>, packageName: String) {
        val installer = ctx.packageManager.packageInstaller
        val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
            setAppPackageName(packageName)
            setSize(apks.sumOf { it.length() })
            setInstallReason(PackageManager.INSTALL_REASON_USER)
            if (Build.VERSION.SDK_INT >= 31) {
                setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
            }
            if (Build.VERSION.SDK_INT >= 33) {
                setPackageSource(PackageInstaller.PACKAGE_SOURCE_LOCAL_FILE)
            }
        }
        val sessionId = installer.createSession(params)
        try {
            installer.openSession(sessionId).use { session ->
                apks.forEach { file ->
                    session.openWrite(file.name, 0, file.length()).use { out ->
                        file.inputStream().use { it.copyTo(out, 1 shl 20) }
                        session.fsync(out)
                    }
                }
                val intent = Intent(ctx, InstallResultReceiver::class.java)
                    .setPackage(ctx.packageName)
                    .putExtra(EXTRA_PKG, packageName)
                var flags = PendingIntent.FLAG_UPDATE_CURRENT
                if (Build.VERSION.SDK_INT >= 31) flags = flags or PendingIntent.FLAG_MUTABLE
                val pending = PendingIntent.getBroadcast(ctx, sessionId, intent, flags)
                session.commit(pending.intentSender)
            }
        } catch (t: Throwable) {
            runCatching { installer.abandonSession(sessionId) }
            throw t
        }
    }

    fun describe(status: Int, raw: String?): String {
        val base = when (status) {
            PackageInstaller.STATUS_SUCCESS -> "Установлено"
            PackageInstaller.STATUS_FAILURE_ABORTED -> "Установка отменена"
            PackageInstaller.STATUS_FAILURE_BLOCKED -> "Установка заблокирована системой или Play Защитой"
            PackageInstaller.STATUS_FAILURE_CONFLICT ->
                "Конфликт: такой пакет уже установлен с другой подписью или конфликтует с другим приложением. Удалите старый клон и повторите"
            PackageInstaller.STATUS_FAILURE_INCOMPATIBLE -> "Приложение несовместимо с этим устройством"
            PackageInstaller.STATUS_FAILURE_INVALID -> "Система отклонила APK (некорректный пакет)"
            PackageInstaller.STATUS_FAILURE_STORAGE -> "Недостаточно места"
            else -> "Ошибка установки"
        }
        return if (raw.isNullOrBlank() || status == PackageInstaller.STATUS_SUCCESS) base else "$base\n$raw"
    }
}

class InstallResultReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val pkg = intent.getStringExtra(Installer.EXTRA_PKG) ?: ""
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
        if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            val confirm = IntentCompat.getParcelableExtra(intent, Intent.EXTRA_INTENT, Intent::class.java)
            if (confirm != null) {
                confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                runCatching { context.startActivity(confirm) }
                    .onFailure {
                        InstallEvents.emit(
                            InstallEvent.Finished(pkg, false, "Не удалось открыть окно установки: ${it.message}")
                        )
                        return
                    }
            }
            InstallEvents.emit(InstallEvent.NeedsConfirmation(pkg))
            return
        }
        val msg = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)
        InstallEvents.emit(
            InstallEvent.Finished(pkg, status == PackageInstaller.STATUS_SUCCESS, Installer.describe(status, msg))
        )
    }
}
