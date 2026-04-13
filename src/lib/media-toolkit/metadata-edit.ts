import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

export interface MetadataCallbacks {
  onStatus: (status: string) => void;
  onProgress: (fraction: number) => void;
}

export interface MetadataEntry {
  key: string;
  value: string;
}

export interface ProbeResult {
  format: string;
  duration: string;
  bitrate: string;
  streams: StreamInfo[];
  metadata: MetadataEntry[];
}

export interface StreamInfo {
  index: number;
  type: string;
  codec: string;
  details: string;
}

/**
 * Probe a media file for metadata and stream info via ffmpeg log parsing.
 */
export async function probeMetadata(
  file: File,
  callbacks: MetadataCallbacks
): Promise<ProbeResult> {
  callbacks.onStatus("Loading ffmpeg…");
  callbacks.onProgress(0);

  const ffmpeg = await loadFFmpeg();

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inputName = `probe.${ext}`;

  const { fetchFile } = await import("@ffmpeg/util");
  const data = await fetchFile(file);
  await ffmpeg.writeFile(inputName, data);

  const logs: string[] = [];
  const logHandler = ({ message }: { message: string }) => {
    logs.push(message);
  };
  ffmpeg.on("log", logHandler);

  callbacks.onStatus("Reading metadata…");
  await ffmpeg.exec(["-i", inputName, "-f", "null", "-"]);
  ffmpeg.off("log", logHandler);

  try { await ffmpeg.deleteFile(inputName); } catch { /* ok */ }

  // Parse results
  const result: ProbeResult = {
    format: "",
    duration: "",
    bitrate: "",
    streams: [],
    metadata: [],
  };

  let inMetadata = false;

  for (const line of logs) {
    // Duration: 00:03:45.12, start: 0.000000, bitrate: 320 kb/s
    const durMatch = /Duration:\s*(\S+),.*bitrate:\s*(\S+\s*\S*)/.exec(line);
    if (durMatch) {
      result.duration = durMatch[1].replace(/,$/,"");
      result.bitrate = durMatch[2];
    }

    // Input #0, mp3, from 'input.mp3':
    const fmtMatch = /Input #\d+,\s*(\S+),/.exec(line);
    if (fmtMatch) {
      result.format = fmtMatch[1];
    }

    // Metadata section
    if (/^\s*Metadata:\s*$/.test(line)) {
      inMetadata = true;
      continue;
    }

    // Metadata key-value: "    title           : My Song"
    if (inMetadata) {
      const kvMatch = /^\s{4,}(\w[\w\s]*\w|\w+)\s*:\s*(.+)$/.exec(line);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        const value = kvMatch[2].trim();
        // Skip internal/technical keys
        if (!["encoder", "handler_name", "vendor_id", "compatible_brands", "major_brand", "minor_version"].includes(key)) {
          // Avoid duplicates
          if (!result.metadata.find((m) => m.key === key)) {
            result.metadata.push({ key, value });
          }
        }
      } else {
        inMetadata = false;
      }
    }

    // Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 320 kb/s
    const streamMatch = /Stream #\d+:(\d+)(?:\([^)]*\))?: (Audio|Video|Subtitle): (.+)/.exec(line);
    if (streamMatch) {
      inMetadata = false;
      result.streams.push({
        index: parseInt(streamMatch[1], 10),
        type: streamMatch[2],
        codec: streamMatch[3].split(",")[0].trim(),
        details: streamMatch[3],
      });
    }
  }

  callbacks.onProgress(1);
  callbacks.onStatus("Done");
  return result;
}

/**
 * Write metadata tags to a media file using ffmpeg.
 * Uses stream copy to avoid re-encoding.
 */
export async function writeMetadata(
  file: File,
  entries: MetadataEntry[],
  callbacks: MetadataCallbacks,
  signal?: AbortSignal
): Promise<{ blob: Blob; filename: string }> {
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
  const outputName = `${baseName}-tagged.${ext}`;

  try {
    callbacks.onStatus("Reading file…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onStatus("Writing metadata…");

    const args = ["-i", inputName, "-c", "copy"];

    // Add each metadata entry
    for (const entry of entries) {
      if (entry.key && entry.value) {
        args.push("-metadata", `${entry.key}=${entry.value}`);
      }
    }

    args.push(outputName);

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

    const mimeMap: Record<string, string> = {
      mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg",
      flac: "audio/flac", wav: "audio/wav",
      mp4: "video/mp4", webm: "video/webm", mkv: "video/x-matroska",
      mov: "video/quicktime", avi: "video/x-msvideo",
    };
    const blob = new Blob([ab], { type: mimeMap[ext] || "application/octet-stream" });

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
 * Strip all metadata from a file (write with empty metadata).
 */
export async function stripMetadata(
  file: File,
  callbacks: MetadataCallbacks,
  signal?: AbortSignal
): Promise<{ blob: Blob; filename: string }> {
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
  const outputName = `${baseName}-stripped.${ext}`;

  try {
    callbacks.onStatus("Reading file…");
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    callbacks.onStatus("Stripping metadata…");

    const args = [
      "-i", inputName,
      "-c", "copy",
      "-map_metadata", "-1",
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

    const mimeMap: Record<string, string> = {
      mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg",
      flac: "audio/flac", wav: "audio/wav",
      mp4: "video/mp4", webm: "video/webm", mkv: "video/x-matroska",
      mov: "video/quicktime", avi: "video/x-msvideo",
    };
    const blob = new Blob([ab], { type: mimeMap[ext] || "application/octet-stream" });

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

export async function abortMetadataEdit(): Promise<void> {
  try {
    const ffmpeg = await loadFFmpeg();
    ffmpeg.terminate();
  } catch { /* ok */ }
  resetFFmpeg();
}
