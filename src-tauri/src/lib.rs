use std::process::Command;

#[tauri::command]
fn has_ffmpeg() -> bool {
    let output = Command::new("ffmpeg").arg("-version").output();
    match output {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![has_ffmpeg])
        .run(tauri::generate_context!())
        .expect("[Error] Failed to run Tauri application...");
}
