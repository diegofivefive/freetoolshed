"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import {
  LineChart,
  Table,
  BarChart3,
  Grid3X3,
  Activity,
  Search,
  Calculator,
} from "lucide-react";
import { calcReducer, INITIAL_STATE } from "@/lib/graphing-calculator/reducer";
import { loadCalcState, saveCalcState } from "@/lib/graphing-calculator/storage";
import {
  STANDARD_LABELS,
  FUNCTION_COLORS,
  DEFAULT_LINE_WIDTH,
  DEFAULT_VIEWPORT,
  ZOOM_FACTOR,
} from "@/lib/graphing-calculator/constants";
import type {
  CalcMode,
  GraphFunction,
  Viewport,
  TableSettings,
  NamedMatrix,
  RegressionType,
  DistributionParams,
  DistributionResult,
} from "@/lib/graphing-calculator/types";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import { useActiveInput } from "@/hooks/use-active-input";
import { CommandPalette } from "./command-palette";
import { TI84Sheet } from "./ti84-sheet";
import { GraphCanvas } from "./graph-canvas";
import { FunctionInputPanel } from "./function-input-panel";
import { TableView } from "./table-view";
import { StatPanel } from "./stat-panel";
import { MatrixPanel } from "./matrix-panel";
import { DistributionPanel } from "./distribution-panel";

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
      "Ctrl/⌘ + K — Open command palette",
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
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { insert, backspace, clearInput, navigateInputs } = useActiveInput(workspaceRef);

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

  // ── TI-84 Sheet ────────────────────────────────────────────────────
  const [ti84Open, setTi84Open] = useState(false);

  // ── Command Palette ─────────────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handlePaletteAddFunction = useCallback(() => {
    if (state.functions.length >= 10) return;
    const index = state.functions.length;
    const label = STANDARD_LABELS[index] ?? `Y${index}`;
    const color = FUNCTION_COLORS[index % FUNCTION_COLORS.length];
    dispatch({
      type: "ADD_FUNCTION",
      fn: {
        id: `fn-${Date.now()}`,
        label,
        expression: "",
        type: "standard" as const,
        color,
        visible: true,
        lineWidth: DEFAULT_LINE_WIDTH,
      },
    });
  }, [state.functions.length]);

  const handleZoomIn = useCallback(() => {
    const v = state.viewport;
    const cx = (v.xMin + v.xMax) / 2;
    const cy = (v.yMin + v.yMax) / 2;
    const f = 1 / ZOOM_FACTOR;
    dispatch({
      type: "SET_VIEWPORT",
      viewport: {
        xMin: cx - (cx - v.xMin) * f,
        xMax: cx + (v.xMax - cx) * f,
        yMin: cy - (cy - v.yMin) * f,
        yMax: cy + (v.yMax - cy) * f,
      },
    });
  }, [state.viewport]);

  const handleZoomOut = useCallback(() => {
    const v = state.viewport;
    const cx = (v.xMin + v.xMax) / 2;
    const cy = (v.yMin + v.yMax) / 2;
    const f = ZOOM_FACTOR;
    dispatch({
      type: "SET_VIEWPORT",
      viewport: {
        xMin: cx - (cx - v.xMin) * f,
        xMax: cx + (v.xMax - cx) * f,
        yMin: cy - (cy - v.yMin) * f,
        yMax: cy + (v.yMax - cy) * f,
      },
    });
  }, [state.viewport]);

  const handleZoomStandard = useCallback(() => {
    dispatch({ type: "SET_VIEWPORT", viewport: { ...DEFAULT_VIEWPORT } });
  }, []);

  const handleZoomTrig = useCallback(() => {
    dispatch({
      type: "SET_VIEWPORT",
      viewport: {
        xMin: -2 * Math.PI,
        xMax: 2 * Math.PI,
        yMin: -4,
        yMax: 4,
      },
    });
  }, []);

  const handleZoomSquare = useCallback(() => {
    const aspect = canvasAspectRatio ?? 2;
    const v = state.viewport;
    const cx = (v.xMin + v.xMax) / 2;
    const cy = (v.yMin + v.yMax) / 2;
    const yRange = v.yMax - v.yMin;
    const xRange = yRange * aspect;
    dispatch({
      type: "SET_VIEWPORT",
      viewport: {
        xMin: cx - xRange / 2,
        xMax: cx + xRange / 2,
        yMin: cy - yRange / 2,
        yMax: cy + yRange / 2,
      },
    });
  }, [state.viewport, canvasAspectRatio]);

  const handleResetState = useCallback(() => {
    dispatch({ type: "LOAD_STATE", state: INITIAL_STATE });
  }, []);

  // ── Stat callbacks ────────────────────────────────────────────────
  const handleUpdateStatList = useCallback(
    (name: string, data: number[]) =>
      dispatch({ type: "UPDATE_STAT_LIST", name, data }),
    []
  );

  const handleSetRegressionType = useCallback(
    (regression: RegressionType) =>
      dispatch({ type: "SET_REGRESSION_TYPE", regression }),
    []
  );

  const handleSetStatPlot = useCallback(
    (enabled: boolean, xList?: string, yList?: string) =>
      dispatch({ type: "SET_STAT_PLOT", enabled, xList, yList }),
    []
  );

  // ── Matrix callbacks ──────────────────────────────────────────────
  const handleSetMatrix = useCallback(
    (name: string, matrix: NamedMatrix) =>
      dispatch({ type: "SET_MATRIX", name, matrix }),
    []
  );

  const handleSetActiveMatrix = useCallback(
    (name: string) => dispatch({ type: "SET_ACTIVE_MATRIX", name }),
    []
  );

  // ── Distribution callbacks ────────────────────────────────────────
  const handleSetDistributionParams = useCallback(
    (params: DistributionParams) =>
      dispatch({ type: "SET_DISTRIBUTION_PARAMS", params }),
    []
  );

  const handleSetDistributionResult = useCallback(
    (result: DistributionResult | null) =>
      dispatch({ type: "SET_DISTRIBUTION_RESULT", result }),
    []
  );

  return (
    <>
      <div ref={workspaceRef} className="rounded-lg border border-border bg-card">
        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 py-2">
          {MODE_TABS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                state.mode === mode
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}

          <button
            onClick={() => setTi84Open(true)}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Open TI-84 calculator"
          >
            <Calculator className="h-3 w-3" />
            <span className="hidden sm:inline">TI-84</span>
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Command palette"
          >
            <Search className="h-3 w-3" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] sm:inline-block">
              ⌘K
            </kbd>
          </button>
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
          {state.mode === "stat" && (
            <StatPanel
              statLists={state.statLists}
              activeRegression={state.activeRegression}
              statPlotEnabled={state.statPlotEnabled}
              statPlotXList={state.statPlotXList}
              statPlotYList={state.statPlotYList}
              onUpdateStatList={handleUpdateStatList}
              onSetRegressionType={handleSetRegressionType}
              onSetStatPlot={handleSetStatPlot}
            />
          )}
          {state.mode === "matrix" && (
            <MatrixPanel
              matrices={state.matrices}
              activeMatrix={state.activeMatrix}
              onSetMatrix={handleSetMatrix}
              onSetActiveMatrix={handleSetActiveMatrix}
            />
          )}
          {state.mode === "distribution" && (
            <DistributionPanel
              distributionParams={state.distributionParams}
              distributionResult={state.distributionResult}
              onSetDistributionParams={handleSetDistributionParams}
              onSetDistributionResult={handleSetDistributionResult}
            />
          )}
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSetMode={setMode}
        onToggleAngleMode={toggleAngleMode}
        onAddFunction={handlePaletteAddFunction}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomStandard={handleZoomStandard}
        onZoomTrig={handleZoomTrig}
        onZoomSquare={handleZoomSquare}
        onToggleTrace={handleTraceToggle}
        onResetState={handleResetState}
        angleMode={state.angleMode}
        currentMode={state.mode}
        functionCount={state.functions.length}
      />

      <ToolGuide sections={TOOL_GUIDE_SECTIONS} />

      <TI84Sheet
        open={ti84Open}
        onOpenChange={setTi84Open}
        onSetMode={setMode}
        onToggleAngleMode={toggleAngleMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomStandard={handleZoomStandard}
        onZoomTrig={handleZoomTrig}
        onZoomSquare={handleZoomSquare}
        onToggleTrace={handleTraceToggle}
        onResetState={handleResetState}
        onOpenPalette={() => setPaletteOpen(true)}
        insert={insert}
        backspace={backspace}
        clearInput={clearInput}
        navigateInputs={navigateInputs}
      />
    </>
  );
}

