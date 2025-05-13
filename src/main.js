const { invoke } = window.__TAURI__.core;
const { open: openDialog } = window.__TAURI__.dialog;

/** @type {HTMLInputElement} */ let inputPath;
/** @type {HTMLInputElement} */ let outputPath;
/** @type {HTMLImageElement} */ let settings;

/** @type {boolean} */ let batch = true;

async function preload() {
  /** @type {boolean} */
  const hasFFmpeg = await invoke("has_ffmpeg");
  if (hasFFmpeg) return;

  const warning = document.getElementById("warning");
  warning.removeAttribute("hidden");
  warning.onclick = () => window.open("https://ffmpeg.org/download.html", "_blank");
}

function init() {
  inputPath = document.getElementById("input");
  outputPath = document.getElementById("output");
  settings = document.getElementById("settings");
}

window.addEventListener("DOMContentLoaded", () => {
  preload();
  init();

  inputPath.addEventListener("dblclick", async () => {
    const path = await openDialog({ directory: batch, multiple: false, defaultPath: "." });
    if (path) {
      inputPath.value = path;
      outputPath.value = path;
    }
  });

  outputPath.addEventListener("dblclick", async () => {
    const path = await openDialog({ directory: batch, multiple: false, defaultPath: "." });
    if (path) outputPath.value = path;
  });
});
