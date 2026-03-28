"use client";

interface GridLayerProps {
  width: number;
  height: number;
  gridSize: number;
  zoom: number;
}

export function GridLayer({ width, height, gridSize, zoom }: GridLayerProps) {
  const majorInterval = 5;
  const strokeWidth = 1 / zoom;

  // Use a fixed color that's visible on the white artboard background
  const gridColor = "rgba(0,0,0,0.15)";
  const majorGridColor = "rgba(0,0,0,0.25)";

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Minor grid lines */}
      <defs>
        <pattern
          id="grid-minor"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={gridSize}
            y1={0}
            x2={gridSize}
            y2={gridSize}
            stroke={gridColor}
            strokeWidth={strokeWidth}
          />
          <line
            x1={0}
            y1={gridSize}
            x2={gridSize}
            y2={gridSize}
            stroke={gridColor}
            strokeWidth={strokeWidth}
          />
        </pattern>

        {/* Major grid lines */}
        <pattern
          id="grid-major"
          width={gridSize * majorInterval}
          height={gridSize * majorInterval}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={gridSize * majorInterval}
            height={gridSize * majorInterval}
            fill="url(#grid-minor)"
          />
          <line
            x1={gridSize * majorInterval}
            y1={0}
            x2={gridSize * majorInterval}
            y2={gridSize * majorInterval}
            stroke={majorGridColor}
            strokeWidth={strokeWidth}
          />
          <line
            x1={0}
            y1={gridSize * majorInterval}
            x2={gridSize * majorInterval}
            y2={gridSize * majorInterval}
            stroke={majorGridColor}
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>

      <rect
        width={width}
        height={height}
        fill="url(#grid-major)"
      />
    </g>
  );
}
