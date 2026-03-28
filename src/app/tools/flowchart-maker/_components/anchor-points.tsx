"use client";

import { memo } from "react";
import type { FlowchartNode, AnchorPosition } from "@/lib/flowchart/types";
import { getAnchorWorldPosition } from "@/lib/flowchart/shapes";

const ANCHORS: AnchorPosition[] = ["top", "right", "bottom", "left"];

interface AnchorPointsProps {
  node: FlowchartNode;
  zoom: number;
  highlightAnchor?: AnchorPosition | null;
  onAnchorMouseDown?: (nodeId: string, anchor: AnchorPosition, e: React.MouseEvent) => void;
}

export const AnchorPoints = memo(function AnchorPoints({
  node,
  zoom,
  highlightAnchor,
  onAnchorMouseDown,
}: AnchorPointsProps) {
  const dotRadius = 5 / zoom;
  const hitRadius = 12 / zoom;

  return (
    <g style={{ pointerEvents: "all" }}>
      {ANCHORS.map((anchor) => {
        const pos = getAnchorWorldPosition(node, anchor);
        const isHighlighted = highlightAnchor === anchor;

        return (
          <g key={anchor}>
            {/* Invisible larger hit area */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={hitRadius}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onAnchorMouseDown?.(node.id, anchor, e);
              }}
              data-anchor={anchor}
              data-anchor-node={node.id}
            />
            {/* Visible dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isHighlighted ? dotRadius * 1.4 : dotRadius}
              fill={isHighlighted ? "var(--color-brand)" : "white"}
              stroke="var(--color-brand)"
              strokeWidth={1.5 / zoom}
              style={{ pointerEvents: "none" }}
            />
          </g>
        );
      })}
    </g>
  );
});
