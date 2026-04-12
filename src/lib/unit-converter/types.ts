// ─── Category IDs ──────────────────────────────────────────────────────────

export type CategoryId =
  | "length"
  | "mass"
  | "temperature"
  | "volume"
  | "area"
  | "speed"
  | "time"
  | "pressure"
  | "energy"
  | "power"
  | "data"
  | "angle"
  | "force"
  | "torque"
  | "frequency"
  | "fuel-economy"
  | "viscosity"
  | "thermal-conductivity"
  | "flow-rate"
  | "illuminance"
  | "electric-current"
  | "voltage"
  | "cooking";

// ─── Unit Definitions ──────────────────────────────────────────────────────

export interface LinearUnit {
  id: string;
  name: string;
  symbol: string;
  aliases: string[];
  category: CategoryId;
  factor: number;
  offset?: number;
}

export interface FunctionUnit {
  id: string;
  name: string;
  symbol: string;
  aliases: string[];
  category: CategoryId;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export type UnitDefinition = LinearUnit | FunctionUnit;

export function isFunctionUnit(unit: UnitDefinition): unit is FunctionUnit {
  return "toBase" in unit && typeof unit.toBase === "function";
}

// ─── Category Definition ───────────────────────────────────────────────────

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  icon: string;
  baseUnit: string;
  units: UnitDefinition[];
}

// ─── Conversion Results ────────────────────────────────────────────────────

export interface ConversionResult {
  inputValue: number;
  outputValue: number;
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  formula: string;
}

export interface BatchResult {
  index: number;
  inputValue: number;
  outputValue: number;
  valid: boolean;
  error?: string;
}

// ─── Favorites & History ───────────────────────────────────────────────────

export interface FavoritePair {
  id: string;
  category: CategoryId;
  fromUnitId: string;
  toUnitId: string;
  label: string;
}

export interface ConversionRecord {
  timestamp: number;
  category: CategoryId;
  fromUnitId: string;
  toUnitId: string;
  inputValue: number;
  outputValue: number;
}

// ─── Formula Steps ─────────────────────────────────────────────────────────

export interface FormulaStep {
  label: string;
  expression: string;
  result: number;
}

// ─── State Management ──────────────────────────────────────────────────────

export interface ConverterState {
  category: CategoryId;
  fromUnitId: string;
  toUnitId: string;
  inputValue: string;
  batchMode: boolean;
  batchInput: string;
  favorites: FavoritePair[];
  recentConversions: ConversionRecord[];
  showFormula: boolean;
  showGraph: boolean;
  showScale: boolean;
}

export type ConverterAction =
  | { type: "SET_CATEGORY"; payload: CategoryId }
  | { type: "SET_FROM_UNIT"; payload: string }
  | { type: "SET_TO_UNIT"; payload: string }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SWAP_UNITS"; payload?: string }
  | { type: "TOGGLE_BATCH" }
  | { type: "SET_BATCH_INPUT"; payload: string }
  | { type: "ADD_FAVORITE"; payload: FavoritePair }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "ADD_RECENT"; payload: ConversionRecord }
  | { type: "TOGGLE_FORMULA" }
  | { type: "TOGGLE_GRAPH" }
  | { type: "TOGGLE_SCALE" }
  | { type: "LOAD_STATE"; payload: Partial<ConverterState> }
  | { type: "RESET" };
