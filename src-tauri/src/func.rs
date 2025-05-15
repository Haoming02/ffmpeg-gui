use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::{ChildStdin, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::Emitter;

use crate::state::ProcessHandle;

fn parse_seconds(timestamp: &str) -> f32 {
    let mut time: f32 = 0.0;

    let times: Vec<&str> = timestamp.split(':').collect();
    if times.len() != 3 {
        return time;
    }

    if let Ok(hour) = times[0].parse::<f32>() {
        time += hour * 60.0 * 60.0;
    }
    if let Ok(min) = times[1].parse::<f32>() {
        time += min * 60.0;
    }
    if let Ok(sec) = times[2].parse::<f32>() {
        time += sec;
    }

    time
}

fn run_single(
    app: &tauri::Window,
    handle: &Arc<Mutex<Option<ChildStdin>>>,
    input: &String,
    output: &String,
    args: &Vec<String>,
) {
    let mut command = Command::new("ffmpeg");
    command.arg("-hide_banner");
    command.arg("-hwaccel").arg("auto");

    command.arg("-i").arg(&input);
    for arg in args {
        command.arg(arg);
    }
    command.arg(&output);

    command.arg("-progress").arg("pipe:2");
    command.stderr(Stdio::piped());
    command.stdin(Stdio::piped());

    let spawn = command.spawn();
    let mut child = match spawn {
        Ok(cmd) => cmd,
        Err(_) => {
            _ = app.emit("FFMPEG_STATUS", 'f');
            return;
        }
    };

    let stdin = child.stdin.take().unwrap();
    *handle.lock().unwrap() = Some(stdin);

    let stderr = child.stderr.take().unwrap();
    let reader = BufReader::new(stderr);

    let mut total: f32 = -1.0;

    for line_result in reader.lines() {
        if let Ok(line) = line_result {
            if total < 0.0 {
                if line.trim().starts_with("Duration:") {
                    let temp = line
                        .split("Duration:")
                        .last()
                        .unwrap()
                        .split(", start")
                        .next()
                        .unwrap()
                        .trim();
                    total = parse_seconds(&temp);
                }
            } else {
                if line.contains("out_time=") {
                    let temp = line.split("out_time=").last().unwrap().trim();
                    let current = parse_seconds(&temp);
                    if current > 0.0 {
                        _ = app.emit("FFMPEG_PROGRESS", current * 100.0 / total);
                    }
                }
            }
        }
    }

    if let Ok(status) = child.wait() {
        if status.success() {
            _ = app.emit("FFMPEG_STATUS", 's');
        } else {
            _ = app.emit("FFMPEG_STATUS", 'e');
        }
    } else {
        _ = app.emit("FFMPEG_STATUS", 'f');
    }

    _ = handle.lock().unwrap().take();
}

#[tauri::command]
pub fn run_ffmpeg(
    app: tauri::Window,
    state: tauri::State<'_, ProcessHandle>,
    input: String,
    output: String,
    args: Vec<String>,
) -> char {
    let input_path = Path::new(&input);
    let output_path = Path::new(&output);

    if !input_path.is_file() {
        return 'i'; // input does not exist
    }
    if output_path.exists() {
        return 'o'; // output already exists
    }

    let handle = Arc::clone(&state.0);

    thread::spawn(move || {
        run_single(&app, &handle, &input, &output, &args);
    });

    's' // successfully started FFmpeg
}
