/**
 * Parametric and polar point generation.
 */

import type { Point, AngleMode } from "./types";
import { evaluateExpression } from "./engine";

/**
 * Generate points for a parametric curve: x = f(t), y = g(t)
 */
export function generateParametricPoints(
  xtExpr: string,
  ytExpr: string,
  tMin: number,
  tMax: number,
  tStep: number,
  angleMode: AngleMode = "radian"
): Point[] {
  const points: Point[] = [];
  const steps = Math.ceil((tMax - tMin) / tStep);

  for (let i = 0; i <= steps; i++) {
    const t = tMin + i * tStep;
    const x = evaluateExpression(xtExpr, { t }, angleMode);
    const y = evaluateExpression(ytExpr, { t }, angleMode);

    if (isFinite(x) && isFinite(y)) {
      points.push({ x, y });
    } else {
      points.push({ x: NaN, y: NaN });
    }
  }

  return points;
}

/**
 * Generate points for a polar curve: r = f(theta)
 * Converts to Cartesian: x = r*cos(theta), y = r*sin(theta)
 */
export function generatePolarPoints(
  rExpr: string,
  thetaMin: number,
  thetaMax: number,
  thetaStep: number,
  angleMode: AngleMode = "radian"
): Point[] {
  const points: Point[] = [];
  const steps = Math.ceil((thetaMax - thetaMin) / thetaStep);

  for (let i = 0; i <= steps; i++) {
    const theta = thetaMin + i * thetaStep;
    const r = evaluateExpression(rExpr, { theta }, angleMode);

    if (isFinite(r)) {
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      points.push({ x, y });
    } else {
      points.push({ x: NaN, y: NaN });
    }
  }

  return points;
}
