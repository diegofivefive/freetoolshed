"use client";

import type { RoomElement, MeasurementUnit } from "@/lib/floor-plan/types";
import { PIXELS_PER_UNIT } from "@/lib/floor-plan/constants";
import { RoomDimensions } from "./dimension-label";

interface RoomRendererProps {
  element: RoomElement;
  isSelected: boolean;
  unit: MeasurementUnit;
  showDimensions: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function RoomRenderer({
  element,
  isSelected,
  unit,
  showDimensions,
  zoom,
  onMouseDown,
}: RoomRendererProps) {
  const px = element.x * PIXELS_PER_UNIT;
  const py = element.y * PIXELS_PER_UNIT;
  const pw = element.width * PIXELS_PER_UNIT;
  const ph = element.height * PIXELS_PER_UNIT;
  const fontSize = 12 / zoom;

  return (
    <g
      transform={`rotate(${element.rotation}, ${px + pw / 2}, ${py + ph / 2})`}
      style={{ opacity: element.opacity, cursor: "move" }}
      onMouseDown={onMouseDown}
    >
      {/* Room fill */}
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        fill={element.fill}
        fillOpacity={0.5}
        stroke={isSelected ? "var(--color-brand)" : element.strokeColor}
        strokeWidth={(isSelected ? 2 : 1) / zoom}
        rx={2 / zoom}
      />

      {/* Room label */}
      {element.label && (
        <text
          x={px + pw / 2}
          y={py + ph / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill="var(--color-foreground)"
          fontFamily="var(--font-geist-sans)"
          fontWeight={500}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {element.label}
        </text>
      )}

      {/* Dimensions */}
      {(showDimensions || element.showDimensions) && (
        <RoomDimensions
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          unit={unit}
          zoom={zoom}
        />
      )}
    </g>
  );
}
