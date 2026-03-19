use std::sync::{Arc, Mutex};
use tauri::State;
use vloc_engine::models::{Route, SpoofingState};
use vloc_engine::simulator::Simulator;

pub struct AppState {
    pub simulator: Arc<Mutex<Option<Simulator>>>,
}

/// Start moving along a route at the given speed (km/h)
#[tauri::command]
pub fn start_route(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    route: Route,
    speed_kmh: f32,
    inaccuracy_meters: f32,
) -> Result<(), String> {
    let mut sim_lock = state.simulator.lock().map_err(|_| "Failed to lock simulator")?;
    
    let mut sim = Simulator::new(route, speed_kmh, inaccuracy_meters).map_err(|e| e.to_string())?;
    sim.start();
    
    // Start OS Mocking
    tauri_plugin_vloc_os_mock::start_os_mock(&app)?;
    
    *sim_lock = Some(sim);
    Ok(())
}

/// Stop the active spoofing simulation
#[tauri::command]
pub fn stop_route(app: tauri::AppHandle, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut sim_lock = state.simulator.lock().map_err(|_| "Failed to lock simulator")?;
    if let Some(sim) = sim_lock.as_mut() {
        sim.stop();
        // Stop OS Mocking
        let _ = tauri_plugin_vloc_os_mock::stop_os_mock(&app);
    }
    Ok(())
}

/// Return the current spoofing state
#[tauri::command]
pub fn get_current_state(state: State<'_, AppState>) -> Result<SpoofingState, String> {
    let sim_lock = state.simulator.lock().map_err(|_| "Failed to lock simulator")?;
    
    if let Some(sim) = sim_lock.as_ref() {
        Ok(sim.get_state().clone())
    } else {
        Ok(SpoofingState::default())
    }
}
