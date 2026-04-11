import { INITIAL_RECORDER_STATE } from "./constants";
import { loadPrefs } from "./storage";
import type { RecorderAction, RecorderState } from "./types";

export function recorderReducer(
  state: RecorderState,
  action: RecorderAction,
): RecorderState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "TOGGLE_AUDIO_SOURCE":
      return {
        ...state,
        audioSources: {
          ...state.audioSources,
          [action.source]: !state.audioSources[action.source],
        },
      };

    case "SET_WEBCAM_CONFIG":
      return {
        ...state,
        webcam: { ...state.webcam, ...action.patch },
      };

    case "TOGGLE_WEBCAM":
      return {
        ...state,
        webcam: { ...state.webcam, enabled: !state.webcam.enabled },
      };

    case "SET_QUALITY":
      return { ...state, quality: action.quality };

    case "TICK_ELAPSED":
      return { ...state, elapsedMs: action.elapsedMs };

    case "RESET_ELAPSED":
      return { ...state, elapsedMs: 0 };

    case "SET_RECORDING_ERROR":
      return { ...state, recordingError: action.message };

    case "SET_RECORDED_BLOB":
      return {
        ...state,
        recordedBlob: action.blob,
        recordedUrl: action.url,
        recordedMimeType: action.mimeType,
        recordedDuration: action.duration,
        recordedSizeBytes: action.sizeBytes,
        // Initialize trim to the full recording (in seconds) so Stage 6 can
        // render handles at sane defaults.
        trim: { start: 0, end: action.duration / 1000 },
      };

    case "CLEAR_RECORDING":
      return {
        ...state,
        recordedBlob: null,
        recordedUrl: null,
        recordedMimeType: null,
        recordedDuration: 0,
        recordedSizeBytes: 0,
        trim: null,
      };

    case "SET_TRIM":
      return { ...state, trim: action.trim };

    case "CLEAR_TRIM":
      return { ...state, trim: null };

    case "SET_EXPORT_FORMAT":
      return { ...state, exportFormat: action.format };

    case "SET_EXPORT_FILENAME":
      return { ...state, exportFilename: action.filename };

    case "SET_FFMPEG_LOADED":
      return { ...state, isFfmpegLoaded: action.loaded };

    case "SET_FFMPEG_PROGRESS":
      return { ...state, ffmpegProgress: action.progress };

    case "RESET":
      return {
        ...INITIAL_RECORDER_STATE,
        // Preserve user preferences across a hard reset
        audioSources: state.audioSources,
        webcam: state.webcam,
        quality: state.quality,
        exportFormat: state.exportFormat,
        isFfmpegLoaded: state.isFfmpegLoaded,
      };

    default: {
      // Exhaustiveness check
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function getInitialRecorderState(): RecorderState {
  const prefs = loadPrefs();
  return {
    ...INITIAL_RECORDER_STATE,
    audioSources: prefs.audioSources,
    webcam: prefs.webcam,
    quality: prefs.quality,
    exportFormat: prefs.exportFormat,
  };
}
