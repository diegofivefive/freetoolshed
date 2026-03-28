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

  return (
    <g data-edge-id={edge.id}>
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
        stroke={isSelected ? "var(--color-brand)" : edge.style.stroke}
        strokeWidth={edge.style.strokeWidth}
        strokeDasharray={edge.style.dashArray || undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={edge.style.opacity}
        markerEnd={
          edge.style.arrowHead !== "none"
            ? `url(#fc-arrow-${edge.style.arrowHead}${isSelected ? "-selected" : ""})`
            : undefined
        }
        markerStart={
          edge.style.arrowTail !== "none"
            ? `url(#fc-arrow-${edge.style.arrowTail}${isSelected ? "-selected" : ""})`
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

// ── Arrow marker defs ──────────────────────────────────────────

export function ArrowMarkerDefs() {
  const defaultColor = "#374151";
  const selectedColor = "var(--color-brand)";

  return (
    <defs>
      {/* Arrow (open) */}
      <marker
        id="fc-arrow-arrow"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path
          d="M 2 2 L 10 6 L 2 10"
          fill="none"
          stroke={defaultColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id="fc-arrow-arrow-selected"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path
          d="M 2 2 L 10 6 L 2 10"
          fill="none"
          stroke={selectedColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>

      {/* Filled arrow */}
      <marker
        id="fc-arrow-filled-arrow"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 2 2 L 10 6 L 2 10 Z" fill={defaultColor} />
      </marker>
      <marker
        id="fc-arrow-filled-arrow-selected"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 2 2 L 10 6 L 2 10 Z" fill={selectedColor} />
      </marker>

      {/* Diamond */}
      <marker
        id="fc-arrow-diamond"
        viewBox="0 0 12 12"
        refX="6"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 1 6 L 6 2 L 11 6 L 6 10 Z" fill={defaultColor} />
      </marker>
      <marker
        id="fc-arrow-diamond-selected"
        viewBox="0 0 12 12"
        refX="6"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 1 6 L 6 2 L 11 6 L 6 10 Z" fill={selectedColor} />
      </marker>

      {/* Circle */}
      <marker
        id="fc-arrow-circle"
        viewBox="0 0 12 12"
        refX="6"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <circle cx="6" cy="6" r="4" fill={defaultColor} />
      </marker>
      <marker
        id="fc-arrow-circle-selected"
        viewBox="0 0 12 12"
        refX="6"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <circle cx="6" cy="6" r="4" fill={selectedColor} />
      </marker>
    </defs>
  );
}
