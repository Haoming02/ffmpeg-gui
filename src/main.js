const { invoke } = window.__TAURI__.core;

async function preload() {
  /** @type {boolean} */
  const hasFFmpeg = await invoke("has_ffmpeg");
  if (hasFFmpeg) return;

  const img = document.getElementById("title");
  img.querySelector("img").removeAttribute("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  preload();
});
