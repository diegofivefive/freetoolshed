import { DEFAULT_MERGE_OPTIONS } from "./constants";
import type { MergerState, MergerAction, AudioFile } from "./types";

export const initialMergerState: MergerState = {
  files: [],
  options: { ...DEFAULT_MERGE_OPTIONS },
  mergeStatus: "idle",
  mergeProgress: 0,
  mergeError: null,
  outputBlob: null,
};

/** Natural-sort comparator: Chapter 1, Chapter 2, … Chapter 10 */
const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function sortFiles(
  files: AudioFile[],
  mode: "name" | "date" | "size" | "duration",
  direction: "asc" | "desc"
): AudioFile[] {
  const sorted = [...files];
  const dir = direction === "asc" ? 1 : -1;

  switch (mode) {
    case "name":
      sorted.sort((a, b) => naturalCollator.compare(a.name, b.name) * dir);
      break;
    case "date":
      sorted.sort((a, b) => (a.lastModified - b.lastModified) * dir);
      break;
    case "size":
      sorted.sort((a, b) => (a.sizeBytes - b.sizeBytes) * dir);
      break;
    case "duration":
      sorted.sort((a, b) => (a.duration - b.duration) * dir);
      break;
  }

  return sorted;
}

export function mergerReducer(
  state: MergerState,
  action: MergerAction
): MergerState {
  switch (action.type) {
    case "ADD_FILES":
      return { ...state, files: [...state.files, ...action.files] };

    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.id),
      };

    case "CLEAR_FILES":
      return {
        ...state,
        files: [],
        mergeStatus: "idle",
        mergeProgress: 0,
        mergeError: null,
        outputBlob: null,
      };

    case "REORDER": {
      const files = [...state.files];
      const [moved] = files.splice(action.fromIndex, 1);
      files.splice(action.toIndex, 0, moved);
      return { ...state, files };
    }

    case "SORT": {
      if (action.mode === "manual") return state;
      return {
        ...state,
        files: sortFiles(state.files, action.mode, action.direction ?? "asc"),
      };
    }

    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.id ? { ...f, ...action.patch } : f
        ),
      };

    case "SET_OPTION":
      return {
        ...state,
        options: { ...state.options, ...action.patch },
      };

    case "SET_MERGE_STATUS":
      return { ...state, mergeStatus: action.status };

    case "SET_MERGE_PROGRESS":
      return { ...state, mergeProgress: action.progress };

    case "SET_MERGE_ERROR":
      return {
        ...state,
        mergeStatus: "error",
        mergeError: action.error,
      };

    case "SET_OUTPUT_BLOB":
      return {
        ...state,
        mergeStatus: "done",
        mergeProgress: 1,
        outputBlob: action.blob,
      };

    case "RESET_MERGE":
      return {
        ...state,
        mergeStatus: "idle",
        mergeProgress: 0,
        mergeError: null,
        outputBlob: null,
      };

    default:
      return state;
  }
}
