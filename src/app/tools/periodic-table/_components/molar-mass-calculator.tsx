"use client";

import { useState, useCallback } from "react";
import { FlaskConical, X, ArrowRight, Beaker } from "lucide-react";
import { MolecularViewerSection } from "./molecular-viewer-section";
import type { PeriodicTableAction } from "@/lib/periodic-table/types";
import {
  parseFormula,
  FORMULA_PRESETS,
  type FormulaResult,
} from "@/lib/periodic-table/calculations";

interface MolarMassCalculatorProps {
  dispatch: React.Dispatch<PeriodicTableAction>;
}

export function MolarMassCalculator({ dispatch }: MolarMassCalculatorProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback((formula: string) => {
    const trimmed = formula.trim();
    if (!trimmed) {
      setResult(null);
      setError(null);
      return;
    }
    try {
      const res = parseFormula(trimmed);
      setResult(res);
      setError(null);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid formula");
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    calculate(value);
  };

  const handlePreset = (formula: string) => {
    setInput(formula);
    calculate(formula);
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <FlaskConical className="size-4 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Molar Mass Calculator
        </span>
        <button
          onClick={() => dispatch({ type: "TOGGLE_MOLAR_MASS_CALC" })}
          className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
          Close
        </button>
      </div>

      <div className="px-4 pb-4 pt-3">
        {/* Input area */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter a chemical formula — e.g. H2SO4, Ca(OH)2"
              className="h-10 w-full rounded-md border border-border bg-background px-3 pr-8 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              spellCheck={false}
              autoComplete="off"
            />
            {input && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear input"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-2 rounded-md border border-pink-400/30 bg-pink-400/10 px-3 py-2">
            <p className="text-xs font-medium text-pink-400">{error}</p>
          </div>
        )}

        {/* Presets */}
        <div className="mt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Common Formulas
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {FORMULA_PRESETS.map((preset) => (
              <button
                key={preset.formula}
                onClick={() => handlePreset(preset.formula)}
                className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${
                  input === preset.formula
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                }`}
              >
                <span className="font-mono font-bold">{preset.formula}</span>
                <span className="ml-1 text-muted-foreground/70">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4">
            {/* Total mass highlight */}
            <div className="rounded-md bg-brand/10 px-4 py-3">
              <div className="flex items-baseline gap-3">
                <Beaker className="size-4 text-brand" />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Molar Mass
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tabular-nums text-foreground">
                      {result.totalMass.toFixed(3)}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      g/mol
                    </span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-[10px] text-muted-foreground">
                    Formula
                  </span>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {result.formula}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="mt-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Element Breakdown
              </span>
              <div className="mt-1.5 rounded-md border border-border overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_80px_100px_1fr_60px] gap-px bg-muted/50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Element</span>
                  <span className="text-right">Count</span>
                  <span className="text-right">Atomic Mass</span>
                  <span className="text-right">Contribution</span>
                  <span className="text-right">%</span>
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/50">
                  {result.elements.map((el) => {
                    const pct = (el.contribution / result.totalMass) * 100;
                    return (
                      <div
                        key={el.symbol}
                        className="group grid grid-cols-[1fr_80px_100px_1fr_60px] items-center gap-px px-3 py-2 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded bg-brand/10 text-[10px] font-black text-brand">
                            {el.symbol}
                          </span>
                        </div>
                        <span className="text-right text-xs font-semibold tabular-nums text-foreground">
                          ×{el.count}
                        </span>
                        <span className="text-right text-xs tabular-nums text-muted-foreground">
                          {el.mass.toFixed(3)} u
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          {/* Mini bar */}
                          <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                            <div
                              className="h-full rounded-full bg-brand transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-right text-xs font-medium tabular-nums text-foreground">
                            {el.contribution.toFixed(3)} u
                          </span>
                        </div>
                        <span className="text-right text-[10px] font-semibold tabular-nums text-brand">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Total row */}
                <div className="grid grid-cols-[1fr_80px_100px_1fr_60px] gap-px border-t border-border bg-muted/30 px-3 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                  <span className="text-right text-xs font-bold tabular-nums text-foreground">
                    {result.elements.reduce((sum, el) => sum + el.count, 0)}{" "}
                    atoms
                  </span>
                  <span />
                  <span className="text-right text-xs font-bold tabular-nums text-foreground">
                    {result.totalMass.toFixed(3)} u
                  </span>
                  <span className="text-right text-[10px] font-bold tabular-nums text-brand">
                    100%
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Molecular Viewer */}
            <MolecularViewerSection formula={result.formula} />

            {/* Quick conversions */}
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  1 mole
                </span>
                <p className="text-xs font-bold tabular-nums text-foreground">
                  {result.totalMass.toFixed(3)} g
                </p>
              </div>
              <div className="flex items-center">
                <ArrowRight className="size-3 text-muted-foreground/40" />
              </div>
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  1 gram
                </span>
                <p className="text-xs font-bold tabular-nums text-foreground">
                  {(1 / result.totalMass).toExponential(4)} mol
                </p>
              </div>
              <div className="flex items-center">
                <ArrowRight className="size-3 text-muted-foreground/40" />
              </div>
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Molecules / mol
                </span>
                <p className="text-xs font-bold tabular-nums text-foreground">
                  6.022 × 10²³
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !error && (
          <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
            <FlaskConical className="size-8 text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">
              Type a chemical formula or select a preset to calculate molar mass
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">
              Supports parentheses, brackets, and subscript notation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
