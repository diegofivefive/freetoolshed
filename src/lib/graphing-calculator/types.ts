// ─── Angle Mode ──────────────────────────────────────────────────────────────
export type AngleMode = "radian" | "degree";

// ─── Calculator Modes ────────────────────────────────────────────────────────
export type CalcMode = "graph" | "table" | "stat" | "matrix" | "distribution";

// ─── Graph Types ─────────────────────────────────────────────────────────────
export type FunctionType = "standard" | "parametric" | "polar";

export interface GraphFunction {
  id: string;
  label: string; // Y1, Y2, ... Y0, or X1T/Y1T, or r1
  expression: string;
  /** Parametric only: the Y component expression */
  expressionY?: string;
  type: FunctionType;
  color: string;
  visible: boolean;
  lineWidth: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface TableSettings {
  tblStart: number;
  deltaTbl: number;
  autoMode: boolean;
}

// ─── Parametric / Polar Settings ─────────────────────────────────────────────
export interface ParametricSettings {
  tMin: number;
  tMax: number;
  tStep: number;
}

export interface PolarSettings {
  thetaMin: number;
  thetaMax: number;
  thetaStep: number;
}

// ─── Statistics ──────────────────────────────────────────────────────────────
export type RegressionType = "linear" | "quadratic" | "exponential" | "power";

export interface StatList {
  name: string; // L1 through L6
  data: number[];
}

export interface RegressionResult {
  type: RegressionType;
  equation: string;
  coefficients: Record<string, number>;
  r?: number;
  r2: number;
}

export interface OneVarStats {
  n: number;
  mean: number;
  sumX: number;
  sumX2: number;
  sampleStdDev: number;
  populationStdDev: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

// ─── Matrices ────────────────────────────────────────────────────────────────
export type Matrix = number[][];

export interface NamedMatrix {
  name: string; // [A] through [J]
  rows: number;
  cols: number;
  data: Matrix;
}

// ─── Distributions ───────────────────────────────────────────────────────────
export type DistributionFunction =
  | "normalpdf"
  | "normalcdf"
  | "invNorm"
  | "tpdf"
  | "tcdf"
  | "invT"
  | "chi2pdf"
  | "chi2cdf"
  | "binompdf"
  | "binomcdf"
  | "poissonpdf"
  | "poissoncdf";

export interface DistributionParams {
  fn: DistributionFunction;
  values: Record<string, number>;
}

export interface DistributionResult {
  fn: DistributionFunction;
  params: Record<string, number>;
  result: number;
}

// ─── State ───────────────────────────────────────────────────────────────────
export interface CalcState {
  mode: CalcMode;
  angleMode: AngleMode;

  // Graph
  functions: GraphFunction[];
  viewport: Viewport;
  tableSettings: TableSettings;
  parametricSettings: ParametricSettings;
  polarSettings: PolarSettings;
  traceEnabled: boolean;

  // Stat
  statLists: StatList[];
  activeRegression: RegressionType;
  statPlotEnabled: boolean;
  statPlotXList: string;
  statPlotYList: string;

  // Matrix
  matrices: NamedMatrix[];
  activeMatrix: string;

  // Distribution
  distributionParams: DistributionParams;
  distributionResult: DistributionResult | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────
export type CalcAction =
  | { type: "SET_MODE"; mode: CalcMode }
  | { type: "SET_ANGLE_MODE"; angleMode: AngleMode }
  // Graph actions
  | { type: "ADD_FUNCTION"; fn: GraphFunction }
  | { type: "UPDATE_FUNCTION"; id: string; updates: Partial<GraphFunction> }
  | { type: "REMOVE_FUNCTION"; id: string }
  | { type: "SET_VIEWPORT"; viewport: Viewport }
  | { type: "SET_TABLE_SETTINGS"; settings: Partial<TableSettings> }
  | { type: "SET_PARAMETRIC_SETTINGS"; settings: Partial<ParametricSettings> }
  | { type: "SET_POLAR_SETTINGS"; settings: Partial<PolarSettings> }
  | { type: "TOGGLE_TRACE" }
  // Stat actions
  | { type: "UPDATE_STAT_LIST"; name: string; data: number[] }
  | { type: "SET_REGRESSION_TYPE"; regression: RegressionType }
  | { type: "SET_STAT_PLOT"; enabled: boolean; xList?: string; yList?: string }
  // Matrix actions
  | { type: "SET_MATRIX"; name: string; matrix: NamedMatrix }
  | { type: "SET_ACTIVE_MATRIX"; name: string }
  // Distribution actions
  | { type: "SET_DISTRIBUTION_PARAMS"; params: DistributionParams }
  | { type: "SET_DISTRIBUTION_RESULT"; result: DistributionResult | null }
  // Persistence
  | { type: "LOAD_STATE"; state: CalcState };
