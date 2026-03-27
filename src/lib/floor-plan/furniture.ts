import type { FurnitureCatalogItem, FurnitureCategory } from "./types";

// SVG paths use a standard 100x100 viewBox. Each item renders at its defaultWidth/defaultHeight in plan units.
// Paths are simplified architectural plan-view symbols.

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // ── Living ──────────────────────────────────────────────────
  { id: "sofa-3seat", name: "3-Seat Sofa", category: "living", defaultWidth: 7, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M5 15 h90 v70 h-90 z M10 10 h80 v5 h-80 z M5 15 v70 h5 v-70 z M90 15 v70 h5 v-70 z M10 20 h25 v60 h-25 z M37 20 h26 v60 h-26 z M65 20 h25 v60 h-25 z" },
  { id: "sofa-2seat", name: "2-Seat Sofa", category: "living", defaultWidth: 5, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M5 15 h90 v70 h-90 z M10 10 h80 v5 h-80 z M5 15 v70 h5 v-70 z M90 15 v70 h5 v-70 z M10 20 h37 v60 h-37 z M53 20 h37 v60 h-37 z" },
  { id: "sofa-l-shape", name: "L-Shape Sofa", category: "living", defaultWidth: 8, defaultHeight: 6, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v40 h-50 v50 h-40 z M10 10 h80 v30 h-45 v45 h-30 z" },
  { id: "armchair", name: "Armchair", category: "living", defaultWidth: 3, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M15 15 h70 v70 h-70 z M10 10 h80 v5 h-80 z M10 15 v70 h5 v-70 z M85 15 v70 h5 v-70 z" },
  { id: "coffee-table-rect", name: "Coffee Table", category: "living", defaultWidth: 4, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M10 10 h80 v80 h-80 z" },
  { id: "coffee-table-round", name: "Round Coffee Table", category: "living", defaultWidth: 3, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M50 5 a45 45 0 1 1 0 90 a45 45 0 1 1 0 -90" },
  { id: "side-table", name: "Side Table", category: "living", defaultWidth: 1.5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M10 10 h80 v80 h-80 z" },
  { id: "tv-stand", name: "TV Stand", category: "living", defaultWidth: 5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 10 h90 v80 h-90 z M15 20 h70 v40 h-70 z" },
  { id: "bookshelf", name: "Bookshelf", category: "living", defaultWidth: 4, defaultHeight: 1, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 30 h90 M5 55 h90 M5 80 h90" },
  { id: "floor-lamp", name: "Floor Lamp", category: "living", defaultWidth: 1, defaultHeight: 1, viewBox: "0 0 100 100", svgPath: "M50 10 a40 40 0 1 1 0 80 a40 40 0 1 1 0 -80 M50 30 a20 20 0 1 1 0 40 a20 20 0 1 1 0 -40" },
  { id: "rug-rect", name: "Area Rug", category: "living", defaultWidth: 8, defaultHeight: 5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M10 10 h80 v80 h-80 z" },
  { id: "plant-large", name: "Large Plant", category: "living", defaultWidth: 1.5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M50 10 a40 40 0 1 1 0 80 a40 40 0 1 1 0 -80 M35 35 l15 15 M65 35 l-15 15 M50 25 v25" },
  { id: "fireplace", name: "Fireplace", category: "living", defaultWidth: 4, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M20 20 h60 v60 h-60 z M35 45 a15 15 0 0 1 30 0" },
  { id: "ottoman", name: "Ottoman", category: "living", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M15 15 h70 v70 h-70 z M15 15 a0 0 0 0 0 0 0" },
  { id: "console-table", name: "Console Table", category: "living", defaultWidth: 4, defaultHeight: 1, viewBox: "0 0 100 100", svgPath: "M5 20 h90 v60 h-90 z" },

  // ── Bedroom ─────────────────────────────────────────────────
  { id: "bed-king", name: "King Bed", category: "bedroom", defaultWidth: 6.5, defaultHeight: 7, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 5 h90 v15 h-90 z M10 25 h35 v65 h-35 z M55 25 h35 v65 h-35 z" },
  { id: "bed-queen", name: "Queen Bed", category: "bedroom", defaultWidth: 5, defaultHeight: 6.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 5 h90 v15 h-90 z M10 25 h35 v65 h-35 z M55 25 h35 v65 h-35 z" },
  { id: "bed-double", name: "Double Bed", category: "bedroom", defaultWidth: 4.5, defaultHeight: 6.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 5 h90 v15 h-90 z M10 25 h80 v65 h-80 z" },
  { id: "bed-single", name: "Single Bed", category: "bedroom", defaultWidth: 3, defaultHeight: 6.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 5 h90 v15 h-90 z M10 25 h80 v65 h-80 z" },
  { id: "nightstand", name: "Nightstand", category: "bedroom", defaultWidth: 1.5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M10 10 h80 v80 h-80 z M20 40 h60" },
  { id: "dresser-6drawer", name: "6-Drawer Dresser", category: "bedroom", defaultWidth: 5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 35 h90 M5 65 h90 M50 5 v90" },
  { id: "dresser-3drawer", name: "3-Drawer Dresser", category: "bedroom", defaultWidth: 3, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 35 h90 M5 65 h90" },
  { id: "wardrobe", name: "Wardrobe", category: "bedroom", defaultWidth: 4, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M50 5 v90 M45 45 h-5 v10 h5 M55 45 h5 v10 h-5" },
  { id: "vanity", name: "Vanity", category: "bedroom", defaultWidth: 3, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 30 h90 v65 h-90 z M25 5 h50 a25 25 0 0 1 0 50 h-50 a25 25 0 0 1 0 -50" },
  { id: "desk-small", name: "Small Desk", category: "bedroom", defaultWidth: 3.5, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M70 15 h20 v30 h-20 z" },

  // ── Kitchen ─────────────────────────────────────────────────
  { id: "counter-straight", name: "Counter (Straight)", category: "kitchen", defaultWidth: 6, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z" },
  { id: "island", name: "Kitchen Island", category: "kitchen", defaultWidth: 5, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M10 10 h80 v80 h-80 z" },
  { id: "sink-double", name: "Double Sink", category: "kitchen", defaultWidth: 3, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M10 15 h35 v70 h-35 z M55 15 h35 v70 h-35 z" },
  { id: "sink-single", name: "Single Sink", category: "kitchen", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M15 15 h70 v70 h-70 z M50 50 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10" },
  { id: "stove-4burner", name: "4-Burner Stove", category: "kitchen", defaultWidth: 2.5, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M25 25 a12 12 0 1 1 0 1 M75 25 a12 12 0 1 1 0 1 M25 70 a12 12 0 1 1 0 1 M75 70 a12 12 0 1 1 0 1" },
  { id: "fridge-standard", name: "Refrigerator", category: "kitchen", defaultWidth: 2.5, defaultHeight: 2.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M50 5 v90 M15 20 v15 M65 20 v15" },
  { id: "dishwasher", name: "Dishwasher", category: "kitchen", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M15 15 h70 v50 h-70 z M45 75 h10 v5 h-10 z" },
  { id: "table-round-4", name: "Round Table (4)", category: "kitchen", defaultWidth: 3.5, defaultHeight: 3.5, viewBox: "0 0 100 100", svgPath: "M50 10 a40 40 0 1 1 0 80 a40 40 0 1 1 0 -80" },
  { id: "table-rect-6", name: "Rect Table (6)", category: "kitchen", defaultWidth: 5, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M10 10 h80 v80 h-80 z" },
  { id: "chair-dining", name: "Dining Chair", category: "kitchen", defaultWidth: 1.5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M15 20 h70 v65 h-70 z M15 15 h70 v10 h-70 z" },
  { id: "stool-bar", name: "Bar Stool", category: "kitchen", defaultWidth: 1.5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M50 15 a35 35 0 1 1 0 70 a35 35 0 1 1 0 -70" },

  // ── Bathroom ────────────────────────────────────────────────
  { id: "toilet-standard", name: "Toilet", category: "bathroom", defaultWidth: 1.5, defaultHeight: 2.5, viewBox: "0 0 100 100", svgPath: "M20 50 h60 v10 h-60 z M25 10 h50 v45 h-50 z M20 55 a30 30 0 0 0 60 0 v30 a30 30 0 0 1 -60 0 z" },
  { id: "bathtub-standard", name: "Bathtub", category: "bathroom", defaultWidth: 2.5, defaultHeight: 5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M10 10 h80 v80 h-80 a10 10 0 0 1 0 0 M50 15 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10" },
  { id: "shower-square", name: "Shower (Square)", category: "bathroom", defaultWidth: 3, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 5 l90 90 M50 50 a8 8 0 1 1 0 1" },
  { id: "shower-rect", name: "Shower (Rect)", category: "bathroom", defaultWidth: 3, defaultHeight: 4, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 5 l90 90 M50 50 a8 8 0 1 1 0 1" },
  { id: "vanity-single", name: "Vanity (Single)", category: "bathroom", defaultWidth: 2, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M30 25 h40 v50 h-40 z M50 50 a5 5 0 1 1 0 1" },
  { id: "vanity-double", name: "Vanity (Double)", category: "bathroom", defaultWidth: 4, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M10 25 h30 v50 h-30 z M60 25 h30 v50 h-30 z M25 50 a5 5 0 1 1 0 1 M75 50 a5 5 0 1 1 0 1" },
  { id: "towel-rack", name: "Towel Rack", category: "bathroom", defaultWidth: 2, defaultHeight: 0.5, viewBox: "0 0 100 100", svgPath: "M5 20 h90 v20 h-90 z M5 60 h90 v20 h-90 z" },

  // ── Office ──────────────────────────────────────────────────
  { id: "desk-large", name: "Large Desk", category: "office", defaultWidth: 5, defaultHeight: 2.5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M70 15 h20 v35 h-20 z" },
  { id: "desk-standing", name: "Standing Desk", category: "office", defaultWidth: 4, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M8 8 h84 v84 h-84 z" },
  { id: "desk-corner", name: "Corner Desk", category: "office", defaultWidth: 5, defaultHeight: 5, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v40 h-50 v50 h-40 z" },
  { id: "chair-office", name: "Office Chair", category: "office", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M50 15 a35 35 0 1 1 0 70 a35 35 0 1 1 0 -70 M30 50 h40" },
  { id: "chair-guest", name: "Guest Chair", category: "office", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M15 20 h70 v65 h-70 z M15 10 h70 v15 h-70 z" },
  { id: "filing-2drawer", name: "Filing Cabinet (2)", category: "office", defaultWidth: 1.5, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M10 5 h80 v90 h-80 z M10 50 h80 M40 25 h20 M40 70 h20" },
  { id: "filing-4drawer", name: "Filing Cabinet (4)", category: "office", defaultWidth: 1.5, defaultHeight: 2.5, viewBox: "0 0 100 100", svgPath: "M10 5 h80 v90 h-80 z M10 28 h80 M10 50 h80 M10 72 h80 M40 16 h20 M40 38 h20 M40 60 h20 M40 82 h20" },
  { id: "bookcase-tall", name: "Tall Bookcase", category: "office", defaultWidth: 3, defaultHeight: 1, viewBox: "0 0 100 100", svgPath: "M5 5 h90 v90 h-90 z M5 25 h90 M5 45 h90 M5 65 h90 M5 85 h90" },
  { id: "whiteboard", name: "Whiteboard", category: "office", defaultWidth: 4, defaultHeight: 0.5, viewBox: "0 0 100 100", svgPath: "M5 10 h90 v80 h-90 z" },
  { id: "monitor", name: "Monitor", category: "office", defaultWidth: 2, defaultHeight: 0.5, viewBox: "0 0 100 100", svgPath: "M10 10 h80 v60 h-80 z M40 70 h20 v15 h-20 z M30 85 h40" },
  { id: "printer", name: "Printer", category: "office", defaultWidth: 1.5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M10 25 h80 v50 h-80 z M20 10 h60 v20 h-60 z M20 75 h60 v15 h-60 z" },

  // ── Outdoor ─────────────────────────────────────────────────
  { id: "patio-table", name: "Patio Table", category: "outdoor", defaultWidth: 4, defaultHeight: 4, viewBox: "0 0 100 100", svgPath: "M50 10 a40 40 0 1 1 0 80 a40 40 0 1 1 0 -80" },
  { id: "patio-chair", name: "Patio Chair", category: "outdoor", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M15 20 h70 v65 h-70 z M15 10 h70 v15 h-70 z" },
  { id: "lounge-chair", name: "Lounge Chair", category: "outdoor", defaultWidth: 2.5, defaultHeight: 6, viewBox: "0 0 100 100", svgPath: "M10 5 h80 v90 h-80 z M10 5 h80 v20 h-80 z M15 30 h70 v60 h-70 z" },
  { id: "grill", name: "Grill", category: "outdoor", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M50 10 a40 40 0 1 1 0 80 a40 40 0 1 1 0 -80 M20 50 h60 M30 30 h40" },
  { id: "planter-large", name: "Large Planter", category: "outdoor", defaultWidth: 2, defaultHeight: 2, viewBox: "0 0 100 100", svgPath: "M15 15 h70 v70 h-70 z M25 25 h50 v50 h-50 z M50 30 v40 M35 50 h30" },
  { id: "umbrella", name: "Umbrella", category: "outdoor", defaultWidth: 3, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M50 5 a45 45 0 1 1 0 90 a45 45 0 1 1 0 -90 M50 5 v90 M5 50 h90" },
  { id: "bench-outdoor", name: "Outdoor Bench", category: "outdoor", defaultWidth: 5, defaultHeight: 1.5, viewBox: "0 0 100 100", svgPath: "M5 20 h90 v60 h-90 z M5 10 h90 v15 h-90 z" },
  { id: "fire-pit", name: "Fire Pit", category: "outdoor", defaultWidth: 3, defaultHeight: 3, viewBox: "0 0 100 100", svgPath: "M50 5 a45 45 0 1 1 0 90 a45 45 0 1 1 0 -90 M50 20 a30 30 0 1 1 0 60 a30 30 0 1 1 0 -60" },
  { id: "hot-tub", name: "Hot Tub", category: "outdoor", defaultWidth: 4, defaultHeight: 4, viewBox: "0 0 100 100", svgPath: "M50 5 a45 45 0 1 1 0 90 a45 45 0 1 1 0 -90 M50 15 a35 35 0 1 1 0 70 a35 35 0 1 1 0 -70 M25 40 h50 M25 60 h50" },
];

export const FURNITURE_CATEGORIES: { id: FurnitureCategory; label: string }[] = [
  { id: "living", label: "Living" },
  { id: "bedroom", label: "Bedroom" },
  { id: "kitchen", label: "Kitchen" },
  { id: "bathroom", label: "Bathroom" },
  { id: "office", label: "Office" },
  { id: "outdoor", label: "Outdoor" },
];

export function getFurnitureItem(furnitureType: string): FurnitureCatalogItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === furnitureType);
}

export function getFurnitureByCategory(category: FurnitureCategory): FurnitureCatalogItem[] {
  return FURNITURE_CATALOG.filter((item) => item.category === category);
}
