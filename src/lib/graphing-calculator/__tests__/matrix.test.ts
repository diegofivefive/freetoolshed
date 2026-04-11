import { describe, it, expect } from "vitest";
import {
  matrixDimensions,
  identity,
  matrixAdd,
  matrixSubtract,
  scalarMultiply,
  matrixMultiply,
  transpose,
  determinant,
  inverse,
  rref,
} from "@/lib/graphing-calculator/matrix";

// Helper: compare matrices with tolerance
function expectMatrixClose(actual: number[][], expected: number[][], digits = 8) {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i].length).toBe(expected[i].length);
    for (let j = 0; j < actual[i].length; j++) {
      expect(actual[i][j]).toBeCloseTo(expected[i][j], digits);
    }
  }
}

// ─── Dimensions & Identity ─────────────────────────────────���─────────────────

describe("matrixDimensions", () => {
  it("2x3 matrix", () => {
    expect(matrixDimensions([[1, 2, 3], [4, 5, 6]])).toEqual([2, 3]);
  });

  it("empty matrix", () => {
    expect(matrixDimensions([])).toEqual([0, 0]);
  });
});

describe("identity", () => {
  it("3x3 identity", () => {
    expect(identity(3)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  it("1x1 identity", () => {
    expect(identity(1)).toEqual([[1]]);
  });

  it("throws on n < 1", () => {
    expect(() => identity(0)).toThrow();
  });
});

// ─── Addition & Subtraction ──────────────────────────────────────────────────

describe("matrixAdd", () => {
  it("2x2 addition", () => {
    const a = [[1, 2], [3, 4]];
    const b = [[5, 6], [7, 8]];
    expect(matrixAdd(a, b)).toEqual([[6, 8], [10, 12]]);
  });

  it("throws on dimension mismatch", () => {
    expect(() => matrixAdd([[1, 2]], [[1], [2]])).toThrow(/Dimension mismatch/);
  });
});

describe("matrixSubtract", () => {
  it("2x2 subtraction", () => {
    const a = [[5, 6], [7, 8]];
    const b = [[1, 2], [3, 4]];
    expect(matrixSubtract(a, b)).toEqual([[4, 4], [4, 4]]);
  });
});

// ─── Scalar Multiply ──────────────────���───────────────────────────────���──────

describe("scalarMultiply", () => {
  it("multiply by 3", () => {
    expect(scalarMultiply([[1, 2], [3, 4]], 3)).toEqual([[3, 6], [9, 12]]);
  });

  it("multiply by 0", () => {
    expect(scalarMultiply([[1, 2], [3, 4]], 0)).toEqual([[0, 0], [0, 0]]);
  });

  it("multiply by -1", () => {
    expect(scalarMultiply([[1, -2], [3, 4]], -1)).toEqual([[-1, 2], [-3, -4]]);
  });
});

// ─── Matrix Multiply ─────────────────────────────────────────────────────────

describe("matrixMultiply", () => {
  it("2x2 * 2x2", () => {
    const a = [[1, 2], [3, 4]];
    const b = [[5, 6], [7, 8]];
    // [1*5+2*7, 1*6+2*8] = [19, 22]
    // [3*5+4*7, 3*6+4*8] = [43, 50]
    expect(matrixMultiply(a, b)).toEqual([[19, 22], [43, 50]]);
  });

  it("2x3 * 3x2", () => {
    const a = [[1, 2, 3], [4, 5, 6]];
    const b = [[7, 8], [9, 10], [11, 12]];
    expect(matrixMultiply(a, b)).toEqual([[58, 64], [139, 154]]);
  });

  it("A * I = A", () => {
    const a = [[1, 2], [3, 4]];
    expect(matrixMultiply(a, identity(2))).toEqual(a);
  });

  it("I * A = A", () => {
    const a = [[1, 2], [3, 4]];
    expect(matrixMultiply(identity(2), a)).toEqual(a);
  });

  it("throws on non-conformable", () => {
    expect(() => matrixMultiply([[1, 2]], [[1, 2]])).toThrow(/Non-conformable/);
  });
});

// ─── Transpose ─────────────────────────────��───────────────────────────────���─

describe("transpose", () => {
  it("2x3 → 3x2", () => {
    const m = [[1, 2, 3], [4, 5, 6]];
    expect(transpose(m)).toEqual([[1, 4], [2, 5], [3, 6]]);
  });

  it("(A^T)^T = A", () => {
    const a = [[1, 2, 3], [4, 5, 6]];
    expect(transpose(transpose(a))).toEqual(a);
  });

  it("1x1 transpose", () => {
    expect(transpose([[5]])).toEqual([[5]]);
  });

  it("symmetric matrix unchanged", () => {
    const sym = [[1, 2, 3], [2, 5, 6], [3, 6, 9]];
    expect(transpose(sym)).toEqual(sym);
  });
});

// ─── Determinant ──────────────────────────────────────────────────────��──────

describe("determinant", () => {
  it("1x1: det([[7]]) = 7", () => {
    expect(determinant([[7]])).toBe(7);
  });

  it("2x2: det([[1,2],[3,4]]) = -2", () => {
    expect(determinant([[1, 2], [3, 4]])).toBeCloseTo(-2, 10);
  });

  it("3x3 known: det([[6,1,1],[4,-2,5],[2,8,7]]) = -306", () => {
    expect(determinant([[6, 1, 1], [4, -2, 5], [2, 8, 7]])).toBeCloseTo(-306, 8);
  });

  it("identity det = 1", () => {
    expect(determinant(identity(4))).toBeCloseTo(1, 10);
  });

  it("singular matrix det = 0", () => {
    expect(determinant([[1, 2], [2, 4]])).toBeCloseTo(0, 10);
  });

  it("det of row-swapped identity = -1", () => {
    expect(determinant([[0, 1], [1, 0]])).toBeCloseTo(-1, 10);
  });

  it("throws on non-square", () => {
    expect(() => determinant([[1, 2, 3], [4, 5, 6]])).toThrow();
  });

  // Cofactor expansion: 2*(0*3-2*1) - 3*(1*3-2*4) + 1*(1*1-0*4) = -4+15+1 = 12
  it("3x3 det [[2,3,1],[1,0,2],[4,1,3]] = 12", () => {
    expect(determinant([[2, 3, 1], [1, 0, 2], [4, 1, 3]])).toBeCloseTo(12, 8);
  });
});

// ─── Inverse ───────────────────────────────────���─────────────────────────────

describe("inverse", () => {
  it("2x2: A * A^-1 = I", () => {
    const a = [[1, 2], [3, 4]];
    const inv = inverse(a);
    const product = matrixMultiply(a, inv);
    expectMatrixClose(product, identity(2), 8);
  });

  it("3x3: A * A^-1 = I", () => {
    const a = [[2, 3, 1], [1, 0, 2], [4, 1, 3]];
    const inv = inverse(a);
    const product = matrixMultiply(a, inv);
    expectMatrixClose(product, identity(3), 8);
  });

  it("inverse of identity is identity", () => {
    expectMatrixClose(inverse(identity(3)), identity(3));
  });

  it("throws on singular matrix", () => {
    expect(() => inverse([[1, 2], [2, 4]])).toThrow(/singular/i);
  });

  // TI-84 reference: [[4,7],[2,6]]^-1 = [[0.6,-0.7],[-0.2,0.4]]
  it("TI-84 reference 2x2 inverse", () => {
    const inv = inverse([[4, 7], [2, 6]]);
    expectMatrixClose(inv, [[0.6, -0.7], [-0.2, 0.4]], 8);
  });
});

// ─── RREF ─────────────────────────────────────────────────────────────────���──

describe("rref", () => {
  // System: 2x + y = 5, x - y = 1 → x=2, y=1
  it("2x2 system: 2x+y=5, x-y=1 → [[1,0,2],[0,1,1]]", () => {
    const result = rref([[2, 1, 5], [1, -1, 1]]);
    expectMatrixClose(result, [[1, 0, 2], [0, 1, 1]]);
  });

  // 3x3 system: x+y+z=6, 2y+5z=−4, 2x+5y−z=27 → x=5, y=3, z=−2
  it("3x3 system → x=5, y=3, z=-2", () => {
    const result = rref([
      [1, 1, 1, 6],
      [0, 2, 5, -4],
      [2, 5, -1, 27],
    ]);
    expectMatrixClose(result, [
      [1, 0, 0, 5],
      [0, 1, 0, 3],
      [0, 0, 1, -2],
    ]);
  });

  // Inconsistent system: x+y=1, x+y=2 → no solution (row of zeros except last)
  it("inconsistent system has contradiction row", () => {
    const result = rref([[1, 1, 1], [1, 1, 2]]);
    // Second row should be [0, 0, 1] indicating inconsistency
    expect(result[1][0]).toBeCloseTo(0, 10);
    expect(result[1][1]).toBeCloseTo(0, 10);
    expect(result[1][2]).toBeCloseTo(1, 10);
  });

  // Underdetermined: x + y + z = 3 (one equation, three unknowns)
  it("underdetermined system preserves free variables", () => {
    const result = rref([[1, 1, 1, 3]]);
    expectMatrixClose(result, [[1, 1, 1, 3]]);
  });

  // Identity augmented → identity
  it("identity matrix rref is identity", () => {
    const result = rref([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    expectMatrixClose(result, identity(3));
  });

  // Zero matrix
  it("zero matrix stays zero", () => {
    const result = rref([[0, 0], [0, 0]]);
    expectMatrixClose(result, [[0, 0], [0, 0]]);
  });

  // TI-84 reference: [[1,2,3,9],[2,-1,1,8],[3,0,-1,3]] → [[1,0,0,2],[0,1,0,-1],[0,0,1,3]]
  it("TI-84 reference 3x4 rref", () => {
    const result = rref([
      [1, 2, 3, 9],
      [2, -1, 1, 8],
      [3, 0, -1, 3],
    ]);
    expectMatrixClose(result, [
      [1, 0, 0, 2],
      [0, 1, 0, -1],
      [0, 0, 1, 3],
    ], 8);
  });
});
