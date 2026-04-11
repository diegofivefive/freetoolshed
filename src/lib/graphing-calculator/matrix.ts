/**
 * Matrix operations module.
 * All functions work with number[][] (row-major).
 * Matches TI-84 matrix operation behavior.
 */

import type { Matrix } from "./types";

// ─── Dimensions & Validation ─────────────────────────────────────────────────

export function matrixDimensions(m: Matrix): [number, number] {
  if (m.length === 0) return [0, 0];
  return [m.length, m[0].length];
}

function assertRectangular(m: Matrix, label = "Matrix"): void {
  if (m.length === 0) return;
  const cols = m[0].length;
  for (let i = 1; i < m.length; i++) {
    if (m[i].length !== cols) {
      throw new Error(`${label} is not rectangular: row ${i} has ${m[i].length} columns, expected ${cols}`);
    }
  }
}

// ─── Identity ────────────────────────────────────────────────────────────────

export function identity(n: number): Matrix {
  if (n < 1) throw new Error("Identity matrix size must be at least 1");
  const result: Matrix = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(0);
    row[i] = 1;
    result.push(row);
  }
  return result;
}

// ─── Addition ────────────────────────────────────────────────────────────────

export function matrixAdd(a: Matrix, b: Matrix): Matrix {
  assertRectangular(a, "A");
  assertRectangular(b, "B");
  const [ra, ca] = matrixDimensions(a);
  const [rb, cb] = matrixDimensions(b);
  if (ra !== rb || ca !== cb) {
    throw new Error(`Dimension mismatch: [${ra}x${ca}] + [${rb}x${cb}]`);
  }
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function matrixSubtract(a: Matrix, b: Matrix): Matrix {
  assertRectangular(a, "A");
  assertRectangular(b, "B");
  const [ra, ca] = matrixDimensions(a);
  const [rb, cb] = matrixDimensions(b);
  if (ra !== rb || ca !== cb) {
    throw new Error(`Dimension mismatch: [${ra}x${ca}] - [${rb}x${cb}]`);
  }
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

// ─── Scalar Multiply ─────────────────────────────────────────────────────────

export function scalarMultiply(m: Matrix, s: number): Matrix {
  assertRectangular(m);
  return m.map((row) => row.map((val) => val * s));
}

// ─── Matrix Multiply ─────────────────────────────────────────────────────────

export function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  assertRectangular(a, "A");
  assertRectangular(b, "B");
  const [ra, ca] = matrixDimensions(a);
  const [rb, cb] = matrixDimensions(b);
  if (ca !== rb) {
    throw new Error(`Non-conformable: [${ra}x${ca}] * [${rb}x${cb}]`);
  }
  const result: Matrix = [];
  for (let i = 0; i < ra; i++) {
    const row: number[] = [];
    for (let j = 0; j < cb; j++) {
      let sum = 0;
      for (let k = 0; k < ca; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

// ─── Transpose ───────────────────────────────────────────────────────────────

export function transpose(m: Matrix): Matrix {
  assertRectangular(m);
  const [rows, cols] = matrixDimensions(m);
  if (rows === 0) return [];
  const result: Matrix = [];
  for (let j = 0; j < cols; j++) {
    const row: number[] = [];
    for (let i = 0; i < rows; i++) {
      row.push(m[i][j]);
    }
    result.push(row);
  }
  return result;
}

// ─── Determinant ─────────────────────────────────────────────────────────────

export function determinant(m: Matrix): number {
  assertRectangular(m);
  const [rows, cols] = matrixDimensions(m);
  if (rows !== cols) throw new Error("Determinant requires a square matrix");
  if (rows === 0) return 1; // convention: det of empty matrix = 1

  // Use LU decomposition approach (Gaussian elimination) for efficiency
  // Work on a copy
  const a = m.map((row) => [...row]);
  const n = rows;
  let det = 1;

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    let maxVal = Math.abs(a[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > maxVal) {
        maxVal = Math.abs(a[row][col]);
        maxRow = row;
      }
    }

    if (maxVal < 1e-15) return 0; // singular

    if (maxRow !== col) {
      [a[col], a[maxRow]] = [a[maxRow], a[col]];
      det *= -1; // row swap flips sign
    }

    det *= a[col][col];

    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col];
      for (let j = col + 1; j < n; j++) {
        a[row][j] -= factor * a[col][j];
      }
      a[row][col] = 0;
    }
  }

  return det;
}

// ─── Inverse ─────────────────────────────────────────────────────────────────

export function inverse(m: Matrix): Matrix {
  assertRectangular(m);
  const [rows, cols] = matrixDimensions(m);
  if (rows !== cols) throw new Error("Inverse requires a square matrix");
  if (rows === 0) return [];

  const n = rows;

  // Augment [A | I]
  const aug: Matrix = m.map((row, i) => {
    const augRow = [...row];
    for (let j = 0; j < n; j++) {
      augRow.push(i === j ? 1 : 0);
    }
    return augRow;
  });

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }

    if (maxVal < 1e-15) {
      throw new Error("Matrix is singular and cannot be inverted");
    }

    if (maxRow !== col) {
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    }

    const pivot = aug[col][col];
    for (let j = 0; j < 2 * n; j++) {
      aug[col][j] /= pivot;
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Extract right half
  return aug.map((row) => row.slice(n));
}

// ─── RREF (Reduced Row Echelon Form) ────────────────────────────────────────

export function rref(m: Matrix): Matrix {
  assertRectangular(m);
  const [rows, cols] = matrixDimensions(m);
  if (rows === 0 || cols === 0) return [];

  const result = m.map((row) => [...row]);
  let lead = 0;

  for (let r = 0; r < rows; r++) {
    if (lead >= cols) return result;

    // Find pivot row
    let i = r;
    while (Math.abs(result[i][lead]) < 1e-15) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) return result;
      }
    }

    // Swap rows
    if (i !== r) {
      [result[r], result[i]] = [result[i], result[r]];
    }

    // Scale pivot row
    const pivotVal = result[r][lead];
    for (let j = 0; j < cols; j++) {
      result[r][j] /= pivotVal;
    }

    // Eliminate column
    for (let i2 = 0; i2 < rows; i2++) {
      if (i2 === r) continue;
      const factor = result[i2][lead];
      for (let j = 0; j < cols; j++) {
        result[i2][j] -= factor * result[r][j];
      }
    }

    lead++;
  }

  // Clean up -0 values
  for (let i2 = 0; i2 < rows; i2++) {
    for (let j = 0; j < cols; j++) {
      if (Math.abs(result[i2][j]) < 1e-12) {
        result[i2][j] = 0;
      }
    }
  }

  return result;
}
