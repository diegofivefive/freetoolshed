"use client";

import type { Dispatch } from "react";
import type { FlowchartAction, ToolMode } from "@/lib/flowchart/types";
import {
  MousePointer2,
  Hand,
  Plus,
  GitBranch,
  Type,
  Shapes,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  activeTool: ToolMode;
  showShapePalette: boolean;
  onToggleShapePalette: () => void;
  dispatch: Dispatch<FlowchartAction>;
}

const TOOLS: {
  mode: ToolMode;
  icon: typeof MousePointer2;
  label: string;
  shortcut: string;
}[] = [
  { mode: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { mode: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { mode: "add-shape", icon: Plus, label: "Add Shape", shortcut: "S" },
  { mode: "connect", icon: GitBranch, label: "Connect", shortcut: "C" },
  { mode: "text", icon: Type, label: "Add Text", shortcut: "T" },
];

export function Toolbar({
  activeTool,
  showShapePalette,
  onToggleShapePalette,
  dispatch,
}: ToolbarProps) {
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

      {/* Shape palette toggle */}
      <button
        onClick={onToggleShapePalette}
        className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
          showShapePalette
            ? "bg-brand/10 text-brand"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        title="Shape Palette (S)"
      >
        <Shapes className="h-4 w-4" />
      </button>
    </div>
  );
}
