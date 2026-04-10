"use client";

import { useMemo } from "react";
import { Thermometer } from "lucide-react";
import type { PeriodicTableAction } from "@/lib/periodic-table/types";
import { ELEMENTS, getElementState } from "@/lib/periodic-table/elements-data";
import { STATE_COLORS, TEMP_MIN, TEMP_MAX } from "@/lib/periodic-table/constants";

interface TemperatureSliderProps {
  temperature: number;
  dispatch: React.Dispatch<PeriodicTableAction>;
}

/** Notable temperature presets */
const PRESETS = [
  { label: "0 K", value: 0, sub: "Absolute zero" },
  { label: "77 K", value: 77, sub: "Liquid N₂" },
  { label: "273 K", value: 273, sub: "Water freezes" },
  { label: "298 K", value: 298, sub: "Room temp" },
  { label: "373 K", value: 373, sub: "Water boils" },
  { label: "1811 K", value: 1811, sub: "Iron melts" },
  { label: "3695 K", value: 3695, sub: "Tungsten melts" },
  { label: "5778 K", value: 5778, sub: "Sun surface" },
] as const;

/** Convert K to °C */
function toCelsius(k: number): number {
  return Math.round(k - 273.15);
}

/** Convert K to °F */
function toFahrenheit(k: number): number {
  return Math.round((k - 273.15) * 1.8 + 32);
}

export function TemperatureSlider({
  temperature,
  dispatch,
}: TemperatureSliderProps) {
  // Count elements in each state at current temperature
  const stateCounts = useMemo(() => {
    const counts = { solid: 0, liquid: 0, gas: 0, unknown: 0 };
    for (const el of ELEMENTS) {
      const s = getElementState(el, temperature);
      counts[s]++;
    }
    return counts;
  }, [temperature]);

  const sliderPercent = ((temperature - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header row */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Thermometer className="size-4 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Temperature Explorer
        </span>

        {/* State counts */}
        <div className="ml-auto flex items-center gap-3">
          {(["solid", "liquid", "gas", "unknown"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className="size-2.5 rounded-[2px]"
                style={{ backgroundColor: STATE_COLORS[s].bg }}
              />
              <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                {stateCounts[s]}
              </span>
              <span className="hidden text-[10px] text-muted-foreground/60 sm:inline">
                {STATE_COLORS[s].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Slider area */}
      <div className="px-4 pb-3 pt-4">
        {/* Temperature readout */}
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-3xl font-black tabular-nums tracking-tight text-foreground">
            {temperature}
          </span>
          <span className="text-sm font-medium text-muted-foreground">K</span>
          <span className="text-xs tabular-nums text-muted-foreground/60">
            {toCelsius(temperature)}°C · {toFahrenheit(temperature)}°F
          </span>
        </div>

        {/* Custom slider with gradient track */}
        <div className="relative mb-2 h-6">
          {/* Track background — gradient from blue (cold) through green (mid) to orange (hot) */}
          <div
            className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(to right, oklch(0.60 0.14 250), oklch(0.65 0.14 220) 15%, oklch(0.70 0.14 163) 35%, oklch(0.75 0.14 80) 60%, oklch(0.70 0.15 40) 80%, oklch(0.65 0.16 25))",
            }}
          />
          {/* Active portion overlay */}
          <div
            className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full"
            style={{
              width: `${sliderPercent}%`,
              background:
                "linear-gradient(to right, oklch(0.60 0.14 250), oklch(0.65 0.14 220) 15%, oklch(0.70 0.14 163) 35%, oklch(0.75 0.14 80) 60%, oklch(0.70 0.15 40) 80%, oklch(0.65 0.16 25))",
              opacity: 1,
            }}
          />
          {/* Dimmed portion after thumb */}
          <div
            className="absolute top-1/2 right-0 h-2 -translate-y-1/2 rounded-full bg-muted"
            style={{
              width: `${100 - sliderPercent}%`,
            }}
          />
          {/* Range input */}
          <input
            type="range"
            min={TEMP_MIN}
            max={TEMP_MAX}
            step={1}
            value={temperature}
            onChange={(e) =>
              dispatch({
                type: "SET_TEMPERATURE",
                payload: Number(e.target.value),
              })
            }
            className="temp-slider absolute inset-x-0 top-1/2 z-10 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent"
            aria-label="Temperature in Kelvin"
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-[9px] tabular-nums text-muted-foreground/50">
          <span>0 K</span>
          <span>1000</span>
          <span>2000</span>
          <span>3000</span>
          <span>4000</span>
          <span>5000</span>
          <span>6000 K</span>
        </div>

        {/* Preset buttons */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() =>
                dispatch({ type: "SET_TEMPERATURE", payload: p.value })
              }
              className={`group rounded-md border px-2 py-1 text-left transition-all ${
                temperature === p.value
                  ? "border-brand bg-brand/10"
                  : "border-border hover:border-brand/40"
              }`}
            >
              <span
                className={`block text-[10px] font-bold tabular-nums ${
                  temperature === p.value
                    ? "text-brand"
                    : "text-foreground"
                }`}
              >
                {p.label}
              </span>
              <span className="block text-[8px] text-muted-foreground">
                {p.sub}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
