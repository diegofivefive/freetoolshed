"use client";

import type { TextElement } from "@/lib/floor-plan/types";
import { PIXELS_PER_UNIT } from "@/lib/floor-plan/constants";

interface TextRendererProps {
  element: TextElement;
  isSelected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function TextRenderer({
  element,
  isSelected,
  zoom,
  onMouseDown,
}: TextRendererProps) {
  const px = element.x * PIXELS_PER_UNIT;
  const py = element.y * PIXELS_PER_UNIT;
  const fontSize = element.fontSize / zoom;

  return (
    <g
      transform={`rotate(${element.rotation}, ${px}, ${py})`}
      style={{ opacity: element.opacity, cursor: "move" }}
      onMouseDown={onMouseDown}
    >
      {/* Selection background */}
      {isSelected && (
        <rect
          x={px - 4 / zoom}
          y={py - fontSize - 2 / zoom}
          width={(element.text.length * fontSize * 0.6) + 8 / zoom}
          height={fontSize + 8 / zoom}
          fill="var(--color-brand)"
          fillOpacity={0.1}
          stroke="var(--color-brand)"
          strokeWidth={1 / zoom}
          rx={2 / zoom}
        />
      )}

      <text
        x={px}
        y={py}
        fontSize={fontSize}
        fontWeight={element.fontWeight}
        fill={element.color}
        fontFamily="var(--font-geist-sans)"
        style={{ userSelect: "none" }}
      >
        {element.text}
      </text>
    </g>
  );
}
