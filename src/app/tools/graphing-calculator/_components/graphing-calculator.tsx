"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import {
  LineChart,
  Table,
  BarChart3,
  Grid3X3,
  Activity,
} from "lucide-react";
import { calcReducer, INITIAL_STATE } from "@/lib/graphing-calculator/reducer";
import { loadCalcState, saveCalcState } from "@/lib/graphing-calculator/storage";
import type { CalcMode, GraphFunction, Viewport } from "@/lib/graphing-calculator/types";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import { GraphCanvas } from "./graph-canvas";
import { FunctionInputPanel } from "./function-input-panel";
import { TableView } from "./table-view";
import type { TableSettings } from "@/lib/graphing-calculator/types";

// ─── Tool Guide Sections ─────────────────────────────────────────────────────

const TOOL_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Select a mode from the tabs above the workspace. Graph mode is the default — enter equations and see them plotted instantly.",
    steps: [
      "Enter an expression like sin(x) or x^2 in a Y= slot",
      "The graph renders automatically on the canvas",
      "Use mouse wheel to zoom, drag to pan",
    ],
  },
  {
    title: "Graph Mode",
    content:
      "Plot up to 10 functions simultaneously. Supports standard (y=f(x)), parametric (X(t)/Y(t)), and polar (r=f(θ)) modes.",
    steps: [
      "Click '+ Function' to add a new equation slot",
      "Toggle visibility with the eye icon",
      "Click the color swatch to cycle colors",
      "Use Zoom presets: Standard (±10), Trig (±2π), or Fit",
    ],
  },
  {
    title: "Table Mode",
    content:
      "Generate x/y value tables for your active functions. Set the start value and step size, or enter x values manually.",
  },
  {
    title: "Statistics Mode",
    content:
      "Enter data into lists L1–L6, compute descriptive statistics, and run regression analysis — just like TI-84 STAT.",
    steps: [
      "Enter data into L1 and L2 columns",
      "Click '1-Var Stats' for descriptive statistics",
      "Choose a regression type (LinReg, QuadReg, ExpReg, PwrReg)",
      "View the equation, r, and R² values",
    ],
  },
  {
    title: "Matrix Mode",
    content:
      "Edit matrices [A] through [J] and perform operations: add, multiply, inverse, determinant, RREF, and transpose.",
    steps: [
      "Select a matrix from the dropdown",
      "Set dimensions and enter values in the grid",
      "Click operation buttons to compute results",
    ],
  },
  {
    title: "Distribution Mode",
    content:
      "Compute probabilities using the same functions from the TI-84 DISTR menu.",
    steps: [
      "Select a function: normalcdf, invNorm, tcdf, binompdf, etc.",
      "Enter parameters (they match TI-84 prompts exactly)",
      "View the result and shaded area visualization",
    ],
  },
  {
    title: "Angle Mode",
    content:
      "Toggle between Radian and Degree mode using the RAD/DEG button in the toolbar. This affects all trig function evaluation.",
  },
  {
    title: "Keyboard Shortcuts",
    content: "Quick access to common operations.",
    steps: [
      "Ctrl/⌘ + K — Command palette (coming soon)",
      "Escape — Close panels and dialogs",
      "R / D — Toggle Radian / Degree mode",
    ],
  },
];

// ─── Mode Tab Config ─────────────────────────────────────────────────────────

const MODE_TABS: { mode: CalcMode; label: string; icon: typeof LineChart }[] = [
  { mode: "graph", label: "Graph", icon: LineChart },
  { mode: "table", label: "Table", icon: Table },
  { mode: "stat", label: "Stat", icon: BarChart3 },
  { mode: "matrix", label: "Matrix", icon: Grid3X3 },
  { mode: "distribution", label: "Dist", icon: Activity },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function GraphingCalculator() {
  const [state, dispatch] = useReducer(calcReducer, INITIAL_STATE);
  const initialized = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    if (!initialized.current) {
      const loaded = loadCalcState();
      dispatch({ type: "LOAD_STATE", state: loaded });
      initialized.current = true;
    }
  }, []);

  // Auto-save on state changes (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!initialized.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCalcState(state);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  const setMode = useCallback(
    (mode: CalcMode) => dispatch({ type: "SET_MODE", mode }),
    []
  );

  const toggleAngleMode = useCallback(() => {
    dispatch({
      type: "SET_ANGLE_MODE",
      angleMode: state.angleMode === "radian" ? "degree" : "radian",
    });
  }, [state.angleMode]);

  // ── Graph-specific callbacks ───────────────────────────────────────
  const handleAddFunction = useCallback(
    (fn: GraphFunction) => dispatch({ type: "ADD_FUNCTION", fn }),
    []
  );

  const handleUpdateFunction = useCallback(
    (id: string, updates: Partial<GraphFunction>) =>
      dispatch({ type: "UPDATE_FUNCTION", id, updates }),
    []
  );

  const handleRemoveFunction = useCallback(
    (id: string) => dispatch({ type: "REMOVE_FUNCTION", id }),
    []
  );

  const handleViewportChange = useCallback(
    (viewport: Viewport) => dispatch({ type: "SET_VIEWPORT", viewport }),
    []
  );

  const handleTableSettingsChange = useCallback(
    (settings: Partial<TableSettings>) =>
      dispatch({ type: "SET_TABLE_SETTINGS", settings }),
    []
  );

  const handleTraceToggle = useCallback(
    () => dispatch({ type: "TOGGLE_TRACE" }),
    []
  );

  const [canvasAspectRatio, setCanvasAspectRatio] = useState<number | undefined>(undefined);
  const handleAspectRatioChange = useCallback((ratio: number) => {
    setCanvasAspectRatio(ratio);
  }, []);

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-border px-4 py-2">
          {MODE_TABS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                state.mode === mode
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Workspace ───────────────────────────────────────────────── */}
        <div className="p-4">
          {state.mode === "graph" && (
            <div className="space-y-4">
              <FunctionInputPanel
                functions={state.functions}
                angleMode={state.angleMode}
                viewport={state.viewport}
                traceEnabled={state.traceEnabled}
                canvasAspectRatio={canvasAspectRatio}
                onAddFunction={handleAddFunction}
                onUpdateFunction={handleUpdateFunction}
                onRemoveFunction={handleRemoveFunction}
                onAngleModeToggle={toggleAngleMode}
                onViewportChange={handleViewportChange}
                onTraceToggle={handleTraceToggle}
              />
              <GraphCanvas
                functions={state.functions}
                viewport={state.viewport}
                angleMode={state.angleMode}
                traceEnabled={state.traceEnabled}
                parametricSettings={state.parametricSettings}
                polarSettings={state.polarSettings}
                onViewportChange={handleViewportChange}
                onAspectRatioChange={handleAspectRatioChange}
              />
            </div>
          )}
          {state.mode === "table" && (
            <TableView
              functions={state.functions}
              angleMode={state.angleMode}
              tableSettings={state.tableSettings}
              onTableSettingsChange={handleTableSettingsChange}
            />
          )}
          {state.mode === "stat" && <StatPlaceholder />}
          {state.mode === "matrix" && <MatrixPlaceholder />}
          {state.mode === "distribution" && <DistributionPlaceholder />}
        </div>
      </div>

      <ToolGuide sections={TOOL_GUIDE_SECTIONS} />
    </>
  );
}

// ─── Placeholder Panels (to be replaced in later stages) ─────────────────────

function PlaceholderPanel({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof LineChart;
}) {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-brand/10 p-4">
        <Icon className="h-8 w-8 text-brand" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StatPlaceholder() {
  return (
    <PlaceholderPanel
      title="Statistics Mode"
      description="Enter data into lists L1–L6, compute 1-Var Stats, and run regression analysis — LinReg, QuadReg, ExpReg, and PwrReg."
      icon={BarChart3}
    />
  );
}

function MatrixPlaceholder() {
  return (
    <PlaceholderPanel
      title="Matrix Mode"
      description="Edit matrices [A] through [J]. Compute addition, multiplication, determinant, inverse, RREF, and transpose."
      icon={Grid3X3}
    />
  );
}

function DistributionPlaceholder() {
  return (
    <PlaceholderPanel
      title="Distribution Mode"
      description="Compute probabilities with normalcdf, invNorm, tcdf, binompdf, chi-square, and Poisson — matching TI-84 output."
      icon={Activity}
    />
  );
}
