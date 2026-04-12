"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Ruler,
  Weight,
  Thermometer,
  Beaker,
  Square,
  Gauge,
  Clock,
  ArrowDownToLine,
  Zap,
  Activity,
  HardDrive,
  TriangleRight,
  MoveRight,
  RotateCw,
  Radio,
  Fuel,
  Droplets,
  Flame,
  Waves,
  Sun,
  Cable,
  CircuitBoard,
  CookingPot,
} from "lucide-react";
import type { CategoryId } from "@/lib/unit-converter/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ruler,
  Weight,
  Thermometer,
  Beaker,
  Square,
  Gauge,
  Clock,
  ArrowDownToLine,
  Zap,
  Activity,
  HardDrive,
  TriangleRight,
  MoveRight,
  RotateCw,
  Radio,
  Fuel,
  Droplets,
  Flame,
  Waves,
  Sun,
  Cable,
  CircuitBoard,
  CookingPot,
};

interface CategoryNavProps {
  categories: Array<{ id: CategoryId; label: string; icon: string }>;
  activeCategory: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeTab = tabRefs.current.get(activeCategory);
    const container = scrollRef.current;
    if (!activeTab || !container) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    setIndicator({
      left: tabRect.left - containerRect.left + container.scrollLeft,
      width: tabRect.width,
    });
  }, [activeCategory]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = tabRefs.current.get(activeCategory);
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeCategory]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scrollbar-none flex gap-1 overflow-x-auto scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isActive = cat.id === activeCategory;

          return (
            <button
              key={cat.id}
              ref={(el) => {
                if (el) tabRefs.current.set(cat.id, el);
              }}
              onClick={() => onCategoryChange(cat.id)}
              className={`
                relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2
                text-xs font-medium transition-colors duration-200
                ${
                  isActive
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
              style={{ scrollSnapAlign: "start" }}
            >
              {Icon && (
                <Icon
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
              )}
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated sliding indicator */}
      <div
        className="absolute bottom-0 h-0.5 rounded-full bg-brand transition-all duration-200 ease-out"
        style={{
          left: indicator.left,
          width: indicator.width,
          transform: "translateZ(0)",
        }}
      />

      {/* Fade edges for scroll overflow */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card/70 to-transparent" />
    </div>
  );
}
