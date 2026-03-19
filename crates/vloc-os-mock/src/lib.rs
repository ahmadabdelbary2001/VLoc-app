use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Runtime,
};

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "com.vloc.app";

#[derive(Debug, Serialize, Deserialize)]
pub struct MockConfig {
    pub enabled: bool,
}

#[cfg(target_os = "android")]
#[derive(Debug, Serialize, Deserialize)]
struct UpdateLocationArgs {
    lat: f32,
    lng: f32,
}

/// Public API to start OS-level mocking.
pub fn start_os_mock<R: Runtime>(_app: &AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        _app.plugin_manager()
            .get_mobile_plugin::<R>(PLUGIN_IDENTIFIER)
            .map_err(|e| e.to_string())?
            .run_mobile_plugin("startMock", ())
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        use windows::Devices::Geolocation::Provider::GeolocationProvider;
        let _ = GeolocationProvider::new().map_err(|e: windows::core::Error| {
            format!("Failed to access GeolocationProvider: {}", e)
        })?;
        println!("Windows Geolocation Provider initialized.");
    }
    #[cfg(not(any(target_os = "android", target_os = "windows")))]
    {
        println!("OS Mocking Started (Unsupported OS Placeholder)");
    }
    Ok(())
}

/// Public API to update OS-level mock location.
pub fn update_os_mock<R: Runtime>(_app: &AppHandle<R>, lat: f32, lng: f32) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        _app.plugin_manager()
            .get_mobile_plugin::<R>(PLUGIN_IDENTIFIER)
            .map_err(|e| e.to_string())?
            .run_mobile_plugin("updateLocation", UpdateLocationArgs { lat, lng })
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        use windows::Devices::Geolocation::Provider::GeolocationProvider;
        use windows::Devices::Geolocation::{BasicGeoposition, PositionSource};

        let provider = GeolocationProvider::new()
            .map_err(|e: windows::core::Error| format!("Failed to get provider: {}", e))?;

        let position = BasicGeoposition {
            Latitude: lat as f64,
            Longitude: lng as f64,
            Altitude: 0.0,
        };

        provider
            .SetOverridePosition(position, PositionSource::Unknown, 10.0)
            .map_err(|e: windows::core::Error| format!("Windows Mocking failed: {}", e))?;
    }
    #[cfg(not(any(target_os = "android", target_os = "windows")))]
    {
        println!(
            "OS Mocking Updated: {}, {} (Unsupported OS Placeholder)",
            lat, lng
        );
    }
    Ok(())
}

/// Public API to stop OS-level mocking.
pub fn stop_os_mock<R: Runtime>(_app: &AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Manager;
        _app.plugin_manager()
            .get_mobile_plugin::<R>(PLUGIN_IDENTIFIER)
            .map_err(|e| e.to_string())?
            .run_mobile_plugin("stopMock", ())
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        use windows::Devices::Geolocation::Provider::GeolocationProvider;
        let provider = GeolocationProvider::new()
            .map_err(|e: windows::core::Error| format!("Failed to get provider: {}", e))?;
        provider
            .ClearOverridePosition()
            .map_err(|e: windows::core::Error| e.to_string())?;
        println!("Windows Geolocation Override Cleared.");
    }
    #[cfg(not(any(target_os = "android", target_os = "windows")))]
    {
        println!("OS Mocking Stopped (Unsupported OS Placeholder)");
    }
    Ok(())
}

#[tauri::command]
fn start_mock<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    start_os_mock(&app)
}

#[tauri::command]
fn update_mock_location<R: Runtime>(app: AppHandle<R>, lat: f32, lng: f32) -> Result<(), String> {
    update_os_mock(&app, lat, lng)
}

#[tauri::command]
fn stop_mock<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    stop_os_mock(&app)
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("vloc-os-mock")
        .invoke_handler(tauri::generate_handler![
            start_mock,
            update_mock_location,
            stop_mock
        ])
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                // Register the mobile plugin
                let _ = _api.register_android_plugin(PLUGIN_IDENTIFIER, "MockLocationPlugin");
            }
            Ok(())
        })
        .build()
}
