plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.lopes.appcloner"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.lopes.appcloner"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    // Свой ключ подписи самого Клонера (необязательно): задаётся секретами GitHub.
    // Без него релиз подписывается debug-ключом — APK всё равно ставится на телефон.
    val ksPath = System.getenv("KEYSTORE_FILE")
    val hasOwnKey = ksPath != null && file(ksPath).exists()
    signingConfigs {
        if (hasOwnKey) {
            create("own") {
                storeFile = file(ksPath!!)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName(if (hasOwnKey) "own" else "debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }
    packaging {
        resources {
            excludes += setOf(
                "META-INF/{AL2.0,LGPL2.1}",
                "META-INF/versions/9/OSGI-INF/MANIFEST.MF",
            )
        }
    }
}

// Ключ, которым Клонер подписывает клоны. Генерируется один раз при первой сборке.
val clonerKey = file("src/main/assets/cloner_key.p12")
val generateClonerKey by tasks.registering(Exec::class) {
    description = "Генерирует ключ подписи клонов"
    onlyIf { !clonerKey.exists() }
    doFirst { clonerKey.parentFile.mkdirs() }
    val ext = if (System.getProperty("os.name").lowercase().contains("win")) ".exe" else ""
    val keytool = File(System.getProperty("java.home"), "bin/keytool$ext").absolutePath
    commandLine(
        keytool, "-J-Dkeystore.pkcs12.legacy",
        "-genkeypair", "-storetype", "PKCS12",
        "-keystore", clonerKey.absolutePath,
        "-storepass", "cloner", "-keypass", "cloner",
        "-alias", "cloner", "-keyalg", "RSA", "-keysize", "2048",
        "-validity", "36500", "-dname", "CN=AppCloner, O=Lopes",
    )
}
tasks.named("preBuild") { dependsOn(generateClonerKey) }

dependencies {
    // ARSCLib (REAndroid) — чтение/запись бинарного AndroidManifest.xml, собран из тега V1.4.0
    implementation(files("libs/ARSCLib.jar"))
    // apksig (AOSP) — подпись APK схемами v1/v2/v3. Собран из исходников AOSP
    // с доработкой: встроенный zipalign (4 Б для ресурсов, 16 КБ для .so).
    implementation(files("libs/apksig.jar"))

    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
