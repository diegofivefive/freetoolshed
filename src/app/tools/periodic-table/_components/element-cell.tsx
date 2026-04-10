"use client";

import { memo, useState, useCallback } from "react";
import type { Element, ElementCategory, ViewMode } from "@/lib/periodic-table/types";
import {
  CATEGORY_COLORS,
  CATEGORY_COLORS_DARK,
} from "@/lib/periodic-table/constants";

interface ElementCellProps {
  element: Element;
  isSelected: boolean;
  isDimmed: boolean;
  viewMode: ViewMode;
  cellColor?: string;
  cellColorDark?: string;
  onClick: (element: Element) => void;
}

function getCategoryStyle(category: ElementCategory) {
  const light = CATEGORY_COLORS[category];
  const dark = CATEGORY_COLORS_DARK[category];
  return {
    "--cell-bg": light.bg,
    "--cell-text": light.text,
    "--cell-border": light.border,
    "--cell-bg-dark": dark.bg,
    "--cell-text-dark": dark.text,
    "--cell-border-dark": dark.border,
  } as React.CSSProperties;
}

function ElementCellInner({
  element,
  isSelected,
  isDimmed,
  viewMode,
  cellColor,
  cellColorDark,
  onClick,
}: ElementCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick(element);
  }, [onClick, element]);

  const categoryStyle = getCategoryStyle(element.category);

  // Override colors for non-category view modes
  const dynamicStyle =
    viewMode !== "category" && cellColor
      ? ({
          ...categoryStyle,
          "--cell-bg": cellColor,
          "--cell-bg-dark": cellColorDark ?? cellColor,
        } as React.CSSProperties)
      : categoryStyle;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="element-cell group relative flex h-full w-full flex-col items-center justify-center rounded-[3px] border p-0.5 text-center transition-all duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
      style={{
        ...dynamicStyle,
        backgroundColor: "var(--cell-bg)",
        color: "var(--cell-text)",
        borderColor: isSelected
          ? "var(--color-brand, oklch(0.596 0.145 163.225))"
          : "var(--cell-border)",
        opacity: isDimmed ? 0.15 : 1,
        transform: isHovered && !isDimmed ? "scale(1.12)" : "scale(1)",
        zIndex: isHovered ? 20 : 1,
        boxShadow: isSelected
          ? "0 0 0 2px var(--color-brand, oklch(0.596 0.145 163.225))"
          : isHovered && !isDimmed
            ? "0 4px 16px rgba(0,0,0,0.25)"
            : "none",
        borderWidth: isSelected ? "2px" : "1px",
      }}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}, ${element.symbol}`}
    >
      {/* Atomic number */}
      <span className="text-[8px] leading-none opacity-70 lg:text-[9px]">
        {element.atomicNumber}
      </span>

      {/* Symbol — big and bold */}
      <span className="text-sm font-bold leading-tight lg:text-base">
        {element.symbol}
      </span>

      {/* Name — truncated */}
      <span className="w-full truncate text-[7px] leading-none opacity-80 lg:text-[8px]">
        {element.name}
      </span>

      {/* Mass */}
      <span className="text-[7px] leading-none opacity-60 lg:text-[8px]">
        {element.atomicMass.toFixed(element.atomicMass < 10 ? 3 : 2)}
      </span>

      {/* Tooltip on hover */}
      {isHovered && !isDimmed && (
        <div
          className="pointer-events-none absolute -top-20 left-1/2 z-50 w-44 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-xl"
          role="tooltip"
        >
          <p className="text-xs font-bold">
            {element.name} ({element.symbol})
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            #{element.atomicNumber} · {element.atomicMass.toFixed(4)} u
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {element.electronConfiguration}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {CATEGORY_COLORS[element.category].label}
          </p>
        </div>
      )}
    </button>
  );
}

export const ElementCell = memo(ElementCellInner);
