/**
 * Statistics module — descriptive stats and regression functions.
 * All implementations match TI-84 output conventions.
 */

// ─── Descriptive Statistics ──────────────────────────────────────────────────

export function sum(data: number[]): number {
  return data.reduce((acc, v) => acc + v, 0);
}

export function mean(data: number[]): number {
  if (data.length === 0) throw new Error("Cannot compute mean of empty dataset");
  return sum(data) / data.length;
}

export function median(data: number[]): number {
  if (data.length === 0) throw new Error("Cannot compute median of empty dataset");
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function mode(data: number[]): number[] {
  if (data.length === 0) return [];
  const freq = new Map<number, number>();
  for (const v of data) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  const maxFreq = Math.max(...freq.values());
  if (maxFreq === 1) return []; // no repeated values → no mode
  const modes: number[] = [];
  for (const [val, count] of freq) {
    if (count === maxFreq) modes.push(val);
  }
  return modes.sort((a, b) => a - b);
}

export function sumOfSquares(data: number[]): number {
  return data.reduce((acc, v) => acc + v * v, 0);
}

/**
 * Variance.
 * population=false (default) → sample variance (divide by n-1), matches TI-84 Sx²
 * population=true → population variance (divide by n), matches TI-84 σx²
 */
export function variance(data: number[], population = false): number {
  if (data.length === 0) throw new Error("Cannot compute variance of empty dataset");
  if (!population && data.length < 2) {
    throw new Error("Sample variance requires at least 2 data points");
  }
  const m = mean(data);
  const sumSqDev = data.reduce((acc, v) => acc + (v - m) ** 2, 0);
  return sumSqDev / (population ? data.length : data.length - 1);
}

/**
 * Standard deviation.
 * population=false → sample (Sx on TI-84)
 * population=true → population (σx on TI-84)
 */
export function standardDeviation(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

// ─── Five-Number Summary ─────────────────────────────────────────────────────

export interface FiveNumberSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

/**
 * Five-number summary using the TI-84 method for quartiles:
 * - Sort data
 * - Median splits the data into lower and upper halves
 * - Q1 = median of lower half, Q3 = median of upper half
 * - For odd n, the overall median is excluded from both halves
 */
export function fiveNumberSummary(data: number[]): FiveNumberSummary {
  if (data.length === 0) throw new Error("Cannot compute summary of empty dataset");
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const med = median(sorted);

  const mid = Math.floor(n / 2);
  const lowerHalf = sorted.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  return {
    min: sorted[0],
    q1: lowerHalf.length > 0 ? median(lowerHalf) : sorted[0],
    median: med,
    q3: upperHalf.length > 0 ? median(upperHalf) : sorted[n - 1],
    max: sorted[n - 1],
  };
}

// ─── Regression ──────────────────────────────────────────────────────────────

export interface LinearRegressionResult {
  a: number; // slope
  b: number; // intercept
  r: number; // correlation coefficient
  r2: number;
}

/**
 * Linear regression: y = ax + b
 * Matches TI-84 LinReg(ax+b)
 */
export function linearRegression(
  x: number[],
  y: number[]
): LinearRegressionResult {
  if (x.length !== y.length) throw new Error("x and y must have same length");
  if (x.length < 2) throw new Error("Need at least 2 data points");

  const n = x.length;
  const sumX = sum(x);
  const sumY = sum(y);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = sumOfSquares(x);
  const sumY2 = sumOfSquares(y);

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-15) {
    throw new Error("Cannot compute regression: x values are constant");
  }

  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;

  // Pearson correlation coefficient
  const numerR = n * sumXY - sumX * sumY;
  const denomR = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
  const r = denomR === 0 ? 0 : numerR / denomR;

  return { a, b, r, r2: r * r };
}

export interface QuadraticRegressionResult {
  a: number;
  b: number;
  c: number;
  r2: number;
}

/**
 * Quadratic regression: y = ax² + bx + c
 * Matches TI-84 QuadReg
 * Uses normal equations solved via 3x3 system.
 */
export function quadraticRegression(
  x: number[],
  y: number[]
): QuadraticRegressionResult {
  if (x.length !== y.length) throw new Error("x and y must have same length");
  if (x.length < 3) throw new Error("Need at least 3 data points for quadratic regression");

  const n = x.length;

  // Build sums for normal equations
  let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0;
  let sy = 0, sxy = 0, sx2y = 0;

  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    const xi2 = xi * xi;
    sx += xi;
    sx2 += xi2;
    sx3 += xi2 * xi;
    sx4 += xi2 * xi2;
    sy += yi;
    sxy += xi * yi;
    sx2y += xi2 * yi;
  }

  // Normal equations: M * [a, b, c]^T = V
  // | sx4  sx3  sx2 |   | a |   | sx2y |
  // | sx3  sx2  sx  | * | b | = | sxy  |
  // | sx2  sx   n   |   | c |   | sy   |

  const M = [
    [sx4, sx3, sx2],
    [sx3, sx2, sx],
    [sx2, sx, n],
  ];
  const V = [sx2y, sxy, sy];

  const coeffs = solveSystem3x3(M, V);
  const a = coeffs[0];
  const b = coeffs[1];
  const c = coeffs[2];

  // Compute R² = 1 - SS_res / SS_tot
  const yMean = sy / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = a * x[i] * x[i] + b * x[i] + c;
    ssRes += (y[i] - yPred) ** 2;
    ssTot += (y[i] - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { a, b, c, r2 };
}

export interface ExponentialRegressionResult {
  a: number;
  b: number;
  r2: number;
}

/**
 * Exponential regression: y = a * b^x
 * Matches TI-84 ExpReg
 * Linearizes by taking ln(y), then fits ln(y) = ln(a) + x*ln(b)
 */
export function exponentialRegression(
  x: number[],
  y: number[]
): ExponentialRegressionResult {
  if (x.length !== y.length) throw new Error("x and y must have same length");
  if (x.length < 2) throw new Error("Need at least 2 data points");

  // All y values must be positive for log transform
  const lnY = y.map((yi) => {
    if (yi <= 0) throw new Error("Exponential regression requires all y > 0");
    return Math.log(yi);
  });

  const linResult = linearRegression(x, lnY);
  const a = Math.exp(linResult.b); // intercept of ln(y) = ln(a)
  const b = Math.exp(linResult.a); // slope of ln(y) = ln(b) * x

  // Compute R² in original space
  const yMean = mean(y);
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < x.length; i++) {
    const yPred = a * b ** x[i];
    ssRes += (y[i] - yPred) ** 2;
    ssTot += (y[i] - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { a, b, r2 };
}

export interface PowerRegressionResult {
  a: number;
  b: number;
  r2: number;
}

/**
 * Power regression: y = a * x^b
 * Matches TI-84 PwrReg
 * Linearizes by taking ln of both sides: ln(y) = ln(a) + b*ln(x)
 */
export function powerRegression(
  x: number[],
  y: number[]
): PowerRegressionResult {
  if (x.length !== y.length) throw new Error("x and y must have same length");
  if (x.length < 2) throw new Error("Need at least 2 data points");

  const lnX = x.map((xi) => {
    if (xi <= 0) throw new Error("Power regression requires all x > 0");
    return Math.log(xi);
  });
  const lnY = y.map((yi) => {
    if (yi <= 0) throw new Error("Power regression requires all y > 0");
    return Math.log(yi);
  });

  const linResult = linearRegression(lnX, lnY);
  const a = Math.exp(linResult.b);
  const b = linResult.a;

  // Compute R² in original space
  const yMean = mean(y);
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < x.length; i++) {
    const yPred = a * x[i] ** b;
    ssRes += (y[i] - yPred) ** 2;
    ssTot += (y[i] - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { a, b, r2 };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Solve a 3x3 linear system using Cramer's rule.
 */
function solveSystem3x3(M: number[][], V: number[]): [number, number, number] {
  const det = det3x3(M);
  if (Math.abs(det) < 1e-15) {
    throw new Error("Singular matrix in regression system");
  }

  const M0 = [
    [V[0], M[0][1], M[0][2]],
    [V[1], M[1][1], M[1][2]],
    [V[2], M[2][1], M[2][2]],
  ];
  const M1 = [
    [M[0][0], V[0], M[0][2]],
    [M[1][0], V[1], M[1][2]],
    [M[2][0], V[2], M[2][2]],
  ];
  const M2 = [
    [M[0][0], M[0][1], V[0]],
    [M[1][0], M[1][1], V[1]],
    [M[2][0], M[2][1], V[2]],
  ];

  return [det3x3(M0) / det, det3x3(M1) / det, det3x3(M2) / det];
}

function det3x3(M: number[][]): number {
  return (
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
  );
}
