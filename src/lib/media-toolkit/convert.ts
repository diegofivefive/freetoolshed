import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

export interface ConvertFormat {
  label: string;
  extension: string;
  mimeType: string;
  codecFlags: string[];
}

export const CONVERT_FORMATS: Record<string, ConvertFormat> = {
  mp3: {
    label: "MP3",
    extension: "mp3",
    mimeType: "audio/mpeg",
    codecFlags: ["-c:a", "libmp3lame"],
  },
  m4a: {
    label: "M4A (AAC)",
    extension: "m4a",
    mimeType: "audio/mp4",
    codecFlags: ["-c:a", "aac", "-movflags", "+faststart"],
  },
  wav: {
    label: "WAV",
    extension: "wav",
    mimeType: "audio/wav",
    codecFlags: ["-c:a", "pcm_s16le"],
  },
  ogg: {
    label: "OGG (Vorbis)",
    extension: "ogg",
    mimeType: "audio/ogg",
    codecFlags: ["-c:a", "libvorbis"],
  },
  flac: {
    label: "FLAC",
    extension: "flac",
    mimeType: "audio/flac",
    codecFlags: ["-c:a", "flac"],
  },
};

export const CONVERT_BITRATES = [
  { label: "64 kbps", value: "64k" },
  { label: "128 kbps", value: "128k" },
  { label: "192 kbps", value: "192k" },
  { label: "256 kbps", value: "256k" },
  { label: "320 kbps", value: "320k" },
] as const;

/** Lossless formats don't use bitrate. */
export const LOSSLESS_FORMATS = new Set(["wav", "flac"]);

export interface ConvertCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

export interface ConvertResult {
  blob: Blob;
  filename: string;
}

/**
 * Convert a single audio file to the target format using ffmpeg.wasm.
 */
export async function convertFile(
  file: File,
  targetFormat: string,
  bitrate: string,
  callbacks: ConvertCallbacks,
  signal?: AbortSignal
): Promise<ConvertResult> {
  const format = CONVERT_FORMATS[targetFormat];
  if (!format) throw new Error(`Unknown format: ${targetFormat}`);

  callbacks.onStatus("Loading ffmpeg…");
  callbacks.onProgress(0);

  const ffmpeg = await loadFFmpeg();

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const progressHandler = ({ progress }: { progress: number }) => {
    callbacks.onProgress(Math.min(progress, 1));
  };
  ffmpeg.on("progress", progressHandler);

  const inputName = `input.${file.name.split(".").pop() || "mp3"}`;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputName = `${baseName}.${format.extension}`;

  try {
    callbacks.onStatus("Reading file…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    callbacks.onStatus("Converting…");

    const args = [
      "-i", inputName,
      ...format.codecFlags,
      ...(LOSSLESS_FORMATS.has(targetFormat) ? [] : ["-b:a", bitrate]),
      outputName,
    ];

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
    const blob = new Blob([ab], { type: format.mimeType });

    callbacks.onProgress(1);
    callbacks.onStatus("Done");

    return { blob, filename: outputName };
  } finally {
    ffmpeg.off("progress", progressHandler);
    for (const name of [inputName, outputName]) {
      try { await ffmpeg.deleteFile(name); } catch { /* may not exist */ }
    }
  }
}

/**
 * Convert multiple files sequentially, reporting per-file progress.
 */
export async function convertBatch(
  files: File[],
  targetFormat: string,
  bitrate: string,
  callbacks: {
    onFileStart: (index: number, filename: string) => void;
    onFileProgress: (index: number, fraction: number) => void;
    onFileComplete: (index: number, result: ConvertResult) => void;
    onFileError: (index: number, error: string) => void;
  },
  signal?: AbortSignal
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    callbacks.onFileStart(i, files[i].name);

    try {
      const result = await convertFile(
        files[i],
        targetFormat,
        bitrate,
        {
          onStatus: () => {},
          onProgress: (fraction) => callbacks.onFileProgress(i, fraction),
        },
        signal
      );
      callbacks.onFileComplete(i, result);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      callbacks.onFileError(
        i,
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }
}

export async function abortConvert(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch { /* may already be dead */ }
  resetFFmpeg();
}
