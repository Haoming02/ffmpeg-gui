const ProResIndex = ["Proxy", "LT", "SQ", "HQ"];

const nvEnc = ["h264", "hevc", "av1"];

const QualityThreshold = [
    [0, "Lossless"],
    [9, "Extreme"],
    [18, "High"],
    [27, "Normal"],
    [36, "Low"],
    [54, "Worst"],
];

const VcodecMapping = {
    H264: "h264",
    HEVC: "hevc",
    AV1: "av1",
    VP9: "vp9",
    ProRes: "prores",
};

const AcodecMapping = {
    aac: "aac",
    mp3: "libmp3lame",
    opus: "libopus",
    flac: "flac",
};

const ErrorCode = {
    s: "Success",
    i: "Input does not Exist...",
    o: "Output already Exists...",
    e: "FFmpeg finished with Error...",
    f: "Failed to run FFmpeg...",
};

export {
    ProResIndex,
    nvEnc,
    QualityThreshold,
    VcodecMapping,
    AcodecMapping,
    ErrorCode,
};
