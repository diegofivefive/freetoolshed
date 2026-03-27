"use client";

import type { Dispatch } from "react";
import type { FloorPlanAction } from "@/lib/floor-plan/types";
import { ZOOM_STEP } from "@/lib/floor-plan/constants";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  dispatch: Dispatch<FloorPlanAction>;
}

export function ZoomControls({ zoom, dispatch }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
      <button
        onClick={() =>
          dispatch({
            type: "SET_VIEWPORT",
            payload: { zoom: zoom - ZOOM_STEP },
          })
        }
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={() =>
          dispatch({
            type: "SET_VIEWPORT",
            payload: { zoom: zoom + ZOOM_STEP },
          })
        }
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <button
        onClick={() => dispatch({ type: "ZOOM_TO_FIT" })}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="Fit to view"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}
