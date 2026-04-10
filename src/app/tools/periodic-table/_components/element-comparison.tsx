"use client";

import { X, GitCompareArrows } from "lucide-react";
import type { Element, PeriodicTableAction } from "@/lib/periodic-table/types";
import { CATEGORY_COLORS } from "@/lib/periodic-table/constants";

interface ElementComparisonProps {
  elements: Element[];
  dispatch: React.Dispatch<PeriodicTableAction>;
}

/** Properties to compare with bar charts */
const COMPARE_PROPERTIES: {
  key: keyof Element;
  label: string;
  unit: string;
  format?: (v: number) => string;
}[] = [
  { key: "atomicMass", label: "Atomic Mass", unit: "u" },
  {
    key: "electronegativity",
    label: "Electronegativity",
    unit: "Pauling",
  },
  { key: "atomicRadius", label: "Atomic Radius", unit: "pm" },
  { key: "ionizationEnergy", label: "Ionization Energy", unit: "kJ/mol" },
  { key: "density", label: "Density", unit: "g/cm³", format: (v) => v < 0.01 ? v.toExponential(2) : v.toFixed(3) },
  { key: "meltingPoint", label: "Melting Point", unit: "K" },
  { key: "boilingPoint", label: "Boiling Point", unit: "K" },
  { key: "electronAffinity", label: "Electron Affinity", unit: "kJ/mol" },
];

/** Assign a unique hue to each element for the bar charts */
const BAR_COLORS = [
  "oklch(0.65 0.18 163)", // emerald
  "oklch(0.65 0.18 250)", // blue
  "oklch(0.70 0.18 40)",  // orange
  "oklch(0.65 0.18 310)", // purple
];

function formatVal(value: number | null, format?: (v: number) => string): string {
  if (value === null) return "—";
  if (format) return format(value);
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(2);
}

function ComparisonBar({
  elements,
  propKey,
  label,
  unit,
  format,
}: {
  elements: Element[];
  propKey: keyof Element;
  label: string;
  unit: string;
  format?: (v: number) => string;
}) {
  const values = elements.map((el) => {
    const v = el[propKey];
    return typeof v === "number" ? v : null;
  });

  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;

  const maxVal = Math.max(...validValues.map(Math.abs));

  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[9px] text-muted-foreground/60">{unit}</span>
      </div>
      <div className="space-y-1">
        {elements.map((el, i) => {
          const v = values[i];
          const pct =
            v !== null && maxVal > 0
              ? Math.max(2, (Math.abs(v) / maxVal) * 100)
              : 0;

          return (
            <div key={el.atomicNumber} className="flex items-center gap-2">
              <span className="w-8 text-right text-[10px] font-bold text-foreground">
                {el.symbol}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded-sm bg-muted">
                {v !== null && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                )}
              </div>
              <span className="w-16 text-right text-[10px] tabular-nums text-muted-foreground">
                {formatVal(v, format)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ElementComparison({
  elements,
  dispatch,
}: ElementComparisonProps) {
  if (elements.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <GitCompareArrows className="size-4 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Compare Elements
        </span>
        <span className="text-[10px] text-muted-foreground">
          {elements.length}/4 selected
        </span>
        <button
          onClick={() => dispatch({ type: "CLEAR_COMPARISON" })}
          className="ml-auto flex items-center gap-1 rounded-md border border-pink-400/30 bg-pink-400/10 px-2 py-1 text-[10px] font-medium text-pink-400 transition-colors hover:bg-pink-400/20"
        >
          <X className="size-3" />
          Clear
        </button>
      </div>

      <div className="px-4 pb-4 pt-3">
        {/* Element chips */}
        <div className="mb-3 flex flex-wrap gap-2">
          {elements.map((el, i) => {
            const catColor = CATEGORY_COLORS[el.category];
            return (
              <div
                key={el.atomicNumber}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                style={{ borderColor: BAR_COLORS[i % BAR_COLORS.length] }}
              >
                <div
                  className="flex size-7 items-center justify-center rounded text-xs font-black"
                  style={{
                    backgroundColor: catColor.bg,
                    color: catColor.text,
                  }}
                >
                  {el.symbol}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-none">
                    {el.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    #{el.atomicNumber} · {el.atomicMass.toFixed(2)} u
                  </p>
                </div>
                <button
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_COMPARISON",
                      payload: el.atomicNumber,
                    })
                  }
                  className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${el.name} from comparison`}
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}

          {elements.length < 4 && (
            <div className="flex items-center rounded-md border border-dashed border-border px-3 py-2">
              <span className="text-[10px] text-muted-foreground">
                Click elements on the table to add (max 4)
              </span>
            </div>
          )}
        </div>

        {/* Bar charts — only show when 2+ elements */}
        {elements.length >= 2 && (
          <div className="divide-y divide-border/50">
            {COMPARE_PROPERTIES.map((prop) => (
              <ComparisonBar
                key={prop.key}
                elements={elements}
                propKey={prop.key}
                label={prop.label}
                unit={prop.unit}
                format={prop.format}
              />
            ))}
          </div>
        )}

        {elements.length < 2 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Select at least 2 elements to see comparison charts
          </p>
        )}
      </div>
    </div>
  );
}
