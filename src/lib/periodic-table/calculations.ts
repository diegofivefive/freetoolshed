import { ELEMENTS } from "./elements-data";

/** Map of symbol → atomic mass for fast lookup */
const MASS_MAP = new Map<string, number>();
for (const el of ELEMENTS) {
  MASS_MAP.set(el.symbol, el.atomicMass);
}

export interface FormulaElement {
  symbol: string;
  count: number;
  mass: number; // atomic mass of the element
  contribution: number; // count × mass
}

export interface FormulaResult {
  formula: string;
  totalMass: number;
  elements: FormulaElement[];
}

/**
 * Parse a chemical formula string and calculate molar mass.
 *
 * Supports:
 * - Simple formulas: H2O, NaCl, Fe2O3
 * - Parentheses: Ca(OH)2, Mg3(PO4)2
 * - Nested parentheses: Ca3(PO4)2
 * - Brackets: [Cu(NH3)4]SO4
 *
 * Throws on invalid input.
 */
export function parseFormula(formula: string): FormulaResult {
  const cleaned = formula.trim();
  if (!cleaned) throw new Error("Empty formula");

  // Tokenize: each token is either a symbol, number, or bracket
  const tokens = tokenize(cleaned);
  const counts = parseTokens(tokens);

  // Build result
  const elements: FormulaElement[] = [];
  let totalMass = 0;

  for (const [symbol, count] of counts) {
    const mass = MASS_MAP.get(symbol);
    if (mass === undefined) {
      throw new Error(`Unknown element: ${symbol}`);
    }
    const contribution = count * mass;
    elements.push({ symbol, count, mass, contribution });
    totalMass += contribution;
  }

  // Sort by order of first appearance in formula
  return { formula: cleaned, totalMass, elements };
}

type Token =
  | { type: "symbol"; value: string }
  | { type: "number"; value: number }
  | { type: "open" }
  | { type: "close" };

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < formula.length) {
    const ch = formula[i];

    if (ch === "(" || ch === "[") {
      tokens.push({ type: "open" });
      i++;
    } else if (ch === ")" || ch === "]") {
      tokens.push({ type: "close" });
      i++;
    } else if (ch >= "A" && ch <= "Z") {
      // Element symbol: uppercase followed by optional lowercase(s)
      let symbol = ch;
      i++;
      while (i < formula.length && formula[i] >= "a" && formula[i] <= "z") {
        symbol += formula[i];
        i++;
      }
      tokens.push({ type: "symbol", value: symbol });
    } else if (ch >= "0" && ch <= "9") {
      let num = "";
      while (i < formula.length && formula[i] >= "0" && formula[i] <= "9") {
        num += formula[i];
        i++;
      }
      tokens.push({ type: "number", value: parseInt(num, 10) });
    } else if (ch === "·" || ch === "." || ch === " ") {
      // Hydrate separator — treat as multiplication of 1
      i++;
    } else if (ch === "₀" || ch === "₁" || ch === "₂" || ch === "₃" || ch === "₄" || ch === "₅" || ch === "₆" || ch === "₇" || ch === "₈" || ch === "₉") {
      // Unicode subscript digits
      const subscriptMap: Record<string, number> = {
        "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4,
        "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9,
      };
      let num = 0;
      while (i < formula.length && subscriptMap[formula[i]] !== undefined) {
        num = num * 10 + subscriptMap[formula[i]];
        i++;
      }
      tokens.push({ type: "number", value: num });
    } else {
      throw new Error(`Unexpected character: '${ch}' at position ${i}`);
    }
  }

  return tokens;
}

/**
 * Recursive descent parser for token stream.
 * Returns a Map of symbol → total count.
 */
function parseTokens(tokens: Token[]): Map<string, number> {
  const result = new Map<string, number>();
  let i = 0;

  function merge(map: Map<string, number>, multiplier: number) {
    for (const [sym, count] of map) {
      result.set(sym, (result.get(sym) ?? 0) + count * multiplier);
    }
  }

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "symbol") {
      // Check if next token is a number
      const count =
        i + 1 < tokens.length && tokens[i + 1].type === "number"
          ? (tokens[++i] as { type: "number"; value: number }).value
          : 1;
      result.set(token.value, (result.get(token.value) ?? 0) + count);
      i++;
    } else if (token.type === "open") {
      // Find matching close and recurse
      i++;
      let depth = 1;
      const subTokens: Token[] = [];
      while (i < tokens.length && depth > 0) {
        if (tokens[i].type === "open") depth++;
        if (tokens[i].type === "close") depth--;
        if (depth > 0) subTokens.push(tokens[i]);
        i++;
      }
      if (depth !== 0) throw new Error("Unmatched parenthesis");

      const subResult = parseTokens(subTokens);
      // Check for trailing number
      const multiplier =
        i < tokens.length && tokens[i].type === "number"
          ? (tokens[i++] as { type: "number"; value: number }).value
          : 1;
      merge(subResult, multiplier);
    } else if (token.type === "close") {
      throw new Error("Unexpected closing bracket");
    } else {
      // Stray number — skip
      i++;
    }
  }

  return result;
}

/** Common formula presets for quick access */
export const FORMULA_PRESETS = [
  { formula: "H2O", name: "Water" },
  { formula: "NaCl", name: "Table Salt" },
  { formula: "H2SO4", name: "Sulfuric Acid" },
  { formula: "C6H12O6", name: "Glucose" },
  { formula: "CaCO3", name: "Calcium Carbonate" },
  { formula: "NH3", name: "Ammonia" },
  { formula: "C2H5OH", name: "Ethanol" },
  { formula: "Ca(OH)2", name: "Slaked Lime" },
  { formula: "Fe2O3", name: "Iron(III) Oxide" },
  { formula: "Mg3(PO4)2", name: "Magnesium Phosphate" },
  { formula: "C8H10N4O2", name: "Caffeine" },
  { formula: "C9H8O4", name: "Aspirin" },
] as const;
