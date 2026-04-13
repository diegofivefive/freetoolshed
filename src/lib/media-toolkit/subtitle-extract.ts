import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

export interface SubtitleCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

export interface SubtitleResult {
  blob: Blob;
  filename: string;
  trackIndex: number;
  language: string;
}

export type SubtitleFormat = "srt" | "ass" | "vtt";

const FORMAT_MIME: Record<SubtitleFormat, string> = {
  srt: "application/x-subrip",
  ass: "text/x-ssa",
  vtt: "text/vtt",
};

/**
 * Probe a video file for subtitle tracks.
 * Returns an array of { index, language, codec } for each subtitle stream.
 */
export async function probeSubtitles(
  file: File,
  callbacks: SubtitleCallbacks
): Promise<{ index: number; language: string; codec: string }[]> {
  callbacks.onStatus("Loading ffmpeg…");
  callbacks.onProgress(0);

  const ffmpeg = await loadFFmpeg();

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `probe.${ext}`;

  const { fetchFile } = await import("@ffmpeg/util");
  const data = await fetchFile(file);
  await ffmpeg.writeFile(inputName, data);

  // Capture ffmpeg log output for stream info
  const logs: string[] = [];
  const logHandler = ({ message }: { message: string }) => {
    logs.push(message);
  };
  ffmpeg.on("log", logHandler);

  callbacks.onStatus("Probing subtitle tracks…");

  // Run a quick probe — just read input info and exit
  await ffmpeg.exec(["-i", inputName, "-f", "null", "-"]);

  ffmpeg.off("log", logHandler);

  // Parse subtitle streams from logs
  // Example: Stream #0:2(eng): Subtitle: subrip
  const tracks: { index: number; language: string; codec: string }[] = [];
  const streamRegex = /Stream #\d+:(\d+)(?:\((\w+)\))?: Subtitle: (\w+)/;

  for (const line of logs) {
    const match = streamRegex.exec(line);
    if (match) {
      tracks.push({
        index: parseInt(match[1], 10),
        language: match[2] || "und",
        codec: match[3],
      });
    }
  }

  try { await ffmpeg.deleteFile(inputName); } catch { /* ok */ }

  callbacks.onProgress(1);
  callbacks.onStatus(tracks.length > 0 ? `Found ${tracks.length} subtitle track(s)` : "No subtitle tracks found");
  return tracks;
}

/**
 * Extract a specific subtitle track from a video file.
 */
export async function extractSubtitle(
  file: File,
  trackIndex: number,
  format: SubtitleFormat,
  callbacks: SubtitleCallbacks,
  signal?: AbortSignal
): Promise<SubtitleResult> {
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
  const outputName = `${baseName}-sub${trackIndex}.${format}`;

  try {
    callbacks.onStatus("Reading file…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onStatus("Extracting subtitle track…");

    const args = [
      "-i", inputName,
      "-map", `0:${trackIndex}`,
      "-c:s", format === "vtt" ? "webvtt" : format === "ass" ? "ass" : "srt",
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

    const blob = new Blob([ab], { type: FORMAT_MIME[format] || "text/plain" });

    callbacks.onProgress(1);
    callbacks.onStatus("Done");
    return { blob, filename: outputName, trackIndex, language: "" };
  } finally {
    ffmpeg.off("progress", progressHandler);
    for (const name of [inputName, outputName]) {
      try { await ffmpeg.deleteFile(name); } catch { /* ok */ }
    }
  }
}

/**
 * Extract all subtitle tracks from a video file.
 */
export async function extractAllSubtitles(
  file: File,
  tracks: { index: number; language: string }[],
  format: SubtitleFormat,
  callbacks: {
    onTrackStart: (idx: number, total: number) => void;
    onProgress: (fraction: number) => void;
  },
  signal?: AbortSignal
): Promise<SubtitleResult[]> {
  const ffmpeg = await loadFFmpeg();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `input.${ext}`;
  const baseName = file.name.replace(/\.[^.]+$/, "");

  const { fetchFile } = await import("@ffmpeg/util");
  const data = await fetchFile(file);
  await ffmpeg.writeFile(inputName, data);

  const results: SubtitleResult[] = [];

  for (let i = 0; i < tracks.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const track = tracks[i];
    callbacks.onTrackStart(i + 1, tracks.length);

    const langSuffix = track.language !== "und" ? `-${track.language}` : "";
    const outputName = `${baseName}-sub${track.index}${langSuffix}.${format}`;

    const args = [
      "-i", inputName,
      "-map", `0:${track.index}`,
      "-c:s", format === "vtt" ? "webvtt" : format === "ass" ? "ass" : "srt",
      outputName,
    ];

    const progressHandler = ({ progress }: { progress: number }) => {
      const frac = (i + Math.min(progress, 1)) / tracks.length;
      callbacks.onProgress(frac);
    };
    ffmpeg.on("progress", progressHandler);

    const exitCode = await ffmpeg.exec(args);
    ffmpeg.off("progress", progressHandler);

    if (exitCode !== 0) throw new Error(`Track ${track.index} extraction failed (code ${exitCode})`);

    const outputData = await ffmpeg.readFile(outputName);
    const bytes =
      outputData instanceof Uint8Array
        ? outputData
        : new TextEncoder().encode(outputData as string);
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);

    results.push({
      blob: new Blob([ab], { type: FORMAT_MIME[format] || "text/plain" }),
      filename: outputName,
      trackIndex: track.index,
      language: track.language,
    });

    try { await ffmpeg.deleteFile(outputName); } catch { /* ok */ }
  }

  try { await ffmpeg.deleteFile(inputName); } catch { /* ok */ }
  return results;
}

export async function abortSubtitleExtract(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch { /* ok */ }
  resetFFmpeg();
}
