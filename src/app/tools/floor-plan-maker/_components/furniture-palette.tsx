"use client";

import { useState, type Dispatch } from "react";
import type {
  FloorPlanAction,
  FurnitureElement,
  FurnitureCategory,
  FurnitureCatalogItem,
} from "@/lib/floor-plan/types";
import {
  FURNITURE_CATEGORIES,
  getFurnitureByCategory,
} from "@/lib/floor-plan/furniture";
import { Sofa, Bed, CookingPot, Bath, Monitor, TreePine } from "lucide-react";

interface FurniturePaletteProps {
  dispatch: Dispatch<FloorPlanAction>;
  elementCount: number;
}

const CATEGORY_ICONS: Record<FurnitureCategory, typeof Sofa> = {
  living: Sofa,
  bedroom: Bed,
  kitchen: CookingPot,
  bathroom: Bath,
  office: Monitor,
  outdoor: TreePine,
};

export function FurniturePalette({ dispatch, elementCount }: FurniturePaletteProps) {
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>("living");
  const items = getFurnitureByCategory(activeCategory);

  const handlePlaceFurniture = (item: FurnitureCatalogItem) => {
    const newFurniture: FurnitureElement = {
      id: crypto.randomUUID(),
      type: "furniture",
      x: 2,
      y: 2,
      width: item.defaultWidth,
      height: item.defaultHeight,
      rotation: 0,
      locked: false,
      label: item.name,
      opacity: 1,
      zIndex: elementCount,
      furnitureType: item.id,
      category: item.category,
      fill: "#64748b",
    };
    dispatch({ type: "ADD_ELEMENT", payload: newFurniture });
    dispatch({ type: "SELECT", payload: [newFurniture.id] });
    dispatch({ type: "SET_TOOL", payload: "select" });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {FURNITURE_CATEGORIES.map(({ id, label }) => {
          const Icon = CATEGORY_ICONS[id];
          return (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                activeCategory === id
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Furniture grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePlaceFurniture(item)}
              className="group flex flex-col items-center gap-1 rounded-md border border-border p-2 text-center transition-colors hover:border-brand hover:bg-brand/5"
              title={`${item.name} (${item.defaultWidth}×${item.defaultHeight} ft)`}
            >
              {/* Mini SVG preview */}
              <svg
                width={36}
                height={36}
                viewBox={item.viewBox}
                className="text-muted-foreground group-hover:text-brand"
              >
                <path
                  d={item.svgPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  fillRule="evenodd"
                />
              </svg>
              <span className="text-[10px] leading-tight text-muted-foreground group-hover:text-foreground">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
