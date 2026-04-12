import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";
import { FORMAT_CONFIGS } from "./constants";
import type { AudioFile, OutputFormat } from "./types";

export interface MergeCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

/**
 * Merges multiple audio files into a single output using ffmpeg.wasm.
 *
 * Strategy: write all input files to the virtual FS, build a concat demuxer
 * list, and transcode to the chosen output format.
 */
export async function runMerge(
  files: AudioFile[],
  opts: {
    outputFormat: OutputFormat;
    outputBitrate: string;
    chapterMarkers: boolean;
    outputFilename: string;
  },
  callbacks: MergeCallbacks,
  signal?: AbortSignal
): Promise<Blob> {
  const { outputFormat, outputBitrate, chapterMarkers, outputFilename } = opts;
  const formatConfig = FORMAT_CONFIGS[outputFormat];

  // ── 1. Load ffmpeg ──────────────────────────────────────────────────────
  callbacks.onStatus("Loading ffmpeg…");
  callbacks.onProgress(0);

  const ffmpeg = await loadFFmpeg();

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  // Wire up progress
  const progressHandler = ({ progress }: { progress: number }) => {
    callbacks.onProgress(Math.min(progress, 1));
  };
  ffmpeg.on("progress", progressHandler);

  try {
    // ── 2. Write input files to virtual FS ──────────────────────────────
    callbacks.onStatus("Reading files…");
    const { fetchFile } = await import("@ffmpeg/util");

    const inputNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const padded = String(i).padStart(5, "0");
      const ext = files[i].name.split(".").pop() || "mp3";
      const fsName = `input_${padded}.${ext}`;
      inputNames.push(fsName);

      const data = await fetchFile(files[i].file);
      await ffmpeg.writeFile(fsName, data);

      // Show file-reading progress (0-10% of total bar)
      callbacks.onProgress((i + 1) / files.length * 0.1);
    }

    // ── 3. Build concat demuxer list ────────────────────────────────────
    const concatList = inputNames
      .map((name) => `file '${name}'`)
      .join("\n");
    const encoder = new TextEncoder();
    await ffmpeg.writeFile("concat.txt", encoder.encode(concatList));

    // ── 4. Build chapter metadata (optional) ────────────────────────────
    const ffmpegArgs: string[] = [];

    if (chapterMarkers && outputFormat === "m4a") {
      let metaContent = ";FFMETADATA1\n";
      let startMs = 0;

      for (const file of files) {
        const durationMs = Math.round(file.duration * 1000);
        const endMs = startMs + durationMs;

        // Use filename without extension as chapter title
        const title = file.name.replace(/\.[^.]+$/, "");

        metaContent += `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${startMs}\nEND=${endMs}\ntitle=${title}\n`;
        startMs = endMs;
      }

      await ffmpeg.writeFile("ffmetadata.txt", encoder.encode(metaContent));
      ffmpegArgs.push("-i", "ffmetadata.txt", "-map_metadata", "1");
    }

    // ── 5. Run ffmpeg ───────────────────────────────────────────────────
    callbacks.onStatus("Merging audio…");

    const outFilename = `${outputFilename}.${formatConfig.extension}`;

    const args = [
      "-f", "concat",
      "-safe", "0",
      "-i", "concat.txt",
      ...ffmpegArgs,
      ...formatConfig.codecFlags,
      "-b:a", outputBitrate,
      outFilename,
    ];

    const exitCode = await ffmpeg.exec(args);

    if (exitCode !== 0) {
      throw new Error(`ffmpeg exited with code ${exitCode}`);
    }

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    // ── 6. Read output ──────────────────────────────────────────────────
    callbacks.onStatus("Preparing download…");
    const outputData = await ffmpeg.readFile(outFilename);
    const bytes =
      outputData instanceof Uint8Array
        ? outputData
        : new TextEncoder().encode(outputData as string);
    // Copy into a plain ArrayBuffer to satisfy strict TS (avoids SharedArrayBuffer)
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    const blob = new Blob([ab], { type: formatConfig.mimeType });

    callbacks.onProgress(1);
    callbacks.onStatus("Done");

    return blob;
  } finally {
    // ── 7. Cleanup virtual FS ───────────────────────────────────────────
    ffmpeg.off("progress", progressHandler);

    const cleanupFiles = [
      ...files.map((_, i) => {
        const padded = String(i).padStart(5, "0");
        const ext = files[i].name.split(".").pop() || "mp3";
        return `input_${padded}.${ext}`;
      }),
      "concat.txt",
      "ffmetadata.txt",
      `${outputFilename}.${formatConfig.extension}`,
    ];

    for (const name of cleanupFiles) {
      try {
        await ffmpeg.deleteFile(name);
      } catch {
        // File may not exist (e.g. ffmetadata.txt when chapters disabled)
      }
    }
  }
}

/**
 * Abort a running merge by terminating the ffmpeg worker and resetting
 * the singleton so the next merge gets a fresh instance.
 */
export async function abortMerge(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch {
    // Instance may already be dead
  }
  resetFFmpeg();
}
