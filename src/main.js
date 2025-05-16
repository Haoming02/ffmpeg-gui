import { ProResIndex, nvEnc, QualityThreshold, VcodecMapping, AcodecMapping, ErrorCode } from "./assets/mappings.js";
import { Components } from "./assets/components.js";

const { open: openDialog, message: displayPopup } = window.__TAURI__.dialog;
const { event: tauriEvent } = window.__TAURI__;
const { invoke } = window.__TAURI__.core;

/** @type {boolean} */ let batch = false;
/** @type {string} */ let sep = "";

async function preload() {
  sep = await invoke("get_separator");

  /** @type {boolean} */
  const hasFFmpeg = await invoke("has_ffmpeg");
  if (hasFFmpeg) return;

  const warning = document.getElementById("warning");
  warning.removeAttribute("hidden");
  warning.onclick = () =>
    window.open("https://ffmpeg.org/download.html", "_blank");

  Components.runButton.disabled = true;
}

/** @param {number} crf @returns {string} */
function qualityLabel(crf) {
  for (const [limit, name] of QualityThreshold) {
    if (crf <= limit);
    return `Quality<br>${name} (${crf})`;
  }
}

/** @param {string} path @returns {string} */
function basename(path) {
  const chunks = path.split(sep);
  return chunks[chunks.length - 1];
}

async function gatherParams() {
  /** @type {string[]} */ let inputFiles = [];
  /** @type {string[]} */ let outputFiles = [];

  const input = Components.inputPath.value;
  const output = Components.outputPath.value;

  if (!batch) {
    inputFiles = [input];
    outputFiles = [output];
  } else {
    inputFiles = await invoke("list_files", { input: input });
    outputFiles = inputFiles.map((file) => [output, basename(file)].join(sep));
  }

  let cv = VcodecMapping[Components.vcodec.value];
  if (Components.gpuToggle.checked && nvEnc.includes(cv)) cv += "_nvenc";

  const vparam =
    cv === "prores"
      ? ["-profile:v", ProResIndex.indexOf(Components.prores.value)]
      : ["-crf", Components.crfSlider.value];

  const ca = AcodecMapping[Components.acodec.value];
  const aparam =
    ca === "flac"
      ? ["-compression_level", Components.flac.value]
      : ["-b:a", Components.bitrate.value];

  const params = ["-c:v", cv, ...vparam, "-c:a", ca, ...aparam];

  const pairs = inputFiles.map((f, i) => [f, outputFiles[i]]);
  for (const [input, output] of pairs) {
    Components.progressBar.style.width = "0%";

    const status = await invoke("run_ffmpeg", {
      input: input,
      output: output,
      args: params,
    });

    if (status === "s") {
      Components.runButton.classList.add("hidden");
      Components.stopButton.classList.remove("hidden");
      continue;
    }

    await displayPopup(ErrorCode[status], {
      title: "FFmpeg GUI",
      kind: "error",
    });
  }
}

async function tauriEventListeners() {
  await tauriEvent.listen("FFMPEG_PROGRESS", (e) => {
    Components.progressBar.style.width = `${e.payload}%`;
  });

  await tauriEvent.listen("FFMPEG_STATUS", async (e) => {
    if (e.payload !== "s")
      await displayPopup(ErrorCode[e.payload], {
        title: "FFmpeg GUI",
        kind: "error",
      });

    Components.runButton.classList.remove("hidden");
    Components.stopButton.classList.add("hidden");
    Components.progressBar.style.width = "100%";
  });
}

function htmlEventListeners() {
  Components.settingsButton.onclick = () =>
    Components.settingsPanel.classList.toggle("enable");

  Components.batchToggle.onchange = (e) => {
    batch = e.target.checked;
    Components.inputPath.value = "";
    Components.outputPath.value = "";

    const obj = batch ? "folder" : "file";
    Components.inputPath.setAttribute("placeholder", `Path to input ${obj}...`);
    Components.outputPath.setAttribute("placeholder", `Path to output ${obj}...`);
  };

  Components.vcodec.onchange = (e) => {
    if (e.target.value === "ProRes") {
      Components.crfSlider.parentElement.classList.add("hidden");
      Components.prores.parentElement.classList.remove("hidden");
    } else {
      Components.crfSlider.parentElement.classList.remove("hidden");
      Components.prores.parentElement.classList.add("hidden");
    }
  };

  Components.acodec.onchange = (e) => {
    if (e.target.value === "flac") {
      Components.bitrate.parentElement.classList.add("hidden");
      Components.flac.parentElement.classList.remove("hidden");
    } else {
      Components.bitrate.parentElement.classList.remove("hidden");
      Components.flac.parentElement.classList.add("hidden");
    }
  };

  Components.crfSlider.oninput = (e) => {
    Components.crfLabel.innerHTML = qualityLabel(e.target.value);
  };
  Components.flac.oninput = (e) => {
    Components.flacLabel.innerHTML = `Compression<br>${e.target.value}`;
  };

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
  };

  Components.stopButton.onclick = async (e) => {
    e.preventDefault();
    await invoke("interrupt_ffmpeg");
    return false;
  };
}

window.addEventListener("DOMContentLoaded", () => {
  Components.init();
  preload();
  tauriEventListeners();
  htmlEventListeners();
});
