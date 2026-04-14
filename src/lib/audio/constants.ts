import type { EditorState, ExportFormat } from "./types";

/** Maximum undo/redo history depth */
export const MAX_HISTORY = 50;

/** Default zoom: pixels per second of audio */
export const DEFAULT_ZOOM = 100;

/** Min/max zoom bounds */
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 1000;

/** Zoom step multiplier for scroll wheel */
export const ZOOM_STEP = 1.25;

/** Waveform canvas height in pixels */
export const WAVEFORM_HEIGHT = 200;

/** Waveform colors (CSS variable references) */
export const WAVEFORM_COLORS = {
  background: "var(--color-card)",
  waveform: "var(--color-brand)",
  waveformMuted: "var(--color-muted-foreground)",
  selection: "oklch(0.72 0.19 163 / 0.25)", // brand emerald with alpha
  selectionBorder: "var(--color-brand)",
  playhead: "oklch(0.85 0.15 85)", // amber
  gridLine: "var(--color-border)",
  timeLabel: "var(--color-muted-foreground)",
} as const;

/** Supported import MIME types */
export const IMPORT_MIME_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
  "audio/webm",
] as const;

/** File extension to display name */
export const FORMAT_LABELS: Record<ExportFormat, string> = {
  wav: "WAV (lossless)",
  mp3: "MP3",
  ogg: "OGG / WebM Opus",
};

/** Available MP3 bitrate options */
export const MP3_BITRATES = [128, 192, 256, 320] as const;

/** Import accept string for file input */
export const IMPORT_ACCEPT = ".mp3,.wav,.ogg,.aac,.flac,.webm,audio/*";

/** Default editor state */
export const INITIAL_EDITOR_STATE: EditorState = {
  track: null,
  playbackStatus: "idle",
  playheadPosition: 0,
  selection: null,
  activeTool: "select",
  zoom: DEFAULT_ZOOM,
  scrollOffset: 0,
  undoStack: [],
  redoStack: [],
  isProcessing: false,
  exportFormat: "wav",
  exportBitrate: 192,
  isLooping: false,
};

/** Keyboard shortcuts */
export const SHORTCUTS = {
  play: " ", // Space
  undo: "z",
  redo: "y",
  delete: "Delete",
  selectAll: "a",
  zoomIn: "=",
  zoomOut: "-",
  trimToSelection: "t",
} as const;
