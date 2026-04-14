/**
 * Audio export utilities.
 * WAV is encoded natively (lossless).
 * MP3 is encoded via lamejs (pure-JS LAME encoder).
 * OGG uses MediaRecorder (audio/ogg on Firefox, audio/webm on Chrome).
 */

import type { ExportFormat } from "./types";

// ── WAV encoder ──────────────────────────────────────────────

export function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;

  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ── MP3 encoder (via lamejs) ────────────────────────────────

/** Convert Float32Array [-1, 1] to Int16Array */
function floatTo16Bit(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

async function encodeMp3(
  buffer: AudioBuffer,
  bitrate: number
): Promise<Blob> {
  // Dynamic import — lamejs is a large CJS bundle, only load when needed
  const { Mp3Encoder } = await import("lamejs");

  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const kbps = bitrate || 192;

  const encoder = new Mp3Encoder(numChannels, sampleRate, kbps);

  const left = floatTo16Bit(buffer.getChannelData(0));
  const right = numChannels > 1
    ? floatTo16Bit(buffer.getChannelData(1))
    : left;

  const mp3Data: Uint8Array[] = [];

  // Encode in chunks of 1152 samples (LAME frame size)
  const CHUNK = 1152;
  for (let i = 0; i < left.length; i += CHUNK) {
    const leftChunk = left.subarray(i, i + CHUNK);
    const rightChunk = right.subarray(i, i + CHUNK);
    const encoded = numChannels > 1
      ? encoder.encodeBuffer(leftChunk, rightChunk)
      : encoder.encodeBuffer(leftChunk);
    if (encoded.length > 0) mp3Data.push(new Uint8Array(encoded.buffer, encoded.byteOffset, encoded.byteLength));
  }

  const tail = encoder.flush();
  if (tail.length > 0) mp3Data.push(new Uint8Array(tail.buffer, tail.byteOffset, tail.byteLength));

  return new Blob(mp3Data as BlobPart[], { type: "audio/mpeg" });
}

// ── OGG encoder (MediaRecorder) ─────────────────────────────

async function encodeOgg(
  buffer: AudioBuffer,
  bitrate: number
): Promise<Blob> {
  // Try audio/ogg first (Firefox), then fall back to audio/webm (Chrome)
  const oggMime = "audio/ogg;codecs=opus";
  const webmMime = "audio/webm;codecs=opus";

  let mimeType: string;
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(oggMime)) {
    mimeType = oggMime;
  } else if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(webmMime)) {
    mimeType = webmMime;
  } else {
    // No MediaRecorder support at all — fall back to WAV
    return encodeWav(buffer);
  }

  return encodeViaMediaRecorder(buffer, mimeType, bitrate);
}

async function encodeViaMediaRecorder(
  buffer: AudioBuffer,
  mimeType: string,
  bitrate?: number
): Promise<Blob> {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();

  const ctx = new AudioContext({ sampleRate: renderedBuffer.sampleRate });
  const dest = ctx.createMediaStreamDestination();
  const playSource = ctx.createBufferSource();
  playSource.buffer = renderedBuffer;
  playSource.connect(dest);

  const recorder = new MediaRecorder(dest.stream, {
    mimeType,
    audioBitsPerSecond: bitrate ? bitrate * 1000 : undefined,
  });

  const chunks: Blob[] = [];

  return new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      ctx.close();
      resolve(new Blob(chunks, { type: mimeType }));
    };

    recorder.onerror = () => {
      ctx.close();
      reject(new Error("MediaRecorder encoding failed"));
    };

    recorder.start();
    playSource.start(0);

    playSource.onended = () => {
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 100);
    };

    // Safety timeout
    const durationMs = (renderedBuffer.duration + 0.5) * 1000;
    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }, durationMs);
  });
}

// ── Main export function ────────────────────────────────────

export async function exportAudio(
  buffer: AudioBuffer,
  format: ExportFormat,
  bitrate?: number
): Promise<{ blob: Blob; extension: string; mimeType: string }> {
  switch (format) {
    case "wav": {
      const blob = encodeWav(buffer);
      return { blob, extension: "wav", mimeType: "audio/wav" };
    }
    case "mp3": {
      const blob = await encodeMp3(buffer, bitrate ?? 192);
      return { blob, extension: "mp3", mimeType: "audio/mpeg" };
    }
    case "ogg": {
      const blob = await encodeOgg(buffer, bitrate ?? 192);
      // Actual extension depends on what the browser produced
      const isOgg = blob.type.includes("ogg");
      return {
        blob,
        extension: isOgg ? "ogg" : "webm",
        mimeType: blob.type,
      };
    }
  }
}

/** Trigger a file download from a Blob */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
