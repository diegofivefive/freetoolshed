"use client";

import { useState, useMemo, useCallback } from "react";
import { Activity, Calculator } from "lucide-react";
import type {
  DistributionFunction,
  DistributionParams,
  DistributionResult,
} from "@/lib/graphing-calculator/types";
import {
  normalpdf,
  normalcdf,
  invNorm,
  tpdf,
  tcdf,
  invT,
  chi2pdf,
  chi2cdf,
  binompdf,
  binomcdf,
  poissonpdf,
  poissoncdf,
} from "@/lib/graphing-calculator/distributions";

interface DistributionPanelProps {
  distributionParams: DistributionParams;
  distributionResult: DistributionResult | null;
  onSetDistributionParams: (params: DistributionParams) => void;
  onSetDistributionResult: (result: DistributionResult | null) => void;
}

// ─── Distribution Function Definitions ─────────────────────────────────────────

interface DistFnDef {
  value: DistributionFunction;
  label: string;
  group: string;
  params: { key: string; label: string; default: number; step?: number }[];
}

const DIST_FUNCTIONS: DistFnDef[] = [
  {
    value: "normalpdf",
    label: "normalpdf",
    group: "Normal",
    params: [
      { key: "x", label: "x", default: 0 },
      { key: "mean", label: "μ", default: 0 },
      { key: "stdev", label: "σ", default: 1, step: 0.1 },
    ],
  },
  {
    value: "normalcdf",
    label: "normalcdf",
    group: "Normal",
    params: [
      { key: "lower", label: "lower", default: -1 },
      { key: "upper", label: "upper", default: 1 },
      { key: "mean", label: "μ", default: 0 },
      { key: "stdev", label: "σ", default: 1, step: 0.1 },
    ],
  },
  {
    value: "invNorm",
    label: "invNorm",
    group: "Normal",
    params: [
      { key: "area", label: "area", default: 0.5, step: 0.01 },
      { key: "mean", label: "μ", default: 0 },
      { key: "stdev", label: "σ", default: 1, step: 0.1 },
    ],
  },
  {
    value: "tpdf",
    label: "tpdf",
    group: "t-Distribution",
    params: [
      { key: "x", label: "x", default: 0 },
      { key: "df", label: "df", default: 10, step: 1 },
    ],
  },
  {
    value: "tcdf",
    label: "tcdf",
    group: "t-Distribution",
    params: [
      { key: "lower", label: "lower", default: -2 },
      { key: "upper", label: "upper", default: 2 },
      { key: "df", label: "df", default: 10, step: 1 },
    ],
  },
  {
    value: "invT",
    label: "invT",
    group: "t-Distribution",
    params: [
      { key: "area", label: "area", default: 0.975, step: 0.01 },
      { key: "df", label: "df", default: 10, step: 1 },
    ],
  },
  {
    value: "chi2pdf",
    label: "χ²pdf",
    group: "Chi-Square",
    params: [
      { key: "x", label: "x", default: 5 },
      { key: "df", label: "df", default: 5, step: 1 },
    ],
  },
  {
    value: "chi2cdf",
    label: "χ²cdf",
    group: "Chi-Square",
    params: [
      { key: "lower", label: "lower", default: 0 },
      { key: "upper", label: "upper", default: 10 },
      { key: "df", label: "df", default: 5, step: 1 },
    ],
  },
  {
    value: "binompdf",
    label: "binompdf",
    group: "Binomial",
    params: [
      { key: "n", label: "n (trials)", default: 10, step: 1 },
      { key: "p", label: "p (prob)", default: 0.5, step: 0.05 },
      { key: "k", label: "k (successes)", default: 5, step: 1 },
    ],
  },
  {
    value: "binomcdf",
    label: "binomcdf",
    group: "Binomial",
    params: [
      { key: "n", label: "n (trials)", default: 10, step: 1 },
      { key: "p", label: "p (prob)", default: 0.5, step: 0.05 },
      { key: "k", label: "k (up to)", default: 5, step: 1 },
    ],
  },
  {
    value: "poissonpdf",
    label: "poissonpdf",
    group: "Poisson",
    params: [
      { key: "lambda", label: "λ (mean)", default: 5, step: 0.5 },
      { key: "k", label: "k", default: 3, step: 1 },
    ],
  },
  {
    value: "poissoncdf",
    label: "poissoncdf",
    group: "Poisson",
    params: [
      { key: "lambda", label: "λ (mean)", default: 5, step: 0.5 },
      { key: "k", label: "k (up to)", default: 5, step: 1 },
    ],
  },
];

// Group functions by category
const DIST_GROUPS = [
  { name: "Normal", fns: DIST_FUNCTIONS.filter((d) => d.group === "Normal") },
  { name: "t-Distribution", fns: DIST_FUNCTIONS.filter((d) => d.group === "t-Distribution") },
  { name: "Chi-Square", fns: DIST_FUNCTIONS.filter((d) => d.group === "Chi-Square") },
  { name: "Binomial", fns: DIST_FUNCTIONS.filter((d) => d.group === "Binomial") },
  { name: "Poisson", fns: DIST_FUNCTIONS.filter((d) => d.group === "Poisson") },
];

export function DistributionPanel({
  distributionParams,
  distributionResult,
  onSetDistributionParams,
  onSetDistributionResult,
}: DistributionPanelProps) {
  const [computeError, setComputeError] = useState<string | null>(null);

  const currentDef = useMemo(
    () => DIST_FUNCTIONS.find((d) => d.value === distributionParams.fn),
    [distributionParams.fn]
  );

  const handleFnChange = useCallback(
    (fn: DistributionFunction) => {
      const def = DIST_FUNCTIONS.find((d) => d.value === fn);
      if (!def) return;
      const values: Record<string, number> = {};
      for (const p of def.params) {
        values[p.key] = p.default;
      }
      onSetDistributionParams({ fn, values });
      onSetDistributionResult(null);
      setComputeError(null);
    },
    [onSetDistributionParams, onSetDistributionResult]
  );

  const handleParamChange = useCallback(
    (key: string, value: number) => {
      onSetDistributionParams({
        ...distributionParams,
        values: { ...distributionParams.values, [key]: value },
      });
    },
    [distributionParams, onSetDistributionParams]
  );

  const compute = useCallback(() => {
    setComputeError(null);
    const v = distributionParams.values;

    try {
      let result: number;

      switch (distributionParams.fn) {
        case "normalpdf":
          result = normalpdf(v.x, v.mean, v.stdev);
          break;
        case "normalcdf":
          result = normalcdf(v.lower, v.upper, v.mean, v.stdev);
          break;
        case "invNorm":
          result = invNorm(v.area, v.mean, v.stdev);
          break;
        case "tpdf":
          result = tpdf(v.x, v.df);
          break;
        case "tcdf":
          result = tcdf(v.lower, v.upper, v.df);
          break;
        case "invT":
          result = invT(v.area, v.df);
          break;
        case "chi2pdf":
          result = chi2pdf(v.x, v.df);
          break;
        case "chi2cdf":
          result = chi2cdf(v.lower, v.upper, v.df);
          break;
        case "binompdf":
          result = binompdf(v.n, v.p, v.k);
          break;
        case "binomcdf":
          result = binomcdf(v.n, v.p, v.k);
          break;
        case "poissonpdf":
          result = poissonpdf(v.lambda, v.k);
          break;
        case "poissoncdf":
          result = poissoncdf(v.lambda, v.k);
          break;
        default:
          throw new Error("Unknown function");
      }

      onSetDistributionResult({
        fn: distributionParams.fn,
        params: { ...v },
        result,
      });
    } catch (e) {
      setComputeError(e instanceof Error ? e.message : "Computation failed");
      onSetDistributionResult(null);
    }
  }, [distributionParams, onSetDistributionResult]);

  return (
    <div className="space-y-4">
      {/* ── Function Selector (grouped) ───────────────────────────────── */}
      <div className="space-y-2">
        {DIST_GROUPS.map((group) => (
          <div key={group.name} className="flex flex-wrap items-center gap-2">
            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
              {group.name}
            </span>
            {group.fns.map((fn) => (
              <button
                key={fn.value}
                onClick={() => handleFnChange(fn.value)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-mono font-medium transition-colors ${
                  distributionParams.fn === fn.value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {fn.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── Parameter Inputs ──────────────────────────────────────────── */}
      {currentDef && (
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand" />
            <h3 className="font-mono text-sm font-semibold">
              {currentDef.label}(
              {currentDef.params.map((p) => p.label).join(", ")}
              )
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {currentDef.params.map((param) => (
              <div key={param.key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {param.label}
                </label>
                <input
                  type="number"
                  value={distributionParams.values[param.key] ?? param.default}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleParamChange(param.key, val);
                  }}
                  step={param.step ?? 1}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            ))}
          </div>

          <button
            onClick={compute}
            className="mt-4 flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            <Calculator className="h-4 w-4" />
            Compute
          </button>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {computeError && (
        <div className="rounded-md border border-pink-500/30 bg-pink-500/5 px-4 py-2 text-sm text-pink-400">
          {computeError}
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────────── */}
      {distributionResult && (
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              {distributionResult.fn}(
              {Object.values(distributionResult.params).join(", ")}
              )
            </span>
            <span className="text-lg font-bold">=</span>
            <span className="font-mono text-xl font-bold text-brand">
              {formatResult(distributionResult.result)}
            </span>
          </div>

          {/* Context hint */}
          <p className="mt-2 text-xs text-muted-foreground">
            {getResultHint(distributionResult)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatResult(n: number): string {
  if (!isFinite(n)) return n.toString();
  if (Math.abs(n) < 1e-15) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e6 || (abs > 0 && abs < 0.00001)) return n.toExponential(8);
  return parseFloat(n.toPrecision(10)).toString();
}

function getResultHint(result: DistributionResult): string {
  const fn = result.fn;
  const r = result.result;

  if (fn === "normalcdf" || fn === "tcdf" || fn === "chi2cdf") {
    return `P = ${(r * 100).toFixed(4)}% — probability that the variable falls within the given bounds.`;
  }
  if (fn === "binomcdf" || fn === "poissoncdf") {
    return `P(X ≤ k) = ${(r * 100).toFixed(4)}% — cumulative probability up to k.`;
  }
  if (fn === "binompdf" || fn === "poissonpdf") {
    return `P(X = k) = ${(r * 100).toFixed(4)}% — probability of exactly k.`;
  }
  if (fn === "invNorm" || fn === "invT") {
    return `The critical value for the given tail area.`;
  }
  if (fn === "normalpdf" || fn === "tpdf" || fn === "chi2pdf") {
    return `The probability density at x (not a probability — use cdf for probabilities).`;
  }
  return "";
}
