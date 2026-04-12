"use client";

import { useState, useCallback } from "react";
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
  insert: (text: string) => void;
  backspace: () => void;
  clearInput: () => void;
  navigateInputs: (direction: "up" | "down" | "left" | "right") => void;
}

// ─── D-pad Sub-component ────────────────────────────────────────────────────

function DPad({
  modifier,
  onPress,
}: {
  modifier: ModifierState;
  onPress: (button: TI84ButtonDef) => void;
}) {
  return (
    <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-zinc-600 bg-zinc-700">
      {/* Up */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onPress(DPAD_UP);
        }}
        className="absolute top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full text-xs text-zinc-300 transition-colors select-none hover:bg-zinc-600 hover:text-white"
      >
        ▲
      </button>
      {/* Down */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onPress(DPAD_DOWN);
        }}
        className="absolute bottom-2 left-1/2 flex h-7 w-7 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full text-xs text-zinc-300 transition-colors select-none hover:bg-zinc-600 hover:text-white"
      >
        ▼
      </button>
      {/* Left */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onPress(DPAD_LEFT);
        }}
        className="absolute top-1/2 left-2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-xs text-zinc-300 transition-colors select-none hover:bg-zinc-600 hover:text-white"
      >
        ◄
      </button>
      {/* Right */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onPress(DPAD_RIGHT);
        }}
        className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-xs text-zinc-300 transition-colors select-none hover:bg-zinc-600 hover:text-white"
      >
        ►
      </button>
      {/* Center */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onPress(DPAD_CENTER);
        }}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-600 text-xs font-medium text-zinc-200 transition-colors select-none hover:bg-zinc-500 hover:text-white"
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
    <div className="grid grid-cols-5 gap-1.5">
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
  insert,
  backspace,
  clearInput,
  navigateInputs,
}: TI84OverlayProps) {
  const [modifier, setModifier] = useState<ModifierState>("none");

  const callbackMap: Record<string, (() => void) | undefined> = {
    zoomIn: onZoomIn,
    zoomOut: onZoomOut,
    zoomStandard: onZoomStandard,
    zoomTrig: onZoomTrig,
    zoomSquare: onZoomSquare,
    toggleTrace: onToggleTrace,
    resetState: onResetState,
    openPalette: onOpenPalette,
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSetMode, insert, onToggleAngleMode, clearInput, backspace, navigateInputs]
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
    <div className="space-y-1.5 rounded-2xl bg-zinc-900 p-3">
      {/* Modifier indicator */}
      {modifier !== "none" && (
        <div
          className={`rounded px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wider ${
            modifier === "second"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {modifier === "second" ? "2nd Active" : "Alpha Active"}
        </div>
      )}

      {/* Row 1: Top function keys */}
      <Row5 buttons={ROW_1} modifier={modifier} onPress={onKeyPress} />

      {/* Row 2: Modifiers */}
      <Row5 buttons={ROW_2} modifier={modifier} onPress={onKeyPress} />

      {/* Rows 3-4 + D-pad */}
      <div className="flex items-center gap-2 py-1">
        {/* Left: rows 3 and 4 stacked */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            {ROW_3.map((btn) => (
              <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ROW_4.map((btn) => (
              <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
            ))}
          </div>
        </div>

        {/* Right: D-pad */}
        <div className="shrink-0">
          <DPad modifier={modifier} onPress={onKeyPress} />
        </div>
      </div>

      {/* Row 5: Inverse / Trig / Power */}
      <Row5 buttons={ROW_5} modifier={modifier} onPress={onKeyPress} />

      {/* Row 6: Square / Parens / Divide */}
      <Row5 buttons={ROW_6} modifier={modifier} onPress={onKeyPress} />

      {/* Numpad zone separator */}
      <div className="border-t border-zinc-700 pt-1.5">
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
