import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

export interface ExtractCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

export interface ExtractResult {
  blob: Blob;
  filename: string;
}

export type AudioOutputFormat = "mp3" | "m4a" | "wav" | "ogg" | "flac";

interface FormatConfig {
  extension: string;
  mimeType: string;
  codecFlags: string[];
}

const FORMAT_CONFIGS: Record<AudioOutputFormat, FormatConfig> = {
  mp3: {
    extension: "mp3",
    mimeType: "audio/mpeg",
    codecFlags: ["-c:a", "libmp3lame"],
  },
  m4a: {
    extension: "m4a",
    mimeType: "audio/mp4",
    codecFlags: ["-c:a", "aac", "-movflags", "+faststart"],
  },
  wav: {
    extension: "wav",
    mimeType: "audio/wav",
    codecFlags: ["-c:a", "pcm_s16le"],
  },
  ogg: {
    extension: "ogg",
    mimeType: "audio/ogg",
    codecFlags: ["-c:a", "libvorbis"],
  },
  flac: {
    extension: "flac",
    mimeType: "audio/flac",
    codecFlags: ["-c:a", "flac"],
  },
};

/**
 * Extract audio track from a video file.
 * If format is "original", attempts stream copy; otherwise re-encodes.
 */
export async function extractAudio(
  file: File,
  format: AudioOutputFormat | "original",
  bitrate: string,
  callbacks: ExtractCallbacks,
  signal?: AbortSignal
): Promise<ExtractResult> {
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

  // Determine output format
  const isOriginal = format === "original";
  const outExt = isOriginal ? "m4a" : FORMAT_CONFIGS[format].extension;
  const outMime = isOriginal ? "audio/mp4" : FORMAT_CONFIGS[format].mimeType;
  const outputName = `${baseName}-audio.${outExt}`;

  try {
    callbacks.onStatus("Reading file…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onStatus("Extracting audio…");

    const args: string[] = ["-i", inputName, "-vn"];

    if (isOriginal) {
      args.push("-c:a", "copy");
    } else {
      const config = FORMAT_CONFIGS[format];
      args.push(...config.codecFlags);
      // Apply bitrate for lossy formats
      if (format !== "wav" && format !== "flac") {
        args.push("-b:a", bitrate);
      }
    }

    args.push(outputName);

    const exitCode = await ffmpeg.exec(args);

    // If stream copy failed (codec mismatch), retry with AAC encode
    if (exitCode !== 0 && isOriginal) {
      callbacks.onStatus("Stream copy failed, re-encoding to AAC…");
      const fallbackArgs = [
        "-i", inputName,
        "-vn",
        "-c:a", "aac",
        "-b:a", bitrate,
        "-movflags", "+faststart",
        outputName,
      ];
      const retryCode = await ffmpeg.exec(fallbackArgs);
      if (retryCode !== 0) throw new Error(`ffmpeg exited with code ${retryCode}`);
    } else if (exitCode !== 0) {
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

    const blob = new Blob([ab], { type: outMime });

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

export async function abortExtract(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch { /* ok */ }
  resetFFmpeg();
}
