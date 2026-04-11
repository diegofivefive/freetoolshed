import { describe, it, expect } from "vitest";
import {
  sum,
  mean,
  median,
  mode,
  sumOfSquares,
  variance,
  standardDeviation,
  fiveNumberSummary,
  linearRegression,
  quadraticRegression,
  exponentialRegression,
  powerRegression,
} from "@/lib/graphing-calculator/stats";

// ─── Sum ─────────────────────────────────────────────────────────────────────

describe("sum", () => {
  it("sums [1,2,3,4,5] = 15", () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
  });

  it("empty array = 0", () => {
    expect(sum([])).toBe(0);
  });

  it("negative numbers", () => {
    expect(sum([-3, -2, 5])).toBe(0);
  });
});

// ─── Mean ────────────────────────────────────────────────────────────────────

describe("mean", () => {
  it("[1,2,3,4,5] = 3", () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });

  it("[10, 20, 30] = 20", () => {
    expect(mean([10, 20, 30])).toBe(20);
  });

  it("single element", () => {
    expect(mean([7])).toBe(7);
  });

  it("throws on empty", () => {
    expect(() => mean([])).toThrow();
  });
});

// ─── Median ──────────────────────────────────────────────────────────────────

describe("median", () => {
  it("odd count [1,2,3,4,5] = 3", () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
  });

  it("even count [1,2,3,4] = 2.5", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("unsorted input [5,1,3,2,4] = 3", () => {
    expect(median([5, 1, 3, 2, 4])).toBe(3);
  });

  it("single element", () => {
    expect(median([42])).toBe(42);
  });

  it("two elements [1,9] = 5", () => {
    expect(median([1, 9])).toBe(5);
  });

  it("throws on empty", () => {
    expect(() => median([])).toThrow();
  });
});

// ─── Mode ────────────────────────────────────────────────────────────────────

describe("mode", () => {
  it("[1,2,2,3,3,3] = [3]", () => {
    expect(mode([1, 2, 2, 3, 3, 3])).toEqual([3]);
  });

  it("bimodal [1,1,2,2,3] = [1,2]", () => {
    expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2]);
  });

  it("no repeats → empty", () => {
    expect(mode([1, 2, 3, 4])).toEqual([]);
  });

  it("empty → empty", () => {
    expect(mode([])).toEqual([]);
  });
});

// ─── Variance & Standard Deviation ───────────────────────────────────────────
// TI-84 reference: for [1,2,3,4,5], Sx = 1.58114, σx = 1.41421

describe("variance and standardDeviation", () => {
  const data = [1, 2, 3, 4, 5];

  it("sample variance of [1,2,3,4,5] = 2.5", () => {
    expect(variance(data)).toBe(2.5);
  });

  it("population variance of [1,2,3,4,5] = 2.0", () => {
    expect(variance(data, true)).toBe(2);
  });

  it("sample stdev (Sx) of [1,2,3,4,5] ≈ 1.5811", () => {
    expect(standardDeviation(data)).toBeCloseTo(1.5811, 4);
  });

  it("population stdev (σx) of [1,2,3,4,5] ≈ 1.4142", () => {
    expect(standardDeviation(data, true)).toBeCloseTo(1.4142, 4);
  });

  it("sample variance throws on single element", () => {
    expect(() => variance([5])).toThrow();
  });

  it("population stdev of single element = 0", () => {
    expect(standardDeviation([5], true)).toBe(0);
  });

  // TI-84 reference: {2, 4, 4, 4, 5, 5, 7, 9} → Sx = 2.1381, σx = 2.0
  it("TI-84 reference dataset Sx ≈ 2.1381", () => {
    const ref = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(standardDeviation(ref)).toBeCloseTo(2.1381, 4);
  });

  it("TI-84 reference dataset σx = 2.0", () => {
    const ref = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(standardDeviation(ref, true)).toBeCloseTo(2.0, 4);
  });
});

// ─── Five-Number Summary ─────────────────────────────────────────────────────
// TI-84 reference: {1,2,3,4,5,6,7,8,9,10}
// min=1, Q1=3, Med=5.5, Q3=8, max=10

describe("fiveNumberSummary", () => {
  it("even dataset [1..10]", () => {
    const result = fiveNumberSummary([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.min).toBe(1);
    expect(result.q1).toBe(3);
    expect(result.median).toBe(5.5);
    expect(result.q3).toBe(8);
    expect(result.max).toBe(10);
  });

  // TI-84: {1,3,5,7,9} → min=1, Q1=2, Med=5, Q3=8, max=9
  it("odd dataset [1,3,5,7,9]", () => {
    const result = fiveNumberSummary([1, 3, 5, 7, 9]);
    expect(result.min).toBe(1);
    expect(result.q1).toBe(2);
    expect(result.median).toBe(5);
    expect(result.q3).toBe(8);
    expect(result.max).toBe(9);
  });

  it("single element", () => {
    const result = fiveNumberSummary([5]);
    expect(result.min).toBe(5);
    expect(result.median).toBe(5);
    expect(result.max).toBe(5);
  });

  it("two elements [3,7]", () => {
    const result = fiveNumberSummary([3, 7]);
    expect(result.min).toBe(3);
    expect(result.median).toBe(5);
    expect(result.max).toBe(7);
  });

  it("throws on empty", () => {
    expect(() => fiveNumberSummary([])).toThrow();
  });
});

// ─── Linear Regression ───────────────────────────────────────────────────────

describe("linearRegression", () => {
  it("perfect positive correlation [1,2,3] vs [2,4,6]", () => {
    const result = linearRegression([1, 2, 3], [2, 4, 6]);
    expect(result.a).toBeCloseTo(2, 8);
    expect(result.b).toBeCloseTo(0, 8);
    expect(result.r).toBeCloseTo(1, 8);
    expect(result.r2).toBeCloseTo(1, 8);
  });

  it("perfect negative correlation [1,2,3] vs [6,4,2]", () => {
    const result = linearRegression([1, 2, 3], [6, 4, 2]);
    expect(result.a).toBeCloseTo(-2, 8);
    expect(result.b).toBeCloseTo(8, 8);
    expect(result.r).toBeCloseTo(-1, 8);
  });

  // Anscombe's quartet dataset 1:
  // x: 10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5
  // y: 8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68
  // TI-84: a ≈ 0.5001, b ≈ 3.0001, r ≈ 0.8164
  it("Anscombe's quartet dataset 1", () => {
    const x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
    const y = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68];
    const result = linearRegression(x, y);
    expect(result.a).toBeCloseTo(0.5001, 3);
    expect(result.b).toBeCloseTo(3.0001, 3);
    expect(result.r).toBeCloseTo(0.8164, 3);
  });

  // Anscombe's quartet dataset 2 (same regression line):
  it("Anscombe's quartet dataset 2", () => {
    const x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
    const y = [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74];
    const result = linearRegression(x, y);
    expect(result.a).toBeCloseTo(0.5, 2);
    expect(result.b).toBeCloseTo(3.0, 1);
    expect(result.r).toBeCloseTo(0.8162, 3);
  });

  it("horizontal line (zero slope)", () => {
    const result = linearRegression([1, 2, 3, 4], [5, 5, 5, 5]);
    expect(result.a).toBeCloseTo(0, 8);
    expect(result.b).toBeCloseTo(5, 8);
    expect(result.r).toBeCloseTo(0, 8);
  });

  it("throws on mismatched lengths", () => {
    expect(() => linearRegression([1, 2], [1])).toThrow();
  });

  it("throws on < 2 points", () => {
    expect(() => linearRegression([1], [1])).toThrow();
  });
});

// ─── Quadratic Regression ────────────────────────────────────────────────────

describe("quadraticRegression", () => {
  // Perfect parabola y = x²
  it("perfect y = x² from [1,2,3,4,5]", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [1, 4, 9, 16, 25];
    const result = quadraticRegression(x, y);
    expect(result.a).toBeCloseTo(1, 6);
    expect(result.b).toBeCloseTo(0, 6);
    expect(result.c).toBeCloseTo(0, 6);
    expect(result.r2).toBeCloseTo(1, 6);
  });

  // y = 2x² - 3x + 1
  it("y = 2x² - 3x + 1", () => {
    const x = [-2, -1, 0, 1, 2, 3];
    const y = x.map((xi) => 2 * xi * xi - 3 * xi + 1);
    const result = quadraticRegression(x, y);
    expect(result.a).toBeCloseTo(2, 4);
    expect(result.b).toBeCloseTo(-3, 4);
    expect(result.c).toBeCloseTo(1, 4);
    expect(result.r2).toBeCloseTo(1, 4);
  });

  // Noisy data — R² should be high but not 1
  it("noisy parabolic data has R² < 1 but > 0.9", () => {
    const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const y = [1.2, 0.8, 3.5, 8.9, 17.1, 24.8, 37.2, 49.5, 65.1, 80.3, 101.5];
    const result = quadraticRegression(x, y);
    expect(result.r2).toBeGreaterThan(0.99);
    expect(result.a).toBeGreaterThan(0.9);
  });

  it("throws on < 3 points", () => {
    expect(() => quadraticRegression([1, 2], [1, 4])).toThrow();
  });
});

// ─── Exponential Regression ──────────────────────────────────────────────────

describe("exponentialRegression", () => {
  // Perfect y = 2 * 3^x
  it("perfect y = 2 * 3^x", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [2, 6, 18, 54, 162];
    const result = exponentialRegression(x, y);
    expect(result.a).toBeCloseTo(2, 4);
    expect(result.b).toBeCloseTo(3, 4);
    expect(result.r2).toBeCloseTo(1, 4);
  });

  // Decay: y = 100 * 0.5^x
  it("decay y = 100 * 0.5^x", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [100, 50, 25, 12.5, 6.25];
    const result = exponentialRegression(x, y);
    expect(result.a).toBeCloseTo(100, 2);
    expect(result.b).toBeCloseTo(0.5, 4);
    expect(result.r2).toBeCloseTo(1, 4);
  });

  it("throws on y <= 0", () => {
    expect(() => exponentialRegression([1, 2, 3], [1, -1, 3])).toThrow();
  });
});

// ─── Power Regression ────────────────────────────────────────────────────────

describe("powerRegression", () => {
  // Perfect y = 3 * x^2
  it("perfect y = 3 * x²", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [3, 12, 27, 48, 75];
    const result = powerRegression(x, y);
    expect(result.a).toBeCloseTo(3, 4);
    expect(result.b).toBeCloseTo(2, 4);
    expect(result.r2).toBeCloseTo(1, 4);
  });

  // Square root: y = 5 * x^0.5
  it("y = 5 * sqrt(x)", () => {
    const x = [1, 4, 9, 16, 25];
    const y = [5, 10, 15, 20, 25];
    const result = powerRegression(x, y);
    expect(result.a).toBeCloseTo(5, 4);
    expect(result.b).toBeCloseTo(0.5, 4);
    expect(result.r2).toBeCloseTo(1, 4);
  });

  it("throws on x <= 0", () => {
    expect(() => powerRegression([0, 1, 2], [1, 2, 3])).toThrow();
  });

  it("throws on y <= 0", () => {
    expect(() => powerRegression([1, 2, 3], [1, 0, 3])).toThrow();
  });
});

// ─── Large Dataset Stability ─────────────────────────────────────────────────

describe("numerical stability", () => {
  it("mean of 100 identical values", () => {
    const data = Array(100).fill(42);
    expect(mean(data)).toBe(42);
    expect(standardDeviation(data, true)).toBe(0);
  });

  it("LinReg with 100 points on y = 2x + 1", () => {
    const x = Array.from({ length: 100 }, (_, i) => i);
    const y = x.map((xi) => 2 * xi + 1);
    const result = linearRegression(x, y);
    expect(result.a).toBeCloseTo(2, 8);
    expect(result.b).toBeCloseTo(1, 8);
    expect(result.r).toBeCloseTo(1, 8);
  });

  it("large values: mean of [1e10, 1e10+1, 1e10+2]", () => {
    const data = [1e10, 1e10 + 1, 1e10 + 2];
    expect(mean(data)).toBeCloseTo(1e10 + 1, 4);
  });
});
