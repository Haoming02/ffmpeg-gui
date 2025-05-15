use std::io::{BufRead, BufReader, Error};
use std::path::Path;
use std::process::{Command, ExitStatus, Stdio};

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

fn run_single(input: &String, output: &String, args: &Vec<String>) -> Result<ExitStatus, Error> {
    let mut command = Command::new("ffmpeg");
    command.arg("-hide_banner").arg("-nostdin");

    command.arg("-i").arg(&input);
    for arg in args {
        command.arg(arg);
    }
    command.arg(&output);

    command.arg("-progress").arg("pipe:2");
    command.stderr(Stdio::piped());

    let mut child = command.spawn()?;
    let stderr = child.stderr.take().unwrap();
    let reader = BufReader::new(stderr);

    let mut total: f32 = -1.0;

    for line_result in reader.lines() {
        if let Ok(line) = line_result {
            if total < 0.0 && line.trim().starts_with("Duration:") {
                let temp = line
                    .split("Duration:")
                    .last()
                    .unwrap()
                    .split(", start")
                    .next()
                    .unwrap()
                    .trim();
                total = parse_seconds(&temp);
                println!("Duration: {}", total);
            } else if line.contains("out_time=") {
                let temp = line.split("out_time=").last().unwrap().trim();
                let current = parse_seconds(&temp);
                println!("Progress: {}%", current * 100.0 / total);
            }
        }
    }

    let status = child.wait()?;
    Ok(status)
}

#[tauri::command]
pub fn run_ffmpeg(input: String, output: String, args: Vec<String>) -> char {
    let input_path = Path::new(&input);
    let output_path = Path::new(&output);

    if !input_path.is_file() {
        return 'i'; // input does not exist
    }
    if output_path.exists() {
        return 'o'; // output already exists
    }

    match run_single(&input, &output, &args) {
        Ok(status) => {
            if status.success() {
                return 's'; // success
            } else {
                return 'e'; // error
            }
        }
        Err(_) => {
            return 'f'; // fail
        }
    }
}
