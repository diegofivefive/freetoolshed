"use client";

import { useState, useCallback } from "react";
import { TI84Key } from "./ti84-key";
import type { ModifierState } from "./ti84-key";
import type { TI84ButtonDef, TI84Action } from "./ti84-button-definitions";
import {
  TOP_ROW,
  MODIFIERS_ROW,
  FUNCTION_ROW,
  SCIENTIFIC_ROW,
  SYMBOLS_ROW,
  NUMPAD_ROW_1,
  NUMPAD_ROW_2,
  NUMPAD_ROW_3,
  NUMPAD_ROW_4,
  ENTER_KEY,
  DPAD_UP,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_CENTER,
} from "./ti84-button-definitions";
import type { CalcMode } from "@/lib/graphing-calculator/types";

// ─── Callback Map Keys ─────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────────

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

  // Map callback keys to actual functions
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

  // Execute an action
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
          // Blur active input to confirm the value
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
        case "arrow":
          navigateInputs(action.direction);
          break;
        case "modifier":
          // Handled in onKeyPress, should not reach here
          break;
        case "noop":
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSetMode, insert, onToggleAngleMode, clearInput, backspace, navigateInputs]
  );

  // Handle a button press with modifier awareness
  const onKeyPress = useCallback(
    (button: TI84ButtonDef) => {
      // Modifier keys toggle their own state
      if (button.action.type === "modifier") {
        const targetMod = (button.action as { type: "modifier"; mod: ModifierState }).mod;
        setModifier((prev) => (prev === targetMod ? "none" : targetMod));
        return;
      }

      // Check if a modifier is active and the button has a modified action
      if (modifier === "second" && button.secondAction) {
        executeAction(button.secondAction);
        setModifier("none");
      } else if (modifier === "alpha" && button.alphaAction) {
        executeAction(button.alphaAction);
        setModifier("none");
      } else {
        executeAction(button.action);
        // Reset modifier even if button had no alternate action
        if (modifier !== "none") {
          setModifier("none");
        }
      }
    },
    [modifier, executeAction]
  );

  return (
    <div
      className="overflow-y-auto rounded-lg border border-zinc-600 bg-zinc-800 p-3"
      style={{ maxHeight: "calc(100vh - 5rem - 250px - 3rem)" }}
    >
      {/* Modifier indicator */}
      {modifier !== "none" && (
        <div
          className={`mb-2 rounded px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wider ${
            modifier === "second"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {modifier === "second" ? "2nd Active" : "Alpha Active"}
        </div>
      )}

      {/* Section A: Top Row (mode keys) */}
      <div className="grid grid-cols-5 gap-1">
        {TOP_ROW.map((btn) => (
          <TI84Key
            key={btn.id}
            button={btn}
            modifier={modifier}
            onPress={onKeyPress}
          />
        ))}
      </div>

      {/* Section B: Modifiers */}
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {MODIFIERS_ROW.map((btn) => (
          <TI84Key
            key={btn.id}
            button={btn}
            modifier={modifier}
            onPress={onKeyPress}
          />
        ))}
      </div>

      {/* Section C: Function access */}
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {FUNCTION_ROW.map((btn) => (
          <TI84Key
            key={btn.id}
            button={btn}
            modifier={modifier}
            onPress={onKeyPress}
          />
        ))}
      </div>

      {/* Section D: D-pad */}
      <div className="mx-auto mt-3 mb-3 grid w-28 grid-cols-3 grid-rows-3 gap-1">
        {/* Row 1: empty | up | empty */}
        <div />
        <TI84Key button={DPAD_UP} modifier={modifier} onPress={onKeyPress} />
        <div />
        {/* Row 2: left | center | right */}
        <TI84Key button={DPAD_LEFT} modifier={modifier} onPress={onKeyPress} />
        <TI84Key button={DPAD_CENTER} modifier={modifier} onPress={onKeyPress} />
        <TI84Key button={DPAD_RIGHT} modifier={modifier} onPress={onKeyPress} />
        {/* Row 3: empty | down | empty */}
        <div />
        <TI84Key button={DPAD_DOWN} modifier={modifier} onPress={onKeyPress} />
        <div />
      </div>

      {/* Section E: Scientific functions */}
      <div className="grid grid-cols-5 gap-1">
        {SCIENTIFIC_ROW.map((btn) => (
          <TI84Key
            key={btn.id}
            button={btn}
            modifier={modifier}
            onPress={onKeyPress}
          />
        ))}
      </div>

      {/* Section F: Symbols */}
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {SYMBOLS_ROW.map((btn) => (
          <TI84Key
            key={btn.id}
            button={btn}
            modifier={modifier}
            onPress={onKeyPress}
          />
        ))}
      </div>

      {/* Section G: Number pad (4-col grid) */}
      <div className="mt-3 grid grid-cols-4 gap-1">
        {NUMPAD_ROW_1.map((btn) => (
          <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
        ))}
        {NUMPAD_ROW_2.map((btn) => (
          <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
        ))}
        {NUMPAD_ROW_3.map((btn) => (
          <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
        ))}
        {NUMPAD_ROW_4.map((btn) => (
          <TI84Key key={btn.id} button={btn} modifier={modifier} onPress={onKeyPress} />
        ))}
      </div>

      {/* Section H: Enter */}
      <div className="mt-1.5 grid grid-cols-4 gap-1">
        <TI84Key button={ENTER_KEY} modifier={modifier} onPress={onKeyPress} />
      </div>
    </div>
  );
}
