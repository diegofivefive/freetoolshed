import { fetchFile } from "@ffmpeg/util";
import { loadFFmpeg, resetFFmpeg } from "./ffmpeg";
import type { ExportFormat, TrimRange } from "./types";

export type ExportStatus =
  | "idle"
  | "loading-ffmpeg"
  | "transcoding"
  | "done"
  | "error";

export interface ExportResult {
  blob: Blob;
  mimeType: string;
  extension: string;
}

export interface ExportOptions {
  sourceBlob: Blob;
  sourceMimeType: string | null;
  sourceDurationMs: number;
  trim: TrimRange | null;
  format: ExportFormat;
  onStatusChange?: (status: ExportStatus) => void;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

const TRIM_EPSILON_SECONDS = 0.05;

/**
 * Whether the trim range covers (near enough to) the full recording — in
 * which case WebM exports can skip ffmpeg entirely.
 */
export function isFullRangeTrim(
  trim: TrimRange | null,
  sourceDurationMs: number,
): boolean {
  if (!trim) return true;
  const totalSeconds = sourceDurationMs / 1000;
  return (
    trim.start <= TRIM_EPSILON_SECONDS &&
    trim.end >= totalSeconds - TRIM_EPSILON_SECONDS
  );
}

/**
 * Seconds of video the export will produce. Always >= 0.
 */
export function effectiveExportSeconds(
  trim: TrimRange | null,
  sourceDurationMs: number,
): number {
  const totalSeconds = sourceDurationMs / 1000;
  if (!trim) return totalSeconds;
  return Math.max(0, Math.min(trim.end, totalSeconds) - Math.max(trim.start, 0));
}

/**
 * Rough output-size estimate in bytes. Used for UX hints only — actual size
 * depends on content entropy, codec behaviour, etc.
 */
export function estimateExportBytes(
  format: ExportFormat,
  durationSeconds: number,
  sourceBytes: number,
  sourceDurationMs: number,
): number | null {
  if (durationSeconds <= 0) return 0;
  const totalSeconds = sourceDurationMs / 1000;
  const trimRatio =
    totalSeconds > 0 ? Math.min(1, durationSeconds / totalSeconds) : 1;

  if (format === "webm") {
    return Math.round(sourceBytes * trimRatio);
  }
  if (format === "mp4") {
    // H.264 ultrafast CRF 23 tends to land near the source bitrate.
    return Math.round(sourceBytes * trimRatio * 1.05);
  }
  if (format === "gif") {
    // GIFs vary wildly; fall back to null so the UI can show "varies".
    return null;
  }
  return null;
}

const FORMAT_META: Record<
  ExportFormat,
  { extension: string; mimeType: string; outputName: string }
> = {
  webm: { extension: "webm", mimeType: "video/webm", outputName: "output.webm" },
  mp4: { extension: "mp4", mimeType: "video/mp4", outputName: "output.mp4" },
  gif: { extension: "gif", mimeType: "image/gif", outputName: "output.gif" },
};

function inferInputName(sourceMimeType: string | null): string {
  if (sourceMimeType && sourceMimeType.includes("mp4")) return "input.mp4";
  return "input.webm";
}

function buildFFmpegArgs({
  input,
  output,
  format,
  trim,
  sourceDurationMs,
}: {
  input: string;
  output: string;
  format: ExportFormat;
  trim: TrimRange | null;
  sourceDurationMs: number;
}): string[] {
  const args: string[] = [];

  // Trim: place -ss / -t BEFORE -i so ffmpeg does a fast seek on the input
  // container. -t is unambiguous (duration from the seek point) regardless
  // of whether -ss is input- or output-scoped.
  if (trim && !isFullRangeTrim(trim, sourceDurationMs)) {
    if (trim.start > TRIM_EPSILON_SECONDS) {
      args.push("-ss", trim.start.toFixed(3));
    }
    const duration = Math.max(0, trim.end - trim.start);
    args.push("-t", duration.toFixed(3));
  }

  args.push("-i", input);

  if (format === "webm") {
    // Stream-copy — no re-encode, near-instant even for long recordings.
    args.push("-c", "copy");
  } else if (format === "mp4") {
    args.push(
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
    );
  } else if (format === "gif") {
    // Two-pass palette generation in a single filter graph for quality.
    args.push(
      "-filter_complex",
      "fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=5",
    );
    args.push("-loop", "0");
  }

  args.push("-y", output);
  return args;
}

/**
 * Run the export pipeline. Returns the final Blob plus a suggested mime type
 * and file extension. Throws if ffmpeg fails or the abort signal fires.
 */
export async function runExport(options: ExportOptions): Promise<ExportResult> {
  const {
    sourceBlob,
    sourceMimeType,
    sourceDurationMs,
    trim,
    format,
    onStatusChange,
    onProgress,
    signal,
  } = options;

  const meta = FORMAT_META[format];

  // Fast path: WebM, no trim → download the original blob as-is.
  if (format === "webm" && isFullRangeTrim(trim, sourceDurationMs)) {
    onStatusChange?.("done");
    onProgress?.(1);
    return {
      blob: sourceBlob,
      mimeType: sourceMimeType ?? meta.mimeType,
      extension: meta.extension,
    };
  }

  onStatusChange?.("loading-ffmpeg");
  onProgress?.(0);
  const ffmpeg = await loadFFmpeg();
  if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");

  const inputName = inferInputName(sourceMimeType);
  const outputName = meta.outputName;

  const handleProgress = (event: { progress: number }) => {
    const p = Number.isFinite(event.progress)
      ? Math.min(1, Math.max(0, event.progress))
      : 0;
    onProgress?.(p);
  };
  ffmpeg.on("progress", handleProgress);

  let aborted = false;
  const onAbort = () => {
    aborted = true;
    try {
      ffmpeg.terminate();
    } catch {
      /* ignore */
    }
    // terminate() destroys the worker; drop the cached instance so the next
    // export kicks off a fresh load.
    resetFFmpeg();
  };
  signal?.addEventListener("abort", onAbort);

  try {
    onStatusChange?.("transcoding");
    await ffmpeg.writeFile(inputName, await fetchFile(sourceBlob));
    if (aborted) throw new DOMException("Export cancelled", "AbortError");

    const args = buildFFmpegArgs({
      input: inputName,
      output: outputName,
      format,
      trim,
      sourceDurationMs,
    });
    try {
      await ffmpeg.exec(args);
    } catch (execErr) {
      // ffmpeg.terminate() rejects in-flight exec() with a non-AbortError.
      // Promote it to AbortError so the caller can distinguish user cancel
      // from a genuine transcode failure.
      if (aborted) {
        throw new DOMException("Export cancelled", "AbortError");
      }
      throw execErr;
    }
    if (aborted) throw new DOMException("Export cancelled", "AbortError");

    const data = await ffmpeg.readFile(outputName);
    // ffmpeg.wasm returns Uint8Array | string; string only when the second
    // argument asks for utf-8, which we don't. Cast defensively, then copy
    // into a fresh ArrayBuffer so the Blob constructor's strict type
    // (ArrayBufferView<ArrayBuffer>) is satisfied even if ffmpeg hands back a
    // Uint8Array backed by a SharedArrayBuffer in a worker environment.
    const bytes =
      typeof data === "string"
        ? new TextEncoder().encode(data)
        : (data as Uint8Array);
    const bufferCopy = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    const blob = new Blob([bufferCopy], { type: meta.mimeType });

    // Best-effort cleanup of the virtual FS.
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {
      /* ignore */
    }
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {
      /* ignore */
    }

    onStatusChange?.("done");
    onProgress?.(1);
    return {
      blob,
      mimeType: meta.mimeType,
      extension: meta.extension,
    };
  } finally {
    ffmpeg.off("progress", handleProgress);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Trigger a browser download for a blob without leaving a dangling object URL.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Revoke on the next tick so Chrome has time to kick off the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}
