import type { VisualizationParams } from "./index";

/**
 * Speed-specific visualization: arc gauge with sweeping needle.
 */
export function drawSpeedometer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VisualizationParams,
  progress: number
) {
  const { fromValue, toValue, fromSymbol, toSymbol, brandColor, mutedColor, textColor } = params;

  const halfW = width / 2;
  const gaugeRadius = Math.min(halfW - 40, height - 50) * 0.7;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 0.2;
  const totalArc = Math.PI * 1.4;

  // Draw two gauges side by side
  drawGauge(ctx, halfW / 2, height - 20, gaugeRadius, startAngle, endAngle, totalArc, fromValue, fromSymbol, brandColor, mutedColor, textColor, progress, 0.8);
  drawGauge(ctx, halfW + halfW / 2, height - 20, gaugeRadius, startAngle, endAngle, totalArc, toValue, toSymbol, brandColor, mutedColor, textColor, progress, 0.4);

  // Divider
  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.15;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(halfW, 10);
  ctx.lineTo(halfW, height - 10);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function drawGauge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  _endAngle: number,
  totalArc: number,
  value: number,
  symbol: string,
  brandColor: string,
  mutedColor: string,
  textColor: string,
  progress: number,
  opacity: number
) {
  // Background arc
  ctx.strokeStyle = mutedColor;
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, startAngle + totalArc);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Tick marks
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = mutedColor;
  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (i / 10) * totalArc;
    const innerR = radius - (i % 5 === 0 ? 12 : 6);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Value arc (filled portion)
  // Normalize value to 0-1 range for display (auto-scale)
  const displayRatio = Math.min(1, Math.max(0, progress));
  const valueAngle = startAngle + displayRatio * totalArc * 0.7; // 70% of arc for typical values

  ctx.strokeStyle = brandColor;
  ctx.lineWidth = 6;
  ctx.globalAlpha = opacity;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, valueAngle);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Needle
  const needleLength = radius - 16;
  ctx.strokeStyle = brandColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.cos(valueAngle) * needleLength,
    cy + Math.sin(valueAngle) * needleLength
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Center dot
  ctx.fillStyle = brandColor;
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Value text
  ctx.font = "600 13px var(--font-geist-mono, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = textColor;
  ctx.fillText(formatSpeed(value), cx, cy - 8);

  ctx.font = "400 10px var(--font-geist-mono, monospace)";
  ctx.fillStyle = mutedColor;
  ctx.fillText(symbol, cx, cy + 6);
}

function formatSpeed(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + "K";
  if (Number.isInteger(v)) return v.toString();
  return v.toPrecision(4);
}
