use std::io::Error;
use std::path::Path;
use std::process::{Command, ExitStatus};

fn run_single(input: &String, output: &String, args: &Vec<String>) -> Result<ExitStatus, Error> {
    let mut command = Command::new("ffmpeg");
    command.arg("-hide_banner").arg("-nostdin");

    command.arg("-i").arg(&input);
    for arg in args {
        command.arg(arg);
    }
    command.arg(&output);

    let status = command.status()?;
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
