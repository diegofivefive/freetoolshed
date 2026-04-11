import { pickSupportedMimeType, StreamError } from "./stream";
import type { QualityPreset } from "./types";

/**
 * Result of mixing system audio + mic into a single track suitable for a
 * MediaRecorder input. When only one source is requested we use it directly
 * (no WebAudio overhead). When both are requested we create an AudioContext
 * destination and merge them.
 */
export interface AudioMix {
  /** Null when neither audio source was requested or available. */
  audioTrack: MediaStreamTrack | null;
  /** Tear down the WebAudio graph (no-op when no mixing was needed). */
  cleanup: () => void;
}

export interface AudioMixRequest {
  system: boolean;
  mic: boolean;
}

/**
 * Pick the audio tracks the user asked for and return a single recordable
 * audio track, mixing via WebAudio when both sources are requested.
 */
export function buildAudioMix(
  displayStream: MediaStream | null,
  userStream: MediaStream | null,
  want: AudioMixRequest,
): AudioMix {
  const sysTrack = want.system
    ? (displayStream?.getAudioTracks()[0] ?? null)
    : null;
  const micTrack = want.mic
    ? (userStream?.getAudioTracks()[0] ?? null)
    : null;

  if (sysTrack && micTrack) {
    const AudioCtor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtor();
    const dest = ctx.createMediaStreamDestination();
    // Wrap each track in its own MediaStream so createMediaStreamSource
    // doesn't swallow extras from the parent.
    const sysSrc = ctx.createMediaStreamSource(new MediaStream([sysTrack]));
    const micSrc = ctx.createMediaStreamSource(new MediaStream([micTrack]));
    sysSrc.connect(dest);
    micSrc.connect(dest);
    const mixed = dest.stream.getAudioTracks()[0] ?? null;
    return {
      audioTrack: mixed,
      cleanup: () => {
        try {
          sysSrc.disconnect();
          micSrc.disconnect();
        } catch {
          /* ignore */
        }
        ctx.close().catch(() => {
          /* already closed */
        });
      },
    };
  }

  if (sysTrack) {
    return { audioTrack: sysTrack, cleanup: () => {} };
  }
  if (micTrack) {
    return { audioTrack: micTrack, cleanup: () => {} };
  }
  return { audioTrack: null, cleanup: () => {} };
}

/** Combine the compositor's video stream with an optional audio track. */
export function buildRecordingStream(
  videoStream: MediaStream,
  audioTrack: MediaStreamTrack | null,
): MediaStream {
  const tracks: MediaStreamTrack[] = [];
  const videoTrack = videoStream.getVideoTracks()[0];
  if (videoTrack) tracks.push(videoTrack);
  if (audioTrack) tracks.push(audioTrack);
  return new MediaStream(tracks);
}

export interface RecorderSetup {
  recorder: MediaRecorder;
  mimeType: string;
}

/**
 * Build a MediaRecorder with the correct MIME type and bitrates for the
 * active quality preset. Throws a `StreamError` if no supported container
 * format is available (extremely rare on desktop browsers).
 */
export function createRecorder(
  stream: MediaStream,
  preset: QualityPreset,
): RecorderSetup {
  const mimeType = pickSupportedMimeType();
  if (!mimeType) {
    throw new StreamError(
      "This browser can't encode WebM video. Try a recent Chrome, Edge, or Firefox.",
      "unsupported",
    );
  }
  if (typeof MediaRecorder === "undefined") {
    throw new StreamError(
      "MediaRecorder isn't supported in this browser.",
      "unsupported",
    );
  }
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: preset.videoBitsPerSecond,
    audioBitsPerSecond: 128_000,
  });
  return { recorder, mimeType };
}
