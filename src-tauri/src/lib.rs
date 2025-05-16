use std::fs;
use std::path::{Path, MAIN_SEPARATOR};
use std::process::Command;

mod func;
mod state;

#[tauri::command]
fn get_separator() -> char {
    MAIN_SEPARATOR
}

#[tauri::command]
fn has_ffmpeg() -> bool {
    let mut command = Command::new("ffmpeg");
    command = state::hide_terminal(command);
    let output = command.arg("-version").output();

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
        .manage(state::ProcessHandle::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_separator,
            has_ffmpeg,
            list_files,
            func::run_ffmpeg,
            state::interrupt_ffmpeg
        ])
        .run(tauri::generate_context!())
        .expect("[Error] Failed to run Tauri application...");
}
