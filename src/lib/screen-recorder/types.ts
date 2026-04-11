/* ── Configuration ────────────────────────────────────────── */

export type QualityPresetId = "720p" | "1080p" | "1440p";

export interface QualityPreset {
  id: QualityPresetId;
  label: string;
  width: number;
  height: number;
  frameRate: number;
  videoBitsPerSecond: number;
  description: string;
}

export interface AudioSourceConfig {
  system: boolean;
  mic: boolean;
}

export type WebcamPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type WebcamSize = "sm" | "md" | "lg";

export type WebcamShape = "circle" | "square";

export interface WebcamConfig {
  enabled: boolean;
  position: WebcamPosition;
  size: WebcamSize;
  shape: WebcamShape;
}

/* ── Output ──────────────────────────────────────────────── */

export type ExportFormat = "webm" | "mp4" | "gif";

export interface TrimRange {
  start: number;
  end: number;
}

/* ── Phase state ─────────────────────────────────────────── */

export type RecorderPhase =
  | "idle"
  | "configuring"
  | "countdown"
  | "recording"
  | "paused"
  | "stopped"
  | "processing";

export interface RecorderState {
  phase: RecorderPhase;

  // Pre-record configuration
  audioSources: AudioSourceConfig;
  webcam: WebcamConfig;
  quality: QualityPresetId;

  // Runtime feedback
  elapsedMs: number;
  recordingError: string | null;

  // Captured recording
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  recordedMimeType: string | null;
  recordedDuration: number;
  recordedSizeBytes: number;

  // Trim selection (in seconds, relative to the current recording)
  trim: TrimRange | null;

  // Export
  exportFormat: ExportFormat;
  exportFilename: string;
  isFfmpegLoaded: boolean;
  ffmpegProgress: number;
}

/* ── Reducer actions ─────────────────────────────────────── */

export type RecorderAction =
  | { type: "SET_PHASE"; phase: RecorderPhase }
  | { type: "TOGGLE_AUDIO_SOURCE"; source: keyof AudioSourceConfig }
  | { type: "SET_WEBCAM_CONFIG"; patch: Partial<WebcamConfig> }
  | { type: "TOGGLE_WEBCAM" }
  | { type: "SET_QUALITY"; quality: QualityPresetId }
  | { type: "TICK_ELAPSED"; elapsedMs: number }
  | { type: "RESET_ELAPSED" }
  | { type: "SET_RECORDING_ERROR"; message: string | null }
  | {
      type: "SET_RECORDED_BLOB";
      blob: Blob;
      url: string;
      mimeType: string;
      duration: number;
      sizeBytes: number;
    }
  | { type: "CLEAR_RECORDING" }
  | { type: "SET_TRIM"; trim: TrimRange }
  | { type: "CLEAR_TRIM" }
  | { type: "SET_EXPORT_FORMAT"; format: ExportFormat }
  | { type: "SET_EXPORT_FILENAME"; filename: string }
  | { type: "SET_FFMPEG_LOADED"; loaded: boolean }
  | { type: "SET_FFMPEG_PROGRESS"; progress: number }
  | { type: "RESET" };

/* ── Persisted preferences ───────────────────────────────── */

export interface RecorderPrefs {
  quality: QualityPresetId;
  audioSources: AudioSourceConfig;
  webcam: WebcamConfig;
  exportFormat: ExportFormat;
}
