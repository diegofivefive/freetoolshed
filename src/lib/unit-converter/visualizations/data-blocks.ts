import type { VisualizationParams } from "./index";

/**
 * Data storage visualization: stacked blocks representing byte magnitudes.
 */
export function drawDataBlocks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VisualizationParams,
  progress: number
) {
  const { fromValue, toValue, fromSymbol, toSymbol, brandColor, mutedColor, textColor } = params;
  const padding = 24;
  const halfW = (width - padding * 2) / 2;
  const blockMaxH = height - padding * 2 - 30;

  // Draw from blocks on left
  drawBlockStack(
    ctx,
    padding,
    padding + 20,
    halfW - 10,
    blockMaxH,
    fromValue,
    fromSymbol,
    brandColor,
    textColor,
    mutedColor,
    progress,
    0.7
  );

  // Draw to blocks on right
  drawBlockStack(
    ctx,
    padding + halfW + 10,
    padding + 20,
    halfW - 10,
    blockMaxH,
    toValue,
    toSymbol,
    brandColor,
    textColor,
    mutedColor,
    progress,
    0.35
  );

  // Divider
  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.15;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(width / 2, padding);
  ctx.lineTo(width / 2, height - padding);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function drawBlockStack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  maxH: number,
  value: number,
  symbol: string,
  brandColor: string,
  textColor: string,
  mutedColor: string,
  progress: number,
  opacity: number
) {
  // Determine number of blocks based on magnitude
  const absVal = Math.abs(value);
  let blocks = 1;
  if (absVal >= 1e15) blocks = 6;
  else if (absVal >= 1e12) blocks = 5;
  else if (absVal >= 1e9) blocks = 4;
  else if (absVal >= 1e6) blocks = 3;
  else if (absVal >= 1e3) blocks = 2;

  const blockGap = 3;
  const totalGaps = (blocks - 1) * blockGap;
  const blockH = Math.min(20, (maxH - totalGaps) / blocks);
  const totalHeight = blocks * blockH + totalGaps;

  const startY = y + maxH - totalHeight;

  for (let i = 0; i < blocks; i++) {
    const blockY = startY + i * (blockH + blockGap);
    const animatedW = w * progress;

    ctx.fillStyle = brandColor;
    ctx.globalAlpha = opacity - i * 0.05;

    // Rounded rect
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, blockY);
    ctx.lineTo(x + animatedW - r, blockY);
    ctx.quadraticCurveTo(x + animatedW, blockY, x + animatedW, blockY + r);
    ctx.lineTo(x + animatedW, blockY + blockH - r);
    ctx.quadraticCurveTo(x + animatedW, blockY + blockH, x + animatedW - r, blockY + blockH);
    ctx.lineTo(x + r, blockY + blockH);
    ctx.quadraticCurveTo(x, blockY + blockH, x, blockY + blockH - r);
    ctx.lineTo(x, blockY + r);
    ctx.quadraticCurveTo(x, blockY, x + r, blockY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Label
  ctx.font = "600 12px var(--font-geist-mono, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;
  ctx.fillText(formatData(value), x + w / 2, y + maxH + 4);

  ctx.font = "400 10px var(--font-geist-mono, monospace)";
  ctx.fillStyle = mutedColor;
  ctx.fillText(symbol, x + w / 2, y + maxH + 19);
}

function formatData(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e15) return (v / 1e15).toFixed(1) + " PB";
  if (abs >= 1e12) return (v / 1e12).toFixed(1) + " TB";
  if (abs >= 1e9) return (v / 1e9).toFixed(1) + " GB";
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + " MB";
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + " KB";
  if (Number.isInteger(v)) return v.toString();
  return v.toPrecision(4);
}
