import type { UnitDefinition } from "./types";
import { convert } from "./engine";

export interface GraphTheme {
  background: string;
  gridLine: string;
  axisLine: string;
  axisLabel: string;
  curveLine: string;
  dotFill: string;
  dotRing: string;
  crosshair: string;
  crosshairLabel: string;
}

export interface GraphRenderParams {
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  currentValue: number;
  theme: GraphTheme;
  mousePos: { x: number; y: number } | null;
  time: number; // for pulsing dot animation
}

/**
 * Draw the conversion function graph.
 * Shows the relationship between input and output units as a curve,
 * with a pulsing dot at the current value.
 */
export function drawConversionGraph(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: GraphRenderParams
) {
  const { fromUnit, toUnit, currentValue, theme, mousePos, time } = params;
  const padding = { top: 16, right: 20, bottom: 36, left: 56 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  if (plotW < 20 || plotH < 20) return;

  // ─── Determine axis ranges ─────────────────────────────────────────
  // For function-based units (temperature, fuel economy), include negative
  // values and widen the range to reveal nonlinear/offset behavior.
  const isFunction =
    "toBase" in fromUnit || "toBase" in toUnit;
  const absVal = Math.abs(currentValue) || 1;

  let xMin: number;
  let xMax: number;

  if (isFunction) {
    // Show a wide range centered around current value
    const span = Math.max(absVal * 2, 100);
    xMin = currentValue - span;
    xMax = currentValue + span;
  } else {
    xMin = 0;
    xMax = Math.max(absVal * 2, 1);
  }

  // Sample the conversion at several points to find y range
  const samples = 60;
  const xValues: number[] = [];
  const yValues: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (i / samples) * (xMax - xMin);
    const y = convert(x, fromUnit, toUnit);
    if (Number.isFinite(y)) {
      xValues.push(x);
      yValues.push(y);
    }
  }

  if (yValues.length < 2) return;

  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yRange = yMax - yMin || 1;
  const yPadding = yRange * 0.1;
  const yStart = yMin - yPadding;
  const yEnd = yMax + yPadding;

  // Coordinate transforms
  const toCanvasX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toCanvasY = (y: number) => padding.top + plotH - ((y - yStart) / (yEnd - yStart)) * plotH;
  const fromCanvasX = (cx: number) => xMin + ((cx - padding.left) / plotW) * (xMax - xMin);

  // ─── Grid lines ────────────────────────────────────────────────────
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;

  const xTicks = niceTickCount(xMin, xMax, 6);
  const yTicks = niceTickCount(yStart, yEnd, 5);

  for (const tick of xTicks) {
    const cx = toCanvasX(tick);
    ctx.beginPath();
    ctx.moveTo(cx, padding.top);
    ctx.lineTo(cx, padding.top + plotH);
    ctx.stroke();
  }

  for (const tick of yTicks) {
    const cy = toCanvasY(tick);
    ctx.beginPath();
    ctx.moveTo(padding.left, cy);
    ctx.lineTo(padding.left + plotW, cy);
    ctx.stroke();
  }

  // ─── Axis labels ───────────────────────────────────────────────────
  ctx.font = "400 10px var(--font-geist-mono, monospace)";
  ctx.fillStyle = theme.axisLabel;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (const tick of xTicks) {
    ctx.fillText(formatAxisLabel(tick), toCanvasX(tick), padding.top + plotH + 6);
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const tick of yTicks) {
    ctx.fillText(formatAxisLabel(tick), padding.left - 6, toCanvasY(tick));
  }

  // Axis unit labels
  ctx.font = "600 10px var(--font-geist-mono, monospace)";
  ctx.fillStyle = theme.axisLabel;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(fromUnit.symbol, padding.left + plotW / 2, height - 6);

  ctx.save();
  ctx.translate(12, padding.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(toUnit.symbol, 0, 0);
  ctx.restore();

  // ─── Axis lines ────────────────────────────────────────────────────
  ctx.strokeStyle = theme.axisLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + plotH);
  ctx.lineTo(padding.left + plotW, padding.top + plotH);
  ctx.stroke();

  // ─── Conversion curve ──────────────────────────────────────────────
  ctx.strokeStyle = theme.curveLine;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  let started = false;
  for (let i = 0; i < xValues.length; i++) {
    const cx = toCanvasX(xValues[i]);
    const cy = toCanvasY(yValues[i]);
    if (!started) {
      ctx.moveTo(cx, cy);
      started = true;
    } else {
      ctx.lineTo(cx, cy);
    }
  }
  ctx.stroke();

  // ─── Current value dot (pulsing) ───────────────────────────────────
  const currentY = convert(currentValue, fromUnit, toUnit);
  if (Number.isFinite(currentY)) {
    const dotX = toCanvasX(currentValue);
    const dotY = toCanvasY(currentY);

    // Pulsing ring
    const pulse = Math.sin(time * 3) * 0.5 + 0.5; // 0 to 1
    const ringRadius = 6 + pulse * 4;
    ctx.strokeStyle = theme.dotRing;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3 + pulse * 0.2;
    ctx.beginPath();
    ctx.arc(dotX, dotY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Solid dot
    ctx.fillStyle = theme.dotFill;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Mouse crosshair ──────────────────────────────────────────────
  if (mousePos && mousePos.x >= padding.left && mousePos.x <= padding.left + plotW) {
    const mx = mousePos.x;
    const inputVal = fromCanvasX(mx);
    const outputVal = convert(inputVal, fromUnit, toUnit);

    if (Number.isFinite(outputVal)) {
      const my = toCanvasY(outputVal);

      // Crosshair lines
      ctx.strokeStyle = theme.crosshair;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(mx, padding.top);
      ctx.lineTo(mx, padding.top + plotH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding.left, my);
      ctx.lineTo(padding.left + plotW, my);
      ctx.stroke();

      ctx.setLineDash([]);

      // Crosshair dot
      ctx.fillStyle = theme.crosshair;
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();

      // Value label
      ctx.font = "500 10px var(--font-geist-mono, monospace)";
      ctx.fillStyle = theme.crosshairLabel;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      const label = `${formatAxisLabel(inputVal)} ${fromUnit.symbol} = ${formatAxisLabel(outputVal)} ${toUnit.symbol}`;
      const labelX = Math.min(mx + 8, width - ctx.measureText(label).width - 8);
      const labelY = Math.max(my - 8, padding.top + 14);
      ctx.fillText(label, labelX, labelY);
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function niceTickCount(min: number, max: number, targetCount: number): number[] {
  const range = max - min;
  if (range === 0) return [min];

  const roughStep = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceStep: number;
  if (normalized <= 1.5) niceStep = 1;
  else if (normalized <= 3.5) niceStep = 2;
  else if (normalized <= 7.5) niceStep = 5;
  else niceStep = 10;
  niceStep *= magnitude;

  const start = Math.ceil(min / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += niceStep) {
    ticks.push(Math.round(t * 1e10) / 1e10); // avoid floating point noise
  }
  return ticks;
}

function formatAxisLabel(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e6) return (value / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + "K";
  if (abs === 0) return "0";
  if (abs < 0.01) return value.toExponential(1);
  if (Number.isInteger(value)) return value.toString();
  if (abs < 1) return value.toFixed(3);
  return value.toFixed(1);
}
