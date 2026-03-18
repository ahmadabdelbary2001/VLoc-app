plugins {
    id("com.android.library")
    kotlin("android")
}

android {
    namespace = "com.vloc.app"
    compileSdk = 35

    defaultConfig {
        minSdk = 24
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("app.tauri:tauri-android:2.10.3")
    implementation(kotlin("stdlib"))
}
