import type { VisualizationParams } from "./index";

/**
 * Default visualization: two proportional horizontal bars showing relative scale.
 * Used for most categories as a fallback.
 */
export function drawBarComparison(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VisualizationParams,
  progress: number
) {
  const { fromValue, toValue, fromSymbol, toSymbol, brandColor, mutedColor, textColor } = params;
  const padding = 24;
  const barHeight = 28;
  const gap = 20;
  const labelWidth = 60;
  const barAreaWidth = width - padding * 2 - labelWidth - 16;

  const absFrom = Math.abs(fromValue);
  const absTo = Math.abs(toValue);
  const maxVal = Math.max(absFrom, absTo, 1e-20);

  const fromRatio = (absFrom / maxVal) * progress;
  const toRatio = (absTo / maxVal) * progress;

  const centerY = height / 2;
  const bar1Y = centerY - gap / 2 - barHeight;
  const bar2Y = centerY + gap / 2;

  // From bar
  const fromBarWidth = Math.max(4, fromRatio * barAreaWidth);
  ctx.fillStyle = brandColor;
  ctx.globalAlpha = 0.8;
  roundRect(ctx, padding + labelWidth + 16, bar1Y, fromBarWidth, barHeight, 6);
  ctx.fill();
  ctx.globalAlpha = 1;

  // To bar
  const toBarWidth = Math.max(4, toRatio * barAreaWidth);
  ctx.fillStyle = brandColor;
  ctx.globalAlpha = 0.4;
  roundRect(ctx, padding + labelWidth + 16, bar2Y, toBarWidth, barHeight, 6);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Labels
  ctx.font = "600 13px var(--font-geist-mono, monospace)";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  ctx.fillStyle = textColor;
  ctx.fillText(fromSymbol, padding + labelWidth, bar1Y + barHeight / 2);
  ctx.fillText(toSymbol, padding + labelWidth, bar2Y + barHeight / 2);

  // Values inside bars
  ctx.textAlign = "left";
  ctx.font = "500 11px var(--font-geist-mono, monospace)";
  ctx.fillStyle = textColor;
  const fromText = formatCompact(fromValue);
  const toText = formatCompact(toValue);

  if (fromBarWidth > 50) {
    ctx.fillText(fromText, padding + labelWidth + 24, bar1Y + barHeight / 2);
  } else {
    ctx.fillText(fromText, padding + labelWidth + fromBarWidth + 24, bar1Y + barHeight / 2);
  }

  if (toBarWidth > 50) {
    ctx.fillText(toText, padding + labelWidth + 24, bar2Y + barHeight / 2);
  } else {
    ctx.fillText(toText, padding + labelWidth + toBarWidth + 24, bar2Y + barHeight / 2);
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return (value / 1e9).toFixed(1) + "B";
  if (abs >= 1e6) return (value / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + "K";
  if (abs < 0.001 && abs > 0) return value.toExponential(1);
  if (Number.isInteger(value)) return value.toString();
  return value.toPrecision(4);
}
