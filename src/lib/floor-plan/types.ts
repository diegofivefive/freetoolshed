// ── Measurement ──────────────────────────────────────────────

export type MeasurementUnit = "ft" | "m";

// ── Element types ────────────────────────────────────────────

export type ElementType = "room" | "furniture" | "wall" | "text";

export type RoomType =
  | "living-room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "dining-room"
  | "office"
  | "garage"
  | "hallway"
  | "closet"
  | "laundry"
  | "custom";

export type FurnitureCategory =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"
  | "outdoor";

// ── Elements ─────────────────────────────────────────────────

interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  locked: boolean;
  label: string;
  opacity: number;
  zIndex: number;
}

export interface RoomElement extends BaseElement {
  type: "room";
  width: number;
  height: number;
  roomType: RoomType;
  fill: string;
  strokeColor: string;
  showDimensions: boolean;
}

export interface FurnitureElement extends BaseElement {
  type: "furniture";
  width: number;
  height: number;
  furnitureType: string;
  category: FurnitureCategory;
  fill: string;
}

export interface WallElement extends BaseElement {
  type: "wall";
  x2: number;
  y2: number;
  thickness: number;
  strokeColor: string;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  color: string;
}

export type FloorPlanElement =
  | RoomElement
  | FurnitureElement
  | WallElement
  | TextElement;

// ── Tool modes ───────────────────────────────────────────────

export type ToolMode = "select" | "room" | "wall" | "text";

// ── Viewport ─────────────────────────────────────────────────

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

// ── Floor plan document ──────────────────────────────────────

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  gridSize: number;
  gridSnap: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  backgroundColor: string;
  elements: FloorPlanElement[];
}

// ── Editor state ─────────────────────────────────────────────

export interface EditorState {
  plan: FloorPlan;
  selectedElementIds: string[];
  activeTool: ToolMode;
  viewport: Viewport;
  clipboard: FloorPlanElement[] | null;
  undoStack: FloorPlan[];
  redoStack: FloorPlan[];
  isDragging: boolean;
  isDrawing: boolean;
  drawStart: { x: number; y: number } | null;
}

// ── Reducer actions ──────────────────────────────────────────

export type FloorPlanAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_PLAN_SIZE"; payload: { width: number; height: number } }
  | { type: "SET_UNIT"; payload: MeasurementUnit }
  | { type: "SET_GRID"; payload: Partial<Pick<FloorPlan, "gridSize" | "gridSnap" | "showGrid">> }
  | { type: "TOGGLE_DIMENSIONS" }
  | { type: "ADD_ELEMENT"; payload: FloorPlanElement }
  | { type: "UPDATE_ELEMENT"; payload: { id: string } & Partial<FloorPlanElement> }
  | { type: "REMOVE_ELEMENTS"; payload: string[] }
  | { type: "MOVE_ELEMENT"; payload: { id: string; x: number; y: number } }
  | { type: "RESIZE_ELEMENT"; payload: { id: string; width: number; height: number; x?: number; y?: number } }
  | { type: "ROTATE_ELEMENT"; payload: { id: string; rotation: number } }
  | { type: "BRING_TO_FRONT"; payload: string }
  | { type: "SEND_TO_BACK"; payload: string }
  | { type: "SELECT"; payload: string[] }
  | { type: "DESELECT_ALL" }
  | { type: "SET_TOOL"; payload: ToolMode }
  | { type: "SET_VIEWPORT"; payload: Partial<Viewport> }
  | { type: "ZOOM_TO_FIT" }
  | { type: "START_DRAW"; payload: { x: number; y: number } }
  | { type: "END_DRAW" }
  | { type: "COPY" }
  | { type: "PASTE"; payload: { x: number; y: number } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOCK_ELEMENTS"; payload: string[] }
  | { type: "UNLOCK_ELEMENTS"; payload: string[] }
  | { type: "LOAD_PLAN"; payload: FloorPlan }
  | { type: "RESET" };

// ── Saved plans ──────────────────────────────────────────────

export interface SavedFloorPlan {
  id: string;
  plan: FloorPlan;
  createdAt: string;
  updatedAt: string;
}

export interface ExportEnvelope {
  tool: "freetoolshed-floor-plan-maker";
  version: 1;
  exportedAt: string;
  plans: SavedFloorPlan[];
}

// ── Furniture catalog ────────────────────────────────────────

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  defaultWidth: number;
  defaultHeight: number;
  svgPath: string;
  viewBox: string;
}
