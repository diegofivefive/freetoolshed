import type { VisualizationParams } from "./index";

/**
 * Temperature-specific visualization: thermometer with animated fluid fill.
 * Reference marks for key temperatures.
 */
export function drawThermometer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VisualizationParams,
  progress: number
) {
  const { fromValue, toValue, fromSymbol, toSymbol, brandColor, mutedColor, textColor } = params;
  const padding = 20;

  // Draw two thermometers side by side
  const thermWidth = 24;
  const thermHeight = height - padding * 2 - 20;
  const bulbRadius = 16;
  const spacing = width / 2;

  drawSingleThermometer(
    ctx,
    spacing / 2 - thermWidth / 2,
    padding + 10,
    thermWidth,
    thermHeight,
    bulbRadius,
    fromValue,
    fromSymbol,
    brandColor,
    mutedColor,
    textColor,
    progress,
    0.8
  );

  drawSingleThermometer(
    ctx,
    spacing + spacing / 2 - thermWidth / 2,
    padding + 10,
    thermWidth,
    thermHeight,
    bulbRadius,
    toValue,
    toSymbol,
    brandColor,
    mutedColor,
    textColor,
    progress,
    0.4
  );

  // Divider line
  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(width / 2, padding);
  ctx.lineTo(width / 2, height - padding);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function drawSingleThermometer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bulbR: number,
  value: number,
  symbol: string,
  brandColor: string,
  mutedColor: string,
  textColor: string,
  progress: number,
  opacity: number
) {
  const tubeH = h - bulbR * 2;
  const tubeX = x;
  const tubeY = y;
  const bulbCX = x + w / 2;
  const bulbCY = y + tubeH + bulbR;

  // Tube outline
  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tubeX, tubeY + 6);
  ctx.quadraticCurveTo(tubeX, tubeY, tubeX + w / 2, tubeY);
  ctx.quadraticCurveTo(tubeX + w, tubeY, tubeX + w, tubeY + 6);
  ctx.lineTo(tubeX + w, tubeY + tubeH);
  ctx.lineTo(tubeX, tubeY + tubeH);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Bulb outline
  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(bulbCX, bulbCY, bulbR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Fill level: clamp value between -50 and 200 (Celsius range) for display
  const minTemp = -50;
  const maxTemp = 200;
  const clampedValue = Math.max(minTemp, Math.min(maxTemp, value));
  const fillRatio = ((clampedValue - minTemp) / (maxTemp - minTemp)) * progress;
  const fillHeight = fillRatio * tubeH;

  // Fluid fill in tube
  ctx.fillStyle = brandColor;
  ctx.globalAlpha = opacity;
  ctx.fillRect(tubeX + 2, tubeY + tubeH - fillHeight, w - 4, fillHeight);
  ctx.globalAlpha = 1;

  // Fluid fill in bulb
  ctx.fillStyle = brandColor;
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(bulbCX, bulbCY, bulbR - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Value label
  ctx.font = "600 14px var(--font-geist-mono, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;
  ctx.fillText(`${formatTemp(value)} ${symbol}`, bulbCX, bulbCY + bulbR + 6);

  // Reference marks
  ctx.font = "400 9px var(--font-geist-sans, sans-serif)";
  ctx.fillStyle = mutedColor;
  ctx.globalAlpha = 0.5;
  ctx.textAlign = "left";

  const marks = [
    { temp: 0, label: "Freeze" },
    { temp: 100, label: "Boil" },
    { temp: 37, label: "Body" },
  ];

  for (const mark of marks) {
    const markRatio = (mark.temp - minTemp) / (maxTemp - minTemp);
    const markY = tubeY + tubeH - markRatio * tubeH;
    if (markY > tubeY && markY < tubeY + tubeH) {
      ctx.beginPath();
      ctx.moveTo(tubeX + w + 3, markY);
      ctx.lineTo(tubeX + w + 8, markY);
      ctx.strokeStyle = mutedColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(mark.label, tubeX + w + 10, markY - 4);
    }
  }
  ctx.globalAlpha = 1;
}

function formatTemp(v: number): string {
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(1);
}
