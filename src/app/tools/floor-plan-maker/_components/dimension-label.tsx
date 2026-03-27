"use client";

import type { MeasurementUnit } from "@/lib/floor-plan/types";
import { formatDimension } from "@/lib/floor-plan/constants";
import { PIXELS_PER_UNIT } from "@/lib/floor-plan/constants";

interface DimensionLabelProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  value: number;
  unit: MeasurementUnit;
  zoom: number;
}

export function DimensionLabel({
  x1,
  y1,
  x2,
  y2,
  value,
  unit,
  zoom,
}: DimensionLabelProps) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const fontSize = 10 / zoom;
  const padX = 4 / zoom;
  const padY = 2 / zoom;
  const text = formatDimension(value, unit);

  // Estimate text width (rough: 6px per char at base font size)
  const textWidth = (text.length * 6) / zoom;
  const textHeight = fontSize;

  // Offset the label outward from the edge
  const isHorizontal = Math.abs(y1 - y2) < 1;
  const offsetX = isHorizontal ? 0 : -((textWidth + padX * 2) / 2 + 4 / zoom);
  const offsetY = isHorizontal ? -((textHeight + padY * 2) / 2 + 4 / zoom) : 0;

  return (
    <g>
      <rect
        x={midX + offsetX - textWidth / 2 - padX}
        y={midY + offsetY - textHeight / 2 - padY}
        width={textWidth + padX * 2}
        height={textHeight + padY * 2}
        rx={2 / zoom}
        fill="var(--color-card)"
        stroke="var(--color-border)"
        strokeWidth={0.5 / zoom}
      />
      <text
        x={midX + offsetX}
        y={midY + offsetY + fontSize * 0.35}
        textAnchor="middle"
        fontSize={fontSize}
        fill="var(--color-muted-foreground)"
        fontFamily="var(--font-geist-mono)"
        style={{ userSelect: "none" }}
      >
        {text}
      </text>
    </g>
  );
}

interface RoomDimensionsProps {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: MeasurementUnit;
  zoom: number;
}

export function RoomDimensions({
  x,
  y,
  width,
  height,
  unit,
  zoom,
}: RoomDimensionsProps) {
  const px = x * PIXELS_PER_UNIT;
  const py = y * PIXELS_PER_UNIT;
  const pw = width * PIXELS_PER_UNIT;
  const ph = height * PIXELS_PER_UNIT;

  return (
    <g>
      {/* Top edge */}
      <DimensionLabel
        x1={px}
        y1={py}
        x2={px + pw}
        y2={py}
        value={width}
        unit={unit}
        zoom={zoom}
      />
      {/* Left edge */}
      <DimensionLabel
        x1={px}
        y1={py}
        x2={px}
        y2={py + ph}
        value={height}
        unit={unit}
        zoom={zoom}
      />
    </g>
  );
}
