import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

export interface CompressPreset {
  label: string;
  description: string;
  /** ffmpeg CRF value (lower = better quality, larger file). */
  crf: number;
  /** Target scale — null means keep original. */
  maxHeight: number | null;
}

export const COMPRESS_PRESETS: Record<string, CompressPreset> = {
  small: {
    label: "Small File",
    description: "Aggressive compression. Good for email/messaging.",
    crf: 32,
    maxHeight: 720,
  },
  balanced: {
    label: "Balanced",
    description: "Good quality at a reasonable file size.",
    crf: 26,
    maxHeight: null,
  },
  high: {
    label: "High Quality",
    description: "Minimal quality loss. Larger output file.",
    crf: 20,
    maxHeight: null,
  },
  custom: {
    label: "Custom",
    description: "Set your own CRF and resolution.",
    crf: 23,
    maxHeight: null,
  },
};

export const CRF_RANGE = { min: 0, max: 51 } as const;

export const MAX_HEIGHT_OPTIONS = [
  { label: "Original", value: null },
  { label: "2160p (4K)", value: 2160 },
  { label: "1080p (Full HD)", value: 1080 },
  { label: "720p (HD)", value: 720 },
  { label: "480p (SD)", value: 480 },
  { label: "360p", value: 360 },
] as const;

export interface CompressCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

export interface CompressResult {
  blob: Blob;
  filename: string;
}

/**
 * Compress a video file using H.264 (libx264) via ffmpeg.wasm.
 *
 * CRF (Constant Rate Factor) controls quality:
 *   0 = lossless, 18 = visually lossless, 23 = default, 51 = worst
 */
export async function compressVideo(
  file: File,
  opts: {
    crf: number;
    maxHeight: number | null;
    audioPassthrough: boolean;
  },
  callbacks: CompressCallbacks,
  signal?: AbortSignal
): Promise<CompressResult> {
  callbacks.onStatus("Loading ffmpeg…");
  callbacks.onProgress(0);

  const ffmpeg = await loadFFmpeg();

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const progressHandler = ({ progress }: { progress: number }) => {
    callbacks.onProgress(Math.min(progress, 1));
  };
  ffmpeg.on("progress", progressHandler);

  const inputExt = file.name.split(".").pop() || "mp4";
  const inputName = `input.${inputExt}`;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputName = `${baseName}-compressed.mp4`;

  try {
    callbacks.onStatus("Reading video…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    callbacks.onStatus("Compressing video — this may take a few minutes…");

    // Build filter chain
    const filters: string[] = [];
    if (opts.maxHeight) {
      // Scale to maxHeight, keep aspect ratio, ensure even dimensions
      filters.push(
        `scale=-2:'min(${opts.maxHeight},ih)':flags=lanczos`
      );
    }

    const args: string[] = ["-i", inputName];

    if (filters.length > 0) {
      args.push("-vf", filters.join(","));
    }

    // Video codec
    args.push("-c:v", "libx264", "-crf", String(opts.crf), "-preset", "fast");

    // Audio
    if (opts.audioPassthrough) {
      args.push("-c:a", "copy");
    } else {
      args.push("-c:a", "aac", "-b:a", "128k");
    }

    // Faststart for web playback
    args.push("-movflags", "+faststart");

    args.push(outputName);

    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) {
      throw new Error(`ffmpeg exited with code ${exitCode}`);
    }

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    callbacks.onStatus("Preparing download…");
    const outputData = await ffmpeg.readFile(outputName);
    const bytes =
      outputData instanceof Uint8Array
        ? outputData
        : new TextEncoder().encode(outputData as string);
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    const blob = new Blob([ab], { type: "video/mp4" });

    callbacks.onProgress(1);
    callbacks.onStatus("Done");

    return { blob, filename: outputName };
  } finally {
    ffmpeg.off("progress", progressHandler);
    for (const name of [inputName, outputName]) {
      try {
        await ffmpeg.deleteFile(name);
      } catch { /* may not exist */ }
    }
  }
}

export async function abortCompress(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch { /* may already be dead */ }
  resetFFmpeg();
}
