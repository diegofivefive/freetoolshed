"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TI84ButtonOverlay } from "./ti84-button-overlay";
import type { CalcMode } from "@/lib/graphing-calculator/types";

interface TI84SheetProps {
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

export function TI84Sheet({
  open,
  onOpenChange,
  ...overlayProps
}: TI84SheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-zinc-700 bg-zinc-900 p-0 sm:max-w-[420px]"
      >
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-sm text-zinc-100">
            TI-84 Plus CE
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400">
            Tap 2nd or Alpha first, then press a key
          </SheetDescription>
        </SheetHeader>
        <div className="px-2 pb-4">
          <TI84ButtonOverlay {...overlayProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
