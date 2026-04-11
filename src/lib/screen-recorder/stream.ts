import { SUPPORTED_MIME_TYPES } from "./constants";
import type { QualityPreset } from "./types";

/**
 * Classes of errors we surface to the UI. The `kind` lets callers branch on
 * recoverability without string-matching messages.
 */
export type StreamErrorKind =
  | "permission"
  | "not-found"
  | "busy"
  | "aborted"
  | "unsupported"
  | "unknown";

export class StreamError extends Error {
  kind: StreamErrorKind;
  constructor(message: string, kind: StreamErrorKind) {
    super(message);
    this.name = "StreamError";
    this.kind = kind;
  }
}

type MediaContext = "display" | "user";

function mapDomException(err: DOMException, context: MediaContext): StreamError {
  switch (err.name) {
    case "NotAllowedError":
      return new StreamError(
        context === "display"
          ? "Screen sharing was blocked. Click Start Recording and choose Allow in the browser prompt."
          : "Camera or microphone access was blocked. Check your browser's site permissions and try again.",
        "permission",
      );
    case "AbortError":
      return new StreamError(
        context === "display"
          ? "You closed the screen picker. Click Start Recording to try again."
          : "Camera or microphone request was canceled.",
        "aborted",
      );
    case "NotFoundError":
      return new StreamError(
        context === "display"
          ? "No shareable screen or window was found."
          : "No camera or microphone was detected on this device.",
        "not-found",
      );
    case "NotReadableError":
      return new StreamError(
        context === "display"
          ? "Another app is using your screen. Close it and try again."
          : "Your camera or microphone is already in use by another app.",
        "busy",
      );
    case "OverconstrainedError":
      return new StreamError(
        "The requested quality isn't supported by your camera or screen. Try a lower preset.",
        "unsupported",
      );
    default:
      return new StreamError(
        err.message || "Couldn't access the media device.",
        "unknown",
      );
  }
}

function toStreamError(err: unknown, context: MediaContext): StreamError {
  if (err instanceof StreamError) return err;
  if (err instanceof DOMException) return mapDomException(err, context);
  if (err instanceof Error)
    return new StreamError(err.message, "unknown");
  return new StreamError("Couldn't access the media device.", "unknown");
}

/**
 * Ask the browser for a screen / window / tab stream. The quality preset drives
 * the requested frame rate and resolution — browsers treat these as hints, not
 * hard constraints.
 */
export async function requestDisplayStream(
  preset: QualityPreset,
  captureSystemAudio: boolean,
): Promise<MediaStream> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getDisplayMedia
  ) {
    throw new StreamError(
      "Your browser doesn't support screen recording. Try Chrome, Edge, or Firefox on desktop.",
      "unsupported",
    );
  }
  try {
    const constraints: DisplayMediaStreamOptions = {
      video: {
        frameRate: { ideal: preset.frameRate, max: preset.frameRate },
        width: { ideal: preset.width },
        height: { ideal: preset.height },
      },
      audio: captureSystemAudio,
    };
    return await navigator.mediaDevices.getDisplayMedia(constraints);
  } catch (err) {
    throw toStreamError(err, "display");
  }
}

export interface UserMediaRequest {
  video: boolean;
  audio: boolean;
}

/**
 * Ask for camera / microphone access. Returns `null` when neither was
 * requested so callers don't need to branch.
 */
export async function requestUserStream(
  req: UserMediaRequest,
): Promise<MediaStream | null> {
  if (!req.video && !req.audio) return null;
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new StreamError(
      "Your browser doesn't support camera or microphone capture.",
      "unsupported",
    );
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: req.video
        ? { width: { ideal: 1280 }, height: { ideal: 720 } }
        : false,
      audio: req.audio,
    });
  } catch (err) {
    throw toStreamError(err, "user");
  }
}

/** Stop every track on a stream. Safe to call with null. */
export function stopStream(stream: MediaStream | null | undefined) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      /* ignore — track may already be ended */
    }
  }
}

/**
 * Return the highest-priority MIME type MediaRecorder supports in this
 * browser, or `null` if none of our candidates work (unlikely — every modern
 * desktop browser handles at least `video/webm`).
 */
export function pickSupportedMimeType(): string | null {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof MediaRecorder.isTypeSupported !== "function"
  ) {
    return null;
  }
  for (const mime of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}
