"use client";

import type { Dispatch } from "react";
import type { FlowchartAction, NodeShapeType } from "@/lib/flowchart/types";
import {
  SHAPE_PRESETS,
  SHAPE_CATEGORIES,
  type ShapePreset,
} from "@/lib/flowchart/constants";
import { getShapePath, isOpenShape } from "@/lib/flowchart/shapes";

interface ShapePaletteProps {
  activeShapeType: NodeShapeType;
  dispatch: Dispatch<FlowchartAction>;
}

function ShapeThumbnail({
  preset,
  isActive,
  onClick,
}: {
  preset: ShapePreset;
  isActive: boolean;
  onClick: () => void;
}) {
  // Render a small preview of the shape
  const thumbW = 48;
  const thumbH = 36;
  const scale = Math.min(
    (thumbW - 8) / preset.defaultWidth,
    (thumbH - 8) / preset.defaultHeight
  );
  const w = preset.defaultWidth * scale;
  const h = preset.defaultHeight * scale;
  const path = getShapePath(preset.type, w, h);
  const open = isOpenShape(preset.type);

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 rounded-md p-1.5 transition-colors ${
        isActive
          ? "bg-brand/10 ring-1 ring-brand/40"
          : "hover:bg-accent"
      }`}
      title={preset.label}
    >
      <svg
        width={thumbW}
        height={thumbH}
        viewBox={`${-((thumbW - w) / 2)} ${-((thumbH - h) / 2)} ${thumbW} ${thumbH}`}
      >
        <path
          d={path}
          fill={open ? "none" : "var(--color-muted)"}
          stroke={
            isActive ? "var(--color-brand)" : "var(--color-muted-foreground)"
          }
          strokeWidth={1.5}
          opacity={isActive ? 1 : 0.7}
        />
      </svg>
      <span
        className={`text-[10px] leading-tight ${
          isActive ? "text-brand font-medium" : "text-muted-foreground"
        }`}
      >
        {preset.label}
      </span>
    </button>
  );
}

export function ShapePalette({ activeShapeType, dispatch }: ShapePaletteProps) {
  const handleSelect = (type: NodeShapeType) => {
    dispatch({ type: "SET_ACTIVE_SHAPE", payload: type });
    dispatch({ type: "SET_TOOL", payload: "add-shape" });
  };

  return (
    <div className="w-44 overflow-y-auto border-r border-border bg-card">
      {SHAPE_CATEGORIES.map((category) => {
        const shapes = SHAPE_PRESETS.filter(
          (s) => s.category === category.key
        );
        if (shapes.length === 0) return null;

        return (
          <div key={category.key} className="px-2 py-1.5">
            <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {category.label}
            </h4>
            <div className="grid grid-cols-2 gap-0.5">
              {shapes.map((preset) => (
                <ShapeThumbnail
                  key={preset.type}
                  preset={preset}
                  isActive={activeShapeType === preset.type}
                  onClick={() => handleSelect(preset.type)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
