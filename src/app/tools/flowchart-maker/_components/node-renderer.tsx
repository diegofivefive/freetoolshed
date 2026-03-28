"use client";

import { memo } from "react";
import type { FlowchartNode } from "@/lib/flowchart/types";
import {
  getShapePath,
  getShapeOverlays,
  isOpenShape,
} from "@/lib/flowchart/shapes";

interface NodeRendererProps {
  node: FlowchartNode;
  isSelected: boolean;
  zoom: number;
}

function NodeRendererInner({ node, isSelected, zoom }: NodeRendererProps) {
  const { width, height, style, rotation } = node;
  const path = getShapePath(node.shape, width, height);
  const overlays = getShapeOverlays(node.shape, width, height);
  const open = isOpenShape(node.shape);

  const cx = node.x + width / 2;
  const cy = node.y + height / 2;

  // Word-wrap text into lines that fit the shape
  const maxCharsPerLine = Math.max(4, Math.floor((width - 20) / (style.fontSize * 0.55)));
  const words = node.text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = style.fontSize * 1.3;
  const textStartY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  return (
    <g
      data-node-id={node.id}
      transform={`translate(${node.x}, ${node.y})${
        rotation ? ` rotate(${rotation}, ${width / 2}, ${height / 2})` : ""
      }`}
    >
      {/* Shape path */}
      <path
        d={path}
        fill={open ? "none" : style.fill}
        stroke={isSelected ? "var(--color-brand)" : style.stroke}
        strokeWidth={
          (isSelected ? Math.max(2.5, style.strokeWidth) : style.strokeWidth) /
          zoom
        }
        opacity={style.opacity}
        strokeLinejoin="round"
      />

      {/* Shape overlays (predefined-process inner lines, database top arc) */}
      {overlays.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={isSelected ? "var(--color-brand)" : style.stroke}
          strokeWidth={style.strokeWidth / zoom}
          opacity={style.opacity}
        />
      ))}

      {/* Text label */}
      {node.text && (
        <text
          x={width / 2}
          y={textStartY}
          textAnchor={
            style.textAlign === "left"
              ? "start"
              : style.textAlign === "right"
                ? "end"
                : "middle"
          }
          fill={style.textColor}
          fontSize={style.fontSize}
          fontWeight={style.fontWeight}
          fontFamily="var(--font-geist-sans), sans-serif"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {lines.map((line, i) => (
            <tspan
              key={i}
              x={
                style.textAlign === "left"
                  ? 12
                  : style.textAlign === "right"
                    ? width - 12
                    : width / 2
              }
              dy={i === 0 ? 0 : lineHeight}
              dominantBaseline="central"
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}

export const NodeRenderer = memo(NodeRendererInner);
