"use client";

import type {
  TI84ButtonDef,
  TI84ButtonColor,
  TI84Action,
} from "./ti84-button-definitions";

// ─── Modifier State ─────────────────────────────────────────────────────────

export type ModifierState = "none" | "second" | "alpha";

// ─── Keycap color variants ──────────────────────────────────────────────────

const COLOR_STYLES: Record<TI84ButtonColor, string> = {
  fn: "border-zinc-950/90 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100",
  body: "border-zinc-950/90 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  num: "border-zinc-950/90 bg-zinc-700 text-white hover:bg-zinc-600",
  second: "border-amber-600 bg-amber-400 text-zinc-950 hover:bg-amber-300",
  alpha: "border-sky-600 bg-sky-400 text-zinc-950 hover:bg-sky-300",
  enter: "border-emerald-700 bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
};

// Tinted styles when a key participates in the active 2nd/alpha layer
const ACCENT_STYLES = {
  second:
    "border-amber-500/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
  alpha: "border-sky-500/60 bg-sky-400/15 text-sky-300 hover:bg-sky-400/25",
};

const LATCHED_STYLES = {
  second: "ring-2 ring-amber-300 ring-offset-2 ring-offset-zinc-900",
  alpha: "ring-2 ring-sky-300 ring-offset-2 ring-offset-zinc-900",
};

function isLive(action?: TI84Action): boolean {
  return !!action && action.type !== "noop";
}

// ─── Component ──────────────────────────────────────────────────────────────

interface TI84KeyProps {
  button: TI84ButtonDef;
  modifier: ModifierState;
  onPress: (button: TI84ButtonDef) => void;
}

export function TI84Key({ button, modifier, onPress }: TI84KeyProps) {
  const isModifierKey = button.action.type === "modifier";
  const latched =
    (modifier === "second" && button.id === "2nd") ||
    (modifier === "alpha" && button.id === "alpha");

  // A layer function only counts if it's actually wired up — unimplemented
  // (noop) functions are never printed on the keycap.
  const hasSecond = isLive(button.secondAction) && !!button.secondLabel;
  const hasAlpha = isLive(button.alphaAction) && !!button.alphaLabel;

  // In a shifted layer, participating keys light up and show their layer
  // label as the main legend; the rest fade back (but still fall through
  // to their base action if pressed).
  const accent =
    modifier === "second" && hasSecond
      ? ("second" as const)
      : modifier === "alpha" && hasAlpha
        ? ("alpha" as const)
        : null;
  const dimmed = modifier !== "none" && !accent && !isModifierKey;

  const displayLabel = accent
    ? (accent === "second" ? button.secondLabel : button.alphaLabel)
    : button.label;

  // Keys whose base action isn't implemented yet read as muted
  const baseDead = !isModifierKey && !isLive(button.action);

  // Printed layer legends only appear on neutral keycaps in the base layer
  const showLegends =
    modifier === "none" &&
    (button.color === "body" ||
      button.color === "fn" ||
      button.color === "num");

  const isNum = button.color === "num";

  return (
    <button
      type="button"
      aria-pressed={isModifierKey ? latched : undefined}
      onMouseDown={(e) => {
        e.preventDefault();
        onPress(button);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPress(button);
        }
      }}
      title={
        accent === "second"
          ? `2nd: ${button.secondLabel}`
          : accent === "alpha"
            ? `Alpha: ${button.alphaLabel}`
            : button.label
      }
      className={`flex h-12 w-full min-w-0 cursor-pointer flex-col rounded-lg border border-b-[3px] px-1 pt-1 pb-1.5 transition-all duration-75 select-none active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
        accent ? ACCENT_STYLES[accent] : COLOR_STYLES[button.color]
      } ${latched ? LATCHED_STYLES[modifier === "second" ? "second" : "alpha"] : ""} ${
        dimmed ? "opacity-35" : ""
      }`}
    >
      {/* Layer legends: 2nd (amber, left) and alpha (sky, right) */}
      <span className="flex h-[10px] w-full items-start justify-between gap-1 leading-none">
        <span className="min-w-0 truncate text-left text-[9px] font-medium text-amber-300/90">
          {showLegends && hasSecond ? button.secondLabel : ""}
        </span>
        <span className="shrink-0 text-[9px] font-medium text-sky-300/90">
          {showLegends && hasAlpha ? button.alphaLabel : ""}
        </span>
      </span>

      {/* Main legend */}
      <span className="flex w-full min-w-0 flex-1 items-center justify-center">
        <span
          className={`truncate font-mono leading-none ${
            isNum ? "text-[15px] font-semibold" : "text-[13px] font-medium"
          } ${baseDead && !accent ? "opacity-50" : ""}`}
        >
          {displayLabel}
        </span>
      </span>
    </button>
  );
}
