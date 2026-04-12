"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { UnitDefinition } from "@/lib/unit-converter/types";
import { drawConversionGraph } from "@/lib/unit-converter/graph-renderer";
import type { GraphTheme } from "@/lib/unit-converter/graph-renderer";

interface ConversionGraphProps {
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  currentValue: number;
}

export function ConversionGraph({
  fromUnit,
  toUnit,
  currentValue,
}: ConversionGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 200 });

  // Resolve CSS variable colors to Canvas-compatible RGB
  const getTheme = useCallback((): GraphTheme => {
    const container = containerRef.current;
    if (!container) {
      return defaultTheme();
    }

    const probe = document.createElement("div");
    probe.style.display = "none";
    container.appendChild(probe);

    const resolve = (cssVar: string, fallback: string): string => {
      probe.style.color = `var(${cssVar})`;
      const computed = getComputedStyle(probe).color;
      return computed && computed !== "" ? computed : fallback;
    };

    const brand = resolve("--color-brand", "#10b981");
    const muted = resolve("--color-muted-foreground", "#71717a");
    const fg = resolve("--color-foreground", "#fafafa");

    container.removeChild(probe);

    return {
      background: "transparent",
      gridLine: withAlpha(muted, 0.1),
      axisLine: withAlpha(muted, 0.3),
      axisLabel: muted,
      curveLine: brand,
      dotFill: brand,
      dotRing: brand,
      crosshair: withAlpha(fg, 0.4),
      crosshairLabel: fg,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dimensions.width;
    const h = dimensions.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const theme = getTheme();
    const time = performance.now() / 1000;

    drawConversionGraph(ctx, w, h, {
      fromUnit,
      toUnit,
      currentValue,
      theme,
      mousePos: mousePosRef.current,
      time,
    });
  }, [fromUnit, toUnit, currentValue, dimensions, getTheme]);

  // Animation loop for pulsing dot
  useEffect(() => {
    if (dimensions.width === 0) return;

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw, dimensions.width]);

  // Mouse tracking for crosshair
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current = null;
  }, []);

  // ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions((prev) => ({ ...prev, width: Math.floor(width) }));
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-lg shadow-black/5 backdrop-blur-xl"
    >
      <canvas
        ref={canvasRef}
        className="w-full cursor-crosshair"
        style={{ height: `${dimensions.height}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function defaultTheme(): GraphTheme {
  return {
    background: "transparent",
    gridLine: "rgba(113, 113, 122, 0.1)",
    axisLine: "rgba(113, 113, 122, 0.3)",
    axisLabel: "#71717a",
    curveLine: "#10b981",
    dotFill: "#10b981",
    dotRing: "#10b981",
    crosshair: "rgba(250, 250, 250, 0.4)",
    crosshairLabel: "#fafafa",
  };
}

/**
 * Convert an rgb() or rgba() color string to one with a specific alpha.
 * Input: "rgb(16, 185, 129)" or "#10b981", Output: "rgba(16, 185, 129, 0.3)"
 */
function withAlpha(color: string, alpha: number): string {
  // If it's already rgba, replace the alpha
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  }
  // Fallback: just return with opacity (won't work for all cases)
  return color;
}
