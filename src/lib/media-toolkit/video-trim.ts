import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

export interface TrimCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

export interface TrimResult {
  blob: Blob;
  filename: string;
}

/**
 * Format seconds to HH:MM:SS.mmm for ffmpeg -ss / -to arguments.
 */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}

/**
 * Parse a time string (HH:MM:SS, MM:SS, or SS) to seconds.
 */
export function parseTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  const parts = trimmed.split(":").map(Number);
  if (parts.some(isNaN)) return null;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return null;
}

/**
 * Format seconds to a human-readable duration (e.g. "1:23" or "1:02:33").
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

const VIDEO_MIME_MAP: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

/**
 * Trim a video file to a specific time range using ffmpeg.wasm.
 * Uses stream copy for speed — no re-encoding.
 */
export async function trimVideo(
  file: File,
  startSec: number,
  endSec: number,
  callbacks: TrimCallbacks,
  signal?: AbortSignal
): Promise<TrimResult> {
  callbacks.onStatus("Loading ffmpeg…");
  callbacks.onProgress(0);

  const ffmpeg = await loadFFmpeg();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const progressHandler = ({ progress }: { progress: number }) => {
    callbacks.onProgress(Math.min(progress, 1));
  };
  ffmpeg.on("progress", progressHandler);

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `input.${ext}`;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputName = `${baseName}-trimmed.${ext}`;

  try {
    callbacks.onStatus("Reading file…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onStatus("Trimming…");

    const args = [
      "-i", inputName,
      "-ss", formatTimestamp(startSec),
      "-to", formatTimestamp(endSec),
      "-c", "copy",
      "-movflags", "+faststart",
      outputName,
    ];

    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) throw new Error(`ffmpeg exited with code ${exitCode}`);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    callbacks.onStatus("Preparing download…");
    const outputData = await ffmpeg.readFile(outputName);
    const bytes =
      outputData instanceof Uint8Array
        ? outputData
        : new TextEncoder().encode(outputData as string);
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);

    const blob = new Blob([ab], { type: VIDEO_MIME_MAP[ext] || "video/mp4" });

    callbacks.onProgress(1);
    callbacks.onStatus("Done");
    return { blob, filename: outputName };
  } finally {
    ffmpeg.off("progress", progressHandler);
    for (const name of [inputName, outputName]) {
      try { await ffmpeg.deleteFile(name); } catch { /* ok */ }
    }
  }
}

/**
 * Split a video file at the given time markers (in seconds).
 * Produces N+1 segments from N split points.
 */
export async function splitVideo(
  file: File,
  splitPoints: number[],
  callbacks: {
    onSegmentStart: (index: number, total: number) => void;
    onProgress: (fraction: number) => void;
  },
  signal?: AbortSignal
): Promise<TrimResult[]> {
  const ffmpeg = await loadFFmpeg();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `input.${ext}`;
  const baseName = file.name.replace(/\.[^.]+$/, "");

  const { fetchFile } = await import("@ffmpeg/util");
  const data = await fetchFile(file);
  await ffmpeg.writeFile(inputName, data);

  const sorted = [...splitPoints].sort((a, b) => a - b);
  const boundaries = [0, ...sorted];
  const results: TrimResult[] = [];

  for (let i = 0; i < boundaries.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const segNum = i + 1;
    const total = boundaries.length;
    callbacks.onSegmentStart(segNum, total);

    const outputName = `${baseName}-part${String(segNum).padStart(3, "0")}.${ext}`;
    const start = boundaries[i];

    const args = ["-i", inputName, "-ss", formatTimestamp(start)];

    if (i < boundaries.length - 1) {
      args.push("-to", formatTimestamp(boundaries[i + 1]));
    }

    args.push("-c", "copy", "-movflags", "+faststart", outputName);

    const progressHandler = ({ progress }: { progress: number }) => {
      const segFraction = (i + Math.min(progress, 1)) / total;
      callbacks.onProgress(segFraction);
    };
    ffmpeg.on("progress", progressHandler);

    const exitCode = await ffmpeg.exec(args);
    ffmpeg.off("progress", progressHandler);

    if (exitCode !== 0) throw new Error(`Segment ${segNum} failed (code ${exitCode})`);

    const outputData = await ffmpeg.readFile(outputName);
    const bytes =
      outputData instanceof Uint8Array
        ? outputData
        : new TextEncoder().encode(outputData as string);
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);

    results.push({
      blob: new Blob([ab], { type: VIDEO_MIME_MAP[ext] || "video/mp4" }),
      filename: outputName,
    });

    try { await ffmpeg.deleteFile(outputName); } catch { /* ok */ }
  }

  try { await ffmpeg.deleteFile(inputName); } catch { /* ok */ }
  return results;
}

export async function abortVideoTrim(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch { /* ok */ }
  resetFFmpeg();
}
