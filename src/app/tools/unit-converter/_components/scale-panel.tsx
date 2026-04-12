"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { CategoryId } from "@/lib/unit-converter/types";
import { getRenderer } from "@/lib/unit-converter/visualizations";
import type { VisualizationParams } from "@/lib/unit-converter/visualizations";

interface ScalePanelProps {
  category: CategoryId;
  fromValue: number;
  toValue: number;
  fromSymbol: string;
  toSymbol: string;
}

// Cubic bezier approximation for easing
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function ScalePanel({
  category,
  fromValue,
  toValue,
  fromSymbol,
  toSymbol,
}: ScalePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 160 });

  const ANIMATION_DURATION = 400; // ms

  // Resolve CSS variable colors to RGB strings that Canvas 2D can use.
  // oklch() is not supported by Canvas context, so we read computed colors
  // from temporary elements styled with the CSS variables.
  const getColors = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return { brandColor: "#10b981", mutedColor: "#71717a", textColor: "#fafafa" };
    }

    const probe = document.createElement("div");
    probe.style.display = "none";
    container.appendChild(probe);

    const resolve = (cssVar: string, fallback: string): string => {
      probe.style.color = `var(${cssVar})`;
      const computed = getComputedStyle(probe).color;
      return computed && computed !== "" ? computed : fallback;
    };

    const colors = {
      brandColor: resolve("--color-brand", "#10b981"),
      mutedColor: resolve("--color-muted-foreground", "#71717a"),
      textColor: resolve("--color-foreground", "#fafafa"),
    };

    container.removeChild(probe);
    return colors;
  }, []);

  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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

      // Clear
      ctx.clearRect(0, 0, w, h);

      const colors = getColors();
      const params: VisualizationParams = {
        fromValue,
        toValue,
        fromSymbol,
        toSymbol,
        brandColor: colors.brandColor,
        mutedColor: colors.mutedColor,
        textColor: colors.textColor,
      };

      const renderer = getRenderer(category);
      renderer(ctx, w, h, params, progress);
    },
    [category, fromValue, toValue, fromSymbol, toSymbol, dimensions, getColors]
  );

  // Animate on value/category change
  useEffect(() => {
    if (dimensions.width === 0) return;

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(1, elapsed / ANIMATION_DURATION);
      const progress = easeOutCubic(rawProgress);

      draw(progress);

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, dimensions.width]);

  // ResizeObserver for responsive canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions((prev) => ({
            ...prev,
            width: Math.floor(width),
          }));
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
        className="w-full"
        style={{ height: `${dimensions.height}px` }}
      />
    </div>
  );
}
