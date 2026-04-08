"use client";

import { memo } from "react";
import type { FlowchartEdge, FlowchartNode } from "@/lib/flowchart/types";
import { computeEdgePath } from "@/lib/flowchart/routing";

interface EdgeRendererProps {
  edge: FlowchartEdge;
  sourceNode: FlowchartNode;
  targetNode: FlowchartNode;
  isSelected: boolean;
  zoom: number;
}

export const EdgeRenderer = memo(function EdgeRenderer({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  zoom,
}: EdgeRendererProps) {
  const route = computeEdgePath(edge, sourceNode, targetNode);
  const hitAreaWidth = Math.max(16, 12 / zoom);

  // Use brand color when selected, otherwise edge's own stroke color
  const activeColor = isSelected ? "var(--color-brand)" : edge.style.stroke;
  const markerId = `fc-edge-${edge.id.slice(0, 8)}`;

  // Marker pixel size scales with stroke width for proportional arrows.
  // Using userSpaceOnUse so sizes are in absolute pixels — no gap.
  const sw = edge.style.strokeWidth;
  const markerPx = Math.max(10, sw * 4);

  return (
    <g data-edge-id={edge.id}>
      {/* Per-edge marker defs — userSpaceOnUse for seamless line integration */}
      <defs>
        {/* Arrow (open) */}
        <marker
          id={`${markerId}-arrow`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth={markerPx}
          markerHeight={markerPx}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path
            d="M 1 1.5 L 9 5 L 1 8.5"
            fill="none"
            stroke={activeColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>

        {/* Filled arrow */}
        <marker
          id={`${markerId}-filled-arrow`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth={markerPx}
          markerHeight={markerPx}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 9 5 L 1 8.5 Z" fill={activeColor} />
        </marker>

        {/* Diamond */}
        <marker
          id={`${markerId}-diamond`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={markerPx}
          markerHeight={markerPx}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 0 5 L 5 1 L 10 5 L 5 9 Z" fill={activeColor} />
        </marker>

        {/* Circle */}
        <marker
          id={`${markerId}-circle`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={markerPx}
          markerHeight={markerPx}
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <circle cx="5" cy="5" r="4" fill={activeColor} />
        </marker>
      </defs>

      {/* Invisible wide hit area for click detection */}
      <path
        d={route.path}
        fill="none"
        stroke="transparent"
        strokeWidth={hitAreaWidth}
        style={{ cursor: "pointer" }}
      />

      {/* Visible edge path */}
      <path
        d={route.path}
        fill="none"
        stroke={activeColor}
        strokeWidth={edge.style.strokeWidth}
        strokeDasharray={
          edge.style.dashArray
            ? edge.style.dashArray
                .split(/\s+/)
                .map((v) => String(Number(v) * Math.max(1, sw / 2)))
                .join(" ")
            : undefined
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={edge.style.opacity}
        markerEnd={
          edge.style.arrowHead !== "none"
            ? `url(#${markerId}-${edge.style.arrowHead})`
            : undefined
        }
        markerStart={
          edge.style.arrowTail !== "none"
            ? `url(#${markerId}-${edge.style.arrowTail})`
            : undefined
        }
        style={{ pointerEvents: "none" }}
      />

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={route.path}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={edge.style.strokeWidth + 4 / zoom}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.2}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Control point handles (visible when selected, for bezier edges) */}
      {isSelected &&
        edge.controlPoints.length > 0 &&
        edge.controlPoints.map((cp, i) => (
          <circle
            key={`cp-${i}`}
            data-edge-cp={edge.id}
            data-cp-index={i}
            cx={cp.x}
            cy={cp.y}
            r={5 / zoom}
            fill="var(--color-brand)"
            stroke="var(--color-card)"
            strokeWidth={1.5 / zoom}
            style={{ cursor: "move" }}
          />
        ))}

      {/* Edge label */}
      {edge.label && (
        <g transform={`translate(${route.labelX}, ${route.labelY})`}>
          <rect
            x={-edge.label.length * 3.5 - 6}
            y={-10}
            width={edge.label.length * 7 + 12}
            height={20}
            rx={4}
            fill="var(--color-card)"
            stroke={isSelected ? "var(--color-brand)" : "var(--color-border)"}
            strokeWidth={1 / zoom}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--color-foreground)"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
});

// ── Arrow marker defs (kept for draft connection line) ─────────────

export function ArrowMarkerDefs() {
  const selectedColor = "var(--color-brand)";

  return (
    <defs>
      {/* Draft connection line arrow — userSpaceOnUse, fixed 10px */}
      <marker
        id="fc-arrow-filled-arrow-selected"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="10"
        markerHeight="10"
        markerUnits="userSpaceOnUse"
        orient="auto-start-reverse"
      >
        <path d="M 1 1.5 L 9 5 L 1 8.5 Z" fill={selectedColor} />
      </marker>
    </defs>
  );
}
