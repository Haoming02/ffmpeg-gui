/** @type {string[]} */
const ProResIndex = ["Proxy", "LT", "SQ", "HQ"];

/** @type {string[]} */
const nvEnc = ["h264", "hevc", "av1"];

/** @type {Array<[number, string]>} */
const QualityThreshold = [
    [0, "Lossless"],
    [9, "Extreme"],
    [18, "High"],
    [27, "Normal"],
    [36, "Low"],
    [54, "Worst"],
];

/** @type {Map<string, string>} */
const VcodecMapping = {
    H264: "h264",
    HEVC: "hevc",
    AV1: "av1",
    VP9: "vp9",
    ProRes: "prores",
};

/** @type {Map<string, string>} */
const AcodecMapping = {
    aac: "aac",
    mp3: "libmp3lame",
    opus: "libopus",
    flac: "flac"
};

/** @type {Map<number, string>} */
const ErrorCode = {
    s: "Success",
    i: "Input does not Exist...",
    o: "Output already Exists...",
    e: "FFmpeg finished with Error...",
    f: "Failed to run FFmpeg...",
};

export { ProResIndex, nvEnc, QualityThreshold, VcodecMapping, AcodecMapping, ErrorCode };
