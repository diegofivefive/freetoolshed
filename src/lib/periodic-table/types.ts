/** Physical state of an element at a given temperature */
export type ElementState = "solid" | "liquid" | "gas" | "unknown";

/** Electron shell block classification */
export type Block = "s" | "p" | "d" | "f";

/** Element category for color-coding */
export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth-metal"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

/** Crystal structure type */
export type CrystalStructure =
  | "fcc"
  | "bcc"
  | "hcp"
  | "simple-cubic"
  | "diamond-cubic"
  | "rhombohedral"
  | "orthorhombic"
  | "tetragonal"
  | "monoclinic"
  | "triclinic"
  | "hexagonal"
  | "unknown";

/** Isotope data */
export interface Isotope {
  massNumber: number;
  abundance: number | null; // percentage, null if synthetic
  halfLife: string | null; // null if stable
}

/** Core element data — one entry per element */
export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number; // in u (unified atomic mass units)
  category: ElementCategory;
  block: Block;
  group: number | null; // 1-18, null for lanthanides/actinides
  period: number; // 1-7
  electronConfiguration: string; // e.g. "[Ar] 3d6 4s2"
  electronShells: number[]; // e.g. [2, 8, 14, 2]
  electronegativity: number | null; // Pauling scale
  atomicRadius: number | null; // in pm
  ionizationEnergy: number | null; // in kJ/mol
  electronAffinity: number | null; // in kJ/mol
  meltingPoint: number | null; // in K
  boilingPoint: number | null; // in K
  density: number | null; // in g/cm³ (g/L for gases)
  stateAtRT: ElementState; // state at 298K
  crystalStructure: CrystalStructure;
  yearDiscovered: number | string | null; // number or "Ancient"
  discoverer: string | null;
  nameOrigin: string;
  uses: string[];
  isotopes: Isotope[];
  // Grid position for rendering
  gridRow: number; // 0-indexed row in table layout
  gridCol: number; // 0-indexed column in table layout
}

/** View modes for the periodic table */
export type ViewMode =
  | "category" // default: colored by element category
  | "temperature" // phase state at selected temp
  | "heatmap"; // gradient by selected property

/** Properties available for heatmap visualization */
export type HeatmapProperty =
  | "electronegativity"
  | "atomicRadius"
  | "ionizationEnergy"
  | "density"
  | "meltingPoint"
  | "boilingPoint"
  | "atomicMass"
  | "electronAffinity";

/** Main periodic table application state */
export interface PeriodicTableState {
  selectedElement: Element | null;
  viewMode: ViewMode;
  temperature: number; // in K
  heatmapProperty: HeatmapProperty;
  searchQuery: string;
  activeFilters: {
    categories: ElementCategory[];
    states: ElementState[];
    blocks: Block[];
  };
  comparisonElements: Element[]; // max 4
  showComparison: boolean;
  showMolarMassCalc: boolean;
  showElectronConfigBuilder: boolean;
  showExport: boolean;
  detailPanelOpen: boolean;
}

/** Actions for the periodic table reducer */
export type PeriodicTableAction =
  | { type: "SELECT_ELEMENT"; payload: Element | null }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SET_TEMPERATURE"; payload: number }
  | { type: "SET_HEATMAP_PROPERTY"; payload: HeatmapProperty }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "TOGGLE_CATEGORY_FILTER"; payload: ElementCategory }
  | { type: "TOGGLE_STATE_FILTER"; payload: ElementState }
  | { type: "TOGGLE_BLOCK_FILTER"; payload: Block }
  | { type: "CLEAR_FILTERS" }
  | { type: "ADD_COMPARISON"; payload: Element }
  | { type: "REMOVE_COMPARISON"; payload: number } // atomicNumber
  | { type: "CLEAR_COMPARISON" }
  | { type: "TOGGLE_COMPARISON" }
  | { type: "TOGGLE_MOLAR_MASS_CALC" }
  | { type: "TOGGLE_ELECTRON_CONFIG_BUILDER" }
  | { type: "TOGGLE_EXPORT" }
  | { type: "OPEN_DETAIL_PANEL" }
  | { type: "CLOSE_DETAIL_PANEL" }
  | { type: "RESET" };
