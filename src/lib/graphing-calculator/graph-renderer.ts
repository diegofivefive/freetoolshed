/**
 * Pure functions for rendering graphs on HTML Canvas 2D.
 * No React dependency — only receives ctx, data, and config.
 */

import type { Point, Viewport } from "./types";
import { GRID_LINE_WIDTH, AXIS_LINE_WIDTH, TRACE_POINT_RADIUS } from "./constants";

// ─── Coordinate Transforms ───────────────────────────────────────────────────

export interface CanvasSize {
  width: number;
  height: number;
}

/** Convert world (math) coordinates to canvas pixel coordinates */
export function worldToCanvas(
  worldX: number,
  worldY: number,
  viewport: Viewport,
  canvas: CanvasSize
): { x: number; y: number } {
  const scaleX = canvas.width / (viewport.xMax - viewport.xMin);
  const scaleY = canvas.height / (viewport.yMax - viewport.yMin);
  return {
    x: (worldX - viewport.xMin) * scaleX,
    y: (viewport.yMax - worldY) * scaleY, // y is inverted on canvas
  };
}

/** Convert canvas pixel coordinates to world (math) coordinates */
export function canvasToWorld(
  canvasX: number,
  canvasY: number,
  viewport: Viewport,
  canvas: CanvasSize
): { x: number; y: number } {
  const scaleX = (viewport.xMax - viewport.xMin) / canvas.width;
  const scaleY = (viewport.yMax - viewport.yMin) / canvas.height;
  return {
    x: viewport.xMin + canvasX * scaleX,
    y: viewport.yMax - canvasY * scaleY,
  };
}

// ─── Theme Colors ────────────────────────────────────────────────────────────

export interface GraphTheme {
  background: string;
  gridLine: string;
  gridLineMinor: string;
  axisLine: string;
  axisLabel: string;
  traceLabel: string;
}

export const DARK_THEME: GraphTheme = {
  background: "#0a0a0a",
  gridLine: "rgba(255, 255, 255, 0.08)",
  gridLineMinor: "rgba(255, 255, 255, 0.03)",
  axisLine: "rgba(255, 255, 255, 0.35)",
  axisLabel: "rgba(255, 255, 255, 0.5)",
  traceLabel: "rgba(255, 255, 255, 0.85)",
};

export const LIGHT_THEME: GraphTheme = {
  background: "#ffffff",
  gridLine: "rgba(0, 0, 0, 0.08)",
  gridLineMinor: "rgba(0, 0, 0, 0.03)",
  axisLine: "rgba(0, 0, 0, 0.35)",
  axisLabel: "rgba(0, 0, 0, 0.5)",
  traceLabel: "rgba(0, 0, 0, 0.85)",
};

// ─── Grid Spacing ────────────────────────────────────────────────────────────

/** Choose a "nice" grid spacing given the visible range */
function niceGridStep(range: number): number {
  const rough = range / 8; // aim for ~8 grid lines
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / magnitude;

  if (normalized < 1.5) return magnitude;
  if (normalized < 3.5) return 2 * magnitude;
  if (normalized < 7.5) return 5 * magnitude;
  return 10 * magnitude;
}

// ─── Drawing Functions ───────────────────────────────────────────────────────

/** Clear and fill background */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasSize,
  theme: GraphTheme
): void {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/** Draw grid lines and axis labels */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  canvas: CanvasSize,
  theme: GraphTheme
): void {
  const xRange = viewport.xMax - viewport.xMin;
  const yRange = viewport.yMax - viewport.yMin;
  const xStep = niceGridStep(xRange);
  const yStep = niceGridStep(yRange);

  ctx.lineWidth = GRID_LINE_WIDTH;

  // Vertical grid lines
  const xStart = Math.ceil(viewport.xMin / xStep) * xStep;
  for (let x = xStart; x <= viewport.xMax; x += xStep) {
    const px = worldToCanvas(x, 0, viewport, canvas).x;
    ctx.strokeStyle = theme.gridLine;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }

  // Horizontal grid lines
  const yStart = Math.ceil(viewport.yMin / yStep) * yStep;
  for (let y = yStart; y <= viewport.yMax; y += yStep) {
    const py = worldToCanvas(0, y, viewport, canvas).y;
    ctx.strokeStyle = theme.gridLine;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }

  // ── Axes ─────────────────────────────────────────────────────────────
  ctx.strokeStyle = theme.axisLine;
  ctx.lineWidth = AXIS_LINE_WIDTH;

  // X-axis (y=0)
  if (viewport.yMin <= 0 && viewport.yMax >= 0) {
    const py = worldToCanvas(0, 0, viewport, canvas).y;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }

  // Y-axis (x=0)
  if (viewport.xMin <= 0 && viewport.xMax >= 0) {
    const px = worldToCanvas(0, 0, viewport, canvas).x;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }

  // ── Axis Labels ──────────────────────────────────────────────────────
  ctx.fillStyle = theme.axisLabel;
  ctx.font = "11px var(--font-geist-mono, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // X-axis labels
  const xAxisY = viewport.yMin <= 0 && viewport.yMax >= 0
    ? worldToCanvas(0, 0, viewport, canvas).y + 4
    : canvas.height - 4;

  for (let x = xStart; x <= viewport.xMax; x += xStep) {
    if (Math.abs(x) < xStep * 0.001) continue; // skip 0
    const px = worldToCanvas(x, 0, viewport, canvas).x;
    const label = formatAxisLabel(x);
    ctx.fillText(label, px, Math.min(xAxisY, canvas.height - 14));
  }

  // Y-axis labels
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const yAxisX = viewport.xMin <= 0 && viewport.xMax >= 0
    ? worldToCanvas(0, 0, viewport, canvas).x + 4
    : 4;

  for (let y = yStart; y <= viewport.yMax; y += yStep) {
    if (Math.abs(y) < yStep * 0.001) continue; // skip 0
    const py = worldToCanvas(0, y, viewport, canvas).y;
    const label = formatAxisLabel(y);
    ctx.fillText(label, Math.max(yAxisX, 2), py);
  }
}

/** Draw a single function's points as a connected line with gap handling */
export function drawFunction(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  lineWidth: number,
  viewport: Viewport,
  canvas: CanvasSize
): void {
  if (points.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  let drawing = false;

  ctx.beginPath();

  for (const point of points) {
    if (isNaN(point.y) || !isFinite(point.y)) {
      // Gap — break the line
      if (drawing) {
        ctx.stroke();
        ctx.beginPath();
        drawing = false;
      }
      continue;
    }

    const { x: px, y: py } = worldToCanvas(point.x, point.y, viewport, canvas);

    // Skip points far outside canvas to avoid rendering artifacts
    if (py < -canvas.height || py > 2 * canvas.height) {
      if (drawing) {
        ctx.stroke();
        ctx.beginPath();
        drawing = false;
      }
      continue;
    }

    if (!drawing) {
      ctx.moveTo(px, py);
      drawing = true;
    } else {
      ctx.lineTo(px, py);
    }
  }

  if (drawing) {
    ctx.stroke();
  }
}

/** Draw trace crosshair and coordinate label */
export function drawTrace(
  ctx: CanvasRenderingContext2D,
  worldX: number,
  worldY: number,
  color: string,
  viewport: Viewport,
  canvas: CanvasSize,
  theme: GraphTheme
): void {
  const { x: px, y: py } = worldToCanvas(worldX, worldY, viewport, canvas);

  // Crosshair lines
  ctx.strokeStyle = theme.axisLine;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, py);
  ctx.lineTo(canvas.width, py);
  ctx.stroke();

  ctx.setLineDash([]);

  // Point dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, TRACE_POINT_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Coordinate label
  const label = `(${formatNumber(worldX)}, ${formatNumber(worldY)})`;
  ctx.font = "12px var(--font-geist-mono, monospace)";
  ctx.textAlign = px > canvas.width / 2 ? "right" : "left";
  ctx.textBaseline = py > canvas.height / 2 ? "bottom" : "top";

  const labelX = px + (px > canvas.width / 2 ? -10 : 10);
  const labelY = py + (py > canvas.height / 2 ? -10 : 10);

  // Background for readability
  const metrics = ctx.measureText(label);
  const padding = 4;
  const bgX = ctx.textAlign === "right" ? labelX - metrics.width - padding : labelX - padding;
  const bgY = ctx.textBaseline === "bottom" ? labelY - 14 - padding : labelY - padding;

  ctx.fillStyle = theme.background;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(bgX, bgY, metrics.width + padding * 2, 14 + padding * 2);
  ctx.globalAlpha = 1;

  ctx.fillStyle = theme.traceLabel;
  ctx.fillText(label, labelX, labelY);
}

/** Draw scatter plot points for stat data */
export function drawScatterPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  viewport: Viewport,
  canvas: CanvasSize
): void {
  ctx.fillStyle = color;

  for (const point of points) {
    if (isNaN(point.x) || isNaN(point.y)) continue;
    const { x: px, y: py } = worldToCanvas(point.x, point.y, viewport, canvas);

    // Only draw if within canvas bounds
    if (px >= -5 && px <= canvas.width + 5 && py >= -5 && py <= canvas.height + 5) {
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAxisLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e6 || (abs > 0 && abs < 0.01)) {
    return value.toExponential(1);
  }
  // Remove trailing zeros
  return parseFloat(value.toPrecision(6)).toString();
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 1e-10) return "0";
  if (Math.abs(value) >= 1e6 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(4);
  }
  return parseFloat(value.toPrecision(6)).toString();
}
