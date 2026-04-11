import { create, all, type MathJsInstance } from "mathjs";
import type { AngleMode, Point } from "./types";
import { DISCONTINUITY_THRESHOLD } from "./constants";

// ─── Math.js Instance ────────────────────────────────────────────────────────

const math: MathJsInstance = create(all, {
  number: "number",
});

// Register ln() as alias for log() (natural log) — math.js v15 doesn't include it
math.import(
  {
    ln: math.typed("ln", { number: (x: number) => math.log(x) }),
  },
  { override: false }
);

// ─── Expression Validation ───────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateExpression(expr: string): ValidationResult {
  if (!expr.trim()) {
    return { valid: false, error: "Expression is empty" };
  }
  try {
    math.parse(normalizeExpression(expr));
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid expression",
    };
  }
}

// ─── Expression Evaluation ───────────────────────────────────────────────────

/**
 * Evaluate a math expression with the given variable scope.
 * Returns NaN for undefined results (e.g., sqrt(-1) in real mode).
 */
export function evaluateExpression(
  expr: string,
  scope: Record<string, number> = {},
  angleMode: AngleMode = "radian"
): number {
  try {
    const normalized = normalizeExpression(expr);
    const wrapped = wrapTrigForAngleMode(normalized, angleMode);
    const result = math.evaluate(wrapped, { ...scope });
    if (typeof result === "number") {
      return result;
    }
    // math.js may return complex numbers — treat as NaN for graphing
    if (result && typeof result === "object" && "re" in result) {
      const complex = result as { re: number; im: number };
      if (Math.abs(complex.im) < 1e-10) {
        return complex.re;
      }
      return NaN;
    }
    return Number(result);
  } catch {
    return NaN;
  }
}

// ─── Parsed Expression Info ──────────────────────────────────────────────────

export interface ParsedExpression {
  variables: string[];
  isValid: boolean;
}

export function parseExpression(expr: string): ParsedExpression {
  try {
    const node = math.parse(normalizeExpression(expr));
    const variables = new Set<string>();
    node.traverse((n) => {
      if (n.type === "SymbolNode") {
        const name = (n as unknown as { name: string }).name;
        // Exclude known constants and function names
        if (!isKnownSymbol(name)) {
          variables.add(name);
        }
      }
    });
    return { variables: [...variables], isValid: true };
  } catch {
    return { variables: [], isValid: false };
  }
}

// ─── Point Generation ────────────────────────────────────────────────────────

/**
 * Generate (x, y) points for a function over a range.
 * Inserts NaN gaps at discontinuities so the renderer can break the line.
 */
export function generatePoints(
  expr: string,
  variable: string,
  range: [number, number],
  steps: number,
  angleMode: AngleMode = "radian"
): Point[] {
  const [start, end] = range;
  const dx = (end - start) / steps;
  const points: Point[] = [];

  let prevY: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const x = start + i * dx;
    const y = evaluateExpression(expr, { [variable]: x }, angleMode);

    // Detect discontinuities: large jumps between consecutive points
    if (
      prevY !== null &&
      isFinite(prevY) &&
      isFinite(y) &&
      Math.abs(y - prevY) > DISCONTINUITY_THRESHOLD * Math.abs(dx)
    ) {
      // Insert a NaN gap to break the line
      points.push({ x, y: NaN });
    }

    points.push({ x, y: isFinite(y) ? y : NaN });
    prevY = y;
  }

  return points;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const KNOWN_CONSTANTS = new Set([
  "e",
  "pi",
  "PI",
  "i",
  "Infinity",
  "NaN",
  "true",
  "false",
  "null",
  "undefined",
]);

const KNOWN_FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "atan2",
  "sinh",
  "cosh",
  "tanh",
  "asinh",
  "acosh",
  "atanh",
  "sqrt",
  "cbrt",
  "abs",
  "ceil",
  "floor",
  "round",
  "log",
  "log2",
  "log10",
  "ln",
  "exp",
  "pow",
  "mod",
  "sign",
  "min",
  "max",
  "factorial",
  "nCr",
  "nPr",
  "sec",
  "csc",
  "cot",
]);

function isKnownSymbol(name: string): boolean {
  return KNOWN_CONSTANTS.has(name) || KNOWN_FUNCTIONS.has(name);
}

/**
 * In degree mode, wrap trig functions so they receive degree-converted input,
 * and inverse trig functions return degrees.
 *
 * We do this by string-rewriting the expression before evaluation:
 *   sin(x) → sin(x * pi/180)
 *   asin(x) → (asin(x) * 180/pi)
 *
 * In radian mode, the expression passes through unchanged.
 */
function wrapTrigForAngleMode(expr: string, mode: AngleMode): string {
  if (mode === "radian") return expr;

  // Degree mode: wrap forward trig functions
  const forwardTrig = ["sin", "cos", "tan", "sec", "csc", "cot"];
  const inverseTrig = ["asin", "acos", "atan"];

  let result = expr;

  // Replace inverse trig first (to avoid double-matching "asin" as "sin")
  for (const fn of inverseTrig) {
    const regex = new RegExp(`${fn}\\(`, "g");
    result = result.replace(regex, `__${fn}__deg(`);
  }

  // Replace forward trig
  for (const fn of forwardTrig) {
    const regex = new RegExp(`(?<!a)${fn}\\(`, "g");
    result = result.replace(regex, `${fn}((pi/180)*`);
  }

  // Now replace inverse trig placeholders
  for (const fn of inverseTrig) {
    const regex = new RegExp(`__${fn}__deg\\(`, "g");
    result = result.replace(regex, `(180/pi)*${fn}(`);
  }

  return result;
}

// ─── Convenience: evaluate with "x" as default variable ──────────────────────

export function evaluateAtX(
  expr: string,
  x: number,
  angleMode: AngleMode = "radian"
): number {
  return evaluateExpression(expr, { x }, angleMode);
}

/**
 * Normalize an expression: fix common case mistakes for known functions.
 * e.g. Sin(x) → sin(x), COS(x) → cos(x), Ln(x) → ln(x)
 * TI-84 is case-insensitive, so users often type with caps.
 */
export function normalizeExpression(expr: string): string {
  let result = expr;
  for (const fn of ALL_KNOWN_FUNCTIONS) {
    // Match the function name (case-insensitive) followed by "("
    const regex = new RegExp(`\\b${fn}\\s*\\(`, "gi");
    result = result.replace(regex, `${fn}(`);
  }
  // Also normalize PI → pi
  result = result.replace(/\bPI\b/g, "pi");
  return result;
}

/** All known function names for case normalization */
const ALL_KNOWN_FUNCTIONS = [
  "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
  "sinh", "cosh", "tanh", "asinh", "acosh", "atanh",
  "sqrt", "cbrt", "abs", "ceil", "floor", "round",
  "log", "log2", "log10", "ln", "exp", "pow", "mod",
  "sign", "min", "max", "factorial",
  "sec", "csc", "cot",
];
