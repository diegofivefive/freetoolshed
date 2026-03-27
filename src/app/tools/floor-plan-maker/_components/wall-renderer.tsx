"use client";

import type { WallElement } from "@/lib/floor-plan/types";
import { PIXELS_PER_UNIT } from "@/lib/floor-plan/constants";

interface WallRendererProps {
  element: WallElement;
  isSelected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function WallRenderer({
  element,
  isSelected,
  zoom,
  onMouseDown,
}: WallRendererProps) {
  const x1 = element.x * PIXELS_PER_UNIT;
  const y1 = element.y * PIXELS_PER_UNIT;
  const x2 = element.x2 * PIXELS_PER_UNIT;
  const y2 = element.y2 * PIXELS_PER_UNIT;
  const thickness = element.thickness * PIXELS_PER_UNIT;

  return (
    <g
      style={{ opacity: element.opacity, cursor: "move" }}
      onMouseDown={onMouseDown}
    >
      {/* Wall line with thickness */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isSelected ? "var(--color-brand)" : element.strokeColor}
        strokeWidth={Math.max(thickness, 2 / zoom)}
        strokeLinecap="round"
      />

      {/* Invisible wider hit area for easier clicking */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="transparent"
        strokeWidth={Math.max(thickness + 10 / zoom, 12 / zoom)}
        strokeLinecap="round"
      />
    </g>
  );
}
