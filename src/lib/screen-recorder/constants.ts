import type {
  AudioSourceConfig,
  ExportFormat,
  QualityPreset,
  QualityPresetId,
  RecorderState,
  WebcamConfig,
  WebcamSize,
} from "./types";

/* ── Quality presets ─────────────────────────────────────── */

export const QUALITY_PRESETS: Record<QualityPresetId, QualityPreset> = {
  "720p": {
    id: "720p",
    label: "720p",
    width: 1280,
    height: 720,
    frameRate: 30,
    videoBitsPerSecond: 2_500_000,
    description: "720p · 30 fps · ~2.5 Mbps — small files, good for walkthroughs.",
  },
  "1080p": {
    id: "1080p",
    label: "1080p",
    width: 1920,
    height: 1080,
    frameRate: 30,
    videoBitsPerSecond: 5_000_000,
    description: "1080p · 30 fps · ~5 Mbps — sharp, balanced file size.",
  },
  "1440p": {
    id: "1440p",
    label: "1440p",
    width: 2560,
    height: 1440,
    frameRate: 30,
    videoBitsPerSecond: 10_000_000,
    description: "1440p · 30 fps · ~10 Mbps — pixel-perfect, larger files.",
  },
};

export const QUALITY_ORDER: QualityPresetId[] = ["720p", "1080p", "1440p"];

export const DEFAULT_QUALITY: QualityPresetId = "1080p";

/* ── Webcam overlay ──────────────────────────────────────── */

export const WEBCAM_SIZE_PX: Record<WebcamSize, number> = {
  sm: 160,
  md: 220,
  lg: 300,
};

export const DEFAULT_WEBCAM_CONFIG: WebcamConfig = {
  enabled: false,
  position: "bottom-right",
  size: "md",
  shape: "circle",
};

/* ── Audio ──────────────────────────────────────────────── */

export const DEFAULT_AUDIO_CONFIG: AudioSourceConfig = {
  system: false,
  mic: true,
};

/* ── MediaRecorder MIME types (priority order) ──────────── */

export const SUPPORTED_MIME_TYPES: readonly string[] = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

/* ── Safety caps ─────────────────────────────────────────── */

/** Hard cap to prevent runaway memory use (2 hours). */
export const MAX_RECORDING_MS = 2 * 60 * 60 * 1000;

/** Interval for elapsed-time ticks while recording. */
export const TICK_INTERVAL_MS = 100;

/** Seconds of countdown before recording begins. */
export const COUNTDOWN_SECONDS = 3;

/* ── Defaults & initial state ───────────────────────────── */

export const DEFAULT_EXPORT_FORMAT: ExportFormat = "webm";

export const INITIAL_RECORDER_STATE: RecorderState = {
  phase: "idle",
  audioSources: DEFAULT_AUDIO_CONFIG,
  webcam: DEFAULT_WEBCAM_CONFIG,
  quality: DEFAULT_QUALITY,
  elapsedMs: 0,
  recordingError: null,
  recordedBlob: null,
  recordedUrl: null,
  recordedMimeType: null,
  recordedDuration: 0,
  recordedSizeBytes: 0,
  trim: null,
  exportFormat: DEFAULT_EXPORT_FORMAT,
  exportFilename: "",
  isFfmpegLoaded: false,
  ffmpegProgress: 0,
};
