"use client";

import { useRef, useCallback, useState, useEffect, type Dispatch } from "react";
import type {
  EditorState,
  FlowchartAction,
  AnchorPosition,
} from "@/lib/flowchart/types";
import {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  DEFAULT_NODE_STYLE,
  DEFAULT_EDGE_STYLE,
  ANCHOR_SNAP_RADIUS,
  getShapePreset,
} from "@/lib/flowchart/constants";
import {
  screenToWorld,
  zoomAtPoint,
  snapToGrid,
  clamp,
  getNodesInRect,
} from "@/lib/flowchart/geometry";
import { computeDraftEdgePath, findClosestAnchor, getAutoBezierControls } from "@/lib/flowchart/routing";
import { getAnchorWorldPosition } from "@/lib/flowchart/shapes";
import { GridLayer } from "./grid-layer";
import { NodeRenderer } from "./node-renderer";
import { EdgeRenderer, ArrowMarkerDefs } from "./edge-renderer";
import { AnchorPoints } from "./anchor-points";
import {
  SelectionHandles,
  type HandlePosition,
} from "./selection-handles";

interface SvgCanvasProps {
  state: EditorState;
  dispatch: Dispatch<FlowchartAction>;
}

export function SvgCanvas({ state, dispatch }: SvgCanvasProps) {
  const { diagram, viewport } = state;

  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);

  // Dragging nodes
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origPositions: Map<string, { x: number; y: number }>;
    hasMoved: boolean;
  } | null>(null);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    nodeId: string;
    handle: HandlePosition;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  // Rotation state
  const [isRotating, setIsRotating] = useState(false);
  const rotateRef = useRef<{
    nodeId: string;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Control point drag state
  const [isDraggingCP, setIsDraggingCP] = useState(false);
  const cpDragRef = useRef<{
    edgeId: string;
    cpIndex: number;
  } | null>(null);

  // Space key for pan mode
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  // Hover state for anchor points
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [snapAnchor, setSnapAnchor] = useState<{
    nodeId: string;
    anchor: AnchorPosition;
  } | null>(null);

  // ── Coordinate helpers ──────────────────────────────────────

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
      if (diagram.gridSnap) {
        return {
          x: snapToGrid(world.x, diagram.gridSize),
          y: snapToGrid(world.y, diagram.gridSize),
        };
      }
      return world;
    },
    [getWorldCoords, diagram.gridSnap, diagram.gridSize]
  );

  // ── Zoom via scroll wheel ───────────────────────────────────

  // Attach wheel handler as a non-passive native listener so preventDefault
  // actually stops the page from scrolling while zooming the canvas.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = clamp(viewport.zoom + delta, ZOOM_MIN, ZOOM_MAX);
      if (newZoom === viewport.zoom) return;
      const result = zoomAtPoint(viewport, newZoom, e.clientX, e.clientY, rect);
      dispatch({ type: "SET_VIEWPORT", payload: result });
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [viewport, dispatch]);

  // ── Handle mouse down on resize/rotate handles ──────────────

  const handleHandleMouseDown = useCallback(
    (handle: HandlePosition, e: React.MouseEvent) => {
      if (state.selectedNodeIds.length !== 1) return;
      const node = diagram.nodes.find(
        (n) => n.id === state.selectedNodeIds[0]
      );
      if (!node || node.locked) return;

      e.stopPropagation();

      if (handle === "rotate") {
        setIsRotating(true);
        rotateRef.current = {
          nodeId: node.id,
          centerX: node.x + node.width / 2,
          centerY: node.y + node.height / 2,
        };
        return;
      }

      const world = getWorldCoords(e);
      setIsResizing(true);
      resizeRef.current = {
        nodeId: node.id,
        handle,
        startX: world.x,
        startY: world.y,
        origX: node.x,
        origY: node.y,
        origW: node.width,
        origH: node.height,
      };
    },
    [state.selectedNodeIds, diagram.nodes, getWorldCoords]
  );

  // ── Anchor mouse down (start connecting) ─────────────────────

  const handleAnchorMouseDown = useCallback(
    (nodeId: string, anchor: AnchorPosition, e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: "START_CONNECT",
        payload: { sourceNodeId: nodeId, sourceAnchor: anchor },
      });
      const world = getWorldCoords(e);
      dispatch({
        type: "UPDATE_CONNECT",
        payload: { mouseX: world.x, mouseY: world.y },
      });
    },
    [dispatch, getWorldCoords]
  );

  // ── Mouse down ──────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Middle mouse → pan
      if (e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX: viewport.panX,
          panY: viewport.panY,
        };
        return;
      }

      if (e.button !== 0) return;

      const target = e.target as SVGElement;
      const isBackground =
        target === svgRef.current || target.dataset.canvasBg === "true";

      // Pan tool or space+click → pan
      if (state.activeTool === "pan" || isSpaceDown) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX: viewport.panX,
          panY: viewport.panY,
        };
        return;
      }

      // Connect tool — click on a node to start connection from closest anchor
      if (state.activeTool === "connect") {
        const nodeEl = target.closest("[data-node-id]");
        const nodeId = nodeEl?.getAttribute("data-node-id");
        if (nodeId) {
          const node = diagram.nodes.find((n) => n.id === nodeId);
          if (node) {
            const world = getWorldCoords(e);
            const closest = findClosestAnchor(node, world.x, world.y);
            dispatch({
              type: "START_CONNECT",
              payload: { sourceNodeId: nodeId, sourceAnchor: closest.anchor },
            });
            dispatch({
              type: "UPDATE_CONNECT",
              payload: { mouseX: world.x, mouseY: world.y },
            });
          }
        }
        return;
      }

      // Click on a control point handle → start dragging it
      const cpEl = target.closest("[data-edge-cp]");
      if (cpEl) {
        const cpEdgeId = cpEl.getAttribute("data-edge-cp");
        const cpIdx = Number(cpEl.getAttribute("data-cp-index"));
        if (cpEdgeId != null && !isNaN(cpIdx)) {
          e.stopPropagation();
          setIsDraggingCP(true);
          cpDragRef.current = { edgeId: cpEdgeId, cpIndex: cpIdx };
          return;
        }
      }

      // Click on an edge → select it (and auto-init control points for bezier)
      const edgeEl = target.closest("[data-edge-id]");
      const edgeId = edgeEl?.getAttribute("data-edge-id");
      if (edgeId && state.activeTool === "select") {
        e.stopPropagation();
        if (e.shiftKey) {
          const isSelected = state.selectedEdgeIds.includes(edgeId);
          dispatch({
            type: "SELECT_EDGES",
            payload: isSelected
              ? state.selectedEdgeIds.filter((id) => id !== edgeId)
              : [...state.selectedEdgeIds, edgeId],
          });
        } else {
          dispatch({ type: "SELECT_EDGES", payload: [edgeId] });
        }

        // Auto-initialize control points for bezier edges so user can drag them
        const edge = diagram.edges.find((ed) => ed.id === edgeId);
        if (
          edge &&
          edge.routeType === "bezier" &&
          edge.controlPoints.length === 0
        ) {
          const srcNode = diagram.nodes.find(
            (n) => n.id === edge.sourceNodeId
          );
          const tgtNode = diagram.nodes.find(
            (n) => n.id === edge.targetNodeId
          );
          if (srcNode && tgtNode) {
            const src = getAnchorWorldPosition(srcNode, edge.sourceAnchor);
            const tgt = getAnchorWorldPosition(tgtNode, edge.targetAnchor);
            const cp = getAutoBezierControls(
              src,
              tgt,
              edge.sourceAnchor,
              edge.targetAnchor
            );
            dispatch({
              type: "UPDATE_EDGE",
              payload: {
                id: edge.id,
                controlPoints: [
                  { x: cp.cp1x, y: cp.cp1y },
                  { x: cp.cp2x, y: cp.cp2y },
                ],
              },
            });
          }
        }
        return;
      }

      // Click on a node → select / start drag
      const nodeEl = target.closest("[data-node-id]");
      const nodeId = nodeEl?.getAttribute("data-node-id");
      if (nodeId && state.activeTool === "select") {
        const node = diagram.nodes.find((n) => n.id === nodeId);
        if (!node || node.locked) return;
        e.stopPropagation();

        // Selection logic
        if (e.shiftKey) {
          const isSelected = state.selectedNodeIds.includes(nodeId);
          dispatch({
            type: "SELECT_NODES",
            payload: isSelected
              ? state.selectedNodeIds.filter((id) => id !== nodeId)
              : [...state.selectedNodeIds, nodeId],
          });
        } else if (!state.selectedNodeIds.includes(nodeId)) {
          dispatch({ type: "SELECT_NODES", payload: [nodeId] });
        }

        // Start drag
        const world = getWorldCoords(e);
        const idsToMove = state.selectedNodeIds.includes(nodeId)
          ? state.selectedNodeIds
          : [nodeId];
        const origPositions = new Map<string, { x: number; y: number }>();
        for (const id of idsToMove) {
          const n = diagram.nodes.find((n) => n.id === id);
          if (n && !n.locked) origPositions.set(id, { x: n.x, y: n.y });
        }
        if (origPositions.size === 0) return;
        setIsDraggingNode(true);
        dragRef.current = {
          startX: world.x,
          startY: world.y,
          origPositions,
          hasMoved: false,
        };
        return;
      }

      // Add shape tool — click on background
      if (state.activeTool === "add-shape" && isBackground) {
        const world = getSnappedWorldCoords(e);
        const preset = getShapePreset(state.activeShapeType);
        const newNode = {
          id: crypto.randomUUID(),
          shape: state.activeShapeType,
          x: world.x - preset.defaultWidth / 2,
          y: world.y - preset.defaultHeight / 2,
          width: preset.defaultWidth,
          height: preset.defaultHeight,
          text: preset.label,
          style: { ...DEFAULT_NODE_STYLE, fill: preset.defaultFill },
          rotation: 0,
          locked: false,
          zIndex: diagram.nodes.length,
        };
        dispatch({ type: "ADD_NODE", payload: newNode });
        dispatch({ type: "SELECT_NODES", payload: [newNode.id] });
        dispatch({ type: "SET_TOOL", payload: "select" });
        return;
      }

      // Text tool — click on background to place a text-like node
      if (state.activeTool === "text" && isBackground) {
        const world = getSnappedWorldCoords(e);
        const newNode = {
          id: crypto.randomUUID(),
          shape: "process" as const,
          x: world.x - 80,
          y: world.y - 20,
          width: 160,
          height: 40,
          text: "Text",
          style: {
            ...DEFAULT_NODE_STYLE,
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 0,
          },
          rotation: 0,
          locked: false,
          zIndex: diagram.nodes.length,
        };
        dispatch({ type: "ADD_NODE", payload: newNode });
        dispatch({ type: "SELECT_NODES", payload: [newNode.id] });
        dispatch({ type: "SET_TOOL", payload: "select" });
        return;
      }

      // Select tool — click background → deselect or start marquee
      if (state.activeTool === "select" && isBackground) {
        dispatch({ type: "DESELECT_ALL" });
        const world = getWorldCoords(e);
        dispatch({
          type: "START_MARQUEE",
          payload: { x: world.x, y: world.y },
        });
        return;
      }
    },
    [
      viewport,
      state.activeTool,
      state.activeShapeType,
      state.selectedNodeIds,
      state.selectedEdgeIds,
      isSpaceDown,
      diagram.nodes,
      diagram.gridSnap,
      diagram.gridSize,
      dispatch,
      getWorldCoords,
      getSnappedWorldCoords,
    ]
  );

  // ── Mouse move ──────────────────────────────────────────────

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

        if (r.handle.includes("right")) {
          newW = Math.max(20, r.origW + dx);
        } else if (r.handle.includes("left")) {
          newW = Math.max(20, r.origW - dx);
          newX = r.origX + r.origW - newW;
        }

        if (r.handle.includes("bottom")) {
          newH = Math.max(20, r.origH + dy);
        } else if (r.handle.includes("top")) {
          newH = Math.max(20, r.origH - dy);
          newY = r.origY + r.origH - newH;
        }

        if (diagram.gridSnap) {
          newW = Math.max(diagram.gridSize, snapToGrid(newW, diagram.gridSize));
          newH = Math.max(diagram.gridSize, snapToGrid(newH, diagram.gridSize));
          newX = snapToGrid(newX, diagram.gridSize);
          newY = snapToGrid(newY, diagram.gridSize);
        }

        dispatch({
          type: "RESIZE_NODE",
          payload: {
            id: r.nodeId,
            width: newW,
            height: newH,
            x: newX,
            y: newY,
          },
        });
        return;
      }

      // Rotating
      if (isRotating && rotateRef.current) {
        const world = getWorldCoords(e);
        const r = rotateRef.current;
        const angle =
          Math.atan2(world.y - r.centerY, world.x - r.centerX) *
            (180 / Math.PI) +
          90;
        let snapped = diagram.gridSnap
          ? Math.round(angle / 15) * 15
          : angle;
        snapped = ((snapped % 360) + 360) % 360;
        dispatch({
          type: "UPDATE_NODE",
          payload: { id: r.nodeId, rotation: snapped },
        });
        return;
      }

      // Control point dragging
      if (isDraggingCP && cpDragRef.current) {
        const world = getWorldCoords(e);
        dispatch({
          type: "MOVE_CONTROL_POINT",
          payload: {
            edgeId: cpDragRef.current.edgeId,
            cpIndex: cpDragRef.current.cpIndex,
            x: diagram.gridSnap ? snapToGrid(world.x, diagram.gridSize) : world.x,
            y: diagram.gridSnap ? snapToGrid(world.y, diagram.gridSize) : world.y,
          },
        });
        return;
      }

      // Node dragging
      if (isDraggingNode && dragRef.current) {
        const world = getWorldCoords(e);
        let dx = world.x - dragRef.current.startX;
        let dy = world.y - dragRef.current.startY;

        if (diagram.gridSnap) {
          dx = snapToGrid(dx, diagram.gridSize);
          dy = snapToGrid(dy, diagram.gridSize);
        }

        if (dx !== 0 || dy !== 0) {
          dragRef.current.hasMoved = true;
        }

        for (const [id, orig] of dragRef.current.origPositions) {
          const node = diagram.nodes.find((n) => n.id === id);
          if (node) {
            const newX = orig.x + dx;
            const newY = orig.y + dy;
            if (node.x !== newX || node.y !== newY) {
              dispatch({
                type: "MOVE_NODES",
                payload: {
                  ids: Array.from(dragRef.current.origPositions.keys()),
                  dx: dx - (node.x - orig.x),
                  dy: dy - (node.y - orig.y),
                },
              });
              break;
            }
          }
        }
        return;
      }

      // Connection drafting — update mouse position and check for anchor snapping
      if (state.isConnecting && state.connectDraft) {
        const world = getWorldCoords(e);
        dispatch({
          type: "UPDATE_CONNECT",
          payload: { mouseX: world.x, mouseY: world.y },
        });

        // Check for snap to target anchor
        let foundSnap = false;
        for (const node of diagram.nodes) {
          if (node.id === state.connectDraft.sourceNodeId) continue;
          const closest = findClosestAnchor(node, world.x, world.y);
          const screenDist = closest.distance * viewport.zoom;
          if (screenDist < ANCHOR_SNAP_RADIUS) {
            setSnapAnchor({ nodeId: node.id, anchor: closest.anchor });
            foundSnap = true;
            break;
          }
        }
        if (!foundSnap) {
          setSnapAnchor(null);
        }
        return;
      }

      // Marquee selection
      if (state.marquee) {
        const world = getWorldCoords(e);
        dispatch({
          type: "UPDATE_MARQUEE",
          payload: { x: world.x, y: world.y },
        });
        return;
      }

      // Hover detection for showing anchors
      if (
        state.activeTool === "connect" ||
        state.activeTool === "select"
      ) {
        const target = e.target as SVGElement;
        const nodeEl = target.closest("[data-node-id]");
        const nodeId = nodeEl?.getAttribute("data-node-id");
        setHoveredNodeId(nodeId ?? null);
      }
    },
    [
      isPanning,
      isResizing,
      isRotating,
      isDraggingNode,
      isDraggingCP,
      state.marquee,
      state.isConnecting,
      state.connectDraft,
      state.activeTool,
      diagram,
      viewport.zoom,
      dispatch,
      getWorldCoords,
    ]
  );

  // ── Mouse up ────────────────────────────────────────────────

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
        return;
      }

      if (isResizing) {
        setIsResizing(false);
        resizeRef.current = null;
        return;
      }

      if (isRotating) {
        setIsRotating(false);
        rotateRef.current = null;
        return;
      }

      if (isDraggingCP) {
        setIsDraggingCP(false);
        cpDragRef.current = null;
        return;
      }

      if (isDraggingNode) {
        setIsDraggingNode(false);
        dragRef.current = null;
        return;
      }

      // Complete connection
      if (state.isConnecting && state.connectDraft) {
        const world = getWorldCoords(e);
        let targetNodeId: string | null = null;
        let targetAnchor: AnchorPosition = "top";

        // Check if snapped to an anchor
        if (snapAnchor) {
          targetNodeId = snapAnchor.nodeId;
          targetAnchor = snapAnchor.anchor;
        } else {
          // Find closest node/anchor
          for (const node of diagram.nodes) {
            if (node.id === state.connectDraft.sourceNodeId) continue;
            const closest = findClosestAnchor(node, world.x, world.y);
            const screenDist = closest.distance * viewport.zoom;
            if (screenDist < ANCHOR_SNAP_RADIUS * 2) {
              targetNodeId = node.id;
              targetAnchor = closest.anchor;
              break;
            }
          }
        }

        if (
          targetNodeId &&
          targetNodeId !== state.connectDraft.sourceNodeId
        ) {
          // Check for duplicate edge
          const exists = diagram.edges.some(
            (e) =>
              e.sourceNodeId === state.connectDraft!.sourceNodeId &&
              e.sourceAnchor === state.connectDraft!.sourceAnchor &&
              e.targetNodeId === targetNodeId &&
              e.targetAnchor === targetAnchor
          );

          if (!exists) {
            dispatch({
              type: "ADD_EDGE",
              payload: {
                id: crypto.randomUUID(),
                sourceNodeId: state.connectDraft.sourceNodeId,
                sourceAnchor: state.connectDraft.sourceAnchor,
                targetNodeId,
                targetAnchor,
                routeType: state.defaultRouteType,
                controlPoints: [],
                label: "",
                style: { ...DEFAULT_EDGE_STYLE },
                zIndex: diagram.edges.length,
              },
            });
          }
        }

        dispatch({ type: "END_CONNECT" });
        setSnapAnchor(null);
        return;
      }

      if (state.marquee) {
        const m = state.marquee;
        const w = m.currentX - m.startX;
        const h = m.currentY - m.startY;
        if (Math.abs(w) > 5 || Math.abs(h) > 5) {
          const ids = getNodesInRect(diagram.nodes, m.startX, m.startY, w, h);
          dispatch({ type: "SELECT_NODES", payload: ids });
        }
        dispatch({ type: "END_MARQUEE" });
        return;
      }
    },
    [
      isPanning,
      isResizing,
      isRotating,
      isDraggingNode,
      isDraggingCP,
      state.marquee,
      state.isConnecting,
      state.connectDraft,
      state.defaultRouteType,
      snapAnchor,
      diagram.nodes,
      diagram.edges,
      viewport.zoom,
      dispatch,
      getWorldCoords,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    if (isDraggingNode) {
      setIsDraggingNode(false);
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
    if (isDraggingCP) {
      setIsDraggingCP(false);
      cpDragRef.current = null;
    }
    if (state.marquee) {
      dispatch({ type: "END_MARQUEE" });
    }
    if (state.isConnecting) {
      dispatch({ type: "CANCEL_CONNECT" });
      setSnapAnchor(null);
    }
    setHoveredNodeId(null);
  }, [
    isPanning,
    isDraggingNode,
    isDraggingCP,
    isResizing,
    isRotating,
    state.marquee,
    state.isConnecting,
    dispatch,
  ]);

  // ── Space key tracking for pan shortcut ─────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      setIsSpaceDown(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " ") {
      setIsSpaceDown(false);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // ── Cursor ──────────────────────────────────────────────────

  const cursorStyle = isPanning
    ? "grabbing"
    : isSpaceDown || state.activeTool === "pan"
      ? "grab"
      : isResizing
        ? "nwse-resize"
        : isRotating
          ? "grabbing"
          : isDraggingNode || isDraggingCP
            ? "move"
            : state.activeTool === "connect"
              ? "crosshair"
              : state.activeTool === "select"
                ? "default"
                : "crosshair";

  // Sort nodes by zIndex
  const sortedNodes = [...diagram.nodes].sort((a, b) => a.zIndex - b.zIndex);

  // Get single selected node for handles
  const selectedNode =
    state.selectedNodeIds.length === 1
      ? diagram.nodes.find((n) => n.id === state.selectedNodeIds[0])
      : null;
  const showHandles = selectedNode && !selectedNode.locked;

  // Determine which nodes show anchor points
  const showAnchorsForConnect = state.activeTool === "connect" || state.isConnecting;

  // Source node for draft edge
  const connectSourceNode = state.connectDraft
    ? diagram.nodes.find((n) => n.id === state.connectDraft!.sourceNodeId)
    : null;

  return (
    <svg
      ref={svgRef}
      className="h-full w-full outline-none"
      style={{ cursor: cursorStyle }}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={handleContextMenu}
    >
      {/* Arrow marker definitions */}
      <ArrowMarkerDefs />

      <g
        transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}
      >
        {/* Infinite canvas background */}
        <rect
          data-canvas-bg="true"
          x={-50000}
          y={-50000}
          width={100000}
          height={100000}
          fill={diagram.backgroundColor}
          opacity={0.01}
        />

        {/* Grid */}
        {diagram.gridVisible && (
          <GridLayer gridSize={diagram.gridSize} zoom={viewport.zoom} />
        )}

        {/* Edges — render behind nodes */}
        {diagram.edges.map((edge) => {
          const sourceNode = diagram.nodes.find(
            (n) => n.id === edge.sourceNodeId
          );
          const targetNode = diagram.nodes.find(
            (n) => n.id === edge.targetNodeId
          );
          if (!sourceNode || !targetNode) return null;
          return (
            <EdgeRenderer
              key={edge.id}
              edge={edge}
              sourceNode={sourceNode}
              targetNode={targetNode}
              isSelected={state.selectedEdgeIds.includes(edge.id)}
              zoom={viewport.zoom}
            />
          );
        })}

        {/* Draft connection edge (while connecting) */}
        {state.connectDraft && connectSourceNode && (
          <path
            d={computeDraftEdgePath(
              connectSourceNode,
              state.connectDraft.sourceAnchor,
              state.connectDraft.mouseX,
              state.connectDraft.mouseY,
              state.defaultRouteType
            )}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinecap="round"
            opacity={0.7}
            style={{ pointerEvents: "none" }}
            markerEnd="url(#fc-arrow-filled-arrow-selected)"
          />
        )}

        {/* Nodes — proper shape rendering */}
        {sortedNodes.map((node) => (
          <NodeRenderer
            key={node.id}
            node={node}
            isSelected={state.selectedNodeIds.includes(node.id)}
            zoom={viewport.zoom}
          />
        ))}

        {/* Anchor points — show on hovered node in connect mode, or on all nodes while connecting */}
        {showAnchorsForConnect &&
          diagram.nodes.map((node) => {
            const showThis =
              state.isConnecting ||
              node.id === hoveredNodeId;
            if (!showThis) return null;
            return (
              <AnchorPoints
                key={`anchor-${node.id}`}
                node={node}
                zoom={viewport.zoom}
                highlightAnchor={
                  snapAnchor?.nodeId === node.id
                    ? snapAnchor.anchor
                    : null
                }
                onAnchorMouseDown={handleAnchorMouseDown}
              />
            );
          })}

        {/* Show anchor points on hovered node in select mode (for quick connection) */}
        {state.activeTool === "select" &&
          !state.isConnecting &&
          hoveredNodeId &&
          (() => {
            const node = diagram.nodes.find(
              (n) => n.id === hoveredNodeId
            );
            if (!node) return null;
            return (
              <AnchorPoints
                node={node}
                zoom={viewport.zoom}
                onAnchorMouseDown={handleAnchorMouseDown}
              />
            );
          })()}

        {/* Selection handles on selected node */}
        {showHandles && (
          <SelectionHandles
            x={selectedNode.x}
            y={selectedNode.y}
            width={selectedNode.width}
            height={selectedNode.height}
            rotation={selectedNode.rotation}
            zoom={viewport.zoom}
            onHandleMouseDown={handleHandleMouseDown}
          />
        )}

        {/* Marquee selection rectangle */}
        {state.marquee && (
          <rect
            x={Math.min(state.marquee.startX, state.marquee.currentX)}
            y={Math.min(state.marquee.startY, state.marquee.currentY)}
            width={Math.abs(state.marquee.currentX - state.marquee.startX)}
            height={Math.abs(state.marquee.currentY - state.marquee.startY)}
            fill="var(--color-brand)"
            fillOpacity={0.08}
            stroke="var(--color-brand)"
            strokeWidth={1 / viewport.zoom}
            strokeDasharray={`${4 / viewport.zoom} ${4 / viewport.zoom}`}
            style={{ pointerEvents: "none" }}
          />
        )}
      </g>
    </svg>
  );
}
