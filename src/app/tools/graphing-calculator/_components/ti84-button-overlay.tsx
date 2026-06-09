"use client";

import { useState, useCallback, useMemo } from "react";
import { TI84Key } from "./ti84-key";
import type { ModifierState } from "./ti84-key";
import type { TI84ButtonDef, TI84Action } from "./ti84-button-definitions";
import {
  ROW_1,
  ROW_2,
  ROW_3,
  ROW_4,
  ROW_5,
  ROW_6,
  ROW_7,
  ROW_8,
  ROW_9,
  ROW_10,
  DPAD_UP,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_CENTER,
} from "./ti84-button-definitions";
import type { CalcMode } from "@/lib/graphing-calculator/types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface TI84OverlayProps {
  onSetMode: (mode: CalcMode) => void;
  onToggleAngleMode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomStandard: () => void;
  onZoomTrig: () => void;
  onZoomSquare: () => void;
  onToggleTrace: () => void;
  onResetState: () => void;
  onOpenPalette: () => void;
  onClose: () => void;
  insert: (text: string) => void;
  backspace: () => void;
  clearInput: () => void;
  navigateInputs: (direction: "up" | "down" | "left" | "right") => void;
}

// ─── D-pad Sub-component ────────────────────────────────────────────────────

const DPAD_ARROW_CLASSES =
  "absolute flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs text-zinc-400 transition-colors select-none hover:bg-zinc-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80";

const DPAD_BUTTONS: { def: TI84ButtonDef; label: string; glyph: string; position: string }[] = [
  { def: DPAD_UP, label: "Previous input", glyph: "▲", position: "top-2 left-1/2 -translate-x-1/2" },
  { def: DPAD_DOWN, label: "Next input", glyph: "▼", position: "bottom-2 left-1/2 -translate-x-1/2" },
  { def: DPAD_LEFT, label: "Previous input", glyph: "◄", position: "top-1/2 left-2 -translate-y-1/2" },
  { def: DPAD_RIGHT, label: "Next input", glyph: "►", position: "top-1/2 right-2 -translate-y-1/2" },
];

function DPad({ onPress }: { onPress: (button: TI84ButtonDef) => void }) {
  const pressHandlers = (def: TI84ButtonDef) => ({
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onPress(def);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPress(def);
      }
    },
  });

  return (
    <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-800">
      {DPAD_BUTTONS.map(({ def, label, glyph, position }) => (
        <button
          key={def.id}
          type="button"
          aria-label={label}
          {...pressHandlers(def)}
          className={`${DPAD_ARROW_CLASSES} ${position}`}
        >
          {glyph}
        </button>
      ))}
      <button
        type="button"
        {...pressHandlers(DPAD_CENTER)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-semibold text-white transition-colors select-none hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
      >
        OK
      </button>
    </div>
  );
}

// ─── Helper: render a 5-col row ─────────────────────────────────────────────

function Row5({
  buttons,
  modifier,
  onPress,
}: {
  buttons: (TI84ButtonDef | null)[];
  modifier: ModifierState;
  onPress: (button: TI84ButtonDef) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {buttons.map((btn, i) =>
        btn ? (
          <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onPress} />
        ) : (
          <div key={`gap-${i}`} />
        )
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function TI84ButtonOverlay({
  onSetMode,
  onToggleAngleMode,
  onZoomIn,
  onZoomOut,
  onZoomStandard,
  onZoomTrig,
  onZoomSquare,
  onToggleTrace,
  onResetState,
  onOpenPalette,
  onClose,
  insert,
  backspace,
  clearInput,
  navigateInputs,
}: TI84OverlayProps) {
  const [modifier, setModifier] = useState<ModifierState>("none");

  const callbackMap = useMemo<Record<string, (() => void) | undefined>>(
    () => ({
      zoomIn: onZoomIn,
      zoomOut: onZoomOut,
      zoomStandard: onZoomStandard,
      zoomTrig: onZoomTrig,
      zoomSquare: onZoomSquare,
      toggleTrace: onToggleTrace,
      resetState: onResetState,
      openPalette: onOpenPalette,
      closePanel: onClose,
    }),
    [
      onZoomIn,
      onZoomOut,
      onZoomStandard,
      onZoomTrig,
      onZoomSquare,
      onToggleTrace,
      onResetState,
      onOpenPalette,
      onClose,
    ]
  );

  const executeAction = useCallback(
    (action: TI84Action) => {
      switch (action.type) {
        case "mode":
          onSetMode(action.mode);
          break;
        case "insert":
          insert(action.text);
          break;
        case "callback":
          callbackMap[action.key]?.();
          break;
        case "angleToggle":
          onToggleAngleMode();
          break;
        case "clear":
          clearInput();
          break;
        case "delete":
          backspace();
          break;
        case "enter":
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
        case "arrow":
          navigateInputs(action.direction);
          break;
        case "modifier":
        case "noop":
          break;
      }
    },
    [
      onSetMode,
      insert,
      callbackMap,
      onToggleAngleMode,
      clearInput,
      backspace,
      navigateInputs,
    ]
  );

  const onKeyPress = useCallback(
    (button: TI84ButtonDef) => {
      if (button.action.type === "modifier") {
        const targetMod = (button.action as { type: "modifier"; mod: ModifierState }).mod;
        setModifier((prev) => (prev === targetMod ? "none" : targetMod));
        return;
      }

      if (modifier === "second" && button.secondAction) {
        executeAction(button.secondAction);
        setModifier("none");
      } else if (modifier === "alpha" && button.alphaAction) {
        executeAction(button.alphaAction);
        setModifier("none");
      } else {
        executeAction(button.action);
        if (modifier !== "none") {
          setModifier("none");
        }
      }
    },
    [modifier, executeAction]
  );

  return (
    <div className="space-y-2 p-3">
      {/* Layer status — fixed height so toggling never shifts the keys */}
      <div
        aria-live="polite"
        className={`flex h-7 items-center justify-center rounded-md text-[11px] font-medium tracking-wide ${
          modifier === "second"
            ? "bg-amber-400/10 text-amber-300"
            : modifier === "alpha"
              ? "bg-sky-400/10 text-sky-300"
              : "bg-zinc-800/60 text-zinc-500"
        }`}
      >
        {modifier === "second"
          ? "2nd layer on — highlighted keys are active"
          : modifier === "alpha"
            ? "Alpha layer on — highlighted keys are active"
            : "Tap 2nd or alpha to switch key layers"}
      </div>

      {/* Row 1: Top function keys */}
      <Row5 buttons={ROW_1} modifier={modifier} onPress={onKeyPress} />

      {/* Row 2: Modifiers */}
      <Row5 buttons={ROW_2} modifier={modifier} onPress={onKeyPress} />

      {/* Rows 3-4 + D-pad */}
      <div className="flex items-center gap-2 py-1">
        {/* Left: rows 3 and 4 stacked */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {ROW_3.map((btn) => (
              <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ROW_4.map((btn) => (
              <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
            ))}
          </div>
        </div>

        {/* Right: D-pad */}
        <div className="shrink-0">
          <DPad onPress={onKeyPress} />
        </div>
      </div>

      {/* Row 5: Inverse / Trig / Power */}
      <Row5 buttons={ROW_5} modifier={modifier} onPress={onKeyPress} />

      {/* Row 6: Square / Parens / Divide */}
      <Row5 buttons={ROW_6} modifier={modifier} onPress={onKeyPress} />

      {/* Numpad zone separator */}
      <div className="border-t border-zinc-800 pt-2">
        {/* Row 7: Log + 7 8 9 x */}
        <Row5 buttons={ROW_7} modifier={modifier} onPress={onKeyPress} />
      </div>

      {/* Row 8: Ln + 4 5 6 - */}
      <Row5 buttons={ROW_8} modifier={modifier} onPress={onKeyPress} />

      {/* Row 9: Sto + 1 2 3 + */}
      <Row5 buttons={ROW_9} modifier={modifier} onPress={onKeyPress} />

      {/* Row 10: On + 0 . (-) Enter */}
      <Row5 buttons={ROW_10} modifier={modifier} onPress={onKeyPress} />
    </div>
  );
}
