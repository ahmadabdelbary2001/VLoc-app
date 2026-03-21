use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime,
};

#[cfg(target_os = "android")]
use jni::{
    objects::{JObject, JValue},
    JNIEnv, JavaVM,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct MockConfig {
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct UpdateLocationArgs {
    pub lat: f64,
    pub lng: f64,
    pub speed: f32,
    pub bearing: f32,
}

#[cfg(target_os = "windows")]
pub struct WindowsMockState {
    pub provider:
        std::sync::Mutex<Option<windows::Devices::Geolocation::Provider::GeolocationProvider>>,
}

#[cfg(target_os = "android")]
fn get_env(jvm: &JavaVM) -> Result<JNIEnv, String> {
    jvm.attach_current_thread_as_daemon()
        .map_err(|e| format!("Failed to attach thread: {}", e))
}

#[cfg(target_os = "android")]
fn get_context<'a>(env: &mut JNIEnv<'a>) -> Result<JObject<'a>, String> {
    let context_ptr = ndk_context::android_context().context();
    if context_ptr.is_null() {
        return Err("Android context is null".to_string());
    }
    unsafe { Ok(JObject::from_raw(context_ptr as jni::sys::jobject)) }
}

/// Public API to start OS-level mocking.
pub fn start_os_mock<R: Runtime>(_app: &AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let jvm = unsafe {
            JavaVM::from_raw(ndk_context::android_context().vm() as *mut jni::sys::JavaVM)
        }
        .map_err(|e| e.to_string())?;
        let mut env = get_env(&jvm)?;
        let context = get_context(&mut env)?;

        // Get LocationManager
        let lm_service_name = env.new_string("location").map_err(|e| e.to_string())?;
        let lm = env
            .call_method(
                &context,
                "getSystemService",
                "(Ljava/lang/String;)Ljava/lang/Object;",
                &[JValue::Object(lm_service_name.as_ref())],
            )
            .map_err(|e| e.to_string())?
            .l()
            .map_err(|e| e.to_string())?;

        if lm.is_null() {
            return Err("Failed to get LocationManager".to_string());
        }

        let provider_name = env.new_string("gps").map_err(|e| e.to_string())?;

        // Try remove first
        let _ = env.call_method(
            &lm,
            "removeTestProvider",
            "(Ljava/lang/String;)V",
            &[JValue::Object(provider_name.as_ref())],
        );

        // addTestProvider
        env.call_method(
            &lm,
            "addTestProvider",
            "(Ljava/lang/String;ZZZZZZZII)V",
            &[
                JValue::Object(provider_name.as_ref()),
                JValue::Bool(0), // requiresNetwork
                JValue::Bool(0), // requiresSatellite
                JValue::Bool(0), // requiresCell
                JValue::Bool(0), // hasMonetaryCost
                JValue::Bool(1), // supportsAltitude
                JValue::Bool(1), // supportsSpeed
                JValue::Bool(1), // supportsBearing
                JValue::Int(1),  // powerRequirement
                JValue::Int(1),  // accuracy
            ],
        )
        .map_err(|e| format!("addTestProvider failed: {}", e))?;

        env.call_method(
            &lm,
            "setTestProviderEnabled",
            "(Ljava/lang/String;Z)V",
            &[JValue::Object(provider_name.as_ref()), JValue::Bool(1)],
        )
        .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        use windows::Devices::Geolocation::Provider::GeolocationProvider;
        let state = _app.state::<WindowsMockState>();
        let mut provider_guard = state.provider.lock().map_err(|e| e.to_string())?;

        if provider_guard.is_none() {
            let provider = GeolocationProvider::new().map_err(|e: windows::core::Error| {
                format!("Failed to access GeolocationProvider: {}. Ensure Location is enabled in Windows Privacy Settings.", e)
            })?;
            *provider_guard = Some(provider);
        }
    }
    Ok(())
}

/// Public API to update OS-level mock location.
pub fn update_os_mock<R: Runtime>(
    _app: &AppHandle<R>,
    lat: f64,
    lng: f64,
    _speed: f32,
    _bearing: f32,
) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let speed = _speed;
        let bearing = _bearing;
        let jvm = unsafe {
            JavaVM::from_raw(ndk_context::android_context().vm() as *mut jni::sys::JavaVM)
        }
        .map_err(|e| e.to_string())?;
        let mut env = get_env(&jvm)?;
        let context = get_context(&mut env)?;

        let lm_service_name = env.new_string("location").map_err(|e| e.to_string())?;
        let lm = env
            .call_method(
                &context,
                "getSystemService",
                "(Ljava/lang/String;)Ljava/lang/Object;",
                &[JValue::Object(lm_service_name.as_ref())],
            )
            .map_err(|e| e.to_string())?
            .l()
            .map_err(|e| e.to_string())?;

        let provider_name = env.new_string("gps").map_err(|e| e.to_string())?;

        let location_class = env
            .find_class("android/location/Location")
            .map_err(|e| e.to_string())?;
        let location = env
            .new_object(
                &location_class,
                "(Ljava/lang/String;)V",
                &[JValue::Object(provider_name.as_ref())],
            )
            .map_err(|e| e.to_string())?;

        env.call_method(&location, "setLatitude", "(D)V", &[JValue::Double(lat)])
            .map_err(|e| e.to_string())?;
        env.call_method(&location, "setLongitude", "(D)V", &[JValue::Double(lng)])
            .map_err(|e| e.to_string())?;
        env.call_method(&location, "setAltitude", "(D)V", &[JValue::Double(0.0)])
            .map_err(|e| e.to_string())?;

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
        env.call_method(&location, "setTime", "(J)V", &[JValue::Long(now)])
            .map_err(|e| e.to_string())?;
        env.call_method(&location, "setAccuracy", "(F)V", &[JValue::Float(1.0)])
            .map_err(|e| e.to_string())?;
        env.call_method(&location, "setSpeed", "(F)V", &[JValue::Float(speed)])
            .map_err(|e| e.to_string())?;
        env.call_method(&location, "setBearing", "(F)V", &[JValue::Float(bearing)])
            .map_err(|e| e.to_string())?;

        let system_clock_class = env
            .find_class("android/os/SystemClock")
            .map_err(|e| e.to_string())?;
        let elapsed_nanos = env
            .call_static_method(&system_clock_class, "elapsedRealtimeNanos", "()J", &[])
            .map_err(|e| e.to_string())?
            .j()
            .map_err(|e| e.to_string())?;
        env.call_method(
            &location,
            "setElapsedRealtimeNanos",
            "(J)V",
            &[JValue::Long(elapsed_nanos)],
        )
        .map_err(|e| e.to_string())?;

        env.call_method(
            &lm,
            "setTestProviderLocation",
            "(Ljava/lang/String;Landroid/location/Location;)V",
            &[
                JValue::Object(provider_name.as_ref()),
                JValue::Object(&location),
            ],
        )
        .map_err(|e| format!("setTestProviderLocation failed: {}", e))?;
    }
    #[cfg(target_os = "windows")]
    {
        use windows::Devices::Geolocation::{BasicGeoposition, PositionSource};
        let state = _app.state::<WindowsMockState>();
        let provider_guard = state.provider.lock().map_err(|e| e.to_string())?;

        if let Some(provider) = provider_guard.as_ref() {
            let position = BasicGeoposition {
                Latitude: lat,
                Longitude: lng,
                Altitude: 0.0,
            };
            provider
                .SetOverridePosition(position, PositionSource::Unknown, 10.0)
                .map_err(|e| format!("Windows Mocking failed: {}", e))?;
        }
    }
    Ok(())
}

/// Public API to stop OS-level mocking.
pub fn stop_os_mock<R: Runtime>(_app: &AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let jvm = unsafe {
            JavaVM::from_raw(ndk_context::android_context().vm() as *mut jni::sys::JavaVM)
        }
        .map_err(|e| e.to_string())?;
        let mut env = get_env(&jvm)?;
        let context = get_context(&mut env)?;

        let lm_service_name = env.new_string("location").map_err(|e| e.to_string())?;
        let lm = env
            .call_method(
                &context,
                "getSystemService",
                "(Ljava/lang/String;)Ljava/lang/Object;",
                &[JValue::Object(lm_service_name.as_ref())],
            )
            .map_err(|e| e.to_string())?
            .l()
            .map_err(|e| e.to_string())?;

        let provider_name = env.new_string("gps").map_err(|e| e.to_string())?;
        let _ = env.call_method(
            &lm,
            "setTestProviderEnabled",
            "(Ljava/lang/String;Z)V",
            &[JValue::Object(provider_name.as_ref()), JValue::Bool(0)],
        );
        let _ = env.call_method(
            &lm,
            "removeTestProvider",
            "(Ljava/lang/String;)V",
            &[JValue::Object(provider_name.as_ref())],
        );
    }
    #[cfg(target_os = "windows")]
    {
        let state = _app.state::<WindowsMockState>();
        let mut provider_guard = state.provider.lock().map_err(|e| e.to_string())?;
        if let Some(provider) = provider_guard.as_ref() {
            let _ = provider.ClearOverridePosition();
        }
        *provider_guard = None;
    }
    Ok(())
}

#[tauri::command]
fn start_mock<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    start_os_mock(&app)
}

#[tauri::command]
fn update_mock_location<R: Runtime>(
    app: AppHandle<R>,
    lat: f64,
    lng: f64,
    speed: f32,
    bearing: f32,
) -> Result<(), String> {
    update_os_mock(&app, lat, lng, speed, bearing)
}

#[tauri::command]
fn stop_mock<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    stop_os_mock(&app)
}

#[tauri::command]
fn is_mock_setting_enabled<R: Runtime>(_app: AppHandle<R>) -> Result<bool, String> {
    #[cfg(target_os = "android")]
    {
        let jvm = unsafe {
            JavaVM::from_raw(ndk_context::android_context().vm() as *mut jni::sys::JavaVM)
        }
        .map_err(|e| e.to_string())?;
        let mut env = get_env(&jvm)?;
        let context = get_context(&mut env)?;
        let content_resolver = env
            .call_method(
                &context,
                "getContentResolver",
                "()Landroid/content/ContentResolver;",
                &[],
            )
            .map_err(|e| e.to_string())?
            .l()
            .map_err(|e| e.to_string())?;
        let settings_secure = env
            .find_class("android/provider/Settings$Secure")
            .map_err(|e| e.to_string())?;
        let allow_mock_location = env
            .new_string("allow_mock_location")
            .map_err(|e| e.to_string())?;
        let result = env
            .call_static_method(
                &settings_secure,
                "getInt",
                "(Landroid/content/ContentResolver;Ljava/lang/String;I)I",
                &[
                    JValue::Object(content_resolver.as_ref()),
                    JValue::Object(allow_mock_location.as_ref()),
                    JValue::Int(0),
                ],
            )
            .map_err(|e| e.to_string())?
            .i()
            .map_err(|e| e.to_string())?;
        Ok(result != 0)
    }
    #[cfg(target_os = "windows")]
    {
        use windows::Devices::Geolocation::Provider::GeolocationProvider;
        use windows::Devices::Geolocation::{GeolocationAccessStatus, Geolocator};

        // 1. Force Register Application with Windows Location Service
        // This causes the app to appear in the "Let desktop apps access your location" list.
        let _ = Geolocator::new().and_then(|g| g.GetGeopositionAsync());

        // 2. Probe: Try to create a provider session.
        if GeolocationProvider::new().is_ok() {
            return Ok(true);
        }

        // 3. Fallback: Check specific access status
        let status = Geolocator::RequestAccessAsync()
            .map_err(|e| e.to_string())?
            .get()
            .map_err(|e| e.to_string())?;

        Ok(status == GeolocationAccessStatus::Allowed)
    }
    #[cfg(not(any(target_os = "android", target_os = "windows")))]
    {
        Ok(true)
    }
}

#[tauri::command]
fn open_location_settings<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Foundation::Uri;
        use windows::System::Launcher;
        let uri = Uri::CreateUri(&windows::core::HSTRING::from(
            "ms-settings:privacy-location",
        ))
        .map_err(|e| e.to_string())?;
        let _ = Launcher::LaunchUriAsync(&uri)
            .map_err(|e| e.to_string())?
            .get()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(())
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("vloc-os-mock")
        .invoke_handler(tauri::generate_handler![
            start_mock,
            update_mock_location,
            stop_mock,
            is_mock_setting_enabled,
            open_location_settings
        ])
        .setup(|_app, _api| {
            #[cfg(target_os = "windows")]
            {
                _app.manage(WindowsMockState {
                    provider: std::sync::Mutex::new(None),
                });
            }
            Ok(())
        })
        .build()
}
