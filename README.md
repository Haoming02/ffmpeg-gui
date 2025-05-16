<h1 align="center">FFmpeg GUI</h1>

<p align="center">
<sup><i>A wrapper for FFmpeg with a simple Graphical User Interface</i></sup>
<br>
<a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/rust-010101?logo=rust"></a> 
<img src="https://img.shields.io/badge/HTML-010101?logo=html5"> 
<img src="https://img.shields.io/badge/JavaScript-010101?logo=javascript"> 
<img src="https://img.shields.io/badge/CSS-010101?logo=css"> 
<a href="https://v2.tauri.app/"><img src="https://img.shields.io/badge/tauri-010101?logo=tauri"></a>
</p>

### Features

- Process a single File
- Batch Process an entire Folder
- Double click the textbox to open the file-picker dialog
- Select from a list of common `vcodec` and `acodec`
- Control `crf` and `b:a`
- Show a progress bar during the encoding
- Click the button to interrupt in the middle
- Lightweight
- Blazingly Fast :tm:

### Requirements

- [FFmpeg](https://www.ffmpeg.org/download.html)
    - Remember to include the executable in the system PATH

<details>
<summary>for Development</summary>

- [Rust](https://www.rust-lang.org/tools/install)
- [npm (Node.js)](https://nodejs.org/en/download)
- [VSCode](https://code.visualstudio.com/)

</details>

### How to Use

- Simply download the installer from [Releases](https://github.com/Haoming02/ffmpeg-gui/releases)

<br>

### Development

- Setup Project
```bash
git clone https://github.com/Haoming02/ffmpeg-gui
cd ffmpeg-gui
npm install
```

- Debug Build
```bash
npm run tauri dev
```

- Release Build
```bash
npm run tauri build
```
