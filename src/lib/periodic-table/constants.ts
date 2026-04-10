import type {
  ElementCategory,
  ElementState,
  HeatmapProperty,
  PeriodicTableState,
} from "./types";

/**
 * Category color palette — oklch values for vibrant, distinct hues.
 * Each category has a bg (fill), text (foreground), and border color.
 */
export const CATEGORY_COLORS: Record<
  ElementCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  "alkali-metal": {
    bg: "oklch(0.75 0.15 30)",
    text: "oklch(0.25 0.05 30)",
    border: "oklch(0.60 0.18 30)",
    label: "Alkali Metal",
  },
  "alkaline-earth-metal": {
    bg: "oklch(0.80 0.12 75)",
    text: "oklch(0.25 0.05 75)",
    border: "oklch(0.65 0.15 75)",
    label: "Alkaline Earth Metal",
  },
  "transition-metal": {
    bg: "oklch(0.72 0.10 250)",
    text: "oklch(0.20 0.05 250)",
    border: "oklch(0.55 0.13 250)",
    label: "Transition Metal",
  },
  "post-transition-metal": {
    bg: "oklch(0.75 0.08 190)",
    text: "oklch(0.20 0.04 190)",
    border: "oklch(0.58 0.10 190)",
    label: "Post-Transition Metal",
  },
  metalloid: {
    bg: "oklch(0.78 0.12 145)",
    text: "oklch(0.20 0.05 145)",
    border: "oklch(0.60 0.15 145)",
    label: "Metalloid",
  },
  nonmetal: {
    bg: "oklch(0.80 0.14 160)",
    text: "oklch(0.20 0.06 160)",
    border: "oklch(0.62 0.17 160)",
    label: "Nonmetal",
  },
  halogen: {
    bg: "oklch(0.78 0.15 330)",
    text: "oklch(0.25 0.06 330)",
    border: "oklch(0.60 0.18 330)",
    label: "Halogen",
  },
  "noble-gas": {
    bg: "oklch(0.80 0.13 290)",
    text: "oklch(0.25 0.06 290)",
    border: "oklch(0.62 0.16 290)",
    label: "Noble Gas",
  },
  lanthanide: {
    bg: "oklch(0.78 0.10 55)",
    text: "oklch(0.25 0.05 55)",
    border: "oklch(0.62 0.13 55)",
    label: "Lanthanide",
  },
  actinide: {
    bg: "oklch(0.73 0.10 20)",
    text: "oklch(0.25 0.05 20)",
    border: "oklch(0.58 0.13 20)",
    label: "Actinide",
  },
  unknown: {
    bg: "oklch(0.70 0.02 260)",
    text: "oklch(0.25 0.02 260)",
    border: "oklch(0.55 0.03 260)",
    label: "Unknown",
  },
};

/** Dark mode category colors — more saturated, deeper backgrounds */
export const CATEGORY_COLORS_DARK: Record<
  ElementCategory,
  { bg: string; text: string; border: string }
> = {
  "alkali-metal": {
    bg: "oklch(0.35 0.12 30)",
    text: "oklch(0.90 0.08 30)",
    border: "oklch(0.50 0.15 30)",
  },
  "alkaline-earth-metal": {
    bg: "oklch(0.35 0.10 75)",
    text: "oklch(0.90 0.06 75)",
    border: "oklch(0.50 0.12 75)",
  },
  "transition-metal": {
    bg: "oklch(0.30 0.08 250)",
    text: "oklch(0.88 0.05 250)",
    border: "oklch(0.45 0.10 250)",
  },
  "post-transition-metal": {
    bg: "oklch(0.32 0.06 190)",
    text: "oklch(0.88 0.04 190)",
    border: "oklch(0.45 0.08 190)",
  },
  metalloid: {
    bg: "oklch(0.33 0.10 145)",
    text: "oklch(0.90 0.06 145)",
    border: "oklch(0.48 0.12 145)",
  },
  nonmetal: {
    bg: "oklch(0.35 0.12 160)",
    text: "oklch(0.92 0.07 160)",
    border: "oklch(0.50 0.14 160)",
  },
  halogen: {
    bg: "oklch(0.33 0.12 330)",
    text: "oklch(0.90 0.07 330)",
    border: "oklch(0.48 0.15 330)",
  },
  "noble-gas": {
    bg: "oklch(0.33 0.10 290)",
    text: "oklch(0.90 0.07 290)",
    border: "oklch(0.48 0.13 290)",
  },
  lanthanide: {
    bg: "oklch(0.33 0.08 55)",
    text: "oklch(0.90 0.05 55)",
    border: "oklch(0.48 0.10 55)",
  },
  actinide: {
    bg: "oklch(0.30 0.08 20)",
    text: "oklch(0.88 0.05 20)",
    border: "oklch(0.45 0.10 20)",
  },
  unknown: {
    bg: "oklch(0.28 0.02 260)",
    text: "oklch(0.80 0.02 260)",
    border: "oklch(0.40 0.03 260)",
  },
};

/** State colors for temperature mode */
export const STATE_COLORS: Record<
  ElementState,
  { bg: string; bgDark: string; label: string }
> = {
  solid: {
    bg: "oklch(0.70 0.12 250)",
    bgDark: "oklch(0.35 0.10 250)",
    label: "Solid",
  },
  liquid: {
    bg: "oklch(0.75 0.14 163)",
    bgDark: "oklch(0.40 0.12 163)",
    label: "Liquid",
  },
  gas: {
    bg: "oklch(0.80 0.12 55)",
    bgDark: "oklch(0.42 0.10 55)",
    label: "Gas",
  },
  unknown: {
    bg: "oklch(0.65 0.02 260)",
    bgDark: "oklch(0.30 0.02 260)",
    label: "Unknown",
  },
};

/** Heatmap property metadata */
export const HEATMAP_PROPERTIES: Record<
  HeatmapProperty,
  { label: string; unit: string; description: string }
> = {
  electronegativity: {
    label: "Electronegativity",
    unit: "Pauling",
    description: "Tendency to attract electrons in a chemical bond",
  },
  atomicRadius: {
    label: "Atomic Radius",
    unit: "pm",
    description: "Half the distance between two bonded atoms",
  },
  ionizationEnergy: {
    label: "Ionization Energy",
    unit: "kJ/mol",
    description: "Energy required to remove an electron",
  },
  density: {
    label: "Density",
    unit: "g/cm³",
    description: "Mass per unit volume",
  },
  meltingPoint: {
    label: "Melting Point",
    unit: "K",
    description: "Temperature at which solid becomes liquid",
  },
  boilingPoint: {
    label: "Boiling Point",
    unit: "K",
    description: "Temperature at which liquid becomes gas",
  },
  atomicMass: {
    label: "Atomic Mass",
    unit: "u",
    description: "Average mass of an element's atoms",
  },
  electronAffinity: {
    label: "Electron Affinity",
    unit: "kJ/mol",
    description: "Energy change when an electron is added",
  },
};

/** Heatmap gradient stops — low to high (cool → warm) */
export const HEATMAP_GRADIENT = {
  low: "oklch(0.70 0.15 250)", // cool blue
  mid: "oklch(0.80 0.15 163)", // emerald/teal
  high: "oklch(0.75 0.15 30)", // warm orange
};

export const HEATMAP_GRADIENT_DARK = {
  low: "oklch(0.40 0.12 250)",
  mid: "oklch(0.50 0.12 163)",
  high: "oklch(0.45 0.12 30)",
};

/** Default state for the periodic table */
export const DEFAULT_STATE: PeriodicTableState = {
  selectedElement: null,
  viewMode: "category",
  temperature: 298, // room temperature
  heatmapProperty: "electronegativity",
  searchQuery: "",
  activeFilters: {
    categories: [],
    states: [],
    blocks: [],
  },
  comparisonElements: [],
  showComparison: false,
  showMolarMassCalc: false,
  showElectronConfigBuilder: false,
  showExport: false,
  detailPanelOpen: false,
};

/** Table grid dimensions */
export const TABLE_COLS = 18;
export const TABLE_ROWS = 10; // 7 main rows + gap + 2 f-block rows

/** Cell sizing for SVG */
export const CELL_WIDTH = 70;
export const CELL_HEIGHT = 80;
export const CELL_GAP = 2;

/** Temperature range */
export const TEMP_MIN = 0;
export const TEMP_MAX = 6000;
export const TEMP_ROOM = 298;
