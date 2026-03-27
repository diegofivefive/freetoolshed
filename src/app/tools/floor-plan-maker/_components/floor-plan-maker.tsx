"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import type {
  EditorState,
  FloorPlanAction,
  FloorPlan,
  FloorPlanElement,
} from "@/lib/floor-plan/types";
import {
  createDefaultEditorState,
  MAX_UNDO_STEPS,
  PIXELS_PER_UNIT,
  ZOOM_MIN,
  ZOOM_MAX,
} from "@/lib/floor-plan/constants";
import { saveDraft, loadDraft } from "@/lib/floor-plan/storage";
import { Toolbar } from "./toolbar";
import { PropertiesPanel } from "./properties-panel";
import { SvgCanvas } from "./svg-canvas";
import { ZoomControls } from "./zoom-controls";
import { FurniturePalette } from "./furniture-palette";
import { PlanManager } from "./plan-manager";
import { ExportPanel } from "./export-panel";
import { Input } from "@/components/ui/input";
import { Undo2, Redo2, Download } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────

function withUndo(state: EditorState): EditorState {
  return {
    ...state,
    undoStack: [...state.undoStack.slice(-(MAX_UNDO_STEPS - 1)), state.plan],
    redoStack: [],
  };
}

function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

// ── Reducer ─────────────────────────────────────────────────

function floorPlanReducer(
  state: EditorState,
  action: FloorPlanAction
): EditorState {
  switch (action.type) {
    // ── Plan metadata ──
    case "SET_NAME":
      return { ...state, plan: { ...state.plan, name: action.payload } };

    case "SET_PLAN_SIZE":
      return {
        ...withUndo(state),
        plan: { ...state.plan, ...action.payload },
      };

    case "SET_UNIT":
      return {
        ...withUndo(state),
        plan: { ...state.plan, unit: action.payload },
      };

    case "SET_GRID":
      return {
        ...state,
        plan: { ...state.plan, ...action.payload },
      };

    case "TOGGLE_DIMENSIONS":
      return {
        ...state,
        plan: { ...state.plan, showDimensions: !state.plan.showDimensions },
      };

    // ── Elements ──
    case "ADD_ELEMENT":
      return {
        ...withUndo(state),
        plan: {
          ...state.plan,
          elements: [...state.plan.elements, action.payload],
        },
      };

    case "UPDATE_ELEMENT":
      return {
        ...withUndo(state),
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            el.id === action.payload.id
              ? ({ ...el, ...action.payload } as FloorPlanElement)
              : el
          ),
        },
      };

    case "REMOVE_ELEMENTS":
      return {
        ...withUndo(state),
        plan: {
          ...state.plan,
          elements: state.plan.elements.filter(
            (el) => !action.payload.includes(el.id)
          ),
        },
        selectedElementIds: state.selectedElementIds.filter(
          (id) => !action.payload.includes(id)
        ),
      };

    case "MOVE_ELEMENT":
      return {
        ...state,
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            el.id === action.payload.id
              ? { ...el, x: action.payload.x, y: action.payload.y }
              : el
          ),
        },
      };

    case "RESIZE_ELEMENT":
      return {
        ...state,
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) => {
            if (el.id !== action.payload.id) return el;
            const updated = { ...el } as FloorPlanElement;
            if ("width" in updated && "height" in updated) {
              (updated as { width: number; height: number }).width = action.payload.width;
              (updated as { width: number; height: number }).height = action.payload.height;
            }
            if (action.payload.x !== undefined) updated.x = action.payload.x;
            if (action.payload.y !== undefined) updated.y = action.payload.y;
            return updated;
          }),
        },
      };

    case "ROTATE_ELEMENT":
      return {
        ...state,
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            el.id === action.payload.id
              ? { ...el, rotation: action.payload.rotation }
              : el
          ),
        },
      };

    case "BRING_TO_FRONT": {
      const maxZ = Math.max(0, ...state.plan.elements.map((el) => el.zIndex));
      return {
        ...withUndo(state),
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            el.id === action.payload ? { ...el, zIndex: maxZ + 1 } : el
          ),
        },
      };
    }

    case "SEND_TO_BACK": {
      const minZ = Math.min(0, ...state.plan.elements.map((el) => el.zIndex));
      return {
        ...withUndo(state),
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            el.id === action.payload ? { ...el, zIndex: minZ - 1 } : el
          ),
        },
      };
    }

    // ── Selection ──
    case "SELECT":
      return { ...state, selectedElementIds: action.payload };

    case "DESELECT_ALL":
      return { ...state, selectedElementIds: [] };

    // ── Tools ──
    case "SET_TOOL":
      return { ...state, activeTool: action.payload, selectedElementIds: [] };

    // ── Viewport ──
    case "SET_VIEWPORT":
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload,
          zoom: action.payload.zoom !== undefined
            ? clampZoom(action.payload.zoom)
            : state.viewport.zoom,
        },
      };

    case "ZOOM_TO_FIT": {
      const canvasW = state.plan.width * PIXELS_PER_UNIT;
      const canvasH = state.plan.height * PIXELS_PER_UNIT;
      // Assume a reasonable viewport size; actual fit will be adjusted by the canvas component
      const zoom = clampZoom(Math.min(800 / canvasW, 600 / canvasH) * 0.9);
      return {
        ...state,
        viewport: { zoom, panX: 20, panY: 20 },
      };
    }

    // ── Drawing ──
    case "START_DRAW":
      return { ...state, isDrawing: true, drawStart: action.payload };

    case "END_DRAW":
      return { ...state, isDrawing: false, drawStart: null };

    // ── Clipboard ──
    case "COPY": {
      const selected = state.plan.elements.filter((el) =>
        state.selectedElementIds.includes(el.id)
      );
      return { ...state, clipboard: selected.length > 0 ? selected : null };
    }

    case "PASTE": {
      if (!state.clipboard || state.clipboard.length === 0) return state;
      const newElements = state.clipboard.map((el) => ({
        ...el,
        id: crypto.randomUUID(),
        x: el.x + action.payload.x,
        y: el.y + action.payload.y,
      }));
      return {
        ...withUndo(state),
        plan: {
          ...state.plan,
          elements: [...state.plan.elements, ...newElements],
        },
        selectedElementIds: newElements.map((el) => el.id),
      };
    }

    // ── Undo / Redo ──
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        plan: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.plan],
        selectedElementIds: [],
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        plan: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.plan],
        selectedElementIds: [],
      };
    }

    // ── Lock ──
    case "LOCK_ELEMENTS":
      return {
        ...state,
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            action.payload.includes(el.id) ? { ...el, locked: true } : el
          ),
        },
      };

    case "UNLOCK_ELEMENTS":
      return {
        ...state,
        plan: {
          ...state.plan,
          elements: state.plan.elements.map((el) =>
            action.payload.includes(el.id) ? { ...el, locked: false } : el
          ),
        },
      };

    // ── Load / Reset ──
    case "LOAD_PLAN":
      return {
        ...createDefaultEditorState(),
        plan: action.payload,
      };

    case "RESET":
      return createDefaultEditorState();

    // ── Underlay ──
    case "SET_UNDERLAY":
      return { ...state, underlay: action.payload };

    case "SET_UNDERLAY_OPACITY":
      return state.underlay
        ? { ...state, underlay: { ...state.underlay, opacity: action.payload } }
        : state;

    case "REMOVE_UNDERLAY":
      return { ...state, underlay: null };

    default:
      return state;
  }
}

// ── Main component ──────────────────────────────────────────

export function FloorPlanMaker() {
  const [state, dispatch] = useReducer(floorPlanReducer, null, () => {
    const draft = loadDraft();
    if (draft) {
      return { ...createDefaultEditorState(), plan: draft };
    }
    return createDefaultEditorState();
  });

  // Auto-save draft (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(state.plan);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.plan]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedElementIds.length > 0) {
          e.preventDefault();
          dispatch({ type: "REMOVE_ELEMENTS", payload: state.selectedElementIds });
        }
      } else if (e.key === "Escape") {
        dispatch({ type: "DESELECT_ALL" });
        dispatch({ type: "SET_TOOL", payload: "select" });
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      } else if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        if (state.selectedElementIds.length > 0) {
          e.preventDefault();
          dispatch({ type: "COPY" });
        }
      } else if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        if (state.clipboard) {
          e.preventDefault();
          dispatch({ type: "PASTE", payload: { x: 1, y: 1 } });
        }
      } else if (e.key === "v" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "select" });
      } else if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "room" });
      } else if (e.key === "w" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "wall" });
      } else if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: "SET_TOOL", payload: "text" });
      } else if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        setShowFurniturePalette((prev) => !prev);
      }
    },
    [state.selectedElementIds, state.clipboard]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const [showFurniturePalette, setShowFurniturePalette] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  const selectedElements = state.plan.elements.filter((el) =>
    state.selectedElementIds.includes(el.id)
  );

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[500px] flex-col rounded-lg border border-border bg-card">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <PlanManager plan={state.plan} dispatch={dispatch} />

        <Input
          value={state.plan.name}
          onChange={(e) =>
            dispatch({ type: "SET_NAME", payload: e.target.value })
          }
          className="h-7 w-48 text-sm font-medium"
          aria-label="Plan name"
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

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">
          {state.plan.width} × {state.plan.height} {state.plan.unit}
        </span>

        <div className="mx-2 h-4 w-px bg-border" />

        <button
          onClick={() => setShowExportPanel((prev) => !prev)}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
            showExportPanel
              ? "bg-brand/10 text-brand"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <Toolbar
          activeTool={state.activeTool}
          showFurniturePalette={showFurniturePalette}
          onToggleFurniture={() => setShowFurniturePalette((prev) => !prev)}
          dispatch={dispatch}
        />

        {/* Furniture palette (collapsible) */}
        {showFurniturePalette && (
          <div className="w-52 border-r border-border bg-card">
            <FurniturePalette
              dispatch={dispatch}
              elementCount={state.plan.elements.length}
            />
          </div>
        )}

        {/* Canvas area */}
        <div className="relative flex-1 overflow-hidden bg-muted/30">
          <SvgCanvas state={state} dispatch={dispatch} />

          {/* Export panel overlay */}
          {showExportPanel && (
            <ExportPanel
              plan={state.plan}
              onClose={() => setShowExportPanel(false)}
            />
          )}

          {/* Zoom controls overlay */}
          <div className="absolute bottom-3 right-3">
            <ZoomControls
              zoom={state.viewport.zoom}
              dispatch={dispatch}
            />
          </div>
        </div>

        {/* Right properties panel */}
        <PropertiesPanel
          state={state}
          selectedElements={selectedElements}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
