"use client";

import { useReducer, useEffect, useRef, useMemo, useCallback } from "react";
import { converterReducer, INITIAL_STATE } from "@/lib/unit-converter/reducer";
import { loadConverterState, saveConverterState } from "@/lib/unit-converter/storage";
import { CATEGORIES, getCategoryById } from "@/lib/unit-converter/categories";
import { convert, formatNumber } from "@/lib/unit-converter/engine";
import type { CategoryId } from "@/lib/unit-converter/types";
import { CategoryNav } from "./category-nav";
import { ConversionPanel } from "./conversion-panel";
import { ScalePanel } from "./scale-panel";
import { ConversionGraph } from "./conversion-graph";
import { FormulaBar } from "./formula-bar";

export function UnitConverter() {
  const [state, dispatch] = useReducer(converterReducer, INITIAL_STATE);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Initialize from localStorage ──────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadConverterState();
    if (saved) {
      dispatch({ type: "LOAD_STATE", payload: saved });
    }
  }, []);

  // ─── Resolve category + units ──────────────────────────────────────────
  const category = useMemo(
    () => getCategoryById(state.category) ?? CATEGORIES[0],
    [state.category]
  );

  // If fromUnitId/toUnitId are empty (after category switch), pick defaults
  const fromUnitId = state.fromUnitId || category.units[0]?.id || "";
  const toUnitId =
    state.toUnitId || category.units[Math.min(1, category.units.length - 1)]?.id || "";

  // Set defaults after category switch
  useEffect(() => {
    if (!state.fromUnitId && category.units[0]) {
      dispatch({ type: "SET_FROM_UNIT", payload: category.units[0].id });
    }
    if (!state.toUnitId && category.units[1]) {
      dispatch({
        type: "SET_TO_UNIT",
        payload: category.units[Math.min(1, category.units.length - 1)].id,
      });
    }
  }, [state.fromUnitId, state.toUnitId, category]);

  const fromUnit = useMemo(
    () => category.units.find((u) => u.id === fromUnitId),
    [category, fromUnitId]
  );
  const toUnit = useMemo(
    () => category.units.find((u) => u.id === toUnitId),
    [category, toUnitId]
  );

  // ─── Computed conversion ───────────────────────────────────────────────
  const inputNum = Number(state.inputValue);
  const outputValue = useMemo(() => {
    if (!fromUnit || !toUnit || !Number.isFinite(inputNum)) return "";
    return formatNumber(convert(inputNum, fromUnit, toUnit));
  }, [inputNum, fromUnit, toUnit]);

  // ─── Auto-save (debounced 1s) ──────────────────────────────────────────
  useEffect(() => {
    if (!initialized.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveConverterState(state), 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleCategoryChange = useCallback((id: CategoryId) => {
    dispatch({ type: "SET_CATEGORY", payload: id });
  }, []);

  const handleFromUnitChange = useCallback((id: string) => {
    dispatch({ type: "SET_FROM_UNIT", payload: id });
  }, []);

  const handleToUnitChange = useCallback((id: string) => {
    dispatch({ type: "SET_TO_UNIT", payload: id });
  }, []);

  const handleInputChange = useCallback((value: string) => {
    dispatch({ type: "SET_INPUT", payload: value });
  }, []);

  const handleSwap = useCallback(() => {
    dispatch({ type: "SWAP_UNITS", payload: outputValue || state.inputValue });
  }, [outputValue, state.inputValue]);

  // ─── Category list for nav ─────────────────────────────────────────────
  const categoryList = useMemo(
    () => CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
    []
  );

  return (
    <div className="space-y-4">
      {/* Category Navigation */}
      <div className="rounded-xl border border-border/50 bg-card/70 p-3 shadow-lg shadow-black/5 backdrop-blur-xl">
        <CategoryNav
          categories={categoryList}
          activeCategory={state.category}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Conversion Panel with animated number output */}
      <ConversionPanel
        units={category.units}
        fromUnitId={fromUnitId}
        toUnitId={toUnitId}
        inputValue={state.inputValue}
        outputValue={outputValue}
        onFromUnitChange={handleFromUnitChange}
        onToUnitChange={handleToUnitChange}
        onInputChange={handleInputChange}
        onSwap={handleSwap}
      />

      {/* Panel toggle buttons */}
      <div className="flex gap-2">
        <PanelToggle
          label="Formula"
          active={state.showFormula}
          onClick={() => dispatch({ type: "TOGGLE_FORMULA" })}
        />
        <PanelToggle
          label="Graph"
          active={state.showGraph}
          onClick={() => dispatch({ type: "TOGGLE_GRAPH" })}
        />
        <PanelToggle
          label="Scale"
          active={state.showScale}
          onClick={() => dispatch({ type: "TOGGLE_SCALE" })}
        />
      </div>

      {state.showFormula && fromUnit && toUnit && (
        <FormulaBar
          fromUnit={fromUnit}
          toUnit={toUnit}
          inputValue={Number.isFinite(inputNum) ? inputNum : 0}
          outputValue={outputValue}
        />
      )}
      {state.showGraph && fromUnit && toUnit && (
        <ConversionGraph
          fromUnit={fromUnit}
          toUnit={toUnit}
          currentValue={Number.isFinite(inputNum) ? inputNum : 0}
        />
      )}
      {state.showScale && fromUnit && toUnit && (
        <ScalePanel
          category={state.category}
          fromValue={Number.isFinite(inputNum) ? inputNum : 0}
          toValue={outputValue ? Number(outputValue) || 0 : 0}
          fromSymbol={fromUnit.symbol}
          toSymbol={toUnit.symbol}
        />
      )}
    </div>
  );
}

// ─── Panel Toggle Button ─────────────────────────────────────────────────

function PanelToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200
        ${
          active
            ? "border-brand/50 bg-brand/10 text-brand shadow-[0_0_12px_oklch(0.696_0.17_162.48/10%)]"
            : "border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:text-foreground"
        }
      `}
    >
      {label}
    </button>
  );
}
