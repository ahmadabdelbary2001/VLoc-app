use vloc_engine::models::{Route, SpoofingState};

/// Start moving along a route at the given speed (km/h)
#[tauri::command]
pub fn start_route(_route: Route, _speed_kmh: f32) -> Result<(), String> {
    // Simulator state management comes in Phase 5 (App State)
    Ok(())
}

/// Stop the active spoofing simulation
#[tauri::command]
pub fn stop_route() -> Result<(), String> {
    Ok(())
}

/// Return the current spoofing state
#[tauri::command]
pub fn get_current_state() -> Result<SpoofingState, String> {
    Ok(SpoofingState {
        is_active: false,
        current_location: None,
        current_speed_kmh: 0.0,
        remaining_distance_meters: None,
    })
}
