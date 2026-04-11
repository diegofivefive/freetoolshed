"use client";

import { useCallback } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  Crosshair,
} from "lucide-react";
import type { GraphFunction, AngleMode, Viewport } from "@/lib/graphing-calculator/types";
import { validateExpression } from "@/lib/graphing-calculator/engine";
import type { FunctionType } from "@/lib/graphing-calculator/types";
import {
  FUNCTION_COLORS,
  STANDARD_LABELS,
  PARAMETRIC_LABELS,
  POLAR_LABELS,
  DEFAULT_VIEWPORT,
  DEFAULT_LINE_WIDTH,
  ZOOM_FACTOR,
} from "@/lib/graphing-calculator/constants";

interface FunctionInputPanelProps {
  functions: GraphFunction[];
  angleMode: AngleMode;
  viewport: Viewport;
  traceEnabled: boolean;
  onAddFunction: (fn: GraphFunction) => void;
  onUpdateFunction: (id: string, updates: Partial<GraphFunction>) => void;
  onRemoveFunction: (id: string) => void;
  onAngleModeToggle: () => void;
  onViewportChange: (viewport: Viewport) => void;
  onTraceToggle: () => void;
}

export function FunctionInputPanel({
  functions,
  angleMode,
  viewport,
  traceEnabled,
  onAddFunction,
  onUpdateFunction,
  onRemoveFunction,
  onAngleModeToggle,
  onViewportChange,
  onTraceToggle,
}: FunctionInputPanelProps) {
  const addFunction = useCallback(() => {
    if (functions.length >= 10) return;
    const index = functions.length;
    const label = STANDARD_LABELS[index] ?? `Y${index}`;
    const color = FUNCTION_COLORS[index % FUNCTION_COLORS.length];

    onAddFunction({
      id: `fn-${Date.now()}`,
      label,
      expression: "",
      type: "standard",
      color,
      visible: true,
      lineWidth: DEFAULT_LINE_WIDTH,
    });
  }, [functions.length, onAddFunction]);

  const zoomIn = useCallback(() => {
    const cx = (viewport.xMin + viewport.xMax) / 2;
    const cy = (viewport.yMin + viewport.yMax) / 2;
    const factor = 1 / ZOOM_FACTOR;
    onViewportChange({
      xMin: cx - ((cx - viewport.xMin) * factor),
      xMax: cx + ((viewport.xMax - cx) * factor),
      yMin: cy - ((cy - viewport.yMin) * factor),
      yMax: cy + ((viewport.yMax - cy) * factor),
    });
  }, [viewport, onViewportChange]);

  const zoomOut = useCallback(() => {
    const cx = (viewport.xMin + viewport.xMax) / 2;
    const cy = (viewport.yMin + viewport.yMax) / 2;
    const factor = ZOOM_FACTOR;
    onViewportChange({
      xMin: cx - ((cx - viewport.xMin) * factor),
      xMax: cx + ((viewport.xMax - cx) * factor),
      yMin: cy - ((cy - viewport.yMin) * factor),
      yMax: cy + ((viewport.yMax - cy) * factor),
    });
  }, [viewport, onViewportChange]);

  const zoomStandard = useCallback(() => {
    onViewportChange({ ...DEFAULT_VIEWPORT });
  }, [onViewportChange]);

  const zoomTrig = useCallback(() => {
    onViewportChange({
      xMin: -2 * Math.PI,
      xMax: 2 * Math.PI,
      yMin: -4,
      yMax: 4,
    });
  }, [onViewportChange]);

  return (
    <div className="space-y-3">
      {/* ── Function Inputs ─────────────────────────────────────────── */}
      <div className="space-y-2">
        {functions.map((fn, index) => (
          <FunctionRow
            key={fn.id}
            fn={fn}
            index={index}
            onUpdate={(updates) => onUpdateFunction(fn.id, updates)}
            onRemove={() => onRemoveFunction(fn.id)}
          />
        ))}
      </div>

      {/* ── Add + Controls Row ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={addFunction}
          disabled={functions.length >= 10}
          className="flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Function
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Zoom Controls */}
        <ToolbarButton icon={ZoomIn} label="Zoom in" onClick={zoomIn} />
        <ToolbarButton icon={ZoomOut} label="Zoom out" onClick={zoomOut} />
        <ToolbarButton icon={Maximize} label="Standard (±10)" onClick={zoomStandard} />

        <button
          onClick={zoomTrig}
          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Trig zoom (±2π)"
        >
          ±2π
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Trace Toggle */}
        <button
          onClick={onTraceToggle}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
            traceEnabled
              ? "border-brand bg-brand/10 text-brand"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Toggle trace mode"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Trace
        </button>

        {/* Angle Mode */}
        <button
          onClick={onAngleModeToggle}
          className="ml-auto rounded-md border border-border px-2.5 py-1 text-xs font-bold tracking-wide transition-colors hover:bg-muted"
          title={`Switch to ${angleMode === "radian" ? "degree" : "radian"} mode`}
        >
          {angleMode === "radian" ? "RAD" : "DEG"}
        </button>
      </div>
    </div>
  );
}

// ─── Function Row ────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: FunctionType; label: string }[] = [
  { value: "standard", label: "y=" },
  { value: "parametric", label: "Param" },
  { value: "polar", label: "Polar" },
];

function getLabelForType(type: FunctionType, index: number): string {
  if (type === "parametric") {
    const pair = PARAMETRIC_LABELS[index] ?? [`X${index + 1}T`, `Y${index + 1}T`];
    return `${pair[0]}/${pair[1]}`;
  }
  if (type === "polar") {
    return POLAR_LABELS[index] ?? `r${index + 1}`;
  }
  return STANDARD_LABELS[index] ?? `Y${index}`;
}

function FunctionRow({
  fn,
  index,
  onUpdate,
  onRemove,
}: {
  fn: GraphFunction;
  index: number;
  onUpdate: (updates: Partial<GraphFunction>) => void;
  onRemove: () => void;
}) {
  const validation = fn.expression.trim()
    ? validateExpression(fn.expression)
    : { valid: true };

  const validationY =
    fn.type === "parametric" && fn.expressionY?.trim()
      ? validateExpression(fn.expressionY)
      : { valid: true };

  const handleTypeChange = (newType: FunctionType) => {
    const newLabel = getLabelForType(newType, index);
    const updates: Partial<GraphFunction> = { type: newType, label: newLabel };
    if (newType === "parametric") {
      updates.expressionY = fn.expressionY ?? "";
    }
    if (newType !== "parametric") {
      updates.expressionY = undefined;
    }
    onUpdate(updates);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Color swatch */}
      <button
        className="h-4 w-4 shrink-0 rounded-sm border border-border"
        style={{ backgroundColor: fn.color }}
        title="Function color"
        onClick={() => {
          const currentIdx = FUNCTION_COLORS.indexOf(fn.color as typeof FUNCTION_COLORS[number]);
          const nextIdx = (currentIdx + 1) % FUNCTION_COLORS.length;
          onUpdate({ color: FUNCTION_COLORS[nextIdx] });
        }}
      />

      {/* Type selector */}
      <select
        value={fn.type}
        onChange={(e) => handleTypeChange(e.target.value as FunctionType)}
        className="h-8 shrink-0 rounded-md border border-border bg-background px-1 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand"
        title="Function type"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Label */}
      <span className="w-auto shrink-0 text-xs font-bold text-muted-foreground">
        {fn.type === "standard" && `${fn.label}=`}
        {fn.type === "polar" && `${fn.label}=`}
        {fn.type === "parametric" && "X(t)="}
      </span>

      {/* Expression Input (X component for parametric, main for others) */}
      <input
        type="text"
        value={fn.expression}
        onChange={(e) => onUpdate({ expression: e.target.value })}
        placeholder={
          fn.type === "parametric"
            ? "e.g. cos(t)"
            : fn.type === "polar"
              ? "e.g. 1+cos(theta)"
              : "e.g. sin(x), x^2 - 4"
        }
        spellCheck={false}
        className={`h-8 flex-1 rounded-md border bg-background px-2 font-mono text-sm transition-colors focus:outline-none focus:ring-1 ${
          !validation.valid
            ? "border-pink-500/50 focus:ring-pink-500/50"
            : "border-border focus:ring-brand"
        }`}
      />

      {/* Parametric: second expression input for Y(t) */}
      {fn.type === "parametric" && (
        <>
          <span className="shrink-0 text-xs font-bold text-muted-foreground">
            Y(t)=
          </span>
          <input
            type="text"
            value={fn.expressionY ?? ""}
            onChange={(e) => onUpdate({ expressionY: e.target.value })}
            placeholder="e.g. sin(t)"
            spellCheck={false}
            className={`h-8 flex-1 rounded-md border bg-background px-2 font-mono text-sm transition-colors focus:outline-none focus:ring-1 ${
              !validationY.valid
                ? "border-pink-500/50 focus:ring-pink-500/50"
                : "border-border focus:ring-brand"
            }`}
          />
        </>
      )}

      {/* Visibility Toggle */}
      <button
        onClick={() => onUpdate({ visible: !fn.visible })}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title={fn.visible ? "Hide function" : "Show function"}
      >
        {fn.visible ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-pink-400"
        title="Remove function"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ZoomIn;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
