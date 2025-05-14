use std::fs;
use std::path::Path;
use std::process::Command;

mod func;

#[tauri::command]
fn has_ffmpeg() -> bool {
    let output = Command::new("ffmpeg").arg("-version").output();
    match output {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn list_files(input: String) -> Vec<String> {
    fs::read_dir(Path::new(&input))
        .map(|entries| {
            entries
                .filter_map(Result::ok)
                .filter(|entry| entry.path().is_file())
                .filter_map(|entry| entry.path().into_os_string().into_string().ok())
                .collect()
        })
        .unwrap_or_default()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            has_ffmpeg,
            list_files,
            func::run_ffmpeg
        ])
        .run(tauri::generate_context!())
        .expect("[Error] Failed to run Tauri application...");
}
