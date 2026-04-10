"use client";

import type { ViewMode, ElementCategory } from "@/lib/periodic-table/types";
import { CATEGORY_COLORS, STATE_COLORS } from "@/lib/periodic-table/constants";

interface CategoryLegendProps {
  viewMode: ViewMode;
}

const CATEGORY_ORDER: ElementCategory[] = [
  "alkali-metal",
  "alkaline-earth-metal",
  "transition-metal",
  "post-transition-metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble-gas",
  "lanthanide",
  "actinide",
  "unknown",
];

export function CategoryLegend({ viewMode }: CategoryLegendProps) {
  if (viewMode === "category") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-2">
        {CATEGORY_ORDER.map((cat) => {
          const color = CATEGORY_COLORS[cat];
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <div
                className="size-3 rounded-[2px] border"
                style={{
                  backgroundColor: color.bg,
                  borderColor: color.border,
                }}
              />
              <span className="text-[10px] text-muted-foreground">
                {color.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === "temperature") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-2">
        {(["solid", "liquid", "gas", "unknown"] as const).map((s) => {
          const color = STATE_COLORS[s];
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className="size-3 rounded-[2px] border border-white/20"
                style={{ backgroundColor: color.bg }}
              />
              <span className="text-[10px] text-muted-foreground">
                {color.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === "heatmap") {
    return (
      <div className="flex items-center justify-center gap-2 px-2">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div
          className="h-3 w-32 rounded-sm"
          style={{
            background:
              "linear-gradient(to right, oklch(0.55 0.12 250), oklch(0.68 0.14 163), oklch(0.80 0.16 30))",
          }}
        />
        <span className="text-[10px] text-muted-foreground">High</span>
      </div>
    );
  }

  return null;
}
