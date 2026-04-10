"use client";

import { useMemo } from "react";
import { Palette } from "lucide-react";
import type {
  HeatmapProperty,
  PeriodicTableAction,
} from "@/lib/periodic-table/types";
import { ELEMENTS } from "@/lib/periodic-table/elements-data";
import { HEATMAP_PROPERTIES } from "@/lib/periodic-table/constants";

interface PropertyHeatmapProps {
  heatmapProperty: HeatmapProperty;
  dispatch: React.Dispatch<PeriodicTableAction>;
}

const PROPERTY_ORDER: HeatmapProperty[] = [
  "electronegativity",
  "atomicRadius",
  "ionizationEnergy",
  "density",
  "meltingPoint",
  "boilingPoint",
  "atomicMass",
  "electronAffinity",
];

/** Compute min/max/avg and the element names at the extremes */
function getPropertyStats(property: HeatmapProperty) {
  let min = Infinity;
  let max = -Infinity;
  let minEl = "";
  let maxEl = "";
  let sum = 0;
  let count = 0;
  let nullCount = 0;

  for (const el of ELEMENTS) {
    const v = el[property];
    if (v === null || v === undefined) {
      nullCount++;
      continue;
    }
    if (v < min) {
      min = v;
      minEl = `${el.symbol} (${el.name})`;
    }
    if (v > max) {
      max = v;
      maxEl = `${el.symbol} (${el.name})`;
    }
    sum += v;
    count++;
  }

  return {
    min: count > 0 ? min : 0,
    max: count > 0 ? max : 0,
    avg: count > 0 ? sum / count : 0,
    minEl,
    maxEl,
    dataCount: count,
    nullCount,
  };
}

function formatValue(value: number, property: HeatmapProperty): string {
  if (property === "density" && value < 0.01) return value.toExponential(2);
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(2);
}

export function PropertyHeatmap({
  heatmapProperty,
  dispatch,
}: PropertyHeatmapProps) {
  const stats = useMemo(
    () => getPropertyStats(heatmapProperty),
    [heatmapProperty]
  );
  const meta = HEATMAP_PROPERTIES[heatmapProperty];

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Palette className="size-4 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Property Heatmap
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {stats.dataCount} elements with data
          {stats.nullCount > 0 && ` · ${stats.nullCount} unknown`}
        </span>
      </div>

      <div className="px-4 pb-3 pt-3">
        {/* Property selector — pill buttons */}
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_ORDER.map((prop) => {
            const propMeta = HEATMAP_PROPERTIES[prop];
            const isActive = prop === heatmapProperty;
            return (
              <button
                key={prop}
                onClick={() =>
                  dispatch({
                    type: "SET_HEATMAP_PROPERTY",
                    payload: prop,
                  })
                }
                className={`rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                  isActive
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                }`}
              >
                {propMeta.label}
              </button>
            );
          })}
        </div>

        {/* Active property info */}
        <div className="mt-3 rounded-md bg-muted/50 px-3 py-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-foreground">
              {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({meta.unit})
            </span>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {meta.description}
          </p>

          {/* Gradient legend bar */}
          <div className="mt-3">
            <div
              className="h-3 w-full rounded-sm"
              style={{
                background:
                  "linear-gradient(to right, oklch(0.55 0.12 250), oklch(0.62 0.13 220), oklch(0.68 0.14 163), oklch(0.74 0.15 80), oklch(0.80 0.16 30))",
              }}
            />
            <div className="mt-1 flex justify-between">
              <div className="text-left">
                <span className="block text-[9px] font-bold tabular-nums text-foreground">
                  {formatValue(stats.min, heatmapProperty)} {meta.unit}
                </span>
                <span className="block text-[8px] text-muted-foreground">
                  {stats.minEl}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[9px] tabular-nums text-muted-foreground">
                  avg {formatValue(stats.avg, heatmapProperty)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-bold tabular-nums text-foreground">
                  {formatValue(stats.max, heatmapProperty)} {meta.unit}
                </span>
                <span className="block text-[8px] text-muted-foreground">
                  {stats.maxEl}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
