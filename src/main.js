const { invoke } = window.__TAURI__.core;
const { open: openDialog } = window.__TAURI__.dialog;

/** @type {HTMLInputElement} */ let inputPath;
/** @type {HTMLInputElement} */ let outputPath;
/** @type {HTMLImageElement} */ let settingsButton;
/** @type {HTMLDivElement} */ let settingsPanel;
/** @type {HTMLInputElement} */ let batchToggle;

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
  settingsButton = document.getElementById("settings");
  settingsPanel = document.getElementById("settings-panel");
  batchToggle = document.getElementById("batch");
}

window.addEventListener("DOMContentLoaded", () => {
  preload();
  init();

  settingsButton.onclick = () => settingsPanel.classList.toggle("enable");
  batchToggle.onchange = () => { batch = batchToggle.checked; }

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
