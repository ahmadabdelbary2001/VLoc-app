mod commands;
use commands::AppState;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let simulator_state = Arc::new(Mutex::new(None));
    let simulator_clone = Arc::clone(&simulator_state);

    tauri::Builder::default()
        .manage(AppState {
            simulator: simulator_state,
        })
        .plugin(tauri_plugin_vloc_os_mock::init())
        .invoke_handler(tauri::generate_handler![
            commands::start_route,
            commands::stop_route,
            commands::get_current_state
        ])
        .setup(move |app| {
            let app_handle = app.handle().clone();
            // Background Simulation Loop (10Hz)
            tauri::async_runtime::spawn(async move {
                let mut last_tick = Instant::now();
                loop {
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    let now = Instant::now();
                    let delta = now.duration_since(last_tick).as_secs_f64();
                    last_tick = now;

                    let mut sim_lock = simulator_clone.lock().unwrap();
                    if let Some(sim) = sim_lock.as_mut() {
                        if let Some(coord) = sim.tick(delta) {
                            let state = sim.get_state();
                            // Update OS Mocking at 10Hz with advanced fields
                            let _ = tauri_plugin_vloc_os_mock::update_os_mock(
                                &app_handle,
                                coord.lat,
                                coord.lng,
                                state.current_speed_ms,
                                state.bearing,
                            );
                        }
                    }
                }
            });

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
