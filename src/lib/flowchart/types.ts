// ── Node shape types ────────────────────────────────────────

export type NodeShapeType =
  | "process"
  | "decision"
  | "terminal"
  | "io"
  | "document"
  | "predefined-process"
  | "manual-input"
  | "preparation"
  | "database"
  | "connector"
  | "comment";

export type ShapeCategory = "basic" | "flowchart" | "data" | "annotation";

// ── Anchors ─────────────────────────────────────────────────

export type AnchorPosition = "top" | "right" | "bottom" | "left";

// ── Node ────────────────────────────────────────────────────

export interface NodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  textColor: string;
  opacity: number;
}

export interface FlowchartNode {
  id: string;
  shape: NodeShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  style: NodeStyle;
  rotation: number;
  locked: boolean;
  zIndex: number;
}

// ── Edge ────────────────────────────────────────────────────

export type RouteType = "straight" | "bezier" | "orthogonal";
export type ArrowHead = "none" | "arrow" | "filled-arrow" | "diamond" | "circle";

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  dashArray: string;
  arrowHead: ArrowHead;
  arrowTail: ArrowHead;
  opacity: number;
}

export interface ControlPoint {
  x: number;
  y: number;
}

export interface FlowchartEdge {
  id: string;
  sourceNodeId: string;
  sourceAnchor: AnchorPosition;
  targetNodeId: string;
  targetAnchor: AnchorPosition;
  routeType: RouteType;
  controlPoints: ControlPoint[];
  label: string;
  style: EdgeStyle;
  zIndex: number;
}

// ── Diagram document ────────────────────────────────────────

export interface FlowchartDiagram {
  id: string;
  name: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  gridSize: number;
  gridSnap: boolean;
  gridVisible: boolean;
  backgroundColor: string;
}

// ── Viewport ────────────────────────────────────────────────

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

// ── Tool modes ──────────────────────────────────────────────

export type ToolMode = "select" | "pan" | "add-shape" | "connect" | "text";

// ── Transient interaction state ─────────────────────────────

export interface ConnectDraft {
  sourceNodeId: string;
  sourceAnchor: AnchorPosition;
  mouseX: number;
  mouseY: number;
}

export interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ── Editor state ────────────────────────────────────────────

export interface EditorState {
  diagram: FlowchartDiagram;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  activeTool: ToolMode;
  activeShapeType: NodeShapeType;
  defaultRouteType: RouteType;
  viewport: Viewport;
  clipboard: { nodes: FlowchartNode[]; edges: FlowchartEdge[] } | null;
  undoStack: FlowchartDiagram[];
  redoStack: FlowchartDiagram[];
  isDragging: boolean;
  isConnecting: boolean;
  connectDraft: ConnectDraft | null;
  marquee: MarqueeState | null;
}

// ── Reducer actions ─────────────────────────────────────────

export type FlowchartAction =
  // Diagram metadata
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_GRID"; payload: Partial<Pick<FlowchartDiagram, "gridSize" | "gridSnap" | "gridVisible">> }
  | { type: "SET_BACKGROUND"; payload: string }
  // Nodes
  | { type: "ADD_NODE"; payload: FlowchartNode }
  | { type: "UPDATE_NODE"; payload: { id: string } & Partial<Omit<FlowchartNode, "id">> }
  | { type: "MOVE_NODES"; payload: { ids: string[]; dx: number; dy: number } }
  | { type: "RESIZE_NODE"; payload: { id: string; width: number; height: number; x?: number; y?: number } }
  | { type: "REMOVE_NODES"; payload: string[] }
  | { type: "BRING_TO_FRONT"; payload: string }
  | { type: "SEND_TO_BACK"; payload: string }
  | { type: "LOCK_NODES"; payload: string[] }
  | { type: "UNLOCK_NODES"; payload: string[] }
  // Edges
  | { type: "ADD_EDGE"; payload: FlowchartEdge }
  | { type: "UPDATE_EDGE"; payload: { id: string } & Partial<Omit<FlowchartEdge, "id">> }
  | { type: "MOVE_CONTROL_POINT"; payload: { edgeId: string; cpIndex: number; x: number; y: number } }
  | { type: "REMOVE_EDGES"; payload: string[] }
  // Selection
  | { type: "SELECT_NODES"; payload: string[] }
  | { type: "SELECT_EDGES"; payload: string[] }
  | { type: "SELECT_ALL" }
  | { type: "DESELECT_ALL" }
  // Tools
  | { type: "SET_TOOL"; payload: ToolMode }
  | { type: "SET_ACTIVE_SHAPE"; payload: NodeShapeType }
  | { type: "SET_DEFAULT_ROUTE_TYPE"; payload: RouteType }
  // Viewport
  | { type: "SET_VIEWPORT"; payload: Partial<Viewport> }
  | { type: "ZOOM_TO_FIT" }
  // Connection drafting
  | { type: "START_CONNECT"; payload: { sourceNodeId: string; sourceAnchor: AnchorPosition } }
  | { type: "UPDATE_CONNECT"; payload: { mouseX: number; mouseY: number } }
  | { type: "END_CONNECT" }
  | { type: "CANCEL_CONNECT" }
  // Marquee
  | { type: "START_MARQUEE"; payload: { x: number; y: number } }
  | { type: "UPDATE_MARQUEE"; payload: { x: number; y: number } }
  | { type: "END_MARQUEE" }
  // Clipboard
  | { type: "COPY" }
  | { type: "PASTE"; payload: { offsetX: number; offsetY: number } }
  | { type: "DUPLICATE" }
  // Undo / Redo
  | { type: "UNDO" }
  | { type: "REDO" }
  // Load / Reset
  | { type: "LOAD_DIAGRAM"; payload: FlowchartDiagram }
  | { type: "RESET" };

// ── Persistence ─────────────────────────────────────────────

export interface SavedDiagram {
  id: string;
  diagram: FlowchartDiagram;
  createdAt: string;
  updatedAt: string;
}

export interface ExportEnvelope {
  tool: "freetoolshed-flowchart-maker";
  version: 1;
  exportedAt: string;
  diagrams: SavedDiagram[];
}
