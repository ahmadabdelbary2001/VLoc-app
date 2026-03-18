const COMMANDS: &[&str] = &["start_mock", "update_mock_location", "stop_mock"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
