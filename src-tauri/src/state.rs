use std::io::Write;
use std::process::{ChildStdin, Command};
use std::sync::{Arc, Mutex};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[derive(Default)]
pub struct ProcessHandle(pub Arc<Mutex<Option<ChildStdin>>>);

#[tauri::command]
pub fn interrupt_ffmpeg(state: tauri::State<'_, ProcessHandle>) -> bool {
    let mut ffmpeg_stdin = state.0.lock().unwrap();

    if let Some(stdin) = ffmpeg_stdin.as_mut() {
        if let Ok(_) = stdin.write_all(b"q\n") {
            if let Ok(_) = stdin.flush() {
                let _ = ffmpeg_stdin.take();
                return true;
            }
        }
    }

    let _ = ffmpeg_stdin.take();
    false
}

pub fn hide_terminal(mut command: Command) -> Command {
    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    command
}
