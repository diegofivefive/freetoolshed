import type {
  Viewport,
  TableSettings,
  ParametricSettings,
  PolarSettings,
  DistributionParams,
} from "./types";

// ─── Viewport Defaults ──────────────────────────────────────────────────────
export const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

export const TRIG_VIEWPORT: Viewport = {
  xMin: -2 * Math.PI,
  xMax: 2 * Math.PI,
  yMin: -4,
  yMax: 4,
};

export const ZOOM_MIN = 0.001;
export const ZOOM_MAX = 1_000_000;
export const ZOOM_FACTOR = 1.25;

// ─── Graph Rendering ─────────────────────────────────────────────────────────
export const DEFAULT_RESOLUTION = 1000; // points per function
export const MIN_RESOLUTION = 200;
export const MAX_RESOLUTION = 5000;
export const DEFAULT_LINE_WIDTH = 2;
export const GRID_LINE_WIDTH = 0.5;
export const AXIS_LINE_WIDTH = 1.5;
export const TRACE_POINT_RADIUS = 5;

/** Threshold for detecting discontinuities (e.g., 1/x near x=0) */
export const DISCONTINUITY_THRESHOLD = 1000;

// ─── Function Color Palette ─────────────────────────────────────────────────
/** 10 colors for Y1–Y0, chosen for legibility on both dark and light themes */
export const FUNCTION_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#a855f7", // purple-500
] as const;

// ─── Function Labels ─────────────────────────────────────────────────────────
export const STANDARD_LABELS = [
  "Y1",
  "Y2",
  "Y3",
  "Y4",
  "Y5",
  "Y6",
  "Y7",
  "Y8",
  "Y9",
  "Y0",
] as const;

export const PARAMETRIC_LABELS = [
  ["X1T", "Y1T"],
  ["X2T", "Y2T"],
  ["X3T", "Y3T"],
  ["X4T", "Y4T"],
  ["X5T", "Y5T"],
  ["X6T", "Y6T"],
] as const;

export const POLAR_LABELS = [
  "r1",
  "r2",
  "r3",
  "r4",
  "r5",
  "r6",
] as const;

// ─── Table Defaults ──────────────────────────────────────────────────────────
export const DEFAULT_TABLE_SETTINGS: TableSettings = {
  tblStart: 0,
  deltaTbl: 1,
  autoMode: true,
};

// ─── Parametric / Polar Defaults ─────────────────────────────────────────────
export const DEFAULT_PARAMETRIC_SETTINGS: ParametricSettings = {
  tMin: 0,
  tMax: 2 * Math.PI,
  tStep: Math.PI / 60,
};

export const DEFAULT_POLAR_SETTINGS: PolarSettings = {
  thetaMin: 0,
  thetaMax: 2 * Math.PI,
  thetaStep: Math.PI / 60,
};

// ─── Stat List Names ─────────────────────────────────────────────────────────
export const STAT_LIST_NAMES = ["L1", "L2", "L3", "L4", "L5", "L6"] as const;

// ─── Matrix Names ────────────────────────────────────────────────────────────
export const MATRIX_NAMES = [
  "[A]",
  "[B]",
  "[C]",
  "[D]",
  "[E]",
  "[F]",
  "[G]",
  "[H]",
  "[I]",
  "[J]",
] as const;

export const DEFAULT_MATRIX_SIZE = 3;
export const MAX_MATRIX_SIZE = 10;

// ─── Distribution Defaults ───────────────────────────────────────────────────
export const DEFAULT_DISTRIBUTION_PARAMS: DistributionParams = {
  fn: "normalcdf",
  values: { lower: -1, upper: 1, mean: 0, stdev: 1 },
};

// ─── LocalStorage Key ────────────────────────────────────────────────────────
export const STORAGE_KEY = "freetoolshed-graphing-calculator";
