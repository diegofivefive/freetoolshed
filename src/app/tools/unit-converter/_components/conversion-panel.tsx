"use client";

import { useRef, useState } from "react";
import type { UnitDefinition } from "@/lib/unit-converter/types";
import { UnitSelector } from "./unit-selector";
import { AnimatedNumber } from "./animated-number";

interface ConversionPanelProps {
  units: UnitDefinition[];
  fromUnitId: string;
  toUnitId: string;
  inputValue: string;
  outputValue: string;
  onFromUnitChange: (id: string) => void;
  onToUnitChange: (id: string) => void;
  onInputChange: (value: string) => void;
  onSwap: () => void;
}

export function ConversionPanel({
  units,
  fromUnitId,
  toUnitId,
  inputValue,
  outputValue,
  onFromUnitChange,
  onToUnitChange,
  onInputChange,
  onSwap,
}: ConversionPanelProps) {
  const [swapRotation, setSwapRotation] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSwap = () => {
    setSwapRotation((r) => r + 180);
    onSwap();
  };

  const handleCopyOutput = () => {
    if (outputValue) {
      navigator.clipboard.writeText(outputValue);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/70 p-6 shadow-lg shadow-black/5 backdrop-blur-xl transition-shadow duration-300 focus-within:shadow-[0_0_30px_oklch(0.696_0.17_162.48/12%)]">
      <div className="flex items-start gap-4">
        {/* From Side */}
        <div className="flex-1 space-y-3">
          <UnitSelector
            units={units}
            selectedId={fromUnitId}
            onChange={onFromUnitChange}
            label="From"
          />
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter value"
            className="w-full rounded-lg border border-border/50 bg-background/50 px-4 py-3 font-mono text-2xl font-semibold tabular-nums backdrop-blur-sm transition-all focus:border-brand focus:outline-none focus:shadow-[0_0_20px_oklch(0.696_0.17_162.48/15%)]"
            autoFocus
          />
        </div>

        {/* Swap Button */}
        <div className="flex items-center pt-8">
          <button
            onClick={handleSwap}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-brand hover:bg-brand/10 active:scale-95"
            title="Swap units (X)"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out group-hover:text-brand"
              style={{
                transform: `rotate(${swapRotation}deg)`,
                transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>
        </div>

        {/* To Side */}
        <div className="flex-1 space-y-3">
          <UnitSelector
            units={units}
            selectedId={toUnitId}
            onChange={onToUnitChange}
            label="To"
          />
          <button
            onClick={handleCopyOutput}
            className="group w-full cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-background/30 px-4 py-3 text-left backdrop-blur-sm transition-all hover:border-brand/30"
            title="Click to copy"
          >
            {outputValue ? (
              <AnimatedNumber
                value={outputValue}
                className={`font-semibold text-brand ${outputValue.length > 12 ? "text-lg" : outputValue.length > 8 ? "text-xl" : "text-2xl"}`}
              />
            ) : (
              <span className="font-mono text-2xl text-muted-foreground/50">
                &mdash;
              </span>
            )}
            <span className="mt-1 block text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              Click to copy
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
