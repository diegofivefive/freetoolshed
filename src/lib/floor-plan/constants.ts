import type {
  FloorPlan,
  EditorState,
  RoomType,
  MeasurementUnit,
} from "./types";

// ── Pixels per plan unit at zoom=1 ──────────────────────────

export const PIXELS_PER_UNIT = 20;

// ── Zoom limits ─────────────────────────────────────────────

export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 5;
export const ZOOM_STEP = 0.1;

// ── Undo stack cap ──────────────────────────────────────────

export const MAX_UNDO_STEPS = 50;

// ── Default wall thickness (feet) ───────────────────────────

export const DEFAULT_WALL_THICKNESS = 0.5;

// ── Room presets ────────────────────────────────────────────

export interface RoomPreset {
  type: RoomType;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  fill: string;
}

export const ROOM_PRESETS: RoomPreset[] = [
  { type: "living-room", label: "Living Room", defaultWidth: 20, defaultHeight: 15, fill: "#e0f2fe" },
  { type: "bedroom", label: "Bedroom", defaultWidth: 12, defaultHeight: 12, fill: "#ede9fe" },
  { type: "kitchen", label: "Kitchen", defaultWidth: 12, defaultHeight: 10, fill: "#fef9c3" },
  { type: "bathroom", label: "Bathroom", defaultWidth: 8, defaultHeight: 6, fill: "#ccfbf1" },
  { type: "dining-room", label: "Dining Room", defaultWidth: 14, defaultHeight: 12, fill: "#fce7f3" },
  { type: "office", label: "Office", defaultWidth: 10, defaultHeight: 10, fill: "#dbeafe" },
  { type: "garage", label: "Garage", defaultWidth: 20, defaultHeight: 20, fill: "#e5e7eb" },
  { type: "hallway", label: "Hallway", defaultWidth: 10, defaultHeight: 4, fill: "#f3f4f6" },
  { type: "closet", label: "Closet", defaultWidth: 4, defaultHeight: 6, fill: "#fef3c7" },
  { type: "laundry", label: "Laundry", defaultWidth: 8, defaultHeight: 6, fill: "#d1fae5" },
  { type: "custom", label: "Custom Room", defaultWidth: 10, defaultHeight: 10, fill: "#f1f5f9" },
];

// ── Grid presets ────────────────────────────────────────────

export const GRID_SIZE_OPTIONS = [0.5, 1, 2, 5] as const;

// ── Unit labels ─────────────────────────────────────────────

export const UNIT_LABELS: Record<MeasurementUnit, { singular: string; plural: string; abbreviation: string }> = {
  ft: { singular: "foot", plural: "feet", abbreviation: "ft" },
  m: { singular: "meter", plural: "meters", abbreviation: "m" },
};

// ── Helpers ─────────────────────────────────────────────────

export function getRoomPreset(roomType: RoomType): RoomPreset {
  return ROOM_PRESETS.find((p) => p.type === roomType) ?? ROOM_PRESETS[ROOM_PRESETS.length - 1];
}

export function formatDimension(value: number, unit: MeasurementUnit): string {
  if (unit === "ft") {
    const feet = Math.floor(value);
    const inches = Math.round((value - feet) * 12);
    if (inches === 0) return `${feet}'`;
    if (inches === 12) return `${feet + 1}'`;
    return `${feet}'-${inches}"`;
  }
  return `${value.toFixed(2)} m`;
}

export function formatArea(width: number, height: number, unit: MeasurementUnit): string {
  const area = width * height;
  if (unit === "ft") return `${Math.round(area)} sq ft`;
  return `${area.toFixed(1)} m²`;
}

// ── Factory functions ───────────────────────────────────────

export function createDefaultPlan(): FloorPlan {
  return {
    id: crypto.randomUUID(),
    name: "Untitled Floor Plan",
    width: 40,
    height: 30,
    unit: "ft",
    gridSize: 1,
    gridSnap: true,
    showGrid: true,
    showDimensions: true,
    backgroundColor: "#ffffff",
    elements: [],
  };
}

export function createDefaultEditorState(): EditorState {
  return {
    plan: createDefaultPlan(),
    selectedElementIds: [],
    activeTool: "select",
    viewport: { zoom: 1, panX: 0, panY: 0 },
    clipboard: null,
    undoStack: [],
    redoStack: [],
    isDragging: false,
    isDrawing: false,
    drawStart: null,
    underlay: null,
  };
}
