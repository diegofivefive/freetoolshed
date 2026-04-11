"use client";

import { useState, useMemo, useCallback } from "react";
import { BarChart3, TrendingUp, Trash2 } from "lucide-react";
import type {
  StatList,
  RegressionType,
  RegressionResult,
  OneVarStats,
} from "@/lib/graphing-calculator/types";
import {
  mean,
  median,
  mode,
  sum,
  sumOfSquares,
  standardDeviation,
  fiveNumberSummary,
  linearRegression,
  quadraticRegression,
  exponentialRegression,
  powerRegression,
} from "@/lib/graphing-calculator/stats";
import { STAT_LIST_NAMES } from "@/lib/graphing-calculator/constants";

interface StatPanelProps {
  statLists: StatList[];
  activeRegression: RegressionType;
  statPlotEnabled: boolean;
  statPlotXList: string;
  statPlotYList: string;
  onUpdateStatList: (name: string, data: number[]) => void;
  onSetRegressionType: (type: RegressionType) => void;
  onSetStatPlot: (enabled: boolean, xList?: string, yList?: string) => void;
}

const REGRESSION_OPTIONS: { value: RegressionType; label: string }[] = [
  { value: "linear", label: "LinReg (ax+b)" },
  { value: "quadratic", label: "QuadReg (ax²+bx+c)" },
  { value: "exponential", label: "ExpReg (a·bˣ)" },
  { value: "power", label: "PwrReg (a·xᵇ)" },
];

type StatTab = "edit" | "1var" | "regression";

export function StatPanel({
  statLists,
  activeRegression,
  statPlotEnabled,
  statPlotXList,
  statPlotYList,
  onUpdateStatList,
  onSetRegressionType,
  onSetStatPlot,
}: StatPanelProps) {
  const [activeTab, setActiveTab] = useState<StatTab>("edit");
  const [editingList, setEditingList] = useState("L1");
  const [inputValue, setInputValue] = useState("");
  const [statsForList, setStatsForList] = useState("L1");

  // Get current editing list data
  const currentList = useMemo(
    () => statLists.find((l) => l.name === editingList)?.data ?? [],
    [statLists, editingList]
  );

  // 1-Var Stats computation
  const oneVarStats = useMemo((): OneVarStats | null => {
    const list = statLists.find((l) => l.name === statsForList);
    if (!list || list.data.length === 0) return null;
    const d = list.data;
    try {
      const fns = fiveNumberSummary(d);
      return {
        n: d.length,
        mean: mean(d),
        sumX: sum(d),
        sumX2: sumOfSquares(d),
        sampleStdDev: d.length >= 2 ? standardDeviation(d, false) : 0,
        populationStdDev: standardDeviation(d, true),
        min: fns.min,
        q1: fns.q1,
        median: median(d),
        q3: fns.q3,
        max: fns.max,
      };
    } catch {
      return null;
    }
  }, [statLists, statsForList]);

  // Regression computation
  const regressionResult = useMemo((): RegressionResult | null => {
    const xList = statLists.find((l) => l.name === statPlotXList);
    const yList = statLists.find((l) => l.name === statPlotYList);
    if (!xList || !yList || xList.data.length < 2 || yList.data.length < 2) return null;

    const len = Math.min(xList.data.length, yList.data.length);
    const x = xList.data.slice(0, len);
    const y = yList.data.slice(0, len);

    try {
      switch (activeRegression) {
        case "linear": {
          const r = linearRegression(x, y);
          return {
            type: "linear",
            equation: `y = ${fmt(r.a)}x + ${fmt(r.b)}`,
            coefficients: { a: r.a, b: r.b },
            r: r.r,
            r2: r.r2,
          };
        }
        case "quadratic": {
          const r = quadraticRegression(x, y);
          return {
            type: "quadratic",
            equation: `y = ${fmt(r.a)}x² + ${fmt(r.b)}x + ${fmt(r.c)}`,
            coefficients: { a: r.a, b: r.b, c: r.c },
            r2: r.r2,
          };
        }
        case "exponential": {
          const r = exponentialRegression(x, y);
          return {
            type: "exponential",
            equation: `y = ${fmt(r.a)}·${fmt(r.b)}ˣ`,
            coefficients: { a: r.a, b: r.b },
            r2: r.r2,
          };
        }
        case "power": {
          const r = powerRegression(x, y);
          return {
            type: "power",
            equation: `y = ${fmt(r.a)}·x^${fmt(r.b)}`,
            coefficients: { a: r.a, b: r.b },
            r2: r.r2,
          };
        }
      }
    } catch {
      return null;
    }
  }, [statLists, statPlotXList, statPlotYList, activeRegression]);

  // Add data point to current list
  const handleAddValue = useCallback(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return;
    onUpdateStatList(editingList, [...currentList, val]);
    setInputValue("");
  }, [inputValue, editingList, currentList, onUpdateStatList]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleAddValue();
    },
    [handleAddValue]
  );

  const handleRemoveValue = useCallback(
    (index: number) => {
      const next = [...currentList];
      next.splice(index, 1);
      onUpdateStatList(editingList, next);
    },
    [editingList, currentList, onUpdateStatList]
  );

  const handleClearList = useCallback(() => {
    onUpdateStatList(editingList, []);
  }, [editingList, onUpdateStatList]);

  const handleCellEdit = useCallback(
    (index: number, value: string) => {
      const val = parseFloat(value);
      if (isNaN(val)) return;
      const next = [...currentList];
      next[index] = val;
      onUpdateStatList(editingList, next);
    },
    [editingList, currentList, onUpdateStatList]
  );

  return (
    <div className="space-y-4">
      {/* ── Sub-tabs ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-border pb-2">
        {(
          [
            { key: "edit", label: "Edit Lists" },
            { key: "1var", label: "1-Var Stats" },
            { key: "regression", label: "Regression" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Edit Lists ────────────────────────────────────────────────── */}
      {activeTab === "edit" && (
        <div className="space-y-3">
          {/* List selector */}
          <div className="flex flex-wrap items-center gap-2">
            {STAT_LIST_NAMES.map((name) => {
              const list = statLists.find((l) => l.name === name);
              const count = list?.data.length ?? 0;
              return (
                <button
                  key={name}
                  onClick={() => setEditingList(name)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-bold transition-colors ${
                    editingList === name
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {name}
                  {count > 0 && (
                    <span className="ml-1 text-[10px] font-normal opacity-60">
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add value input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a value..."
              className="h-8 flex-1 rounded-md border border-border bg-background px-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              onClick={handleAddValue}
              className="h-8 rounded-md bg-brand px-3 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              Add
            </button>
            <button
              onClick={handleClearList}
              className="h-8 rounded-md border border-border px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-pink-400"
              title="Clear list"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Data table */}
          {currentList.length > 0 ? (
            <div className="max-h-[350px] overflow-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted">
                  <tr>
                    <th className="border-b border-r border-border px-3 py-2 text-left font-mono font-semibold w-16">
                      #
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left font-mono font-semibold">
                      {editingList}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((val, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 last:border-b-0 hover:bg-muted/50"
                    >
                      <td className="border-r border-border px-3 py-1.5 font-mono text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-3 py-1.5 font-mono">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={val}
                            onBlur={(e) => handleCellEdit(i, e.target.value)}
                            className="h-6 w-32 rounded border border-transparent bg-transparent px-1 font-mono text-sm hover:border-border focus:border-brand focus:outline-none"
                          />
                          <button
                            onClick={() => handleRemoveValue(i)}
                            className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-pink-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                {editingList} is empty. Enter values above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 1-Var Stats ───────────────────────────────────────────────── */}
      {activeTab === "1var" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">List:</label>
            <select
              value={statsForList}
              onChange={(e) => setStatsForList(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {STAT_LIST_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {oneVarStats ? (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-semibold">
                  1-Var Stats — {statsForList}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 font-mono text-sm">
                <StatRow label="x̄" value={oneVarStats.mean} />
                <StatRow label="Σx" value={oneVarStats.sumX} />
                <StatRow label="Σx²" value={oneVarStats.sumX2} />
                <StatRow label="Sx" value={oneVarStats.sampleStdDev} />
                <StatRow label="σx" value={oneVarStats.populationStdDev} />
                <StatRow label="n" value={oneVarStats.n} />
                <div className="col-span-2 my-1 border-t border-border" />
                <StatRow label="minX" value={oneVarStats.min} />
                <StatRow label="Q₁" value={oneVarStats.q1} />
                <StatRow label="Med" value={oneVarStats.median} />
                <StatRow label="Q₃" value={oneVarStats.q3} />
                <StatRow label="maxX" value={oneVarStats.max} />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Add data to {statsForList} in the Edit Lists tab first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Regression ────────────────────────────────────────────────── */}
      {activeTab === "regression" && (
        <div className="space-y-3">
          {/* X/Y list selectors */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                XList:
              </label>
              <select
                value={statPlotXList}
                onChange={(e) =>
                  onSetStatPlot(statPlotEnabled, e.target.value, statPlotYList)
                }
                className="h-7 rounded-md border border-border bg-background px-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {STAT_LIST_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                YList:
              </label>
              <select
                value={statPlotYList}
                onChange={(e) =>
                  onSetStatPlot(statPlotEnabled, statPlotXList, e.target.value)
                }
                className="h-7 rounded-md border border-border bg-background px-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {STAT_LIST_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Regression type */}
          <div className="flex flex-wrap items-center gap-2">
            {REGRESSION_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onSetRegressionType(value)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeRegression === value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Results */}
          {regressionResult ? (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-semibold">
                  {REGRESSION_OPTIONS.find((o) => o.value === activeRegression)
                    ?.label ?? "Regression"}
                </h3>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Equation: </span>
                  <span className="font-semibold">{regressionResult.equation}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {Object.entries(regressionResult.coefficients).map(
                    ([key, val]) => (
                      <StatRow key={key} label={key} value={val} />
                    )
                  )}
                  {regressionResult.r !== undefined && (
                    <StatRow label="r" value={regressionResult.r} />
                  )}
                  <StatRow label="R²" value={regressionResult.r2} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Enter data into {statPlotXList} and {statPlotYList} (at least 2
                points each) in the Edit Lists tab.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{fmt(value)}</span>
    </div>
  );
}

function fmt(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e10) return n.toString();
  const abs = Math.abs(n);
  if (abs >= 1e6 || (abs > 0 && abs < 0.0001)) return n.toExponential(6);
  return parseFloat(n.toPrecision(10)).toString();
}
