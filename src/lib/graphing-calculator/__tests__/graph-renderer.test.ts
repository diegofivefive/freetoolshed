import { describe, it, expect } from "vitest";
import {
  worldToCanvas,
  canvasToWorld,
} from "@/lib/graphing-calculator/graph-renderer";
import type { CanvasSize } from "@/lib/graphing-calculator/graph-renderer";
import type { Viewport } from "@/lib/graphing-calculator/types";

const VP: Viewport = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const CANVAS: CanvasSize = { width: 800, height: 600 };

// ─── worldToCanvas ───────────────────────────────────────────────────────────

describe("worldToCanvas", () => {
  it("origin (0,0) maps to center of canvas", () => {
    const { x, y } = worldToCanvas(0, 0, VP, CANVAS);
    expect(x).toBeCloseTo(400, 4);
    expect(y).toBeCloseTo(300, 4);
  });

  it("xMin maps to left edge (x=0)", () => {
    const { x } = worldToCanvas(-10, 0, VP, CANVAS);
    expect(x).toBeCloseTo(0, 4);
  });

  it("xMax maps to right edge (x=800)", () => {
    const { x } = worldToCanvas(10, 0, VP, CANVAS);
    expect(x).toBeCloseTo(800, 4);
  });

  it("yMax maps to top edge (y=0, canvas y inverted)", () => {
    const { y } = worldToCanvas(0, 10, VP, CANVAS);
    expect(y).toBeCloseTo(0, 4);
  });

  it("yMin maps to bottom edge (y=600)", () => {
    const { y } = worldToCanvas(0, -10, VP, CANVAS);
    expect(y).toBeCloseTo(600, 4);
  });

  it("(5, 5) maps to (600, 150)", () => {
    const { x, y } = worldToCanvas(5, 5, VP, CANVAS);
    expect(x).toBeCloseTo(600, 4);
    expect(y).toBeCloseTo(150, 4);
  });
});

// ─── canvasToWorld ───────────────────────────────────────────────────────────

describe("canvasToWorld", () => {
  it("center of canvas maps to origin (0,0)", () => {
    const { x, y } = canvasToWorld(400, 300, VP, CANVAS);
    expect(x).toBeCloseTo(0, 4);
    expect(y).toBeCloseTo(0, 4);
  });

  it("top-left (0,0) maps to (xMin, yMax)", () => {
    const { x, y } = canvasToWorld(0, 0, VP, CANVAS);
    expect(x).toBeCloseTo(-10, 4);
    expect(y).toBeCloseTo(10, 4);
  });

  it("bottom-right maps to (xMax, yMin)", () => {
    const { x, y } = canvasToWorld(800, 600, VP, CANVAS);
    expect(x).toBeCloseTo(10, 4);
    expect(y).toBeCloseTo(-10, 4);
  });
});

// ─── Round-trip ──────────────────────────────────────────────────────────────

describe("coordinate round-trip", () => {
  const testPoints = [
    { wx: 0, wy: 0 },
    { wx: 5, wy: -3 },
    { wx: -7.5, wy: 8.2 },
    { wx: 10, wy: 10 },
    { wx: -10, wy: -10 },
    { wx: 0.001, wy: -0.001 },
  ];

  for (const { wx, wy } of testPoints) {
    it(`world→canvas→world: (${wx}, ${wy})`, () => {
      const canvas = worldToCanvas(wx, wy, VP, CANVAS);
      const world = canvasToWorld(canvas.x, canvas.y, VP, CANVAS);
      expect(world.x).toBeCloseTo(wx, 8);
      expect(world.y).toBeCloseTo(wy, 8);
    });
  }

  it("works with non-symmetric viewport", () => {
    const vp: Viewport = { xMin: 0, xMax: 100, yMin: -50, yMax: 50 };
    const cs: CanvasSize = { width: 1000, height: 500 };
    const world = { wx: 37, wy: 12 };
    const c = worldToCanvas(world.wx, world.wy, vp, cs);
    const back = canvasToWorld(c.x, c.y, vp, cs);
    expect(back.x).toBeCloseTo(world.wx, 8);
    expect(back.y).toBeCloseTo(world.wy, 8);
  });

  it("works with tiny viewport (high zoom)", () => {
    const vp: Viewport = { xMin: -0.001, xMax: 0.001, yMin: -0.001, yMax: 0.001 };
    const cs: CanvasSize = { width: 800, height: 600 };
    const world = { wx: 0.0005, wy: -0.0003 };
    const c = worldToCanvas(world.wx, world.wy, vp, cs);
    const back = canvasToWorld(c.x, c.y, vp, cs);
    expect(back.x).toBeCloseTo(world.wx, 8);
    expect(back.y).toBeCloseTo(world.wy, 8);
  });
});
