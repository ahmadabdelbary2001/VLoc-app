use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MockConfig {
    pub enabled: bool,
}

#[tauri::command]
fn start_mock<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<(), String> {
    println!("OS Mocking Started (Placeholder)");
    Ok(())
}

#[tauri::command]
fn stop_mock<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<(), String> {
    println!("OS Mocking Stopped (Placeholder)");
    Ok(())
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("vloc-os-mock")
        .invoke_handler(tauri::generate_handler![start_mock, stop_mock])
        .build()
}
