import type { CalcMode } from "@/lib/graphing-calculator/types";

// ─── Action Types ───────────────────────────────────────────────────────────

export type TI84Action =
  | { type: "mode"; mode: CalcMode }
  | { type: "insert"; text: string }
  | { type: "callback"; key: string }
  | { type: "angleToggle" }
  | { type: "clear" }
  | { type: "delete" }
  | { type: "enter" }
  | { type: "arrow"; direction: "up" | "down" | "left" | "right" }
  | { type: "modifier"; mod: "second" | "alpha" }
  | { type: "noop" };

// ─── Button Color Variants ──────────────────────────────────────────────────

export type TI84ButtonColor =
  | "darkblue"   // top row mode keys (Y=, WINDOW, etc.)
  | "darkgray"   // standard body keys
  | "lightgray"  // number pad keys
  | "yellow"     // 2nd modifier
  | "green"      // ALPHA modifier
  | "enter";     // ENTER key accent

// ─── Button Definition ──────────────────────────────────────────────────────

export interface TI84ButtonDef {
  id: string;
  label: string;
  secondLabel?: string;
  alphaLabel?: string;
  action: TI84Action;
  secondAction?: TI84Action;
  alphaAction?: TI84Action;
  color: TI84ButtonColor;
  colSpan?: number;  // in a 4-col grid, default 1
}

// ─── Section A: Top Row (mode keys) ─────────────────────────────────────────

export const TOP_ROW: TI84ButtonDef[] = [
  {
    id: "y-equals",
    label: "Y=",
    action: { type: "mode", mode: "graph" },
    color: "darkblue",
  },
  {
    id: "window",
    label: "WINDOW",
    secondLabel: "TBLSET",
    action: { type: "callback", key: "zoomStandard" },
    secondAction: { type: "mode", mode: "table" },
    color: "darkblue",
  },
  {
    id: "zoom",
    label: "ZOOM",
    action: { type: "callback", key: "openPalette" },
    color: "darkblue",
  },
  {
    id: "trace",
    label: "TRACE",
    action: { type: "callback", key: "toggleTrace" },
    color: "darkblue",
  },
  {
    id: "graph",
    label: "GRAPH",
    secondLabel: "TABLE",
    action: { type: "mode", mode: "graph" },
    secondAction: { type: "mode", mode: "table" },
    color: "darkblue",
  },
];

// ─── Section B: Modifiers Row ───────────────────────────────────────────────

export const MODIFIERS_ROW: TI84ButtonDef[] = [
  {
    id: "2nd",
    label: "2nd",
    action: { type: "modifier", mod: "second" },
    color: "yellow",
  },
  {
    id: "alpha",
    label: "ALPHA",
    action: { type: "modifier", mod: "alpha" },
    color: "green",
  },
  {
    id: "mode",
    label: "MODE",
    secondLabel: "QUIT",
    action: { type: "angleToggle" },
    secondAction: { type: "callback", key: "resetState" },
    color: "darkgray",
  },
  {
    id: "del",
    label: "DEL",
    secondLabel: "INS",
    action: { type: "delete" },
    secondAction: { type: "noop" },
    color: "darkgray",
  },
  {
    id: "clear",
    label: "CLEAR",
    action: { type: "clear" },
    color: "darkgray",
  },
];

// ─── Section C: Function Access Row ─────────────────────────────────────────

export const FUNCTION_ROW: TI84ButtonDef[] = [
  {
    id: "math",
    label: "MATH",
    action: { type: "callback", key: "openPalette" },
    color: "darkgray",
  },
  {
    id: "stat",
    label: "STAT",
    action: { type: "mode", mode: "stat" },
    color: "darkgray",
  },
  {
    id: "matrix",
    label: "MATRX",
    action: { type: "mode", mode: "matrix" },
    color: "darkgray",
  },
  {
    id: "distr",
    label: "DISTR",
    action: { type: "mode", mode: "distribution" },
    color: "darkgray",
  },
  {
    id: "vars-x",
    label: "X,T,θ,n",
    action: { type: "insert", text: "x" },
    color: "darkgray",
  },
];

// ─── Section D: D-pad ───────────────────────────────────────────────────────
// D-pad is rendered separately as a 3x3 grid — not in a flat array.

export const DPAD_UP: TI84ButtonDef = {
  id: "dpad-up",
  label: "▲",
  action: { type: "arrow", direction: "up" },
  color: "darkgray",
};

export const DPAD_DOWN: TI84ButtonDef = {
  id: "dpad-down",
  label: "▼",
  action: { type: "arrow", direction: "down" },
  color: "darkgray",
};

export const DPAD_LEFT: TI84ButtonDef = {
  id: "dpad-left",
  label: "◄",
  action: { type: "arrow", direction: "left" },
  color: "darkgray",
};

export const DPAD_RIGHT: TI84ButtonDef = {
  id: "dpad-right",
  label: "►",
  action: { type: "arrow", direction: "right" },
  color: "darkgray",
};

export const DPAD_CENTER: TI84ButtonDef = {
  id: "dpad-enter",
  label: "OK",
  action: { type: "enter" },
  color: "darkgray",
};

// ─── Section E: Scientific Functions ────────────────────────────────────────

export const SCIENTIFIC_ROW: TI84ButtonDef[] = [
  {
    id: "sin",
    label: "sin",
    secondLabel: "sin⁻¹",
    action: { type: "insert", text: "sin(" },
    secondAction: { type: "insert", text: "asin(" },
    color: "darkgray",
  },
  {
    id: "cos",
    label: "cos",
    secondLabel: "cos⁻¹",
    action: { type: "insert", text: "cos(" },
    secondAction: { type: "insert", text: "acos(" },
    color: "darkgray",
  },
  {
    id: "tan",
    label: "tan",
    secondLabel: "tan⁻¹",
    action: { type: "insert", text: "tan(" },
    secondAction: { type: "insert", text: "atan(" },
    color: "darkgray",
  },
  {
    id: "power",
    label: "^",
    secondLabel: "√(",
    action: { type: "insert", text: "^" },
    secondAction: { type: "insert", text: "sqrt(" },
    color: "darkgray",
  },
  {
    id: "x-squared",
    label: "x²",
    secondLabel: "³√(",
    action: { type: "insert", text: "^2" },
    secondAction: { type: "insert", text: "cbrt(" },
    color: "darkgray",
  },
];

// ─── Section F: Symbols Row ────────────────────────────────────────────────

export const SYMBOLS_ROW: TI84ButtonDef[] = [
  {
    id: "log",
    label: "log",
    secondLabel: "10^(",
    action: { type: "insert", text: "log(" },
    secondAction: { type: "insert", text: "10^(" },
    color: "darkgray",
  },
  {
    id: "ln",
    label: "ln",
    secondLabel: "e^(",
    action: { type: "insert", text: "ln(" },
    secondAction: { type: "insert", text: "exp(" },
    color: "darkgray",
  },
  {
    id: "lparen",
    label: "(",
    action: { type: "insert", text: "(" },
    color: "darkgray",
  },
  {
    id: "rparen",
    label: ")",
    action: { type: "insert", text: ")" },
    color: "darkgray",
  },
  {
    id: "divide",
    label: "÷",
    secondLabel: "e",
    action: { type: "insert", text: "/" },
    secondAction: { type: "insert", text: "e" },
    color: "darkgray",
  },
];

// ─── Section G: Number Pad ──────────────────────────────────────────────────
// 4 rows of 4 columns: 3 digits + 1 operator per row
// Last row: 0 (span 2), decimal, negate

export const NUMPAD_ROW_1: TI84ButtonDef[] = [
  { id: "7", label: "7", action: { type: "insert", text: "7" }, color: "lightgray" },
  { id: "8", label: "8", action: { type: "insert", text: "8" }, color: "lightgray" },
  { id: "9", label: "9", action: { type: "insert", text: "9" }, color: "lightgray" },
  { id: "multiply", label: "×", action: { type: "insert", text: "*" }, color: "darkgray" },
];

export const NUMPAD_ROW_2: TI84ButtonDef[] = [
  { id: "4", label: "4", action: { type: "insert", text: "4" }, color: "lightgray" },
  { id: "5", label: "5", action: { type: "insert", text: "5" }, color: "lightgray" },
  { id: "6", label: "6", action: { type: "insert", text: "6" }, color: "lightgray" },
  { id: "subtract", label: "−", action: { type: "insert", text: "-" }, color: "darkgray" },
];

export const NUMPAD_ROW_3: TI84ButtonDef[] = [
  { id: "1", label: "1", action: { type: "insert", text: "1" }, color: "lightgray" },
  { id: "2", label: "2", action: { type: "insert", text: "2" }, color: "lightgray" },
  { id: "3", label: "3", action: { type: "insert", text: "3" }, color: "lightgray" },
  { id: "add", label: "+", action: { type: "insert", text: "+" }, color: "darkgray" },
];

export const NUMPAD_ROW_4: TI84ButtonDef[] = [
  {
    id: "0",
    label: "0",
    action: { type: "insert", text: "0" },
    color: "lightgray",
    colSpan: 2,
  },
  { id: "decimal", label: ".", action: { type: "insert", text: "." }, color: "lightgray" },
  {
    id: "negate",
    label: "(−)",
    secondLabel: "π",
    action: { type: "insert", text: "-" },
    secondAction: { type: "insert", text: "pi" },
    color: "darkgray",
  },
];

// ─── Section H: Bottom Enter ────────────────────────────────────────────────

export const ENTER_KEY: TI84ButtonDef = {
  id: "enter",
  label: "ENTER",
  action: { type: "enter" },
  color: "enter",
  colSpan: 4,
};

// ─── All Sections (for convenience) ─────────────────────────────────────────

export const ALL_5COL_ROWS = [
  TOP_ROW,
  MODIFIERS_ROW,
  FUNCTION_ROW,
  SCIENTIFIC_ROW,
  SYMBOLS_ROW,
] as const;

export const NUMPAD_ROWS = [
  NUMPAD_ROW_1,
  NUMPAD_ROW_2,
  NUMPAD_ROW_3,
  NUMPAD_ROW_4,
] as const;
