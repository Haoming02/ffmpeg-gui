const { invoke } = window.__TAURI__.core;
const { open: openDialog } = window.__TAURI__.dialog;

async function preload() {
  /** @type {boolean} */
  const hasFFmpeg = await invoke("has_ffmpeg");
  if (hasFFmpeg) return;

  const img = document.getElementById("title");
  img.querySelector("img").removeAttribute("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  preload();

  const folderInput = document.getElementById("input");

  folderInput.addEventListener("dblclick", async () => {
    const selected = await openDialog({
      directory: true,
      multiple: false,
      defaultPath: ".",
    });

    if (selected) folderInput.value = selected;
  });

});
