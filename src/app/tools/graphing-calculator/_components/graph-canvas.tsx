"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import type { Viewport, GraphFunction, AngleMode, Point, ParametricSettings, PolarSettings } from "@/lib/graphing-calculator/types";
import { generatePoints, evaluateAtX } from "@/lib/graphing-calculator/engine";
import { generateParametricPoints, generatePolarPoints } from "@/lib/graphing-calculator/parametric";
import {
  drawBackground,
  drawGrid,
  drawFunction,
  drawTrace,
  drawScatterPoints,
  worldToCanvas,
  canvasToWorld,
  DARK_THEME,
  LIGHT_THEME,
} from "@/lib/graphing-calculator/graph-renderer";
import type { CanvasSize, GraphTheme } from "@/lib/graphing-calculator/graph-renderer";
import { ZOOM_FACTOR, DEFAULT_RESOLUTION } from "@/lib/graphing-calculator/constants";

interface GraphCanvasProps {
  functions: GraphFunction[];
  viewport: Viewport;
  angleMode: AngleMode;
  traceEnabled: boolean;
  parametricSettings?: ParametricSettings;
  polarSettings?: PolarSettings;
  scatterPoints?: Point[];
  scatterColor?: string;
  onViewportChange: (viewport: Viewport) => void;
}

export function GraphCanvas({
  functions,
  viewport,
  angleMode,
  traceEnabled,
  parametricSettings,
  polarSettings,
  scatterPoints,
  scatterColor,
  onViewportChange,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Interaction state refs (no re-render needed)
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const mouseWorldPos = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Keep ref in sync
  viewportRef.current = viewport;

  const theme: GraphTheme = resolvedTheme === "light" ? LIGHT_THEME : DARK_THEME;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // ── Resize Observer ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      requestPaint();
    });

    observer.observe(container);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Paint Function ─────────────────────────────────────────────────
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size: CanvasSize = {
      width: canvas.width / dpr,
      height: canvas.height / dpr,
    };

    const vp = viewportRef.current;
    const t = themeRef.current;

    // Clear
    ctx.save();
    drawBackground(ctx, size, t);
    drawGrid(ctx, vp, size, t);

    // Draw each visible function
    for (const fn of functions) {
      if (!fn.visible || !fn.expression.trim()) continue;

      let points: import("@/lib/graphing-calculator/types").Point[];

      if (fn.type === "parametric" && fn.expressionY) {
        const ps = parametricSettings ?? { tMin: 0, tMax: 2 * Math.PI, tStep: Math.PI / 60 };
        points = generateParametricPoints(
          fn.expression, fn.expressionY, ps.tMin, ps.tMax, ps.tStep, angleMode
        );
      } else if (fn.type === "polar") {
        const ps = polarSettings ?? { thetaMin: 0, thetaMax: 2 * Math.PI, thetaStep: Math.PI / 60 };
        points = generatePolarPoints(
          fn.expression, ps.thetaMin, ps.thetaMax, ps.thetaStep, angleMode
        );
      } else {
        points = generatePoints(
          fn.expression, "x", [vp.xMin, vp.xMax], DEFAULT_RESOLUTION, angleMode
        );
      }

      drawFunction(ctx, points, fn.color, fn.lineWidth, vp, size);
    }

    // Scatter plot overlay
    if (scatterPoints && scatterPoints.length > 0) {
      drawScatterPoints(ctx, scatterPoints, scatterColor ?? "#3b82f6", vp, size);
    }

    // Trace crosshair
    if (traceEnabled && mouseWorldPos.current) {
      const mx = mouseWorldPos.current.x;
      // Find closest visible function at this x
      let closestY = NaN;
      let closestColor = "#3b82f6";
      let minDist = Infinity;

      for (const fn of functions) {
        if (!fn.visible || !fn.expression.trim()) continue;
        const y = evaluateAtX(fn.expression, mx, angleMode);
        if (!isNaN(y) && isFinite(y)) {
          const canvasY = worldToCanvas(mx, y, vp, size).y;
          const mouseCanvasY = worldToCanvas(mx, mouseWorldPos.current.y, vp, size).y;
          const dist = Math.abs(canvasY - mouseCanvasY);
          if (dist < minDist) {
            minDist = dist;
            closestY = y;
            closestColor = fn.color;
          }
        }
      }

      if (!isNaN(closestY)) {
        drawTrace(ctx, mx, closestY, closestColor, vp, size, t);
      }
    }

    ctx.restore();
  }, [functions, angleMode, traceEnabled, parametricSettings, polarSettings, scatterPoints, scatterColor]);

  const requestPaint = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(paint);
  }, [paint]);

  // Re-paint when deps change
  useEffect(() => {
    requestPaint();
  }, [requestPaint, viewport, resolvedTheme]);

  // ── Mouse Handlers ─────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const size: CanvasSize = { width: canvas.width / dpr, height: canvas.height / dpr };
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // Update mouse world position for trace
      mouseWorldPos.current = canvasToWorld(canvasX, canvasY, viewportRef.current, size);

      if (isPanning.current) {
        const vp = viewportRef.current;
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        panStart.current = { x: e.clientX, y: e.clientY };

        const xRange = vp.xMax - vp.xMin;
        const yRange = vp.yMax - vp.yMin;
        const worldDx = -(dx / size.width) * xRange;
        const worldDy = (dy / size.height) * yRange;

        onViewportChange({
          xMin: vp.xMin + worldDx,
          xMax: vp.xMax + worldDx,
          yMin: vp.yMin + worldDy,
          yMax: vp.yMax + worldDy,
        });
      } else if (traceEnabled) {
        requestPaint();
      }
    },
    [onViewportChange, traceEnabled, requestPaint]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPanning.current = false;
    mouseWorldPos.current = null;
    if (traceEnabled) requestPaint();
  }, [traceEnabled, requestPaint]);

  // Use native wheel listener with { passive: false } so preventDefault() works
  // React's onWheel is passive by default and cannot prevent page scroll
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const size: CanvasSize = { width: canvas.width / dpr, height: canvas.height / dpr };
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const worldPoint = canvasToWorld(canvasX, canvasY, viewportRef.current, size);
      const vp = viewportRef.current;

      const factor = e.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      // Zoom centered on mouse position
      const newXMin = worldPoint.x - (worldPoint.x - vp.xMin) * factor;
      const newXMax = worldPoint.x + (vp.xMax - worldPoint.x) * factor;
      const newYMin = worldPoint.y - (worldPoint.y - vp.yMin) * factor;
      const newYMax = worldPoint.y + (vp.yMax - worldPoint.y) * factor;

      onViewportChangeRef.current({
        xMin: newXMin,
        xMax: newXMax,
        yMin: newYMin,
        yMax: newYMax,
      });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[460px] w-full cursor-crosshair overflow-hidden rounded-md border border-border bg-background"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="block h-full w-full"
      />
    </div>
  );
}
