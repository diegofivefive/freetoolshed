import type {
  UnitDefinition,
  ConversionResult,
  BatchResult,
  FormulaStep,
} from "./types";
import { isFunctionUnit } from "./types";
import {
  DEFAULT_PRECISION,
  SCIENTIFIC_NOTATION_THRESHOLD,
  SCIENTIFIC_NOTATION_SMALL_THRESHOLD,
} from "./constants";
import { ALIAS_INDEX, UNIT_MAP } from "./units";
import { CATEGORIES } from "./categories";

// ─── Core Conversion ───────────────────────────────────────────────────────

/**
 * Convert a value from one unit to another within the same category.
 * Converts input → base unit → output unit.
 */
export function convert(
  value: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): number {
  if (fromUnit.id === toUnit.id) return value;

  // Convert to base
  const baseValue = isFunctionUnit(fromUnit)
    ? fromUnit.toBase(value)
    : value * fromUnit.factor;

  // Convert from base to target
  const result = isFunctionUnit(toUnit)
    ? toUnit.fromBase(baseValue)
    : baseValue / toUnit.factor;

  return result;
}

/**
 * Full conversion with metadata.
 */
export function convertFull(
  value: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): ConversionResult {
  return {
    inputValue: value,
    outputValue: convert(value, fromUnit, toUnit),
    fromUnit,
    toUnit,
    formula: getConversionFormula(fromUnit, toUnit),
  };
}

// ─── Formula Generation ────────────────────────────────────────────────────

/**
 * Returns a human-readable formula string for the conversion.
 */
export function getConversionFormula(
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): string {
  if (fromUnit.id === toUnit.id) return `${toUnit.symbol} = ${fromUnit.symbol}`;

  const fromIsFunction = isFunctionUnit(fromUnit);
  const toIsFunction = isFunctionUnit(toUnit);

  // Temperature and other function-based: show named formula
  if (fromIsFunction || toIsFunction) {
    return getNamedFormula(fromUnit, toUnit);
  }

  // Linear: show the combined factor
  const factor = fromUnit.factor / toUnit.factor;
  const factorStr = formatNumber(factor, 10);
  return `${toUnit.symbol} = ${fromUnit.symbol} \u00D7 ${factorStr}`;
}

function getNamedFormula(
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): string {
  // Special-case temperature formulas for readability
  if (fromUnit.category === "temperature") {
    return getTemperatureFormula(fromUnit.id, toUnit.id);
  }

  // Fuel economy and other function-based
  return `${toUnit.symbol} = f(${fromUnit.symbol})`;
}

function getTemperatureFormula(fromId: string, toId: string): string {
  const formulas: Record<string, Record<string, string>> = {
    celsius: {
      fahrenheit: "\u00B0F = \u00B0C \u00D7 9/5 + 32",
      kelvin: "K = \u00B0C + 273.15",
      rankine: "\u00B0R = (\u00B0C + 273.15) \u00D7 9/5",
    },
    fahrenheit: {
      celsius: "\u00B0C = (\u00B0F \u2212 32) \u00D7 5/9",
      kelvin: "K = (\u00B0F \u2212 32) \u00D7 5/9 + 273.15",
      rankine: "\u00B0R = \u00B0F + 459.67",
    },
    kelvin: {
      celsius: "\u00B0C = K \u2212 273.15",
      fahrenheit: "\u00B0F = (K \u2212 273.15) \u00D7 9/5 + 32",
      rankine: "\u00B0R = K \u00D7 9/5",
    },
    rankine: {
      celsius: "\u00B0C = (\u00B0R \u2212 491.67) \u00D7 5/9",
      fahrenheit: "\u00B0F = \u00B0R \u2212 459.67",
      kelvin: "K = \u00B0R \u00D7 5/9",
    },
  };

  return formulas[fromId]?.[toId] ?? `Convert via base unit`;
}

/**
 * Returns step-by-step math for the formula bar animation.
 */
export function getConversionSteps(
  value: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): FormulaStep[] {
  if (fromUnit.id === toUnit.id) {
    return [{ label: "Same unit", expression: `${value}`, result: value }];
  }

  const fromIsFunction = isFunctionUnit(fromUnit);
  const toIsFunction = isFunctionUnit(toUnit);

  if (fromUnit.category === "temperature" && (fromIsFunction || toIsFunction)) {
    return getTemperatureSteps(value, fromUnit, toUnit);
  }

  if (fromIsFunction || toIsFunction) {
    // Generic function-based: just show input → base → output
    const baseValue = isFunctionUnit(fromUnit)
      ? fromUnit.toBase(value)
      : value * fromUnit.factor;
    const result = isFunctionUnit(toUnit)
      ? toUnit.fromBase(baseValue)
      : baseValue / toUnit.factor;

    return [
      {
        label: `Convert to base`,
        expression: `${formatNumber(value)} ${fromUnit.symbol} \u2192 ${formatNumber(baseValue)} base`,
        result: baseValue,
      },
      {
        label: `Convert to ${toUnit.symbol}`,
        expression: `${formatNumber(baseValue)} base \u2192 ${formatNumber(result)} ${toUnit.symbol}`,
        result,
      },
    ];
  }

  // Linear conversion
  const factor = fromUnit.factor / toUnit.factor;
  const result = value * factor;

  return [
    {
      label: "Apply conversion factor",
      expression: `${formatNumber(value)} \u00D7 ${formatNumber(factor, 10)}`,
      result,
    },
  ];
}

function getTemperatureSteps(
  value: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): FormulaStep[] {
  const steps: FormulaStep[] = [];

  // Step 1: Convert to Celsius (base)
  const baseValue = isFunctionUnit(fromUnit)
    ? fromUnit.toBase(value)
    : value * fromUnit.factor;

  if (fromUnit.id !== "celsius") {
    steps.push({
      label: `${fromUnit.symbol} to \u00B0C`,
      expression: getTemperatureStepExpression(fromUnit.id, value),
      result: baseValue,
    });
  }

  // Step 2: Convert from Celsius to target
  const result = isFunctionUnit(toUnit)
    ? toUnit.fromBase(baseValue)
    : baseValue / toUnit.factor;

  if (toUnit.id !== "celsius") {
    steps.push({
      label: `\u00B0C to ${toUnit.symbol}`,
      expression: getTemperatureStepExpression(
        "celsius-to-" + toUnit.id,
        baseValue
      ),
      result,
    });
  }

  if (steps.length === 0) {
    steps.push({
      label: "Same unit",
      expression: `${formatNumber(value)}`,
      result: value,
    });
  }

  return steps;
}

function getTemperatureStepExpression(conversion: string, value: number): string {
  const v = formatNumber(value);
  switch (conversion) {
    case "fahrenheit":
      return `(${v} \u2212 32) \u00D7 5/9`;
    case "kelvin":
      return `${v} \u2212 273.15`;
    case "rankine":
      return `(${v} \u2212 491.67) \u00D7 5/9`;
    case "celsius-to-fahrenheit":
      return `${v} \u00D7 9/5 + 32`;
    case "celsius-to-kelvin":
      return `${v} + 273.15`;
    case "celsius-to-rankine":
      return `(${v} + 273.15) \u00D7 9/5`;
    default:
      return `f(${v})`;
  }
}

// ─── Number Formatting ─────────────────────────────────────────────────────

/**
 * Smart number formatting: integers stay clean, small/large numbers use
 * scientific notation, everything else uses significant figures.
 */
export function formatNumber(value: number, precision?: number): string {
  const p = precision ?? DEFAULT_PRECISION;

  if (!Number.isFinite(value)) {
    if (Number.isNaN(value)) return "NaN";
    return value > 0 ? "\u221E" : "\u2212\u221E";
  }

  if (value === 0) return "0";

  const abs = Math.abs(value);

  // Very large or very small: scientific notation
  if (abs >= SCIENTIFIC_NOTATION_THRESHOLD || (abs > 0 && abs < SCIENTIFIC_NOTATION_SMALL_THRESHOLD)) {
    return value.toExponential(p - 1);
  }

  // Check if it's effectively an integer
  if (Number.isInteger(value) && abs < 1e15) {
    return value.toString();
  }

  // Use toPrecision for significant figures, then clean trailing zeros
  const formatted = value.toPrecision(p);
  // Remove trailing zeros after decimal point
  if (formatted.includes(".")) {
    return formatted.replace(/\.?0+$/, "");
  }
  return formatted;
}

// ─── Batch Conversion ──────────────────────────────────────────────────────

/**
 * Convert an array of values, returning results with validity flags.
 */
export function batchConvert(
  values: string[],
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): BatchResult[] {
  return values.map((raw, index) => {
    const trimmed = raw.trim();
    const inputValue = Number(trimmed);

    if (trimmed === "" || Number.isNaN(inputValue)) {
      return {
        index,
        inputValue: 0,
        outputValue: 0,
        valid: false,
        error: trimmed === "" ? "Empty value" : `Invalid number: "${trimmed}"`,
      };
    }

    return {
      index,
      inputValue,
      outputValue: convert(inputValue, fromUnit, toUnit),
      valid: true,
    };
  });
}

// ─── Natural Language Parser ───────────────────────────────────────────────

export interface ParsedConversion {
  value: number;
  fromUnitId: string;
  toUnitId: string;
  categoryId: string;
}

/**
 * Parse natural language input like "5 miles to km", "100 F in C",
 * "3.5 gallons to liters". Returns null if no match.
 */
export function parseNaturalLanguage(input: string): ParsedConversion | null {
  const trimmed = input.trim().toLowerCase();

  // Pattern: {number} {unit} (to|in|into|as|->|=) {unit}
  const match = trimmed.match(
    /^(-?[\d.,]+)\s*(.+?)\s+(?:to|in|into|as|->|=|=>)\s+(.+)$/
  );
  if (!match) return null;

  const valueStr = match[1].replace(/,/g, "");
  const value = Number(valueStr);
  if (Number.isNaN(value)) return null;

  const fromQuery = match[2].trim();
  const toQuery = match[3].trim();

  const fromMatch = findBestUnitMatch(fromQuery);
  if (!fromMatch) return null;

  const toMatch = findBestUnitMatch(toQuery, fromMatch.category);
  if (!toMatch) return null;

  // Ensure same category
  if (fromMatch.category !== toMatch.category) return null;

  return {
    value,
    fromUnitId: fromMatch.unitId,
    toUnitId: toMatch.unitId,
    categoryId: fromMatch.category,
  };
}

interface UnitMatch {
  unitId: string;
  category: string;
}

function findBestUnitMatch(
  query: string,
  preferCategory?: string
): UnitMatch | null {
  const lower = query.toLowerCase().trim();

  // Exact match on alias
  const exactMatches = ALIAS_INDEX.filter(([alias]) => alias === lower);
  if (exactMatches.length > 0) {
    // Prefer the category hint if provided
    if (preferCategory) {
      const preferred = exactMatches.find(([, , cat]) => cat === preferCategory);
      if (preferred) return { unitId: preferred[1], category: preferred[2] };
    }
    return { unitId: exactMatches[0][1], category: exactMatches[0][2] };
  }

  // Partial match: check if query starts with or is contained in an alias
  const partialMatches = ALIAS_INDEX.filter(
    ([alias]) => alias.startsWith(lower) || lower.startsWith(alias)
  );
  if (partialMatches.length > 0) {
    if (preferCategory) {
      const preferred = partialMatches.find(
        ([, , cat]) => cat === preferCategory
      );
      if (preferred) return { unitId: preferred[1], category: preferred[2] };
    }
    return { unitId: partialMatches[0][1], category: partialMatches[0][2] };
  }

  return null;
}

// ─── Unit Search ───────────────────────────────────────────────────────────

export interface UnitSearchResult {
  unitId: string;
  categoryId: string;
  name: string;
  symbol: string;
  matchType: "exact" | "prefix" | "contains";
}

/**
 * Search units by name, symbol, or alias. Returns ranked results.
 */
export function searchUnits(query: string, limit = 10): UnitSearchResult[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];

  const results: UnitSearchResult[] = [];
  const seen = new Set<string>();

  // Pass 1: exact matches
  for (const [alias, unitId, categoryId] of ALIAS_INDEX) {
    if (alias === lower && !seen.has(unitId)) {
      seen.add(unitId);
      const unit = UNIT_MAP.get(unitId);
      if (unit) {
        results.push({
          unitId,
          categoryId,
          name: unit.name,
          symbol: unit.symbol,
          matchType: "exact",
        });
      }
    }
  }

  // Pass 2: prefix matches
  for (const [alias, unitId, categoryId] of ALIAS_INDEX) {
    if (alias.startsWith(lower) && !seen.has(unitId)) {
      seen.add(unitId);
      const unit = UNIT_MAP.get(unitId);
      if (unit) {
        results.push({
          unitId,
          categoryId,
          name: unit.name,
          symbol: unit.symbol,
          matchType: "prefix",
        });
      }
    }
  }

  // Pass 3: contains matches
  for (const [alias, unitId, categoryId] of ALIAS_INDEX) {
    if (alias.includes(lower) && !seen.has(unitId)) {
      seen.add(unitId);
      const unit = UNIT_MAP.get(unitId);
      if (unit) {
        results.push({
          unitId,
          categoryId,
          name: unit.name,
          symbol: unit.symbol,
          matchType: "contains",
        });
      }
    }
  }

  return results.slice(0, limit);
}
