"use client";

import { useRef, useCallback, useState, type Dispatch } from "react";
import type {
  EditorState,
  FloorPlanAction,
  FloorPlanElement,
  RoomElement,
  WallElement,
  TextElement,
} from "@/lib/floor-plan/types";
import {
  PIXELS_PER_UNIT,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  getRoomPreset,
  DEFAULT_WALL_THICKNESS,
} from "@/lib/floor-plan/constants";
import { screenToWorld, zoomAtPoint, snapToGrid, clamp, computeAlignGuides, type AlignGuide } from "@/lib/floor-plan/geometry";
import { GridLayer } from "./grid-layer";
import { ElementRenderer } from "./element-renderer";
import { ResizeHandles, type HandlePosition } from "./resize-handles";

interface SvgCanvasProps {
  state: EditorState;
  dispatch: Dispatch<FloorPlanAction>;
}

export function SvgCanvas({ state, dispatch }: SvgCanvasProps) {
  const { plan, viewport } = state;
  const canvasW = plan.width * PIXELS_PER_UNIT;
  const canvasH = plan.height * PIXELS_PER_UNIT;

  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Drawing state for room tool
  const [drawPreview, setDrawPreview] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  // Dragging state for moving elements
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const dragRef = useRef<{
    elementId: string;
    startX: number; startY: number;
    origX: number; origY: number;
  } | null>(null);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    elementId: string;
    handle: HandlePosition;
    startX: number; startY: number;
    origX: number; origY: number;
    origW: number; origH: number;
  } | null>(null);

  // Rotation state
  const [isRotating, setIsRotating] = useState(false);
  const rotateRef = useRef<{
    elementId: string;
    centerX: number; centerY: number;
  } | null>(null);

  // Wall drawing state (click start → click end)
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);
  const [wallPreview, setWallPreview] = useState<{ x: number; y: number } | null>(null);

  // Alignment guides
  const [alignGuides, setAlignGuides] = useState<AlignGuide[]>([]);

  // ── Get world coords from mouse event ─────────────────────
  const getWorldCoords = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return screenToWorld(e.clientX, e.clientY, viewport, rect);
    },
    [viewport]
  );

  const getSnappedWorldCoords = useCallback(
    (e: React.MouseEvent) => {
      const world = getWorldCoords(e);
      if (plan.gridSnap) {
        return {
          x: snapToGrid(world.x, plan.gridSize),
          y: snapToGrid(world.y, plan.gridSize),
        };
      }
      return world;
    },
    [getWorldCoords, plan.gridSnap, plan.gridSize]
  );

  // ── Zoom via scroll wheel ─────────────────────────────────
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();

      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = clamp(viewport.zoom + delta, ZOOM_MIN, ZOOM_MAX);
      if (newZoom === viewport.zoom) return;

      const result = zoomAtPoint(viewport, newZoom, e.clientX, e.clientY, rect);
      dispatch({ type: "SET_VIEWPORT", payload: result });
    },
    [viewport, dispatch]
  );

  // ── Element mouse down (select / start drag) ─────────────
  const handleElementMouseDown = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();

      const el = plan.elements.find((el) => el.id === elementId);
      if (!el || el.locked) return;

      // Select element
      if (e.shiftKey) {
        const isSelected = state.selectedElementIds.includes(elementId);
        dispatch({
          type: "SELECT",
          payload: isSelected
            ? state.selectedElementIds.filter((id) => id !== elementId)
            : [...state.selectedElementIds, elementId],
        });
      } else if (!state.selectedElementIds.includes(elementId)) {
        dispatch({ type: "SELECT", payload: [elementId] });
      }

      // Start drag
      const world = getSnappedWorldCoords(e);
      setIsDraggingElement(true);
      dragRef.current = {
        elementId,
        startX: world.x,
        startY: world.y,
        origX: el.x,
        origY: el.y,
      };
    },
    [plan.elements, state.selectedElementIds, dispatch, getSnappedWorldCoords]
  );

  // ── Handle mouse down (resize or rotate) ──────────────────
  const handleHandleMouseDown = useCallback(
    (handle: HandlePosition, e: React.MouseEvent) => {
      if (state.selectedElementIds.length !== 1) return;
      const el = plan.elements.find((el) => el.id === state.selectedElementIds[0]);
      if (!el || el.locked) return;
      if (!("width" in el && "height" in el) && handle !== "rotate") return;

      e.stopPropagation();

      if (handle === "rotate") {
        let centerX = el.x;
        let centerY = el.y;
        if ("width" in el && "height" in el) {
          centerX = el.x + (el as RoomElement).width / 2;
          centerY = el.y + (el as RoomElement).height / 2;
        }
        setIsRotating(true);
        rotateRef.current = { elementId: el.id, centerX, centerY };
        return;
      }

      if (!("width" in el && "height" in el)) return;
      const elW = (el as RoomElement).width;
      const elH = (el as RoomElement).height;
      const world = getWorldCoords(e);
      setIsResizing(true);
      resizeRef.current = {
        elementId: el.id,
        handle,
        startX: world.x,
        startY: world.y,
        origX: el.x,
        origY: el.y,
        origW: elW,
        origH: elH,
      };
    },
    [state.selectedElementIds, plan.elements, getWorldCoords]
  );

  // ── Mouse down on canvas ──────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Middle mouse button for panning
      if (e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX, y: e.clientY,
          panX: viewport.panX, panY: viewport.panY,
        };
        return;
      }

      if (e.button !== 0) return;

      const target = e.target as SVGElement;
      const isBackground =
        target === svgRef.current || target.dataset.canvasBg === "true";

      // Room drawing tool
      if (state.activeTool === "room" && isBackground) {
        const world = getSnappedWorldCoords(e);
        drawStartRef.current = world;
        dispatch({ type: "START_DRAW", payload: world });
        setDrawPreview({ x: world.x, y: world.y, width: 0, height: 0 });
        return;
      }

      // Wall drawing tool — click to set start, click again to set end
      if (state.activeTool === "wall" && isBackground) {
        const world = getSnappedWorldCoords(e);
        if (!wallStart) {
          setWallStart(world);
        } else {
          // Snap to horizontal/vertical if close
          let endX = world.x;
          let endY = world.y;
          const dx = Math.abs(endX - wallStart.x);
          const dy = Math.abs(endY - wallStart.y);
          if (dx > 0.5 || dy > 0.5) {
            if (dy < dx * 0.2) endY = wallStart.y; // snap horizontal
            else if (dx < dy * 0.2) endX = wallStart.x; // snap vertical
          }

          const newWall: WallElement = {
            id: crypto.randomUUID(),
            type: "wall",
            x: wallStart.x,
            y: wallStart.y,
            x2: endX,
            y2: endY,
            rotation: 0,
            locked: false,
            label: "",
            opacity: 1,
            zIndex: plan.elements.length,
            thickness: DEFAULT_WALL_THICKNESS,
            strokeColor: "#334155",
          };
          dispatch({ type: "ADD_ELEMENT", payload: newWall });
          dispatch({ type: "SELECT", payload: [newWall.id] });
          setWallStart(null);
          setWallPreview(null);
        }
        return;
      }

      // Text tool — click to place text
      if (state.activeTool === "text" && isBackground) {
        const world = getSnappedWorldCoords(e);
        const newText: TextElement = {
          id: crypto.randomUUID(),
          type: "text",
          x: world.x,
          y: world.y,
          rotation: 0,
          locked: false,
          label: "",
          opacity: 1,
          zIndex: plan.elements.length,
          text: "Text",
          fontSize: 14,
          fontWeight: "normal",
          color: "#1e293b",
        };
        dispatch({ type: "ADD_ELEMENT", payload: newText });
        dispatch({ type: "SELECT", payload: [newText.id] });
        dispatch({ type: "SET_TOOL", payload: "select" });
        return;
      }

      // Select tool — deselect on background click
      if (state.activeTool === "select" && isBackground) {
        dispatch({ type: "DESELECT_ALL" });
      }
    },
    [viewport, state.activeTool, dispatch, getSnappedWorldCoords, wallStart, plan.elements.length]
  );

  // ── Mouse move ────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Panning
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        dispatch({
          type: "SET_VIEWPORT",
          payload: {
            panX: panStartRef.current.panX + dx,
            panY: panStartRef.current.panY + dy,
          },
        });
        return;
      }

      // Room drawing preview
      if (state.isDrawing && drawStartRef.current) {
        const world = getSnappedWorldCoords(e);
        const start = drawStartRef.current;
        const x = Math.min(start.x, world.x);
        const y = Math.min(start.y, world.y);
        const width = Math.abs(world.x - start.x);
        const height = Math.abs(world.y - start.y);
        setDrawPreview({ x, y, width, height });
        return;
      }

      // Resizing
      if (isResizing && resizeRef.current) {
        const world = getWorldCoords(e);
        const r = resizeRef.current;
        const dx = world.x - r.startX;
        const dy = world.y - r.startY;

        let newX = r.origX;
        let newY = r.origY;
        let newW = r.origW;
        let newH = r.origH;

        // Horizontal adjustments
        if (r.handle.includes("right")) {
          newW = Math.max(1, r.origW + dx);
        } else if (r.handle.includes("left")) {
          newW = Math.max(1, r.origW - dx);
          newX = r.origX + r.origW - newW;
        }

        // Vertical adjustments
        if (r.handle.includes("bottom")) {
          newH = Math.max(1, r.origH + dy);
        } else if (r.handle.includes("top")) {
          newH = Math.max(1, r.origH - dy);
          newY = r.origY + r.origH - newH;
        }

        if (plan.gridSnap) {
          newW = Math.max(plan.gridSize, snapToGrid(newW, plan.gridSize));
          newH = Math.max(plan.gridSize, snapToGrid(newH, plan.gridSize));
          newX = snapToGrid(newX, plan.gridSize);
          newY = snapToGrid(newY, plan.gridSize);
        }

        dispatch({
          type: "RESIZE_ELEMENT",
          payload: { id: r.elementId, width: newW, height: newH, x: newX, y: newY },
        });
        return;
      }

      // Rotating
      if (isRotating && rotateRef.current) {
        const world = getWorldCoords(e);
        const r = rotateRef.current;
        const angle = Math.atan2(world.y - r.centerY, world.x - r.centerX) * (180 / Math.PI) + 90;
        let snapped = angle;
        if (plan.gridSnap) {
          snapped = Math.round(angle / 15) * 15;
        }
        // Normalize to 0-360
        snapped = ((snapped % 360) + 360) % 360;
        dispatch({
          type: "ROTATE_ELEMENT",
          payload: { id: r.elementId, rotation: snapped },
        });
        return;
      }

      // Wall preview line
      if (state.activeTool === "wall" && wallStart) {
        const world = getSnappedWorldCoords(e);
        let endX = world.x;
        let endY = world.y;
        const ddx = Math.abs(endX - wallStart.x);
        const ddy = Math.abs(endY - wallStart.y);
        if (ddx > 0.5 || ddy > 0.5) {
          if (ddy < ddx * 0.2) endY = wallStart.y;
          else if (ddx < ddy * 0.2) endX = wallStart.x;
        }
        setWallPreview({ x: endX, y: endY });
        return;
      }

      // Element dragging
      if (isDraggingElement && dragRef.current) {
        const world = getSnappedWorldCoords(e);
        const dx = world.x - dragRef.current.startX;
        const dy = world.y - dragRef.current.startY;
        let newX = dragRef.current.origX + dx;
        let newY = dragRef.current.origY + dy;
        if (plan.gridSnap) {
          newX = snapToGrid(newX, plan.gridSize);
          newY = snapToGrid(newY, plan.gridSize);
        }

        // Smart alignment guides
        const draggedEl = plan.elements.find((el) => el.id === dragRef.current!.elementId);
        if (draggedEl) {
          const dragW = "width" in draggedEl ? (draggedEl as { width: number }).width : 0;
          const dragH = "height" in draggedEl ? (draggedEl as { height: number }).height : 0;
          const others = plan.elements
            .filter((el) => el.id !== dragRef.current!.elementId)
            .map((el) => ({
              x: el.x,
              y: el.y,
              width: "width" in el ? (el as { width: number }).width : undefined,
              height: "height" in el ? (el as { height: number }).height : undefined,
            }));

          const result = computeAlignGuides(newX, newY, dragW, dragH, others);
          newX = result.x;
          newY = result.y;
          setAlignGuides(result.guides);
        }

        dispatch({
          type: "MOVE_ELEMENT",
          payload: { id: dragRef.current.elementId, x: newX, y: newY },
        });
      }
    },
    [isPanning, state.isDrawing, isResizing, isRotating, isDraggingElement, dispatch, getWorldCoords, getSnappedWorldCoords, plan.gridSnap, plan.gridSize]
  );

  // ── Mouse up ──────────────────────────────────────────────
  const handleMouseUp = useCallback(
    () => {
      // End panning
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
        return;
      }

      // End room drawing → create room element
      if (state.isDrawing && drawStartRef.current && drawPreview) {
        dispatch({ type: "END_DRAW" });
        drawStartRef.current = null;

        if (drawPreview.width >= 1 && drawPreview.height >= 1) {
          const preset = getRoomPreset("custom");
          const newRoom: RoomElement = {
            id: crypto.randomUUID(),
            type: "room",
            x: drawPreview.x,
            y: drawPreview.y,
            width: drawPreview.width,
            height: drawPreview.height,
            rotation: 0,
            locked: false,
            label: preset.label,
            opacity: 1,
            zIndex: plan.elements.length,
            roomType: "custom",
            fill: preset.fill,
            strokeColor: "#64748b",
            showDimensions: false,
          };
          dispatch({ type: "ADD_ELEMENT", payload: newRoom });
          dispatch({ type: "SELECT", payload: [newRoom.id] });
        }
        setDrawPreview(null);
        return;
      }

      // End resize
      if (isResizing) {
        setIsResizing(false);
        resizeRef.current = null;
        return;
      }

      // End rotation
      if (isRotating) {
        setIsRotating(false);
        rotateRef.current = null;
        return;
      }

      // End element drag
      if (isDraggingElement) {
        setIsDraggingElement(false);
        dragRef.current = null;
        setAlignGuides([]);
      }
    },
    [isPanning, state.isDrawing, drawPreview, isResizing, isRotating, isDraggingElement, dispatch, plan.elements.length]
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    if (state.isDrawing) {
      dispatch({ type: "END_DRAW" });
      drawStartRef.current = null;
      setDrawPreview(null);
    }
    if (isDraggingElement) {
      setIsDraggingElement(false);
      dragRef.current = null;
    }
    if (isResizing) {
      setIsResizing(false);
      resizeRef.current = null;
    }
    if (isRotating) {
      setIsRotating(false);
      rotateRef.current = null;
    }
    if (wallStart) {
      setWallStart(null);
      setWallPreview(null);
    }
  }, [isPanning, state.isDrawing, isDraggingElement, isResizing, isRotating, wallStart, dispatch]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const cursorStyle = isPanning
    ? "grabbing"
    : isResizing
      ? "nwse-resize"
      : isRotating
        ? "grabbing"
        : isDraggingElement
          ? "move"
          : state.activeTool === "select"
            ? "default"
            : "crosshair";

  // Sort elements by zIndex for rendering order
  const sortedElements = [...plan.elements].sort((a, b) => a.zIndex - b.zIndex);

  // Get the single selected element for resize handles
  const selectedElement =
    state.selectedElementIds.length === 1
      ? plan.elements.find((el) => el.id === state.selectedElementIds[0])
      : null;
  const showHandles =
    selectedElement &&
    !selectedElement.locked &&
    "width" in selectedElement &&
    "height" in selectedElement;

  return (
    <svg
      ref={svgRef}
      className="h-full w-full"
      style={{ cursor: cursorStyle }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      <g
        transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}
      >
        {/* Plan background */}
        <rect
          data-canvas-bg="true"
          x={0}
          y={0}
          width={canvasW}
          height={canvasH}
          fill={plan.backgroundColor}
          stroke="var(--color-border)"
          strokeWidth={1 / viewport.zoom}
        />

        {/* Underlay image */}
        {state.underlay && (
          <image
            href={state.underlay.dataUrl}
            x={0}
            y={0}
            width={canvasW}
            height={canvasH}
            opacity={state.underlay.opacity}
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* Grid */}
        {plan.showGrid && (
          <GridLayer
            width={canvasW}
            height={canvasH}
            gridSize={plan.gridSize * PIXELS_PER_UNIT}
            zoom={viewport.zoom}
          />
        )}

        {/* Elements */}
        {sortedElements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            isSelected={state.selectedElementIds.includes(element.id)}
            unit={plan.unit}
            showDimensions={plan.showDimensions}
            zoom={viewport.zoom}
            dispatch={dispatch}
            onElementMouseDown={handleElementMouseDown}
          />
        ))}

        {/* Resize/rotate handles for selected element */}
        {showHandles && (
          <ResizeHandles
            x={selectedElement.x}
            y={selectedElement.y}
            width={(selectedElement as RoomElement).width}
            height={(selectedElement as RoomElement).height}
            rotation={selectedElement.rotation}
            zoom={viewport.zoom}
            onHandleMouseDown={handleHandleMouseDown}
          />
        )}

        {/* Draw preview (dashed rect while drawing a room) */}
        {drawPreview && drawPreview.width > 0 && drawPreview.height > 0 && (
          <rect
            x={drawPreview.x * PIXELS_PER_UNIT}
            y={drawPreview.y * PIXELS_PER_UNIT}
            width={drawPreview.width * PIXELS_PER_UNIT}
            height={drawPreview.height * PIXELS_PER_UNIT}
            fill="var(--color-brand)"
            fillOpacity={0.1}
            stroke="var(--color-brand)"
            strokeWidth={1.5 / viewport.zoom}
            strokeDasharray={`${4 / viewport.zoom} ${4 / viewport.zoom}`}
            rx={2 / viewport.zoom}
          />
        )}

        {/* Alignment guides */}
        {alignGuides.map((guide, i) => (
          guide.axis === "x" ? (
            <line
              key={`guide-${i}`}
              x1={guide.position * PIXELS_PER_UNIT}
              y1={0}
              x2={guide.position * PIXELS_PER_UNIT}
              y2={canvasH}
              stroke="var(--color-brand)"
              strokeWidth={1 / viewport.zoom}
              strokeDasharray={`${3 / viewport.zoom} ${3 / viewport.zoom}`}
              opacity={0.7}
              style={{ pointerEvents: "none" }}
            />
          ) : (
            <line
              key={`guide-${i}`}
              x1={0}
              y1={guide.position * PIXELS_PER_UNIT}
              x2={canvasW}
              y2={guide.position * PIXELS_PER_UNIT}
              stroke="var(--color-brand)"
              strokeWidth={1 / viewport.zoom}
              strokeDasharray={`${3 / viewport.zoom} ${3 / viewport.zoom}`}
              opacity={0.7}
              style={{ pointerEvents: "none" }}
            />
          )
        ))}

        {/* Wall drawing preview line */}
        {wallStart && wallPreview && (
          <line
            x1={wallStart.x * PIXELS_PER_UNIT}
            y1={wallStart.y * PIXELS_PER_UNIT}
            x2={wallPreview.x * PIXELS_PER_UNIT}
            y2={wallPreview.y * PIXELS_PER_UNIT}
            stroke="var(--color-brand)"
            strokeWidth={DEFAULT_WALL_THICKNESS * PIXELS_PER_UNIT}
            strokeLinecap="round"
            opacity={0.5}
          />
        )}
      </g>
    </svg>
  );
}
