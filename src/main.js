import { ProResIndex, QualityThreshold, VcodecMapping, ErrorCode } from "./assets/mappings.js"
const { open: openDialog } = window.__TAURI__.dialog;
const { invoke } = window.__TAURI__.core;


/** @type {HTMLInputElement} */ let inputPath;
/** @type {HTMLInputElement} */ let outputPath;

/** @type {HTMLSelectElement} */ let vcodec;
/** @type {HTMLInputElement} */ let crfSlider;
/** @type {HTMLLabelElement} */ let crfLabel;
/** @type {HTMLSelectElement} */ let prores;
/** @type {HTMLSelectElement} */ let acodec;
/** @type {HTMLSelectElement} */ let bitrate;
/** @type {HTMLInputElement} */ let flac;
/** @type {HTMLLabelElement} */ let flacLabel;

/** @type {HTMLButtonElement} */ let runButton;

/** @type {HTMLImageElement} */ let settingsButton;
/** @type {HTMLDivElement} */ let settingsPanel;
/** @type {HTMLInputElement} */ let batchToggle;

/** @type {boolean} */ let batch = false;

async function preload() {
  /** @type {boolean} */
  const hasFFmpeg = await invoke("has_ffmpeg");
  if (hasFFmpeg) return;

  const warning = document.getElementById("warning");
  warning.removeAttribute("hidden");
  warning.onclick = () => window.open("https://ffmpeg.org/download.html", "_blank");

  runButton.disabled = true;
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
  acodec = document.getElementById("acodec");
  bitrate = document.getElementById("bitrate");
  flac = document.getElementById("flac");
  flacLabel = flac.parentElement.querySelector("label");

  runButton = document.getElementById("run");
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

async function gatherParams() {

  const input = inputPath.value;
  const output = outputPath.value;

  if (batch) {
    const files = await invoke("list_files", { input: input });
    console.log(files);
    return;
  }

  const cv = VcodecMapping[vcodec.value];
  const vparam = (cv === "prores") ?
    ["-profile:v", ProResIndex.indexOf(prores.value)] : ["-crf", crfSlider.value];

  const ca = acodec.value;
  const aparam = (ca === "flac") ?
    ["-compression_level", flac.value] : ["-b:a", bitrate.value];

  const status = await invoke("run_ffmpeg", {
    input: input,
    output: output,
    args: [
      "-c:v", cv,
      ...vparam,
      "-c:a", ca,
      ...aparam,
    ]
  });

  console.log(ErrorCode[status]);
}

window.addEventListener("DOMContentLoaded", () => {
  init();
  preload();

  settingsButton.onclick = () => settingsPanel.classList.toggle("enable");
  batchToggle.onchange = () => {
    batch = batchToggle.checked;
    inputPath.value = "";
    outputPath.value = "";
  }

  vcodec.onchange = () => {
    if (vcodec.value === "ProRes") {
      crfSlider.parentElement.classList.add("hidden");
      prores.parentElement.classList.remove("hidden");
    } else {
      crfSlider.parentElement.classList.remove("hidden");
      prores.parentElement.classList.add("hidden");
    }
  }

  acodec.onchange = () => {
    if (acodec.value === "flac") {
      bitrate.parentElement.classList.add("hidden");
      flac.parentElement.classList.remove("hidden");
    }
    else {
      bitrate.parentElement.classList.remove("hidden");
      flac.parentElement.classList.add("hidden");
    }
  }

  crfSlider.oninput = () => { crfLabel.innerHTML = qualityLabel(crfSlider.value); }
  flac.oninput = () => { flacLabel.innerHTML = `Compression<br>${flac.value}`; }

  inputPath.addEventListener("dblclick", async () => {
    const path = await openDialog({ directory: batch, multiple: false });
    if (path) {
      inputPath.value = path;
      if (batch) outputPath.value = path;
    }
  });

  outputPath.addEventListener("dblclick", async () => {
    const path = await openDialog({ directory: batch, multiple: false });
    if (path) outputPath.value = path;
  });

  runButton.onclick = (e) => {
    e.preventDefault();
    gatherParams();
    return false;
  }
});
