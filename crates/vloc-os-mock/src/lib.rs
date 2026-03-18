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

#[derive(Debug, Serialize, Deserialize)]
struct UpdateLocationArgs {
    lat: f32,
    lng: f32,
}

#[tauri::command]
fn start_mock<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        app.plugin_manager()
            .get_mobile_plugin::<R>(PLUGIN_IDENTIFIER)
            .map_err(|e| e.to_string())?
            .run_mobile_plugin("startMock", ())
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "android"))]
    {
        println!("OS Mocking Started (Desktop Placeholder)");
    }
    Ok(())
}

#[tauri::command]
fn update_mock_location<R: Runtime>(app: AppHandle<R>, lat: f32, lng: f32) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        app.plugin_manager()
            .get_mobile_plugin::<R>(PLUGIN_IDENTIFIER)
            .map_err(|e| e.to_string())?
            .run_mobile_plugin("updateLocation", UpdateLocationArgs { lat, lng })
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "android"))]
    {
        println!("OS Mocking Updated: {}, {} (Desktop Placeholder)", lat, lng);
    }
    Ok(())
}

#[tauri::command]
fn stop_mock<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        app.plugin_manager()
            .get_mobile_plugin::<R>(PLUGIN_IDENTIFIER)
            .map_err(|e| e.to_string())?
            .run_mobile_plugin("stopMock", ())
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "android"))]
    {
        println!("OS Mocking Stopped (Desktop Placeholder)");
    }
    Ok(())
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("vloc-os-mock")
        .invoke_handler(tauri::generate_handler![
            start_mock,
            update_mock_location,
            stop_mock
        ])
        .setup(|app, api| {
            #[cfg(target_os = "android")]
            {
                // Register the mobile plugin
                let _ = api.register_android_plugin(PLUGIN_IDENTIFIER, "MockLocationPlugin");
            }
            Ok(())
        })
        .build()
}
