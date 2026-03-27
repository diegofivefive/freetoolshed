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

  return (
    <g>
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
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          <line
            x1={0}
            y1={gridSize}
            x2={gridSize}
            y2={gridSize}
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.3}
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
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.5}
          />
          <line
            x1={0}
            y1={gridSize * majorInterval}
            x2={gridSize * majorInterval}
            y2={gridSize * majorInterval}
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.5}
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
