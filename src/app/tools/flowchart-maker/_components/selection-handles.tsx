"use client";

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

interface SelectionHandlesProps {
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
  top: "ns-resize",
  "top-right": "nesw-resize",
  right: "ew-resize",
  "bottom-right": "nwse-resize",
  bottom: "ns-resize",
  "bottom-left": "nesw-resize",
  left: "ew-resize",
  rotate: "grab",
};

export function SelectionHandles({
  x,
  y,
  width,
  height,
  rotation,
  zoom,
  onHandleMouseDown,
}: SelectionHandlesProps) {
  const hs = HANDLE_SIZE / zoom;
  const half = hs / 2;
  const rotateOff = ROTATE_OFFSET / zoom;

  const handles: { pos: HandlePosition; cx: number; cy: number }[] = [
    { pos: "top-left", cx: x, cy: y },
    { pos: "top", cx: x + width / 2, cy: y },
    { pos: "top-right", cx: x + width, cy: y },
    { pos: "right", cx: x + width, cy: y + height / 2 },
    { pos: "bottom-right", cx: x + width, cy: y + height },
    { pos: "bottom", cx: x + width / 2, cy: y + height },
    { pos: "bottom-left", cx: x, cy: y + height },
    { pos: "left", cx: x, cy: y + height / 2 },
  ];

  return (
    <g
      transform={
        rotation
          ? `rotate(${rotation}, ${x + width / 2}, ${y + height / 2})`
          : undefined
      }
    >
      {/* Selection outline */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
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
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y - rotateOff}
        stroke="var(--color-brand)"
        strokeWidth={1 / zoom}
        pointerEvents="none"
      />
      <circle
        cx={x + width / 2}
        cy={y - rotateOff}
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
