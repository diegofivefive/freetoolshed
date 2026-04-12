/** Represents a single audio file in the merge queue. */
export interface AudioFile {
  id: string;
  file: File;
  name: string;
  /** Duration in seconds (0 while probing). */
  duration: number;
  sizeBytes: number;
  /** File.lastModified timestamp (ms since epoch). */
  lastModified: number;
  status: "pending" | "probing" | "ready" | "error";
  error?: string;
}

export type SortMode = "manual" | "name" | "date" | "size" | "duration";

export type OutputFormat = "m4a" | "mp3" | "ogg";

export type MergeStatus =
  | "idle"
  | "loading-ffmpeg"
  | "concatenating"
  | "encoding"
  | "done"
  | "error";

export interface MergeOptions {
  outputFormat: OutputFormat;
  outputBitrate: string;
  chapterMarkers: boolean;
  outputFilename: string;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export interface MergerState {
  files: AudioFile[];
  options: MergeOptions;
  mergeStatus: MergeStatus;
  mergeProgress: number;
  mergeError: string | null;
  outputBlob: Blob | null;
}

export type MergerAction =
  | { type: "ADD_FILES"; files: AudioFile[] }
  | { type: "REMOVE_FILE"; id: string }
  | { type: "CLEAR_FILES" }
  | { type: "REORDER"; fromIndex: number; toIndex: number }
  | { type: "SORT"; mode: SortMode; direction?: "asc" | "desc" }
  | { type: "UPDATE_FILE"; id: string; patch: Partial<AudioFile> }
  | { type: "SET_OPTION"; patch: Partial<MergeOptions> }
  | { type: "SET_MERGE_STATUS"; status: MergeStatus }
  | { type: "SET_MERGE_PROGRESS"; progress: number }
  | { type: "SET_MERGE_ERROR"; error: string }
  | { type: "SET_OUTPUT_BLOB"; blob: Blob }
  | { type: "RESET_MERGE" };
