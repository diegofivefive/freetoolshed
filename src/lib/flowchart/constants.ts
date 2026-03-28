import type {
  FlowchartDiagram,
  EditorState,
  NodeShapeType,
  NodeStyle,
  EdgeStyle,
  ShapeCategory,
} from "./types";

// ── Zoom limits ──────────────────────────────────────────────

export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 5;
export const ZOOM_STEP = 0.1;

// ── Undo stack cap ───────────────────────────────────────────

export const MAX_UNDO_STEPS = 50;

// ── Grid ─────────────────────────────────────────────────────

export const DEFAULT_GRID_SIZE = 20;
export const GRID_SIZE_OPTIONS = [10, 20, 40] as const;

// ── Anchor snap distance (pixels, screen space) ──────────────

export const ANCHOR_SNAP_RADIUS = 12;

// ── Default styles ───────────────────────────────────────────

export const DEFAULT_NODE_STYLE: NodeStyle = {
  fill: "#ffffff",
  stroke: "#374151",
  strokeWidth: 2,
  fontSize: 14,
  fontWeight: "normal",
  textAlign: "center",
  textColor: "#111827",
  opacity: 1,
};

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  stroke: "#374151",
  strokeWidth: 2,
  dashArray: "",
  arrowHead: "filled-arrow",
  arrowTail: "none",
  opacity: 1,
};

// ── Shape presets ────────────────────────────────────────────

export interface ShapePreset {
  type: NodeShapeType;
  label: string;
  category: ShapeCategory;
  defaultWidth: number;
  defaultHeight: number;
  defaultFill: string;
}

export const SHAPE_PRESETS: ShapePreset[] = [
  { type: "process", label: "Process", category: "basic", defaultWidth: 160, defaultHeight: 80, defaultFill: "#ffffff" },
  { type: "terminal", label: "Terminal", category: "basic", defaultWidth: 160, defaultHeight: 60, defaultFill: "#d1fae5" },
  { type: "connector", label: "Connector", category: "basic", defaultWidth: 40, defaultHeight: 40, defaultFill: "#ffffff" },
  { type: "decision", label: "Decision", category: "flowchart", defaultWidth: 120, defaultHeight: 100, defaultFill: "#fef9c3" },
  { type: "io", label: "Input / Output", category: "flowchart", defaultWidth: 160, defaultHeight: 80, defaultFill: "#dbeafe" },
  { type: "document", label: "Document", category: "flowchart", defaultWidth: 160, defaultHeight: 100, defaultFill: "#fce7f3" },
  { type: "predefined-process", label: "Predefined Process", category: "flowchart", defaultWidth: 160, defaultHeight: 80, defaultFill: "#ede9fe" },
  { type: "manual-input", label: "Manual Input", category: "flowchart", defaultWidth: 160, defaultHeight: 80, defaultFill: "#ccfbf1" },
  { type: "preparation", label: "Preparation", category: "flowchart", defaultWidth: 160, defaultHeight: 80, defaultFill: "#fef3c7" },
  { type: "database", label: "Database", category: "data", defaultWidth: 100, defaultHeight: 120, defaultFill: "#e0f2fe" },
  { type: "comment", label: "Comment", category: "annotation", defaultWidth: 160, defaultHeight: 80, defaultFill: "transparent" },
];

export const SHAPE_CATEGORIES: { key: ShapeCategory; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "flowchart", label: "Flowchart" },
  { key: "data", label: "Data" },
  { key: "annotation", label: "Annotation" },
];

// ── Dash pattern presets ─────────────────────────────────────

export const DASH_PRESETS = [
  { label: "Solid", value: "" },
  { label: "Dashed", value: "8 4" },
  { label: "Dotted", value: "2 4" },
  { label: "Dash-dot", value: "8 4 2 4" },
] as const;

// ── Arrow head options ───────────────────────────────────────

export const ARROW_HEAD_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Arrow", value: "arrow" },
  { label: "Filled Arrow", value: "filled-arrow" },
  { label: "Diamond", value: "diamond" },
  { label: "Circle", value: "circle" },
] as const;

// ── Color presets for shape fills ────────────────────────────

export const FILL_COLOR_PRESETS = [
  "#ffffff", "#f3f4f6", "#d1fae5", "#dbeafe",
  "#fef9c3", "#fce7f3", "#ede9fe", "#ccfbf1",
  "#fef3c7", "#e0f2fe", "#fee2e2", "#f1f5f9",
] as const;

export const STROKE_COLOR_PRESETS = [
  "#111827", "#374151", "#6b7280", "#9ca3af",
  "#059669", "#2563eb", "#7c3aed", "#db2777",
  "#d97706", "#dc2626", "#0891b2", "#4b5563",
] as const;

// ── Factory functions ────────────────────────────────────────

export function getShapePreset(shapeType: NodeShapeType): ShapePreset {
  return SHAPE_PRESETS.find((p) => p.type === shapeType) ?? SHAPE_PRESETS[0];
}

export function createDefaultDiagram(): FlowchartDiagram {
  return {
    id: crypto.randomUUID(),
    name: "Untitled Diagram",
    nodes: [],
    edges: [],
    gridSize: DEFAULT_GRID_SIZE,
    gridSnap: true,
    gridVisible: true,
    backgroundColor: "#ffffff",
  };
}

export function createDefaultEditorState(): EditorState {
  return {
    diagram: createDefaultDiagram(),
    selectedNodeIds: [],
    selectedEdgeIds: [],
    activeTool: "select",
    activeShapeType: "process",
    defaultRouteType: "bezier",
    viewport: { zoom: 1, panX: 0, panY: 0 },
    clipboard: null,
    undoStack: [],
    redoStack: [],
    isDragging: false,
    isConnecting: false,
    connectDraft: null,
    marquee: null,
  };
}
