/**
 * Audio export utilities.
 * WAV is encoded natively (lossless).
 * MP3 and OGG use the OfflineAudioContext + MediaRecorder approach.
 */

import type { ExportFormat } from "./types";

/** Encode an AudioBuffer as a WAV Blob */
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
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Interleave channels and write samples
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample =
        sample < 0 ? sample * 0x8000 : sample * 0x7fff;
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

/**
 * Encode an AudioBuffer as MP3 or OGG using OfflineAudioContext + MediaRecorder.
 * Falls back to WAV if the browser doesn't support the requested MIME type.
 */
export async function encodeCompressed(
  buffer: AudioBuffer,
  format: "mp3" | "ogg",
  bitrate?: number
): Promise<Blob> {
  const mimeType =
    format === "mp3" ? "audio/webm;codecs=opus" : "audio/ogg;codecs=opus";

  // Check if MediaRecorder supports the format
  if (
    typeof MediaRecorder === "undefined" ||
    !MediaRecorder.isTypeSupported(mimeType)
  ) {
    // Fallback: try webm, then fall back to wav
    const fallbackMime = "audio/webm;codecs=opus";
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(fallbackMime)
    ) {
      return encodeViaMediaRecorder(buffer, fallbackMime);
    }
    // Last resort: WAV
    return encodeWav(buffer);
  }

  return encodeViaMediaRecorder(buffer, mimeType, bitrate);
}

async function encodeViaMediaRecorder(
  buffer: AudioBuffer,
  mimeType: string,
  _bitrate?: number
): Promise<Blob> {
  // Create an OfflineAudioContext to render the buffer
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

  // Now play through a real AudioContext + MediaRecorder
  const ctx = new AudioContext({ sampleRate: renderedBuffer.sampleRate });
  const dest = ctx.createMediaStreamDestination();

  const playSource = ctx.createBufferSource();
  playSource.buffer = renderedBuffer;
  playSource.connect(dest);

  const recorder = new MediaRecorder(dest.stream, {
    mimeType,
    audioBitsPerSecond: _bitrate ? _bitrate * 1000 : undefined,
  });

  const chunks: Blob[] = [];

  return new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      ctx.close();
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = () => {
      ctx.close();
      reject(new Error("MediaRecorder encoding failed"));
    };

    recorder.start();
    playSource.start(0);

    // Stop recording after the buffer duration + small padding
    const durationMs = (renderedBuffer.duration + 0.1) * 1000;
    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }, durationMs);

    playSource.onended = () => {
      // Give a small delay for final data
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 100);
    };
  });
}

/** Main export function */
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
      const blob = await encodeCompressed(buffer, "mp3", bitrate);
      return {
        blob,
        extension: blob.type.includes("webm") ? "webm" : "mp3",
        mimeType: blob.type,
      };
    }
    case "ogg": {
      const blob = await encodeCompressed(buffer, "ogg", bitrate);
      return {
        blob,
        extension: blob.type.includes("webm") ? "webm" : "ogg",
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
