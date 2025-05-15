class Components {

    /** @type {HTMLInputElement} */
    static inputPath;
    /** @type {HTMLInputElement} */
    static outputPath;

    /** @type {HTMLSelectElement} */
    static vcodec;
    /** @type {HTMLInputElement} */
    static crfSlider;
    /** @type {HTMLLabelElement} */
    static crfLabel;
    /** @type {HTMLSelectElement} */
    static prores;

    /** @type {HTMLSelectElement} */
    static acodec;
    /** @type {HTMLSelectElement} */
    static bitrate;
    /** @type {HTMLInputElement} */
    static flac;
    /** @type {HTMLLabelElement} */
    static flacLabel;

    /** @type {HTMLButtonElement} */
    static runButton;
    /** @type {HTMLButtonElement} */
    static stopButton;
    /** @type {HTMLDivElement} */
    static progressBar;

    /** @type {HTMLImageElement} */
    static settingsButton;
    /** @type {HTMLDivElement} */
    static settingsPanel;

    /** @type {HTMLInputElement} */
    static batchToggle;

    static init() {
        this.inputPath = document.getElementById("input");
        this.outputPath = document.getElementById("output");
        this.settingsButton = document.getElementById("settings");
        this.settingsPanel = document.getElementById("settings-panel");
        this.batchToggle = document.getElementById("batch");

        this.vcodec = document.getElementById("vcodec");
        this.crfSlider = document.getElementById("crf");
        this.crfLabel = this.crfSlider.parentElement.querySelector("label");
        this.prores = document.getElementById("prores");
        this.acodec = document.getElementById("acodec");
        this.bitrate = document.getElementById("bitrate");
        this.flac = document.getElementById("flac");
        this.flacLabel = this.flac.parentElement.querySelector("label");

        this.runButton = document.getElementById("run");
        this.stopButton = document.getElementById("interrupt");
        this.progressBar = document.getElementById("progress");
    }
}

export { Components }
