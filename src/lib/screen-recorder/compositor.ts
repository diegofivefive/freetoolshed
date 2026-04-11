import { WEBCAM_SIZE_PX } from "./constants";
import type { QualityPreset, WebcamConfig, WebcamShape } from "./types";

export interface CompositorOptions {
  screenVideo: HTMLVideoElement;
  webcamVideo: HTMLVideoElement | null;
  /**
   * Callback read on every frame so the caller can change webcam
   * position/size/shape without tearing down the compositor.
   */
  getConfig: () => WebcamConfig;
  quality: QualityPreset;
}

export interface Compositor {
  canvas: HTMLCanvasElement;
  /** Video-only stream captured from the canvas, ready to feed MediaRecorder. */
  stream: MediaStream;
  stop: () => void;
}

/** ~24 px at 1080p — scales proportionally at other resolutions. */
const EDGE_INSET_RATIO = 0.022;

interface WebcamRect {
  x: number;
  y: number;
  size: number;
}

function computeWebcamRect(
  canvasW: number,
  canvasH: number,
  config: WebcamConfig,
): WebcamRect {
  const size = WEBCAM_SIZE_PX[config.size];
  const inset = Math.round(Math.min(canvasW, canvasH) * EDGE_INSET_RATIO);
  let x = 0;
  let y = 0;
  switch (config.position) {
    case "top-left":
      x = inset;
      y = inset;
      break;
    case "top-right":
      x = canvasW - size - inset;
      y = inset;
      break;
    case "bottom-left":
      x = inset;
      y = canvasH - size - inset;
      break;
    case "bottom-right":
      x = canvasW - size - inset;
      y = canvasH - size - inset;
      break;
  }
  return { x, y, size };
}

function tracePath(
  ctx: CanvasRenderingContext2D,
  rect: WebcamRect,
  shape: WebcamShape,
) {
  const { x, y, size } = rect;
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    return;
  }
  const radius = size * 0.08;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.arcTo(x + size, y, x + size, y + radius, radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.arcTo(x + size, y + size, x + size - radius, y + size, radius);
  ctx.lineTo(x + radius, y + size);
  ctx.arcTo(x, y + size, x, y + size - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function drawWebcamBubble(
  ctx: CanvasRenderingContext2D,
  webcamVideo: HTMLVideoElement,
  rect: WebcamRect,
  shape: WebcamShape,
) {
  const vw = webcamVideo.videoWidth;
  const vh = webcamVideo.videoHeight;
  if (vw <= 0 || vh <= 0) return;

  // Clip to the bubble path, then draw a center-cropped square from the video
  // so circles and squares both fill their box without stretching.
  ctx.save();
  tracePath(ctx, rect, shape);
  ctx.clip();

  const side = Math.min(vw, vh);
  const sx = (vw - side) / 2;
  const sy = (vh - side) / 2;
  ctx.drawImage(webcamVideo, sx, sy, side, side, rect.x, rect.y, rect.size, rect.size);
  ctx.restore();

  // Soft white border so the bubble reads against any background.
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = Math.max(2, rect.size * 0.015);
  tracePath(ctx, rect, shape);
  ctx.stroke();
  ctx.restore();
}

interface ScreenDrawRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

function computeScreenRect(
  canvasW: number,
  canvasH: number,
  videoW: number,
  videoH: number,
): ScreenDrawRect {
  if (videoW <= 0 || videoH <= 0) {
    return { dx: 0, dy: 0, dw: canvasW, dh: canvasH };
  }
  const canvasAspect = canvasW / canvasH;
  const videoAspect = videoW / videoH;
  if (videoAspect > canvasAspect) {
    // Video wider than canvas — fit width, letterbox top/bottom.
    const dh = canvasW / videoAspect;
    return { dx: 0, dy: (canvasH - dh) / 2, dw: canvasW, dh };
  }
  // Video taller — fit height, pillarbox sides.
  const dw = canvasH * videoAspect;
  return { dx: (canvasW - dw) / 2, dy: 0, dw, dh: canvasH };
}

/**
 * Build a canvas-backed compositor that draws `screenVideo` with an optional
 * webcam bubble overlay on every animation frame. The returned `stream` is
 * what the caller feeds into MediaRecorder.
 */
export function createCompositor({
  screenVideo,
  webcamVideo,
  getConfig,
  quality,
}: CompositorOptions): Compositor {
  const canvas = document.createElement("canvas");
  canvas.width = quality.width;
  canvas.height = quality.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("This browser doesn't support 2D canvas rendering.");
  }

  // Black base in case the video isn't ready on the first tick.
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let rafId: number | null = null;
  let stopped = false;

  const draw = () => {
    if (stopped) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sRect = computeScreenRect(
      canvas.width,
      canvas.height,
      screenVideo.videoWidth,
      screenVideo.videoHeight,
    );
    if (screenVideo.readyState >= 2 && screenVideo.videoWidth > 0) {
      ctx.drawImage(screenVideo, sRect.dx, sRect.dy, sRect.dw, sRect.dh);
    }

    const config = getConfig();
    if (
      config.enabled &&
      webcamVideo &&
      webcamVideo.readyState >= 2 &&
      webcamVideo.videoWidth > 0
    ) {
      const rect = computeWebcamRect(canvas.width, canvas.height, config);
      drawWebcamBubble(ctx, webcamVideo, rect, config.shape);
    }

    rafId = requestAnimationFrame(draw);
  };

  rafId = requestAnimationFrame(draw);

  const stream = canvas.captureStream(quality.frameRate);

  const stop = () => {
    stopped = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch {
        /* ignore */
      }
    }
  };

  return { canvas, stream, stop };
}
