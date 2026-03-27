"use client";

import { PIXELS_PER_UNIT } from "@/lib/floor-plan/constants";

export type HandlePosition =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left"
  | "rotate";

interface ResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zoom: number;
  onHandleMouseDown: (handle: HandlePosition, e: React.MouseEvent) => void;
}

const HANDLE_SIZE = 8;
const ROTATE_OFFSET = 24;

const CURSOR_MAP: Record<HandlePosition, string> = {
  "top-left": "nwse-resize",
  "top": "ns-resize",
  "top-right": "nesw-resize",
  "right": "ew-resize",
  "bottom-right": "nwse-resize",
  "bottom": "ns-resize",
  "bottom-left": "nesw-resize",
  "left": "ew-resize",
  "rotate": "grab",
};

export function ResizeHandles({
  x,
  y,
  width,
  height,
  rotation,
  zoom,
  onHandleMouseDown,
}: ResizeHandlesProps) {
  const px = x * PIXELS_PER_UNIT;
  const py = y * PIXELS_PER_UNIT;
  const pw = width * PIXELS_PER_UNIT;
  const ph = height * PIXELS_PER_UNIT;

  const hs = HANDLE_SIZE / zoom;
  const half = hs / 2;
  const rotateOff = ROTATE_OFFSET / zoom;

  const handles: { pos: HandlePosition; cx: number; cy: number }[] = [
    { pos: "top-left", cx: px, cy: py },
    { pos: "top", cx: px + pw / 2, cy: py },
    { pos: "top-right", cx: px + pw, cy: py },
    { pos: "right", cx: px + pw, cy: py + ph / 2 },
    { pos: "bottom-right", cx: px + pw, cy: py + ph },
    { pos: "bottom", cx: px + pw / 2, cy: py + ph },
    { pos: "bottom-left", cx: px, cy: py + ph },
    { pos: "left", cx: px, cy: py + ph / 2 },
  ];

  return (
    <g
      transform={`rotate(${rotation}, ${px + pw / 2}, ${py + ph / 2})`}
    >
      {/* Selection outline */}
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={1.5 / zoom}
        strokeDasharray={`${4 / zoom} ${3 / zoom}`}
        pointerEvents="none"
      />

      {/* Resize handles */}
      {handles.map(({ pos, cx, cy }) => (
        <rect
          key={pos}
          x={cx - half}
          y={cy - half}
          width={hs}
          height={hs}
          fill="white"
          stroke="var(--color-brand)"
          strokeWidth={1.5 / zoom}
          rx={1 / zoom}
          style={{ cursor: CURSOR_MAP[pos] }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onHandleMouseDown(pos, e);
          }}
        />
      ))}

      {/* Rotation handle — line + circle above top-center */}
      <line
        x1={px + pw / 2}
        y1={py}
        x2={px + pw / 2}
        y2={py - rotateOff}
        stroke="var(--color-brand)"
        strokeWidth={1 / zoom}
        pointerEvents="none"
      />
      <circle
        cx={px + pw / 2}
        cy={py - rotateOff}
        r={hs * 0.6}
        fill="white"
        stroke="var(--color-brand)"
        strokeWidth={1.5 / zoom}
        style={{ cursor: "grab" }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onHandleMouseDown("rotate", e);
        }}
      />
    </g>
  );
}
