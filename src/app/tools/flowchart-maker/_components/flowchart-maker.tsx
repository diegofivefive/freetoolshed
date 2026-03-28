"use client";

import { useReducer, useEffect, useCallback, useState, useRef } from "react";
import type {
  EditorState,
  FlowchartAction,
  FlowchartDiagram,
  FlowchartNode,
  FlowchartEdge,
} from "@/lib/flowchart/types";
import {
  createDefaultEditorState,
  MAX_UNDO_STEPS,
  ZOOM_MIN,
  ZOOM_MAX,
} from "@/lib/flowchart/constants";
import { saveDraft, loadDraft } from "@/lib/flowchart/storage";
import { SvgCanvas } from "./svg-canvas";
import { Toolbar } from "./toolbar";
import { ZoomControls } from "./zoom-controls";
import { ShapePalette } from "./shape-palette";
import { PropertiesPanel } from "./properties-panel";
import { DiagramManager } from "./diagram-manager";
import { ExportPanel } from "./export-panel";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import { Input } from "@/components/ui/input";
import { Undo2, Redo2, Download } from "lucide-react";

// ── Guide sections ──────────────────────────────────────────

const TOOL_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Create flowcharts by placing shapes on the canvas and connecting them with edges.",
    steps: [
      "Select a shape from the palette on the left",
      "Click on the canvas to place the shape",
      "Switch to Connect mode (C) to draw edges between shapes",
      "Double-click a shape to edit its text",
    ],
  },
  {
    title: "Tools",
    content: "Switch tools with the left toolbar or keyboard shortcuts.",
    steps: [
      "V — Select: move, resize, and edit shapes",
      "H — Pan: drag the canvas to navigate",
      "S — Add Shape: click to place the active shape",
      "C — Connect: click two shapes to draw an edge",
      "T — Text: click to add a text label",
    ],
  },
  {
    title: "Shapes",
    content: "11 shape types across 4 categories: Basic (process, terminal, connector), Flowchart (decision, I/O, document, predefined process, manual input, preparation), Data (database), and Annotation (comment).",
  },
  {
    title: "Connections",
    content: "Draw edges between shapes using the Connect tool. Edges snap to anchor points (top, right, bottom, left) on each shape.",
    steps: [
      "Select the Connect tool (C)",
      "Click a shape to start the connection",
      "Click another shape to complete it",
      "Select an edge to change its route type, style, and labels in the properties panel",
    ],
  },
  {
    title: "Keyboard Shortcuts",
    content: "Common shortcuts for fast editing.",
    steps: [
      "Ctrl+Z / Ctrl+Y — Undo / Redo",
      "Ctrl+C / Ctrl+V — Copy / Paste",
      "Ctrl+D — Duplicate selection",
      "Ctrl+A — Select all",
      "Delete — Remove selected",
      "Escape — Deselect / cancel",
    ],
  },
  {
    title: "File Menu",
    content: "Use the File menu in the top-left to manage diagrams.",
    steps: [
      "New Diagram — start fresh",
      "From Template — load a starter flowchart",
      "Save / Load — save to browser history",
      "Export / Import JSON — backup and share",
    ],
  },
  {
    title: "Export",
    content: "Click the download icon in the top bar to open the export panel.",
    steps: [
      "SVG — scalable vector, best for editing",
      "PNG — raster image at 1x, 2x, or 4x",
      "PDF — print-ready on A4 or Letter paper",
      "Clipboard — paste into any app",
    ],
  },
  {
    title: "Auto-Save",
    content: "Your diagram is automatically saved to your browser every few seconds. It restores when you return. Use File > Save to History for permanent snapshots.",
  },
];

// ── Helpers ──────────────────────────────────────────────────

function withUndo(state: EditorState): EditorState {
  return {
    ...state,
    undoStack: [
      ...state.undoStack.slice(-(MAX_UNDO_STEPS - 1)),
      state.diagram,
    ],
    redoStack: [],
  };
}

function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

function removeConnectedEdges(
  edges: FlowchartEdge[],
  nodeIds: string[]
): FlowchartEdge[] {
  return edges.filter(
    (e) => !nodeIds.includes(e.sourceNodeId) && !nodeIds.includes(e.targetNodeId)
  );
}

// ── Reducer ──────────────────────────────────────────────────

function flowchartReducer(
  state: EditorState,
  action: FlowchartAction
): EditorState {
  switch (action.type) {
    // ── Diagram metadata ──
    case "SET_NAME":
      return {
        ...state,
        diagram: { ...state.diagram, name: action.payload },
      };

    case "SET_GRID":
      return {
        ...state,
        diagram: { ...state.diagram, ...action.payload },
      };

    case "SET_BACKGROUND":
      return {
        ...withUndo(state),
        diagram: { ...state.diagram, backgroundColor: action.payload },
      };

    // ── Nodes ──
    case "ADD_NODE":
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: [...state.diagram.nodes, action.payload],
        },
      };

    case "UPDATE_NODE":
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) =>
            n.id === action.payload.id
              ? ({ ...n, ...action.payload } as FlowchartNode)
              : n
          ),
        },
      };

    case "MOVE_NODES": {
      const { ids, dx, dy } = action.payload;
      return {
        ...state,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) =>
            ids.includes(n.id)
              ? { ...n, x: n.x + dx, y: n.y + dy }
              : n
          ),
        },
      };
    }

    case "RESIZE_NODE":
      return {
        ...state,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) => {
            if (n.id !== action.payload.id) return n;
            return {
              ...n,
              width: action.payload.width,
              height: action.payload.height,
              ...(action.payload.x !== undefined ? { x: action.payload.x } : {}),
              ...(action.payload.y !== undefined ? { y: action.payload.y } : {}),
            };
          }),
        },
      };

    case "REMOVE_NODES":
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.filter(
            (n) => !action.payload.includes(n.id)
          ),
          edges: removeConnectedEdges(state.diagram.edges, action.payload),
        },
        selectedNodeIds: state.selectedNodeIds.filter(
          (id) => !action.payload.includes(id)
        ),
        selectedEdgeIds: [],
      };

    case "BRING_TO_FRONT": {
      const maxZ = Math.max(
        0,
        ...state.diagram.nodes.map((n) => n.zIndex)
      );
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) =>
            n.id === action.payload ? { ...n, zIndex: maxZ + 1 } : n
          ),
        },
      };
    }

    case "SEND_TO_BACK": {
      const minZ = Math.min(
        0,
        ...state.diagram.nodes.map((n) => n.zIndex)
      );
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) =>
            n.id === action.payload ? { ...n, zIndex: minZ - 1 } : n
          ),
        },
      };
    }

    case "LOCK_NODES":
      return {
        ...state,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) =>
            action.payload.includes(n.id) ? { ...n, locked: true } : n
          ),
        },
      };

    case "UNLOCK_NODES":
      return {
        ...state,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((n) =>
            action.payload.includes(n.id) ? { ...n, locked: false } : n
          ),
        },
      };

    // ── Edges ──
    case "ADD_EDGE":
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          edges: [...state.diagram.edges, action.payload],
        },
      };

    case "UPDATE_EDGE":
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((e) =>
            e.id === action.payload.id
              ? ({ ...e, ...action.payload } as FlowchartEdge)
              : e
          ),
        },
      };

    case "REMOVE_EDGES":
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.filter(
            (e) => !action.payload.includes(e.id)
          ),
        },
        selectedEdgeIds: state.selectedEdgeIds.filter(
          (id) => !action.payload.includes(id)
        ),
      };

    // ── Selection ──
    case "SELECT_NODES":
      return { ...state, selectedNodeIds: action.payload, selectedEdgeIds: [] };

    case "SELECT_EDGES":
      return { ...state, selectedEdgeIds: action.payload, selectedNodeIds: [] };

    case "SELECT_ALL":
      return {
        ...state,
        selectedNodeIds: state.diagram.nodes.map((n) => n.id),
        selectedEdgeIds: state.diagram.edges.map((e) => e.id),
      };

    case "DESELECT_ALL":
      return { ...state, selectedNodeIds: [], selectedEdgeIds: [] };

    // ── Tools ──
    case "SET_TOOL":
      return {
        ...state,
        activeTool: action.payload,
        selectedNodeIds: [],
        selectedEdgeIds: [],
        connectDraft: null,
        isConnecting: false,
        marquee: null,
      };

    case "SET_ACTIVE_SHAPE":
      return { ...state, activeShapeType: action.payload };

    case "SET_DEFAULT_ROUTE_TYPE":
      return { ...state, defaultRouteType: action.payload };

    // ── Viewport ──
    case "SET_VIEWPORT":
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload,
          zoom:
            action.payload.zoom !== undefined
              ? clampZoom(action.payload.zoom)
              : state.viewport.zoom,
        },
      };

    case "ZOOM_TO_FIT": {
      if (state.diagram.nodes.length === 0) {
        return {
          ...state,
          viewport: { zoom: 1, panX: 100, panY: 100 },
        };
      }
      // Compute bounding box of all nodes
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const n of state.diagram.nodes) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + n.width);
        maxY = Math.max(maxY, n.y + n.height);
      }
      const pad = 60;
      const contentW = maxX - minX + pad * 2;
      const contentH = maxY - minY + pad * 2;
      // Assume viewport ~800x600 (actual size is handled by the canvas)
      const zoom = clampZoom(
        Math.min(800 / contentW, 600 / contentH) * 0.9
      );
      return {
        ...state,
        viewport: {
          zoom,
          panX: -(minX - pad) * zoom + 20,
          panY: -(minY - pad) * zoom + 20,
        },
      };
    }

    // ── Connection drafting ──
    case "START_CONNECT":
      return {
        ...state,
        isConnecting: true,
        connectDraft: {
          sourceNodeId: action.payload.sourceNodeId,
          sourceAnchor: action.payload.sourceAnchor,
          mouseX: 0,
          mouseY: 0,
        },
      };

    case "UPDATE_CONNECT":
      return state.connectDraft
        ? {
            ...state,
            connectDraft: {
              ...state.connectDraft,
              mouseX: action.payload.mouseX,
              mouseY: action.payload.mouseY,
            },
          }
        : state;

    case "END_CONNECT":
      return { ...state, isConnecting: false, connectDraft: null };

    case "CANCEL_CONNECT":
      return { ...state, isConnecting: false, connectDraft: null };

    // ── Marquee ──
    case "START_MARQUEE":
      return {
        ...state,
        marquee: {
          startX: action.payload.x,
          startY: action.payload.y,
          currentX: action.payload.x,
          currentY: action.payload.y,
        },
      };

    case "UPDATE_MARQUEE":
      return state.marquee
        ? {
            ...state,
            marquee: {
              ...state.marquee,
              currentX: action.payload.x,
              currentY: action.payload.y,
            },
          }
        : state;

    case "END_MARQUEE":
      return { ...state, marquee: null };

    // ── Clipboard ──
    case "COPY": {
      const selectedNodes = state.diagram.nodes.filter((n) =>
        state.selectedNodeIds.includes(n.id)
      );
      const selectedNodeIdSet = new Set(state.selectedNodeIds);
      const selectedEdges = state.diagram.edges.filter(
        (e) =>
          selectedNodeIdSet.has(e.sourceNodeId) &&
          selectedNodeIdSet.has(e.targetNodeId)
      );
      return {
        ...state,
        clipboard:
          selectedNodes.length > 0
            ? { nodes: selectedNodes, edges: selectedEdges }
            : null,
      };
    }

    case "PASTE": {
      if (!state.clipboard || state.clipboard.nodes.length === 0) return state;
      const idMap = new Map<string, string>();
      const newNodes = state.clipboard.nodes.map((n) => {
        const newId = crypto.randomUUID();
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          x: n.x + action.payload.offsetX,
          y: n.y + action.payload.offsetY,
        };
      });
      const newEdges = state.clipboard.edges
        .filter(
          (e) => idMap.has(e.sourceNodeId) && idMap.has(e.targetNodeId)
        )
        .map((e) => ({
          ...e,
          id: crypto.randomUUID(),
          sourceNodeId: idMap.get(e.sourceNodeId)!,
          targetNodeId: idMap.get(e.targetNodeId)!,
        }));
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: [...state.diagram.nodes, ...newNodes],
          edges: [...state.diagram.edges, ...newEdges],
        },
        selectedNodeIds: newNodes.map((n) => n.id),
        selectedEdgeIds: [],
      };
    }

    case "DUPLICATE": {
      if (state.selectedNodeIds.length === 0) return state;
      // Re-use COPY + PASTE logic inline
      const selectedNodes = state.diagram.nodes.filter((n) =>
        state.selectedNodeIds.includes(n.id)
      );
      const selectedNodeIdSet = new Set(state.selectedNodeIds);
      const selectedEdges = state.diagram.edges.filter(
        (e) =>
          selectedNodeIdSet.has(e.sourceNodeId) &&
          selectedNodeIdSet.has(e.targetNodeId)
      );
      const idMap = new Map<string, string>();
      const newNodes = selectedNodes.map((n) => {
        const newId = crypto.randomUUID();
        idMap.set(n.id, newId);
        return { ...n, id: newId, x: n.x + 20, y: n.y + 20 };
      });
      const newEdges = selectedEdges
        .filter(
          (e) => idMap.has(e.sourceNodeId) && idMap.has(e.targetNodeId)
        )
        .map((e) => ({
          ...e,
          id: crypto.randomUUID(),
          sourceNodeId: idMap.get(e.sourceNodeId)!,
          targetNodeId: idMap.get(e.targetNodeId)!,
        }));
      return {
        ...withUndo(state),
        diagram: {
          ...state.diagram,
          nodes: [...state.diagram.nodes, ...newNodes],
          edges: [...state.diagram.edges, ...newEdges],
        },
        selectedNodeIds: newNodes.map((n) => n.id),
        selectedEdgeIds: [],
      };
    }

    // ── Undo / Redo ──
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        diagram: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.diagram],
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        diagram: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.diagram],
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }

    // ── Load / Reset ──
    case "LOAD_DIAGRAM":
      return {
        ...createDefaultEditorState(),
        diagram: action.payload,
      };

    case "RESET":
      return createDefaultEditorState();

    default:
      return state;
  }
}

// ── Main component ───────────────────────────────────────────

export function FlowchartMaker() {
  const [state, dispatch] = useReducer(flowchartReducer, null, () => {
    const draft = loadDraft();
    if (draft) {
      return { ...createDefaultEditorState(), diagram: draft };
    }
    return createDefaultEditorState();
  });

  const [showShapePalette, setShowShapePalette] = useState(true);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Auto-save draft (debounced 500ms)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(state.diagram);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.diagram]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedNodeIds.length > 0) {
          e.preventDefault();
          dispatch({ type: "REMOVE_NODES", payload: state.selectedNodeIds });
        } else if (state.selectedEdgeIds.length > 0) {
          e.preventDefault();
          dispatch({ type: "REMOVE_EDGES", payload: state.selectedEdgeIds });
        }
      } else if (e.key === "Escape") {
        if (state.isConnecting) {
          dispatch({ type: "CANCEL_CONNECT" });
        } else {
          dispatch({ type: "DESELECT_ALL" });
          dispatch({ type: "SET_TOOL", payload: "select" });
        }
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      } else if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "SELECT_ALL" });
      } else if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        if (state.selectedNodeIds.length > 0) {
          e.preventDefault();
          dispatch({ type: "COPY" });
        }
      } else if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        if (state.clipboard) {
          e.preventDefault();
          dispatch({ type: "PASTE", payload: { offsetX: 30, offsetY: 30 } });
        }
      } else if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        if (state.selectedNodeIds.length > 0) {
          e.preventDefault();
          dispatch({ type: "DUPLICATE" });
        }
      } else if (e.key === "v" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "select" });
      } else if (e.key === "h" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "pan" });
      } else if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "add-shape" });
        setShowShapePalette(true);
      } else if (e.key === "c" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "connect" });
      } else if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "text" });
      }
    },
    [state.selectedNodeIds, state.selectedEdgeIds, state.clipboard, state.isConnecting]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
    <div className="flex h-[calc(100vh-16rem)] min-h-[500px] flex-col rounded-lg border border-border bg-card">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <DiagramManager diagram={state.diagram} dispatch={dispatch} />

        <div className="mx-1 h-4 w-px bg-border" />

        <Input
          value={state.diagram.name}
          onChange={(e) =>
            dispatch({ type: "SET_NAME", payload: e.target.value })
          }
          className="h-7 w-48 text-sm font-medium"
          aria-label="Diagram name"
        />

        <div className="mx-2 h-4 w-px bg-border" />

        <button
          onClick={() => dispatch({ type: "UNDO" })}
          disabled={state.undoStack.length === 0}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => dispatch({ type: "REDO" })}
          disabled={state.redoStack.length === 0}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-2 h-4 w-px bg-border" />

        <span className="text-xs text-muted-foreground">
          {Math.round(state.viewport.zoom * 100)}%
        </span>

        <div className="mx-2 h-4 w-px bg-border" />

        <button
          onClick={() => setShowExportPanel((p) => !p)}
          className={`rounded p-1 hover:bg-accent hover:text-foreground ${
            showExportPanel
              ? "bg-accent text-brand"
              : "text-muted-foreground"
          }`}
          title="Export diagram"
        >
          <Download className="h-4 w-4" />
        </button>

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">
          {state.diagram.nodes.length} node{state.diagram.nodes.length !== 1 ? "s" : ""}
          {state.diagram.edges.length > 0 &&
            ` · ${state.diagram.edges.length} edge${state.diagram.edges.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <Toolbar
          activeTool={state.activeTool}
          showShapePalette={showShapePalette}
          onToggleShapePalette={() => setShowShapePalette((prev) => !prev)}
          dispatch={dispatch}
        />

        {/* Shape palette (collapsible) */}
        {showShapePalette && (
          <ShapePalette
            activeShapeType={state.activeShapeType}
            dispatch={dispatch}
          />
        )}

        {/* Canvas area */}
        <div className="relative flex-1 overflow-hidden bg-muted/30">
          <SvgCanvas state={state} dispatch={dispatch} />

          {/* Export panel overlay */}
          {showExportPanel && (
            <ExportPanel
              diagram={state.diagram}
              onClose={() => setShowExportPanel(false)}
            />
          )}

          {/* Zoom controls overlay */}
          <div className="absolute bottom-3 right-3">
            <ZoomControls zoom={state.viewport.zoom} dispatch={dispatch} />
          </div>
        </div>

        {/* Right properties panel */}
        <PropertiesPanel state={state} dispatch={dispatch} />
      </div>
    </div>
    <ToolGuide sections={TOOL_GUIDE_SECTIONS} />
    </>
  );
}
