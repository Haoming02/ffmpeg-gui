const { invoke } = window.__TAURI__.core;
const { open: openDialog } = window.__TAURI__.dialog;

/** @type {HTMLInputElement} */ let inputPath;
/** @type {HTMLInputElement} */ let outputPath;
/** @type {HTMLImageElement} */ let settingsButton;
/** @type {HTMLDivElement} */ let settingsPanel;
/** @type {HTMLInputElement} */ let batchToggle;

/** @type {HTMLSelectElement} */ let vcodec;
/** @type {HTMLInputElement} */ let crfSlider;
/** @type {HTMLLabelElement} */ let crfLabel;
/** @type {HTMLSelectElement} */ let prores;

/** @type {boolean} */ let batch = true;


/** @type {Array<[number, string]>} */
const QualityThreshold = [
  [0, "Lossless"],
  [9, "Extreme"],
  [18, "High"],
  [27, "Normal"],
  [36, "Low"],
  [54, "Worst"]
];

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

  vcodec = document.getElementById("vcodec");
  crfSlider = document.getElementById("crf");
  crfLabel = crfSlider.parentElement.querySelector("label");
  prores = document.getElementById("prores");
}

/** @param {number} crf @returns {string} */
function qualityLabel(crf) {
  let label;

  for (const [limit, name] of QualityThreshold) {
    if (crf > limit) continue;
    label = name;
    break;
  }

  return `Quality<br>${label} (${crf})`;
}

window.addEventListener("DOMContentLoaded", () => {
  preload();
  init();

  settingsButton.onclick = () => settingsPanel.classList.toggle("enable");
  batchToggle.onchange = () => { batch = batchToggle.checked; }

  vcodec.onchange = () => {
    if (vcodec.value === "ProRes") {
      crfSlider.parentElement.classList.add("hidden");
      prores.parentElement.classList.remove("hidden");
    } else {
      crfSlider.parentElement.classList.remove("hidden");
      prores.parentElement.classList.add("hidden");
    }
  }

  crfSlider.oninput = () => { crfLabel.innerHTML = qualityLabel(crfSlider.value); }

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
