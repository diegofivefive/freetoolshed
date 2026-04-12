import type { VisualizationParams } from "./index";

/**
 * Mass-specific visualization: balance scale that tilts based on relative values.
 */
export function drawBalanceScale(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VisualizationParams,
  progress: number
) {
  const { fromValue, toValue, fromSymbol, toSymbol, brandColor, mutedColor, textColor } = params;

  const centerX = width / 2;
  const baseY = height - 20;
  const pivotY = 35;

  // Calculate tilt angle based on value ratio (max ±15 degrees)
  const absFrom = Math.abs(fromValue);
  const absTo = Math.abs(toValue);
  const maxVal = Math.max(absFrom, absTo, 1e-20);
  const ratio = absFrom / maxVal - absTo / maxVal; // -1 to 1
  const maxAngle = 15 * (Math.PI / 180);
  const angle = ratio * maxAngle * progress;

  // Base / stand
  ctx.strokeStyle = mutedColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;

  // Vertical post
  ctx.beginPath();
  ctx.moveTo(centerX, baseY);
  ctx.lineTo(centerX, pivotY);
  ctx.stroke();

  // Base triangle
  ctx.beginPath();
  ctx.moveTo(centerX - 30, baseY);
  ctx.lineTo(centerX + 30, baseY);
  ctx.lineTo(centerX, baseY - 12);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Pivot dot
  ctx.fillStyle = brandColor;
  ctx.beginPath();
  ctx.arc(centerX, pivotY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Beam
  const beamLength = width * 0.35;

  ctx.save();
  ctx.translate(centerX, pivotY);
  ctx.rotate(angle);

  ctx.strokeStyle = mutedColor;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-beamLength, 0);
  ctx.lineTo(beamLength, 0);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Left pan (from)
  const panWidth = 50;
  const chainLength = 30;

  // Chains
  ctx.strokeStyle = mutedColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(-beamLength, 0);
  ctx.lineTo(-beamLength, chainLength);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Pan
  ctx.fillStyle = brandColor;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(-beamLength, chainLength + 5, panWidth / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // From label
  ctx.font = "600 11px var(--font-geist-mono, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;
  ctx.fillText(formatMass(fromValue), -beamLength, chainLength + 18);
  ctx.font = "400 10px var(--font-geist-mono, monospace)";
  ctx.fillStyle = mutedColor;
  ctx.fillText(fromSymbol, -beamLength, chainLength + 33);

  // Right pan (to)
  ctx.strokeStyle = mutedColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(beamLength, 0);
  ctx.lineTo(beamLength, chainLength);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = brandColor;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(beamLength, chainLength + 5, panWidth / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // To label
  ctx.font = "600 11px var(--font-geist-mono, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;
  ctx.fillText(formatMass(toValue), beamLength, chainLength + 18);
  ctx.font = "400 10px var(--font-geist-mono, monospace)";
  ctx.fillStyle = mutedColor;
  ctx.fillText(toSymbol, beamLength, chainLength + 33);

  ctx.restore();
}

function formatMass(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + "K";
  if (Number.isInteger(v)) return v.toString();
  return v.toPrecision(4);
}
