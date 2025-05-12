const { invoke } = window.__TAURI__.core;

window.addEventListener("DOMContentLoaded", async () => {
  const msg = document.querySelector("#msg");

  /** @type {boolean} */
  const ffmpeg = await invoke("has_ffmpeg");

  msg.textContent = `FFmpeg: ${ffmpeg}`;
});
