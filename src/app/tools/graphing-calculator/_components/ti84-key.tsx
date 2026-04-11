"use client";

import type { TI84ButtonDef, TI84ButtonColor } from "./ti84-button-definitions";

// ─── Color Style Map ────────────────────────────────────────────────────────

const COLOR_STYLES: Record<TI84ButtonColor, string> = {
  darkblue:
    "bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950 border-blue-800",
  darkgray:
    "bg-zinc-700 text-zinc-100 hover:bg-zinc-600 active:bg-zinc-800 border-zinc-600",
  lightgray:
    "bg-zinc-400 text-zinc-900 hover:bg-zinc-300 active:bg-zinc-500 border-zinc-300 dark:bg-zinc-500 dark:text-zinc-100 dark:hover:bg-zinc-400 dark:active:bg-zinc-600 dark:border-zinc-400",
  yellow:
    "bg-amber-500 text-zinc-900 hover:bg-amber-400 active:bg-amber-600 border-amber-400 font-bold",
  green:
    "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 border-emerald-500",
  enter:
    "bg-blue-700 text-white hover:bg-blue-600 active:bg-blue-800 border-blue-600 font-bold",
};

// ─── Modifier State ─────────────────────────────────────────────────────────

export type ModifierState = "none" | "second" | "alpha";

// ─── Component ──────────────────────────────────────────────────────────────

interface TI84KeyProps {
  button: TI84ButtonDef;
  modifier: ModifierState;
  onPress: (button: TI84ButtonDef) => void;
}

export function TI84Key({ button, modifier, onPress }: TI84KeyProps) {
  // Determine which label to show
  const showSecond = modifier === "second" && button.secondLabel;
  const showAlpha = modifier === "alpha" && button.alphaLabel;

  const displayLabel = showSecond
    ? button.secondLabel
    : showAlpha
      ? button.alphaLabel
      : button.label;

  // Text color override for modifier labels
  const labelColorClass = showSecond
    ? "text-amber-300"
    : showAlpha
      ? "text-emerald-300"
      : "";

  // 2nd label annotation shown above the key in normal state
  const secondAnnotation =
    modifier === "none" && button.secondLabel ? button.secondLabel : null;

  return (
    <div
      className="flex flex-col items-center"
      style={{ gridColumn: button.colSpan ? `span ${button.colSpan}` : undefined }}
    >
      {/* 2nd function label (shown above key like on real TI-84) */}
      {secondAnnotation && (
        <span className="mb-0.5 truncate text-center text-[8px] leading-none text-amber-500">
          {secondAnnotation}
        </span>
      )}

      <button
        onMouseDown={(e) => {
          // Prevent focus steal from the active expression input
          e.preventDefault();
          onPress(button);
        }}
        className={`flex w-full cursor-pointer items-center justify-center rounded-md border px-0.5 py-1.5 text-[10px] leading-tight transition-colors select-none ${COLOR_STYLES[button.color]} ${labelColorClass}`}
        title={
          showSecond
            ? `2nd: ${button.secondLabel}`
            : showAlpha
              ? `Alpha: ${button.alphaLabel}`
              : button.label
        }
      >
        {displayLabel}
      </button>
    </div>
  );
}
