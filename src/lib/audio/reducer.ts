import type { EditorState, EditorAction, AudioTrack } from "./types";
import { INITIAL_EDITOR_STATE, MAX_HISTORY } from "./constants";

function createTrackFromBuffer(name: string, buffer: AudioBuffer): AudioTrack {
  return {
    id: crypto.randomUUID(),
    name,
    buffer,
    gain: 1,
    muted: false,
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
  };
}

export function editorReducer(
  state: EditorState,
  action: EditorAction
): EditorState {
  switch (action.type) {
    case "LOAD_TRACK": {
      const track = createTrackFromBuffer(
        action.payload.name,
        action.payload.buffer
      );
      return {
        ...INITIAL_EDITOR_STATE,
        track,
        exportFormat: state.exportFormat,
        exportBitrate: state.exportBitrate,
      };
    }

    case "UNLOAD_TRACK":
      return { ...INITIAL_EDITOR_STATE };

    case "SET_PLAYBACK_STATUS":
      return { ...state, playbackStatus: action.payload };

    case "SET_PLAYHEAD":
      return { ...state, playheadPosition: action.payload };

    case "SET_SELECTION":
      return { ...state, selection: action.payload };

    case "SET_TOOL":
      return { ...state, activeTool: action.payload };

    case "SET_ZOOM":
      return { ...state, zoom: action.payload };

    case "SET_SCROLL_OFFSET":
      return { ...state, scrollOffset: action.payload };

    case "SET_GAIN":
      if (!state.track) return state;
      return {
        ...state,
        track: { ...state.track, gain: action.payload },
      };

    case "TOGGLE_MUTE":
      if (!state.track) return state;
      return {
        ...state,
        track: { ...state.track, muted: !state.track.muted },
      };

    case "APPLY_BUFFER": {
      if (!state.track) return state;
      const historyEntry = {
        buffer: state.track.buffer,
        label: action.payload.label,
        timestamp: Date.now(),
      };
      const undoStack = [...state.undoStack, historyEntry].slice(-MAX_HISTORY);
      return {
        ...state,
        track: {
          ...state.track,
          buffer: action.payload.buffer,
          duration: action.payload.buffer.duration,
          sampleRate: action.payload.buffer.sampleRate,
          channels: action.payload.buffer.numberOfChannels,
        },
        undoStack,
        redoStack: [], // clear redo on new action
        isProcessing: false,
      };
    }

    case "UNDO": {
      if (state.undoStack.length === 0 || !state.track) return state;
      const undoStack = [...state.undoStack];
      const entry = undoStack.pop()!;
      const redoEntry = {
        buffer: state.track.buffer,
        label: entry.label,
        timestamp: Date.now(),
      };
      return {
        ...state,
        track: {
          ...state.track,
          buffer: entry.buffer,
          duration: entry.buffer.duration,
          sampleRate: entry.buffer.sampleRate,
          channels: entry.buffer.numberOfChannels,
        },
        undoStack,
        redoStack: [...state.redoStack, redoEntry].slice(-MAX_HISTORY),
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0 || !state.track) return state;
      const redoStack = [...state.redoStack];
      const entry = redoStack.pop()!;
      const undoEntry = {
        buffer: state.track.buffer,
        label: entry.label,
        timestamp: Date.now(),
      };
      return {
        ...state,
        track: {
          ...state.track,
          buffer: entry.buffer,
          duration: entry.buffer.duration,
          sampleRate: entry.buffer.sampleRate,
          channels: entry.buffer.numberOfChannels,
        },
        undoStack: [...state.undoStack, undoEntry].slice(-MAX_HISTORY),
        redoStack,
      };
    }

    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };

    case "SET_EXPORT_FORMAT":
      return { ...state, exportFormat: action.payload };

    case "SET_EXPORT_BITRATE":
      return { ...state, exportBitrate: action.payload };

    case "TOGGLE_LOOP":
      return { ...state, isLooping: !state.isLooping };

    default:
      return state;
  }
}
