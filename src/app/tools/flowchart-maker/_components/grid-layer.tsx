"use client";

interface GridLayerProps {
  gridSize: number;
  zoom: number;
}

/**
 * Infinite grid using repeating SVG patterns.
 * Unlike the floor plan grid (which is bounded by the artboard),
 * this grid extends in all directions.
 */
export function GridLayer({ gridSize, zoom }: GridLayerProps) {
  const majorInterval = 5;
  const strokeWidth = 1 / zoom;
  const majorSize = gridSize * majorInterval;

  return (
    <g style={{ pointerEvents: "none" }}>
      <defs>
        {/* Minor grid */}
        <pattern
          id="fc-grid-minor"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1={gridSize}
            y1={0}
            x2={gridSize}
            y2={gridSize}
            stroke="rgba(128,128,128,0.12)"
            strokeWidth={strokeWidth}
          />
          <line
            x1={0}
            y1={gridSize}
            x2={gridSize}
            y2={gridSize}
            stroke="rgba(128,128,128,0.12)"
            strokeWidth={strokeWidth}
          />
        </pattern>

        {/* Major grid */}
        <pattern
          id="fc-grid-major"
          width={majorSize}
          height={majorSize}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={majorSize}
            height={majorSize}
            fill="url(#fc-grid-minor)"
          />
          <line
            x1={majorSize}
            y1={0}
            x2={majorSize}
            y2={majorSize}
            stroke="rgba(128,128,128,0.22)"
            strokeWidth={strokeWidth}
          />
          <line
            x1={0}
            y1={majorSize}
            x2={majorSize}
            y2={majorSize}
            stroke="rgba(128,128,128,0.22)"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>

      {/* Extend grid way beyond visible area */}
      <rect
        x={-50000}
        y={-50000}
        width={100000}
        height={100000}
        fill="url(#fc-grid-major)"
      />
    </g>
  );
}
