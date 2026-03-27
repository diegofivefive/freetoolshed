"use client";

import type { Dispatch } from "react";
import type { FloorPlanAction, ToolMode } from "@/lib/floor-plan/types";
import { MousePointer2, Square, Minus, Type, Sofa } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  activeTool: ToolMode;
  showFurniturePalette: boolean;
  onToggleFurniture: () => void;
  dispatch: Dispatch<FloorPlanAction>;
}

const TOOLS: { mode: ToolMode; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { mode: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { mode: "room", icon: Square, label: "Draw Room", shortcut: "R" },
  { mode: "wall", icon: Minus, label: "Draw Wall", shortcut: "W" },
  { mode: "text", icon: Type, label: "Add Text", shortcut: "T" },
];

export function Toolbar({ activeTool, showFurniturePalette, onToggleFurniture, dispatch }: ToolbarProps) {
  return (
    <div className="flex w-12 flex-col items-center gap-1 border-r border-border bg-card py-2">
      {TOOLS.map(({ mode, icon: Icon, label, shortcut }) => (
        <button
          key={mode}
          onClick={() => dispatch({ type: "SET_TOOL", payload: mode })}
          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
            activeTool === mode
              ? "bg-brand/10 text-brand"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title={`${label} (${shortcut})`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      <Separator className="mx-2 my-1" />

      {/* Furniture palette toggle */}
      <button
        onClick={onToggleFurniture}
        className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
          showFurniturePalette
            ? "bg-brand/10 text-brand"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        title="Furniture (F)"
      >
        <Sofa className="h-4 w-4" />
      </button>
    </div>
  );
}
