import { ProResIndex, QualityThreshold, VcodecMapping, ErrorCode } from "./assets/mappings.js"
import { Components } from "./assets/components.js"

const { open: openDialog } = window.__TAURI__.dialog;
const { event: tauriEvent } = window.__TAURI__;
const { invoke } = window.__TAURI__.core;

/** @type {boolean} */ let batch = false;
/** @type {string} */ let sep;

async function hookProgress() {
  await tauriEvent.listen('FFMPEG_PROGRESS', (e) => {
    Components.progressBar.style.width = `${e.payload}%`;
  });
}

async function hookStatus() {
  await tauriEvent.listen('FFMPEG_STATUS', (e) => {
    console.log(ErrorCode[e.payload]);

    Components.runButton.classList.remove("hidden");
    Components.stopButton.classList.add("hidden");
    Components.progressBar.style.width = "100%";
  });
}

async function preload() {
  sep = await invoke("get_separator");
  hookProgress();
  hookStatus();

  /** @type {boolean} */
  const hasFFmpeg = await invoke("has_ffmpeg");
  if (hasFFmpeg) return;

  const warning = document.getElementById("warning");
  warning.removeAttribute("hidden");
  warning.onclick = () => window.open("https://ffmpeg.org/download.html", "_blank");

  Components.runButton.disabled = true;
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

/** @param {string} path @returns {string} */
function basename(path) {
  const chunks = path.split(sep);
  return chunks[chunks.length - 1];
}

async function gatherParams() {
  /** @type {string[]} */ let inputFiles;
  /** @type {string[]} */ let outputFiles;

  const input = Components.inputPath.value;
  const output = Components.outputPath.value;

  if (!batch) {
    inputFiles = [input];
    outputFiles = [output];
  }
  else {
    inputFiles = await invoke("list_files", { input: input });
    outputFiles = inputFiles.map(file => [output, basename(file)].join(sep));
  }

  const cv = VcodecMapping[Components.vcodec.value];
  const vparam = (cv === "prores") ?
    ["-profile:v", ProResIndex.indexOf(Components.prores.value)] : ["-crf", Components.crfSlider.value];

  const ca = Components.acodec.value;
  const aparam = (ca === "flac") ?
    ["-compression_level", Components.flac.value] : ["-b:a", Components.bitrate.value];

  const pairs = inputFiles.map((f, i) => [f, outputFiles[i]]);
  for (const [input, output] of pairs) {
    Components.progressBar.style.width = "0%";

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

    if (status === "s") {
      Components.runButton.classList.add("hidden");
      Components.stopButton.classList.remove("hidden");
    } else console.log(ErrorCode[status]);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  Components.init();
  preload();

  Components.settingsButton.onclick = () => Components.settingsPanel.classList.toggle("enable");
  Components.batchToggle.onchange = () => {
    batch = Components.batchToggle.checked;
    Components.inputPath.value = "";
    Components.outputPath.value = "";
  }

  Components.vcodec.onchange = () => {
    if (Components.vcodec.value === "ProRes") {
      Components.crfSlider.parentElement.classList.add("hidden");
      Components.prores.parentElement.classList.remove("hidden");
    } else {
      Components.crfSlider.parentElement.classList.remove("hidden");
      Components.prores.parentElement.classList.add("hidden");
    }
  }

  Components.acodec.onchange = () => {
    if (Components.acodec.value === "flac") {
      Components.bitrate.parentElement.classList.add("hidden");
      Components.flac.parentElement.classList.remove("hidden");
    }
    else {
      Components.bitrate.parentElement.classList.remove("hidden");
      Components.flac.parentElement.classList.add("hidden");
    }
  }

  Components.crfSlider.oninput = () => { Components.crfLabel.innerHTML = qualityLabel(Components.crfSlider.value); }
  Components.flac.oninput = () => { Components.flacLabel.innerHTML = `Compression<br>${flac.value}`; }

  Components.inputPath.addEventListener("dblclick", async () => {
    const path = await openDialog({ directory: batch, multiple: false });
    if (path) {
      Components.inputPath.value = path;
      if (batch) Components.outputPath.value = path;
    }
  });

  Components.outputPath.addEventListener("dblclick", async () => {
    const path = await openDialog({ directory: batch, multiple: false });
    if (path) Components.outputPath.value = path;
  });

  Components.runButton.onclick = (e) => {
    e.preventDefault();
    gatherParams();
    return false;
  }

  Components.stopButton.onclick = async (e) => {
    e.preventDefault();
    await invoke("interrupt_ffmpeg");
    return false;
  }
});
