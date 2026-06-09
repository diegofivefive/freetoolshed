"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { TI84ButtonOverlay } from "./ti84-button-overlay";
import type { CalcMode } from "@/lib/graphing-calculator/types";

interface KeypadPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

/**
 * Non-modal floating keypad dock. Unlike a Sheet/Dialog it renders no
 * backdrop and traps no focus — the workspace stays fully visible and
 * interactive while the keypad is open, which is essential since keys
 * type into whichever workspace input was last focused.
 */
export function KeypadPanel({
  open,
  onOpenChange,
  ...overlayProps
}: KeypadPanelProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <aside
      aria-label="Graphing keypad"
      inert={!open}
      className={`fixed top-20 right-4 z-40 flex max-h-[calc(100vh-6rem)] w-[min(440px,calc(100vw-2rem))] transition-all duration-300 ease-out ${
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-[calc(100%+1.5rem)] opacity-0"
      }`}
    >
      <div className="flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <div>
            <h2 className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide text-zinc-100">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/80"
              />
              GRAPHING KEYPAD
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Click any input on the page, then type with the keys below
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Close keypad"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Keys */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TI84ButtonOverlay
            {...overlayProps}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </div>
    </aside>
  );
}
