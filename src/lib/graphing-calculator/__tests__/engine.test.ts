import { describe, it, expect } from "vitest";
import {
  evaluateExpression,
  evaluateAtX,
  validateExpression,
  parseExpression,
  generatePoints,
} from "@/lib/graphing-calculator/engine";

// ─── Basic Arithmetic ────────────────────────────────────────────────────────

describe("evaluateExpression: basic arithmetic", () => {
  it("addition", () => {
    expect(evaluateExpression("2 + 3")).toBe(5);
  });

  it("subtraction", () => {
    expect(evaluateExpression("10 - 4")).toBe(6);
  });

  it("multiplication", () => {
    expect(evaluateExpression("6 * 7")).toBe(42);
  });

  it("division", () => {
    expect(evaluateExpression("10 / 4")).toBe(2.5);
  });

  it("exponentiation", () => {
    expect(evaluateExpression("2^8")).toBe(256);
  });

  it("modulo", () => {
    expect(evaluateExpression("17 mod 5")).toBe(2);
  });

  it("negative numbers", () => {
    expect(evaluateExpression("-3 + 5")).toBe(2);
  });

  it("decimal arithmetic", () => {
    expect(evaluateExpression("0.1 + 0.2")).toBeCloseTo(0.3, 10);
  });
});

// ─── Order of Operations ─────────────────────────────────────────────────────

describe("evaluateExpression: order of operations", () => {
  it("multiplication before addition: 2 + 3 * 4 = 14", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe(14);
  });

  it("parentheses override: (2 + 3) * 4 = 20", () => {
    expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
  });

  it("nested parentheses: ((1 + 2) * (3 + 4)) = 21", () => {
    expect(evaluateExpression("((1 + 2) * (3 + 4))")).toBe(21);
  });

  it("exponent before multiplication: 2 * 3^2 = 18", () => {
    expect(evaluateExpression("2 * 3^2")).toBe(18);
  });

  it("complex precedence: 2^3 + 4 * 5 - 6 / 2 = 25", () => {
    expect(evaluateExpression("2^3 + 4 * 5 - 6 / 2")).toBe(25);
  });

  it("left-to-right for same precedence: 10 - 3 - 2 = 5", () => {
    expect(evaluateExpression("10 - 3 - 2")).toBe(5);
  });
});

// ─── Trigonometric Functions (Radian Mode) ───────────────────────────────────

describe("evaluateExpression: trig functions (radian)", () => {
  it("sin(0) = 0", () => {
    expect(evaluateExpression("sin(0)")).toBeCloseTo(0, 10);
  });

  it("sin(pi/2) = 1", () => {
    expect(evaluateExpression("sin(pi/2)")).toBeCloseTo(1, 10);
  });

  it("cos(0) = 1", () => {
    expect(evaluateExpression("cos(0)")).toBeCloseTo(1, 10);
  });

  it("cos(pi) = -1", () => {
    expect(evaluateExpression("cos(pi)")).toBeCloseTo(-1, 10);
  });

  it("tan(pi/4) ≈ 1", () => {
    expect(evaluateExpression("tan(pi/4)")).toBeCloseTo(1, 8);
  });

  it("sin(pi) ≈ 0", () => {
    expect(evaluateExpression("sin(pi)")).toBeCloseTo(0, 10);
  });

  it("asin(1) = pi/2", () => {
    expect(evaluateExpression("asin(1)")).toBeCloseTo(Math.PI / 2, 8);
  });

  it("acos(0) = pi/2", () => {
    expect(evaluateExpression("acos(0)")).toBeCloseTo(Math.PI / 2, 8);
  });

  it("atan(1) = pi/4", () => {
    expect(evaluateExpression("atan(1)")).toBeCloseTo(Math.PI / 4, 8);
  });
});

// ─── Trigonometric Functions (Degree Mode) ───────────────────────────────────

describe("evaluateExpression: trig functions (degree)", () => {
  it("sin(90) = 1 in degree mode", () => {
    expect(evaluateExpression("sin(90)", {}, "degree")).toBeCloseTo(1, 8);
  });

  it("sin(0) = 0 in degree mode", () => {
    expect(evaluateExpression("sin(0)", {}, "degree")).toBeCloseTo(0, 10);
  });

  it("cos(180) = -1 in degree mode", () => {
    expect(evaluateExpression("cos(180)", {}, "degree")).toBeCloseTo(-1, 8);
  });

  it("cos(60) = 0.5 in degree mode", () => {
    expect(evaluateExpression("cos(60)", {}, "degree")).toBeCloseTo(0.5, 8);
  });

  it("tan(45) = 1 in degree mode", () => {
    expect(evaluateExpression("tan(45)", {}, "degree")).toBeCloseTo(1, 8);
  });

  it("sin(30) = 0.5 in degree mode", () => {
    expect(evaluateExpression("sin(30)", {}, "degree")).toBeCloseTo(0.5, 8);
  });

  it("asin(1) = 90 in degree mode", () => {
    expect(evaluateExpression("asin(1)", {}, "degree")).toBeCloseTo(90, 4);
  });

  it("acos(0.5) = 60 in degree mode", () => {
    expect(evaluateExpression("acos(0.5)", {}, "degree")).toBeCloseTo(60, 4);
  });

  it("atan(1) = 45 in degree mode", () => {
    expect(evaluateExpression("atan(1)", {}, "degree")).toBeCloseTo(45, 4);
  });
});

// ─── Logarithms & Exponentials ───────────────────────────────────────────────

describe("evaluateExpression: logarithms and exponentials", () => {
  it("log(1) = 0 (natural log)", () => {
    expect(evaluateExpression("log(1)")).toBeCloseTo(0, 10);
  });

  it("log(e) = 1 (natural log)", () => {
    expect(evaluateExpression("log(e)")).toBeCloseTo(1, 10);
  });

  it("log10(10) = 1", () => {
    expect(evaluateExpression("log10(10)")).toBeCloseTo(1, 10);
  });

  it("log10(100) = 2", () => {
    expect(evaluateExpression("log10(100)")).toBeCloseTo(2, 10);
  });

  it("log2(8) = 3", () => {
    expect(evaluateExpression("log2(8)")).toBeCloseTo(3, 10);
  });

  it("ln(e) = 1", () => {
    expect(evaluateExpression("ln(e)")).toBeCloseTo(1, 10);
  });

  it("ln(1) = 0", () => {
    expect(evaluateExpression("ln(1)")).toBeCloseTo(0, 10);
  });

  it("e^0 = 1", () => {
    expect(evaluateExpression("e^0")).toBe(1);
  });

  it("e^1 ≈ 2.71828", () => {
    expect(evaluateExpression("e^1")).toBeCloseTo(Math.E, 4);
  });

  it("exp(2) = e^2", () => {
    expect(evaluateExpression("exp(2)")).toBeCloseTo(Math.E ** 2, 8);
  });
});

// ─── Square Root, Abs, Floor, Ceil ───────────────────────────────────────────

describe("evaluateExpression: misc math functions", () => {
  it("sqrt(9) = 3", () => {
    expect(evaluateExpression("sqrt(9)")).toBe(3);
  });

  it("sqrt(2) ≈ 1.41421", () => {
    expect(evaluateExpression("sqrt(2)")).toBeCloseTo(Math.SQRT2, 8);
  });

  it("cbrt(27) = 3", () => {
    expect(evaluateExpression("cbrt(27)")).toBe(3);
  });

  it("abs(-5) = 5", () => {
    expect(evaluateExpression("abs(-5)")).toBe(5);
  });

  it("floor(3.7) = 3", () => {
    expect(evaluateExpression("floor(3.7)")).toBe(3);
  });

  it("ceil(3.2) = 4", () => {
    expect(evaluateExpression("ceil(3.2)")).toBe(4);
  });

  it("round(3.5) = 4", () => {
    expect(evaluateExpression("round(3.5)")).toBe(4);
  });
});

// ─── Variables and Scope ─────────────────────────────────────────────────────

describe("evaluateExpression: variables", () => {
  it("evaluates x^2 with x=3 → 9", () => {
    expect(evaluateExpression("x^2", { x: 3 })).toBe(9);
  });

  it("evaluates 2*x + 1 with x=5 → 11", () => {
    expect(evaluateExpression("2*x + 1", { x: 5 })).toBe(11);
  });

  it("evaluates multi-variable: a*b + c with a=2,b=3,c=4 → 10", () => {
    expect(evaluateExpression("a*b + c", { a: 2, b: 3, c: 4 })).toBe(10);
  });

  it("evaluateAtX convenience: sin(x) at x=0 → 0", () => {
    expect(evaluateAtX("sin(x)", 0)).toBeCloseTo(0, 10);
  });

  it("evaluateAtX: x^2 - 4 at x=2 → 0", () => {
    expect(evaluateAtX("x^2 - 4", 2)).toBe(0);
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe("evaluateExpression: edge cases", () => {
  it("division by zero returns Infinity", () => {
    expect(evaluateExpression("1/0")).toBe(Infinity);
  });

  it("0/0 returns NaN", () => {
    expect(evaluateExpression("0/0")).toBeNaN();
  });

  it("0^0 = 1", () => {
    expect(evaluateExpression("0^0")).toBe(1);
  });

  it("sqrt(-1) returns NaN (real mode)", () => {
    expect(evaluateExpression("sqrt(-1)")).toBeNaN();
  });

  it("log(-1) returns NaN", () => {
    expect(evaluateExpression("ln(-1)")).toBeNaN();
  });

  it("very large numbers: 10^308", () => {
    expect(evaluateExpression("10^308")).toBe(1e308);
  });

  it("Infinity arithmetic: Infinity + 1 = Infinity", () => {
    expect(evaluateExpression("Infinity + 1")).toBe(Infinity);
  });
});

// ─── Validate Expression ─────────────────────────────────────────────────────

describe("validateExpression", () => {
  it("valid simple expression", () => {
    expect(validateExpression("2 + 3").valid).toBe(true);
  });

  it("valid function expression", () => {
    expect(validateExpression("sin(x)").valid).toBe(true);
  });

  it("empty string is invalid", () => {
    const r = validateExpression("");
    expect(r.valid).toBe(false);
    expect(r.error).toBeDefined();
  });

  it("whitespace-only is invalid", () => {
    expect(validateExpression("   ").valid).toBe(false);
  });

  it("unmatched parenthesis is invalid", () => {
    expect(validateExpression("sin(x").valid).toBe(false);
  });

  it("unknown operator is invalid", () => {
    expect(validateExpression("2 @ 3").valid).toBe(false);
  });
});

// ─── Parse Expression ────────────────────────────────────────────────────────

describe("parseExpression", () => {
  it("detects variable x in x^2", () => {
    const result = parseExpression("x^2");
    expect(result.isValid).toBe(true);
    expect(result.variables).toContain("x");
  });

  it("does not include pi as a variable", () => {
    const result = parseExpression("2 * pi * x");
    expect(result.variables).not.toContain("pi");
    expect(result.variables).toContain("x");
  });

  it("does not include function names as variables", () => {
    const result = parseExpression("sin(x) + cos(y)");
    expect(result.variables).not.toContain("sin");
    expect(result.variables).not.toContain("cos");
    expect(result.variables).toContain("x");
    expect(result.variables).toContain("y");
  });

  it("handles invalid expression", () => {
    const result = parseExpression("((((");
    expect(result.isValid).toBe(false);
  });
});

// ─── Generate Points ─────────────────────────────────────────────────────────

describe("generatePoints", () => {
  it("generates correct number of points for x^2", () => {
    const points = generatePoints("x^2", "x", [-5, 5], 100);
    // May have extra gap points for discontinuities, but at least 101
    expect(points.length).toBeGreaterThanOrEqual(101);
  });

  it("first and last x values match range", () => {
    const points = generatePoints("x", "x", [-10, 10], 100);
    expect(points[0].x).toBeCloseTo(-10, 8);
    const lastReal = points.filter((p) => !isNaN(p.y));
    expect(lastReal[lastReal.length - 1].x).toBeCloseTo(10, 8);
  });

  it("y values are correct for x^2", () => {
    const points = generatePoints("x^2", "x", [0, 3], 3);
    // Points at x=0,1,2,3
    const realPoints = points.filter((p) => !isNaN(p.y));
    expect(realPoints[0]).toEqual({ x: 0, y: 0 });
    expect(realPoints[1]).toEqual({ x: 1, y: 1 });
    expect(realPoints[2]).toEqual({ x: 2, y: 4 });
    expect(realPoints[3]).toEqual({ x: 3, y: 9 });
  });

  it("inserts NaN gaps for 1/x near x=0", () => {
    const points = generatePoints("1/x", "x", [-1, 1], 200);
    const nanPoints = points.filter((p) => isNaN(p.y));
    expect(nanPoints.length).toBeGreaterThan(0);
  });

  it("handles sin(x) without discontinuities", () => {
    const points = generatePoints("sin(x)", "x", [0, 6.28], 100);
    const nanPoints = points.filter((p) => isNaN(p.y));
    // sin(x) is continuous — should have no NaN gaps
    expect(nanPoints.length).toBe(0);
  });
});

// ─── Constants ───────────────────────────────────────────────────────────────

describe("evaluateExpression: constants", () => {
  it("pi ≈ 3.14159", () => {
    expect(evaluateExpression("pi")).toBeCloseTo(Math.PI, 8);
  });

  it("e ≈ 2.71828", () => {
    expect(evaluateExpression("e")).toBeCloseTo(Math.E, 8);
  });

  it("2*pi ≈ 6.28318", () => {
    expect(evaluateExpression("2*pi")).toBeCloseTo(2 * Math.PI, 8);
  });
});
