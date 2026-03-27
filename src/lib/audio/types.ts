/** Supported import formats (browser-native decoding) */
export type ImportFormat = "mp3" | "wav" | "ogg" | "aac" | "flac" | "webm";

/** Supported export formats */
export type ExportFormat = "wav" | "mp3" | "ogg";

/** Playback state */
export type PlaybackStatus = "idle" | "playing" | "paused";

/** Available editing tools */
export type EditorTool = "select" | "trim" | "cut" | "silence";

/** Available audio effects */
export type AudioEffect =
  | "fade-in"
  | "fade-out"
  | "normalize"
  | "reverse"
  | "silence"
  | "amplify"
  | "noise-reduction";

/** A selected region on the waveform (in seconds) */
export interface Selection {
  start: number;
  end: number;
}

/** A single audio track / clip in the editor */
export interface AudioTrack {
  id: string;
  name: string;
  /** The decoded audio data */
  buffer: AudioBuffer;
  /** Gain level (0–2, default 1) */
  gain: number;
  /** Whether this track is muted */
  muted: boolean;
  /** Duration in seconds (derived from buffer) */
  duration: number;
  /** Sample rate (derived from buffer) */
  sampleRate: number;
  /** Number of channels (derived from buffer) */
  channels: number;
}

/** Undo/redo history entry */
export interface HistoryEntry {
  /** Snapshot of the audio buffer */
  buffer: AudioBuffer;
  /** Description of the action */
  label: string;
  /** Timestamp */
  timestamp: number;
}

/** Main editor state */
export interface EditorState {
  /** The active audio track (single-track editor for v1) */
  track: AudioTrack | null;
  /** Current playback status */
  playbackStatus: PlaybackStatus;
  /** Playhead position in seconds */
  playheadPosition: number;
  /** Selected region on the waveform */
  selection: Selection | null;
  /** Active editing tool */
  activeTool: EditorTool;
  /** Zoom level (pixels per second) */
  zoom: number;
  /** Scroll offset in seconds */
  scrollOffset: number;
  /** Undo history stack */
  undoStack: HistoryEntry[];
  /** Redo history stack */
  redoStack: HistoryEntry[];
  /** Whether the editor is processing an effect */
  isProcessing: boolean;
  /** Export format preference */
  exportFormat: ExportFormat;
  /** Export quality (bitrate for mp3: 128, 192, 256, 320) */
  exportBitrate: number;
}

/** Actions for the editor reducer */
export type EditorAction =
  | { type: "LOAD_TRACK"; payload: { name: string; buffer: AudioBuffer } }
  | { type: "UNLOAD_TRACK" }
  | { type: "SET_PLAYBACK_STATUS"; payload: PlaybackStatus }
  | { type: "SET_PLAYHEAD"; payload: number }
  | { type: "SET_SELECTION"; payload: Selection | null }
  | { type: "SET_TOOL"; payload: EditorTool }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_SCROLL_OFFSET"; payload: number }
  | { type: "SET_GAIN"; payload: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "APPLY_BUFFER"; payload: { buffer: AudioBuffer; label: string } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_EXPORT_FORMAT"; payload: ExportFormat }
  | { type: "SET_EXPORT_BITRATE"; payload: number };
