import { describe, it, expect } from "vitest";
import {
  generateParametricPoints,
  generatePolarPoints,
} from "@/lib/graphing-calculator/parametric";

// ─── Parametric Points ───────────────────────────────────────────────────────

describe("generateParametricPoints", () => {
  it("unit circle: cos(t), sin(t) for t=[0, 2pi]", () => {
    const points = generateParametricPoints(
      "cos(t)", "sin(t)", 0, 2 * Math.PI, Math.PI / 60
    );
    // All points should lie on unit circle (x²+y² ≈ 1)
    const realPoints = points.filter((p) => !isNaN(p.x));
    expect(realPoints.length).toBeGreaterThan(100);
    for (const p of realPoints) {
      expect(p.x * p.x + p.y * p.y).toBeCloseTo(1, 4);
    }
  });

  it("circle starts at (1,0) and ends near (1,0)", () => {
    const points = generateParametricPoints(
      "cos(t)", "sin(t)", 0, 2 * Math.PI, Math.PI / 60
    );
    const real = points.filter((p) => !isNaN(p.x));
    expect(real[0].x).toBeCloseTo(1, 4);
    expect(real[0].y).toBeCloseTo(0, 4);
    expect(real[real.length - 1].x).toBeCloseTo(1, 2);
    expect(real[real.length - 1].y).toBeCloseTo(0, 2);
  });

  it("straight line: x=t, y=2t for t=[0,5]", () => {
    const points = generateParametricPoints("t", "2*t", 0, 5, 1);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[1]).toEqual({ x: 1, y: 2 });
    expect(points[5]).toEqual({ x: 5, y: 10 });
  });

  it("Lissajous: sin(2t), sin(3t) produces valid points", () => {
    const points = generateParametricPoints(
      "sin(2*t)", "sin(3*t)", 0, 2 * Math.PI, Math.PI / 60
    );
    const real = points.filter((p) => !isNaN(p.x));
    expect(real.length).toBeGreaterThan(100);
    // All coordinates bounded by [-1, 1]
    for (const p of real) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(1.0001);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(1.0001);
    }
  });

  it("ellipse: 3*cos(t), 2*sin(t)", () => {
    const points = generateParametricPoints(
      "3*cos(t)", "2*sin(t)", 0, 2 * Math.PI, Math.PI / 30
    );
    const real = points.filter((p) => !isNaN(p.x));
    // Check ellipse equation: (x/3)² + (y/2)² ≈ 1
    for (const p of real) {
      expect((p.x / 3) ** 2 + (p.y / 2) ** 2).toBeCloseTo(1, 3);
    }
  });

  it("handles invalid expression gracefully (NaN points)", () => {
    const points = generateParametricPoints("1/0", "t", 0, 1, 0.5);
    expect(points.length).toBeGreaterThan(0);
    // 1/0 = Infinity → should become NaN
    expect(points.every((p) => isNaN(p.x))).toBe(true);
  });
});

// ─── Polar Points ────────────────────────────────────────────────────────────

describe("generatePolarPoints", () => {
  it("unit circle: r=1 for theta=[0, 2pi]", () => {
    const points = generatePolarPoints("1", 0, 2 * Math.PI, Math.PI / 60);
    const real = points.filter((p) => !isNaN(p.x));
    expect(real.length).toBeGreaterThan(100);
    // All points at distance 1 from origin
    for (const p of real) {
      expect(Math.sqrt(p.x * p.x + p.y * p.y)).toBeCloseTo(1, 4);
    }
  });

  it("circle r=1 starts at (1,0)", () => {
    const points = generatePolarPoints("1", 0, 2 * Math.PI, Math.PI / 60);
    expect(points[0].x).toBeCloseTo(1, 6);
    expect(points[0].y).toBeCloseTo(0, 6);
  });

  it("cardioid: r = 1 + cos(theta)", () => {
    const points = generatePolarPoints(
      "1 + cos(theta)", 0, 2 * Math.PI, Math.PI / 60
    );
    const real = points.filter((p) => !isNaN(p.x));
    expect(real.length).toBeGreaterThan(100);
    // At theta=0, r=2 → x=2, y=0
    expect(real[0].x).toBeCloseTo(2, 4);
    expect(real[0].y).toBeCloseTo(0, 4);
  });

  it("four-petal rose: r = cos(2*theta)", () => {
    const points = generatePolarPoints(
      "cos(2*theta)", 0, 2 * Math.PI, Math.PI / 120
    );
    const real = points.filter((p) => !isNaN(p.x));
    expect(real.length).toBeGreaterThan(200);
    // r at theta=0 should be 1 → point at (1,0)
    expect(real[0].x).toBeCloseTo(1, 4);
    expect(real[0].y).toBeCloseTo(0, 4);
    // r at theta=pi/4 should be 0
    const pi4Index = Math.round((Math.PI / 4) / (Math.PI / 120));
    const dist = Math.sqrt(real[pi4Index].x ** 2 + real[pi4Index].y ** 2);
    expect(dist).toBeCloseTo(0, 2);
  });

  it("spiral: r = theta", () => {
    const points = generatePolarPoints("theta", 0, 4 * Math.PI, Math.PI / 30);
    const real = points.filter((p) => !isNaN(p.x));
    expect(real.length).toBeGreaterThan(100);
    // Distance from origin should increase monotonically
    for (let i = 1; i < real.length; i++) {
      const d1 = Math.sqrt(real[i - 1].x ** 2 + real[i - 1].y ** 2);
      const d2 = Math.sqrt(real[i].x ** 2 + real[i].y ** 2);
      expect(d2).toBeGreaterThanOrEqual(d1 - 0.01); // small tolerance for float
    }
  });

  it("handles negative r correctly (reflects through origin)", () => {
    // r = -1 at theta=0 → point at (-1, 0)
    const points = generatePolarPoints("-1", 0, 0, 1);
    expect(points[0].x).toBeCloseTo(-1, 6);
    expect(points[0].y).toBeCloseTo(0, 6);
  });
});
