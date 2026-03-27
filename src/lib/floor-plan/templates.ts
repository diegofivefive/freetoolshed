import type { FloorPlan, RoomElement, FurnitureElement, WallElement } from "./types";

export interface FloorPlanTemplate {
  id: string;
  name: string;
  description: string;
  plan: Omit<FloorPlan, "id">;
}

// Helper to generate unique IDs at template creation time
let _seq = 0;
function tid(): string {
  return `tpl-${Date.now()}-${_seq++}`;
}

function room(
  x: number, y: number, w: number, h: number,
  label: string, roomType: RoomElement["roomType"], fill: string, z: number
): RoomElement {
  return {
    id: tid(), type: "room", x, y, width: w, height: h,
    rotation: 0, locked: false, label, opacity: 1, zIndex: z,
    roomType, fill, strokeColor: "#1e293b", showDimensions: false,
  };
}

function furniture(
  x: number, y: number, w: number, h: number,
  label: string, furnitureType: string, category: FurnitureElement["category"],
  z: number, rotation = 0
): FurnitureElement {
  return {
    id: tid(), type: "furniture", x, y, width: w, height: h,
    rotation, locked: false, label, opacity: 1, zIndex: z,
    furnitureType, category, fill: "#64748b",
  };
}

function wall(
  x: number, y: number, x2: number, y2: number, z: number
): WallElement {
  return {
    id: tid(), type: "wall", x, y, x2, y2,
    rotation: 0, locked: false, label: "", opacity: 1, zIndex: z,
    thickness: 0.5, strokeColor: "#1e293b",
  };
}

// ── Templates ───────────────────────────────────────────────

const studioApartment: FloorPlanTemplate = {
  id: "studio-apartment",
  name: "Studio Apartment",
  description: "~400 sq ft open-plan studio with kitchen, bath, and living area",
  plan: {
    name: "Studio Apartment",
    width: 25,
    height: 20,
    unit: "ft",
    gridSize: 1,
    gridSnap: true,
    showGrid: true,
    showDimensions: true,
    backgroundColor: "#ffffff",
    elements: [
      // Main living/bedroom area
      room(0, 0, 25, 20, "Studio", "living-room", "#e0f2fe", 0),
      // Kitchen area
      room(0, 0, 10, 8, "Kitchen", "kitchen", "#fef9c3", 1),
      // Bathroom
      room(18, 0, 7, 7, "Bathroom", "bathroom", "#ccfbf1", 2),
      // Furniture
      furniture(12, 12, 6, 3, "Sofa", "sofa", "living", 3),
      furniture(14, 16, 3, 2, "Coffee Table", "coffee-table", "living", 4),
      furniture(12, 2, 5, 6.5, "Bed (Queen)", "bed-queen", "bedroom", 5),
      furniture(1, 1, 3, 2, "Stove", "stove", "kitchen", 6),
      furniture(5, 1, 3, 2, "Sink", "kitchen-sink", "kitchen", 7),
      furniture(19, 1, 2.5, 2, "Toilet", "toilet", "bathroom", 8),
      furniture(22, 1, 3, 2, "Sink", "bathroom-sink", "bathroom", 9),
      furniture(19, 4, 4, 2.5, "Bathtub", "bathtub", "bathroom", 10),
      // Walls
      wall(0, 8, 10, 8, 11),
      wall(10, 0, 10, 8, 12),
      wall(18, 0, 18, 7, 13),
      wall(18, 7, 25, 7, 14),
    ],
  },
};

const twoBedroom: FloorPlanTemplate = {
  id: "two-bedroom",
  name: "2-Bedroom Apartment",
  description: "~800 sq ft apartment with 2 bedrooms, living room, kitchen, and bath",
  plan: {
    name: "2-Bedroom Apartment",
    width: 40,
    height: 30,
    unit: "ft",
    gridSize: 1,
    gridSnap: true,
    showGrid: true,
    showDimensions: true,
    backgroundColor: "#ffffff",
    elements: [
      // Living room
      room(0, 0, 18, 15, "Living Room", "living-room", "#e0f2fe", 0),
      // Kitchen
      room(18, 0, 12, 12, "Kitchen", "kitchen", "#fef9c3", 1),
      // Dining
      room(30, 0, 10, 12, "Dining Room", "dining-room", "#fce7f3", 2),
      // Master bedroom
      room(0, 15, 15, 15, "Master Bedroom", "bedroom", "#ede9fe", 3),
      // Bedroom 2
      room(22, 15, 12, 15, "Bedroom 2", "bedroom", "#ede9fe", 4),
      // Bathroom
      room(15, 15, 7, 8, "Bathroom", "bathroom", "#ccfbf1", 5),
      // Hallway
      room(15, 23, 7, 7, "Hallway", "hallway", "#f3f4f6", 6),
      // Closet
      room(34, 15, 6, 6, "Closet", "closet", "#fef3c7", 7),
      // Furniture
      furniture(3, 6, 6, 3, "Sofa", "sofa", "living", 8),
      furniture(5, 10, 3, 2, "Coffee Table", "coffee-table", "living", 9),
      furniture(10, 1, 4, 2, "TV Stand", "tv-stand", "living", 10),
      furniture(20, 1, 3, 2, "Stove", "stove", "kitchen", 11),
      furniture(24, 1, 3, 2, "Sink", "kitchen-sink", "kitchen", 12),
      furniture(20, 5, 3, 3, "Fridge", "refrigerator", "kitchen", 13),
      furniture(32, 3, 5, 3, "Dining Table", "dining-table-rect", "living", 14),
      furniture(2, 18, 5, 6.5, "Bed (Queen)", "bed-queen", "bedroom", 15),
      furniture(24, 18, 5, 6.5, "Bed (Queen)", "bed-queen", "bedroom", 16),
      furniture(16, 16, 2.5, 2, "Toilet", "toilet", "bathroom", 17),
      furniture(19, 16, 3, 2, "Sink", "bathroom-sink", "bathroom", 18),
    ],
  },
};

const smallOffice: FloorPlanTemplate = {
  id: "small-office",
  name: "Small Office",
  description: "~500 sq ft office with reception, 2 desks, and meeting area",
  plan: {
    name: "Small Office",
    width: 30,
    height: 20,
    unit: "ft",
    gridSize: 1,
    gridSnap: true,
    showGrid: true,
    showDimensions: true,
    backgroundColor: "#ffffff",
    elements: [
      // Reception
      room(0, 0, 12, 10, "Reception", "living-room", "#e0f2fe", 0),
      // Office 1
      room(12, 0, 10, 10, "Office 1", "office", "#dbeafe", 1),
      // Office 2
      room(22, 0, 8, 10, "Office 2", "office", "#dbeafe", 2),
      // Meeting room
      room(0, 10, 15, 10, "Meeting Room", "dining-room", "#fce7f3", 3),
      // Kitchen/break room
      room(15, 10, 8, 10, "Break Room", "kitchen", "#fef9c3", 4),
      // Bathroom
      room(23, 10, 7, 10, "Bathroom", "bathroom", "#ccfbf1", 5),
      // Furniture
      furniture(2, 2, 4, 2, "Reception Desk", "desk-l-shape", "office", 6),
      furniture(14, 2, 3, 2, "Desk", "desk", "office", 7),
      furniture(14, 5, 2, 2, "Office Chair", "office-chair", "office", 8),
      furniture(24, 2, 3, 2, "Desk", "desk", "office", 9),
      furniture(24, 5, 2, 2, "Office Chair", "office-chair", "office", 10),
      furniture(3, 13, 8, 4, "Conference Table", "dining-table-rect", "living", 11),
      furniture(17, 12, 3, 2, "Sink", "kitchen-sink", "kitchen", 12),
      furniture(17, 15, 3, 3, "Fridge", "refrigerator", "kitchen", 13),
      furniture(24, 12, 2.5, 2, "Toilet", "toilet", "bathroom", 14),
      furniture(27, 12, 3, 2, "Sink", "bathroom-sink", "bathroom", 15),
    ],
  },
};

const oneBedHouse: FloorPlanTemplate = {
  id: "one-bed-house",
  name: "1-Bedroom House",
  description: "~650 sq ft house with bedroom, living room, kitchen, and bathroom",
  plan: {
    name: "1-Bedroom House",
    width: 30,
    height: 25,
    unit: "ft",
    gridSize: 1,
    gridSnap: true,
    showGrid: true,
    showDimensions: true,
    backgroundColor: "#ffffff",
    elements: [
      // Living room
      room(0, 0, 16, 14, "Living Room", "living-room", "#e0f2fe", 0),
      // Kitchen
      room(16, 0, 14, 14, "Kitchen", "kitchen", "#fef9c3", 1),
      // Bedroom
      room(0, 14, 16, 11, "Bedroom", "bedroom", "#ede9fe", 2),
      // Bathroom
      room(16, 14, 8, 8, "Bathroom", "bathroom", "#ccfbf1", 3),
      // Laundry
      room(24, 14, 6, 8, "Laundry", "laundry", "#d1fae5", 4),
      // Hallway
      room(16, 22, 14, 3, "Hallway", "hallway", "#f3f4f6", 5),
      // Furniture
      furniture(2, 5, 6, 3, "Sofa", "sofa", "living", 6),
      furniture(4, 9, 3, 2, "Coffee Table", "coffee-table", "living", 7),
      furniture(10, 1, 4, 2, "TV Stand", "tv-stand", "living", 8),
      furniture(18, 1, 3, 2, "Stove", "stove", "kitchen", 9),
      furniture(22, 1, 3, 2, "Sink", "kitchen-sink", "kitchen", 10),
      furniture(26, 1, 3, 3, "Fridge", "refrigerator", "kitchen", 11),
      furniture(2, 17, 5, 6.5, "Bed (Queen)", "bed-queen", "bedroom", 12),
      furniture(10, 17, 4, 3, "Dresser", "dresser", "bedroom", 13),
      furniture(17, 15, 2.5, 2, "Toilet", "toilet", "bathroom", 14),
      furniture(20, 15, 3, 2, "Sink", "bathroom-sink", "bathroom", 15),
      furniture(17, 18, 4, 2.5, "Bathtub", "bathtub", "bathroom", 16),
      furniture(25, 15, 3, 3, "Washer", "washer", "bathroom", 17),
    ],
  },
};

const openPlanLiving: FloorPlanTemplate = {
  id: "open-plan-living",
  name: "Open Plan Living Space",
  description: "~900 sq ft open living, dining, and kitchen area",
  plan: {
    name: "Open Plan Living Space",
    width: 35,
    height: 25,
    unit: "ft",
    gridSize: 1,
    gridSnap: true,
    showGrid: true,
    showDimensions: true,
    backgroundColor: "#ffffff",
    elements: [
      // Main open area
      room(0, 0, 35, 25, "Open Plan", "living-room", "#e0f2fe", 0),
      // Kitchen zone (no walls, just labeled area)
      room(0, 0, 12, 10, "Kitchen", "kitchen", "#fef9c3", 1),
      // Dining zone
      room(12, 0, 11, 10, "Dining", "dining-room", "#fce7f3", 2),
      // Furniture — living area
      furniture(4, 15, 8, 3, "Sectional Sofa", "sofa-sectional", "living", 3),
      furniture(7, 19, 3, 2, "Coffee Table", "coffee-table", "living", 4),
      furniture(14, 19, 4, 2, "TV Stand", "tv-stand", "living", 5),
      furniture(20, 14, 3, 3, "Armchair", "armchair", "living", 6),
      furniture(25, 14, 3, 3, "Armchair", "armchair", "living", 7),
      furniture(24, 18, 4, 3, "Bookshelf", "bookshelf", "office", 8),
      // Furniture — kitchen
      furniture(1, 1, 3, 2, "Stove", "stove", "kitchen", 9),
      furniture(5, 1, 3, 2, "Sink", "kitchen-sink", "kitchen", 10),
      furniture(9, 1, 3, 3, "Fridge", "refrigerator", "kitchen", 11),
      furniture(1, 5, 8, 2, "Kitchen Island", "kitchen-island", "kitchen", 12),
      // Furniture — dining
      furniture(14, 3, 5, 3, "Dining Table", "dining-table-rect", "living", 13),
      // Plants
      furniture(0, 22, 2, 2, "Plant", "potted-plant", "outdoor", 14),
      furniture(33, 0, 2, 2, "Plant", "potted-plant", "outdoor", 15),
    ],
  },
};

export const FLOOR_PLAN_TEMPLATES: FloorPlanTemplate[] = [
  studioApartment,
  twoBedroom,
  oneBedHouse,
  openPlanLiving,
  smallOffice,
];
