"use client";

import type { FurnitureElement } from "@/lib/floor-plan/types";
import { PIXELS_PER_UNIT } from "@/lib/floor-plan/constants";
import { getFurnitureItem } from "@/lib/floor-plan/furniture";

interface FurnitureRendererProps {
  element: FurnitureElement;
  isSelected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function FurnitureRenderer({
  element,
  isSelected,
  zoom,
  onMouseDown,
}: FurnitureRendererProps) {
  const px = element.x * PIXELS_PER_UNIT;
  const py = element.y * PIXELS_PER_UNIT;
  const pw = element.width * PIXELS_PER_UNIT;
  const ph = element.height * PIXELS_PER_UNIT;
  const fontSize = 9 / zoom;

  const catalogItem = getFurnitureItem(element.furnitureType);

  return (
    <g
      transform={`rotate(${element.rotation}, ${px + pw / 2}, ${py + ph / 2})`}
      style={{ opacity: element.opacity, cursor: "move" }}
      onMouseDown={onMouseDown}
    >
      {/* Bounding box (always render for hit area) */}
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        fill={element.fill}
        fillOpacity={0.15}
        stroke={isSelected ? "var(--color-brand)" : "var(--color-border)"}
        strokeWidth={(isSelected ? 2 : 0.5) / zoom}
        rx={2 / zoom}
      />

      {/* SVG path from catalog */}
      {catalogItem && (
        <svg
          x={px}
          y={py}
          width={pw}
          height={ph}
          viewBox={catalogItem.viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={catalogItem.svgPath}
            fill="none"
            stroke={element.fill}
            strokeWidth={2}
            fillRule="evenodd"
            opacity={0.7}
          />
        </svg>
      )}

      {/* Label below */}
      {element.label && (
        <text
          x={px + pw / 2}
          y={py + ph + fontSize + 2 / zoom}
          textAnchor="middle"
          fontSize={fontSize}
          fill="var(--color-muted-foreground)"
          fontFamily="var(--font-geist-sans)"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {element.label}
        </text>
      )}
    </g>
  );
}
