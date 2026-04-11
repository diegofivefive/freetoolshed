import { describe, it, expect } from "vitest";
import { DEFAULT_VIEWPORT, FUNCTION_COLORS } from "@/lib/graphing-calculator/constants";
import type { CalcMode, AngleMode } from "@/lib/graphing-calculator/types";

describe("smoke tests", () => {
  it("vitest pipeline works", () => {
    expect(1 + 1).toBe(2);
  });

  it("constants are importable and valid", () => {
    expect(DEFAULT_VIEWPORT.xMin).toBe(-10);
    expect(DEFAULT_VIEWPORT.xMax).toBe(10);
    expect(FUNCTION_COLORS).toHaveLength(10);
  });

  it("types are usable", () => {
    const mode: CalcMode = "graph";
    const angle: AngleMode = "radian";
    expect(mode).toBe("graph");
    expect(angle).toBe("radian");
  });
});
