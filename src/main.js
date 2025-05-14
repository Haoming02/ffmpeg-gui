const { invoke } = window.__TAURI__.core;
const { open: openDialog } = window.__TAURI__.dialog;


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


/** @type {Array<[number, string]>} */
const QualityThreshold = [
  [0, "Lossless"],
  [9, "Extreme"],
  [18, "High"],
  [27, "Normal"],
  [36, "Low"],
  [54, "Worst"]
];

/** @type {Map<string, string>} */
const VcodecMapping = {
  "H.264": "h264",
  "H.264 (GPU)": "h264_nvenc",
  "HEVC": "hevc",
  "HEVC (GPU)": "hevc_nvenc",
  "AV1": "av1",
  "AV1 (GPU)": "av1_nvenc",
  "VP9": "vp9",
  "ProRes": "prores"
};

/** @type {string[]} */
const ProResIndex = ["Proxy", "LT", "SQ", "HQ"];


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

function gatherParams() {

  const input = inputPath.value;
  const output = outputPath.value;

  const cv = VcodecMapping[vcodec.value];
  const vparam = (cv === "prores") ?
    `-profile:v ${ProResIndex.indexOf(prores.value)}` : `-crf ${crfSlider.value}`;

  const ca = acodec.value;
  const aparam = (ca === "flac") ?
    `-compression_level ${flac.value}` : `-b:a ${bitrate.value}`;

  console.log(`ffmpeg -i ${input} -c:v ${cv} ${vparam} -c:a ${ca} ${aparam} ${output}`);
}

window.addEventListener("DOMContentLoaded", () => {
  preload();
  init();

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
