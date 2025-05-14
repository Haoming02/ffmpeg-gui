/** @type {string[]} */
const ProResIndex = ["Proxy", "LT", "SQ", "HQ"];

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
    "H.264": "h264",
    "H.264 (GPU)": "h264_nvenc",
    "HEVC": "hevc",
    "HEVC (GPU)": "hevc_nvenc",
    "AV1": "av1",
    "AV1 (GPU)": "av1_nvenc",
    "VP9": "vp9",
    "ProRes": "prores",
};

/** @type {Map<number, string>} */
const ErrorCode = {
    s: "Success",
    i: "Input does not Exist...",
    o: "Output already Exists...",
    e: "FFmpeg finished with Error...",
    f: "Failed to run FFmpeg...",
};

export { ProResIndex, QualityThreshold, VcodecMapping, ErrorCode };
