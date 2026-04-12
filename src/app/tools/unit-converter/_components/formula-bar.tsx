"use client";

import { useMemo } from "react";
import type { UnitDefinition } from "@/lib/unit-converter/types";
import { isFunctionUnit } from "@/lib/unit-converter/types";
import {
  getConversionFormula,
  getConversionSteps,
  formatNumber,
} from "@/lib/unit-converter/engine";

interface FormulaBarProps {
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  inputValue: number;
  outputValue: string;
}

export function FormulaBar({
  fromUnit,
  toUnit,
  inputValue,
  outputValue,
}: FormulaBarProps) {
  const formula = useMemo(
    () => getConversionFormula(fromUnit, toUnit),
    [fromUnit, toUnit]
  );

  const steps = useMemo(
    () =>
      Number.isFinite(inputValue)
        ? getConversionSteps(inputValue, fromUnit, toUnit)
        : [],
    [inputValue, fromUnit, toUnit]
  );

  // Build substituted formula line
  const substituted = useMemo(() => {
    if (!Number.isFinite(inputValue) || !outputValue) return null;

    if (fromUnit.id === toUnit.id) {
      return [{ type: "number" as const, text: outputValue }];
    }

    const fromIsFunction = isFunctionUnit(fromUnit);
    const toIsFunction = isFunctionUnit(toUnit);

    // Temperature / function-based: show step results
    if (fromIsFunction || toIsFunction) {
      return null; // Steps panel handles this
    }

    // Linear: show "outputValue = inputValue × factor"
    const factor = fromUnit.factor / toUnit.factor;
    return [
      { type: "number" as const, text: outputValue },
      { type: "operator" as const, text: " = " },
      { type: "number" as const, text: formatNumber(inputValue) },
      { type: "operator" as const, text: " × " },
      { type: "number" as const, text: formatNumber(factor, 10) },
    ];
  }, [inputValue, outputValue, fromUnit, toUnit]);

  // Unique key for animation reset
  const animKey = `${fromUnit.id}-${toUnit.id}-${inputValue}`;

  return (
    <div className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-lg shadow-black/5 backdrop-blur-xl">
      {/* Generic formula */}
      <div className="font-mono text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Formula
        </span>
        <div className="mt-1.5">
          <FormulaTokens text={formula} />
        </div>
      </div>

      {/* Substituted formula (linear conversions) */}
      {substituted && (
        <div
          key={animKey}
          className="mt-3 border-t border-border/30 pt-3 font-mono text-sm animate-[fadeSlideIn_300ms_ease-out]"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Result
          </span>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-0.5">
            {substituted.map((token, i) => (
              <span
                key={i}
                className={
                  token.type === "number"
                    ? "text-brand font-medium"
                    : "text-muted-foreground"
                }
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {token.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-step breakdown (temperature / function-based) */}
      {steps.length > 1 && (
        <div
          key={`steps-${animKey}`}
          className="mt-3 space-y-2 border-t border-border/30 pt-3"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Steps
          </span>
          {steps.map((step, i) => (
            <div
              key={i}
              className="font-mono text-sm animate-[fadeSlideIn_300ms_ease-out]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-muted-foreground/70 text-xs">
                {step.label}:
              </span>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-0.5">
                <FormulaTokens text={step.expression} />
                <span className="text-muted-foreground"> = </span>
                <span className="text-brand font-medium">
                  {formatNumber(step.result)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single-step result for linear (when steps is exactly 1) */}
      {steps.length === 1 && !substituted && (
        <div
          key={`single-${animKey}`}
          className="mt-3 border-t border-border/30 pt-3 font-mono text-sm animate-[fadeSlideIn_300ms_ease-out]"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Result
          </span>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-0.5">
            <FormulaTokens text={steps[0].expression} />
            <span className="text-muted-foreground"> = </span>
            <span className="text-brand font-medium">
              {formatNumber(steps[0].result)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formula Token Renderer ─────────────────────────────────────────────────
// Parses a formula string and applies syntax highlighting:
// - Numbers → brand green
// - Operators (×, +, −, /, =, →) → muted
// - Unit symbols and text → foreground

function FormulaTokens({ text }: { text: string }) {
  const tokens = useMemo(() => tokenize(text), [text]);

  return (
    <>
      {tokens.map((token, i) => (
        <span
          key={i}
          className={
            token.type === "number"
              ? "text-brand font-medium"
              : token.type === "operator"
                ? "text-muted-foreground"
                : "text-foreground/80"
          }
        >
          {token.text}
        </span>
      ))}
    </>
  );
}

interface Token {
  type: "number" | "operator" | "symbol";
  text: string;
}

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  // Match: numbers (including decimals, negatives, scientific notation),
  // operators (×, +, −, -, /, =, →, (, )), or other text
  const regex =
    /(-?[\d.]+(?:e[+-]?\d+)?)|([×+\u2212\-/=\u2192()^])|([^\d×+\u2212\-/=\u2192()^\s]+|\s+)/gi;

  let match;
  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) {
      tokens.push({ type: "number", text: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "operator", text: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "symbol", text: match[3] });
    }
  }

  return tokens;
}
