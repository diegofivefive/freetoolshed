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
}

// ─── Row 1: Top Function Keys ───────────────────────────────────────────────

export const ROW_1: TI84ButtonDef[] = [
  {
    id: "y-equals",
    label: "y=",
    secondLabel: "stat plot",
    action: { type: "mode", mode: "graph" },
    secondAction: { type: "mode", mode: "stat" },
    color: "darkblue",
  },
  {
    id: "window",
    label: "window",
    secondLabel: "tblset",
    action: { type: "callback", key: "zoomStandard" },
    secondAction: { type: "mode", mode: "table" },
    color: "darkblue",
  },
  {
    id: "zoom",
    label: "zoom",
    secondLabel: "format",
    action: { type: "callback", key: "openPalette" },
    secondAction: { type: "noop" },
    color: "darkblue",
  },
  {
    id: "trace",
    label: "trace",
    secondLabel: "calc",
    action: { type: "callback", key: "toggleTrace" },
    secondAction: { type: "callback", key: "openPalette" },
    color: "darkblue",
  },
  {
    id: "graph",
    label: "graph",
    secondLabel: "table",
    action: { type: "mode", mode: "graph" },
    secondAction: { type: "mode", mode: "table" },
    color: "darkblue",
  },
];

// ─── Row 2: Modifiers ───────────────────────────────────────────────────────

export const ROW_2: (TI84ButtonDef | null)[] = [
  {
    id: "2nd",
    label: "2nd",
    action: { type: "modifier", mod: "second" },
    color: "yellow",
  },
  {
    id: "mode",
    label: "mode",
    secondLabel: "quit",
    action: { type: "angleToggle" },
    secondAction: { type: "callback", key: "resetState" },
    color: "darkgray",
  },
  {
    id: "del",
    label: "del",
    secondLabel: "ins",
    action: { type: "delete" },
    secondAction: { type: "noop" },
    color: "darkgray",
  },
  null, // gap
  {
    id: "clear",
    label: "clear",
    action: { type: "clear" },
    color: "darkgray",
  },
];

// ─── Row 3: Alpha + Variable Keys (left of D-pad) ──────────────────────────

export const ROW_3: TI84ButtonDef[] = [
  {
    id: "alpha",
    label: "alpha",
    secondLabel: "A-lock",
    action: { type: "modifier", mod: "alpha" },
    secondAction: { type: "modifier", mod: "alpha" },
    color: "green",
  },
  {
    id: "vars-x",
    label: "X,T,\u03B8,n",
    secondLabel: "link",
    action: { type: "insert", text: "x" },
    secondAction: { type: "noop" },
    color: "darkgray",
  },
  {
    id: "stat",
    label: "stat",
    secondLabel: "list",
    action: { type: "mode", mode: "stat" },
    secondAction: { type: "noop" },
    color: "darkgray",
  },
];

// ─── Row 4: Menu Keys (left of D-pad) ──────────────────────────────────────

export const ROW_4: TI84ButtonDef[] = [
  {
    id: "math",
    label: "math",
    secondLabel: "test",
    alphaLabel: "A",
    action: { type: "callback", key: "openPalette" },
    secondAction: { type: "noop" },
    alphaAction: { type: "insert", text: "A" },
    color: "darkgray",
  },
  {
    id: "apps",
    label: "apps",
    secondLabel: "angle",
    alphaLabel: "B",
    action: { type: "noop" },
    secondAction: { type: "noop" },
    alphaAction: { type: "insert", text: "B" },
    color: "darkgray",
  },
  {
    id: "prgm",
    label: "prgm",
    secondLabel: "draw",
    alphaLabel: "C",
    action: { type: "noop" },
    secondAction: { type: "noop" },
    alphaAction: { type: "insert", text: "C" },
    color: "darkgray",
  },
  {
    id: "vars",
    label: "vars",
    secondLabel: "distr",
    action: { type: "noop" },
    secondAction: { type: "mode", mode: "distribution" },
    color: "darkgray",
  },
];

// ─── D-pad ──────────────────────────────────────────────────────────────────

export const DPAD_UP: TI84ButtonDef = {
  id: "dpad-up",
  label: "\u25B2",
  action: { type: "arrow", direction: "up" },
  color: "darkgray",
};

export const DPAD_DOWN: TI84ButtonDef = {
  id: "dpad-down",
  label: "\u25BC",
  action: { type: "arrow", direction: "down" },
  color: "darkgray",
};

export const DPAD_LEFT: TI84ButtonDef = {
  id: "dpad-left",
  label: "\u25C4",
  action: { type: "arrow", direction: "left" },
  color: "darkgray",
};

export const DPAD_RIGHT: TI84ButtonDef = {
  id: "dpad-right",
  label: "\u25BA",
  action: { type: "arrow", direction: "right" },
  color: "darkgray",
};

export const DPAD_CENTER: TI84ButtonDef = {
  id: "dpad-enter",
  label: "OK",
  action: { type: "enter" },
  color: "darkgray",
};

// ─── Row 5: Inverse / Trig / Power ─────────────────────────────────────────

export const ROW_5: TI84ButtonDef[] = [
  {
    id: "x-inverse",
    label: "x\u207B\u00B9",
    secondLabel: "matrix",
    alphaLabel: "D",
    action: { type: "insert", text: "^(-1)" },
    secondAction: { type: "mode", mode: "matrix" },
    alphaAction: { type: "insert", text: "D" },
    color: "darkgray",
  },
  {
    id: "sin",
    label: "sin",
    secondLabel: "sin\u207B\u00B9",
    alphaLabel: "E",
    action: { type: "insert", text: "sin(" },
    secondAction: { type: "insert", text: "asin(" },
    alphaAction: { type: "insert", text: "E" },
    color: "darkgray",
  },
  {
    id: "cos",
    label: "cos",
    secondLabel: "cos\u207B\u00B9",
    alphaLabel: "F",
    action: { type: "insert", text: "cos(" },
    secondAction: { type: "insert", text: "acos(" },
    alphaAction: { type: "insert", text: "F" },
    color: "darkgray",
  },
  {
    id: "tan",
    label: "tan",
    secondLabel: "tan\u207B\u00B9",
    alphaLabel: "G",
    action: { type: "insert", text: "tan(" },
    secondAction: { type: "insert", text: "atan(" },
    alphaAction: { type: "insert", text: "G" },
    color: "darkgray",
  },
  {
    id: "power",
    label: "^",
    secondLabel: "\u03C0",
    alphaLabel: "H",
    action: { type: "insert", text: "^" },
    secondAction: { type: "insert", text: "pi" },
    alphaAction: { type: "insert", text: "H" },
    color: "darkgray",
  },
];

// ─── Row 6: Square / Parens / Divide ────────────────────────────────────────

export const ROW_6: TI84ButtonDef[] = [
  {
    id: "x-squared",
    label: "x\u00B2",
    secondLabel: "\u221A",
    alphaLabel: "I",
    action: { type: "insert", text: "^2" },
    secondAction: { type: "insert", text: "sqrt(" },
    alphaAction: { type: "insert", text: "I" },
    color: "darkgray",
  },
  {
    id: "comma",
    label: ",",
    secondLabel: "EE",
    alphaLabel: "J",
    action: { type: "insert", text: "," },
    secondAction: { type: "insert", text: "E" },
    alphaAction: { type: "insert", text: "J" },
    color: "darkgray",
  },
  {
    id: "lparen",
    label: "(",
    secondLabel: "{",
    alphaLabel: "K",
    action: { type: "insert", text: "(" },
    secondAction: { type: "insert", text: "{" },
    alphaAction: { type: "insert", text: "K" },
    color: "darkgray",
  },
  {
    id: "rparen",
    label: ")",
    secondLabel: "}",
    alphaLabel: "L",
    action: { type: "insert", text: ")" },
    secondAction: { type: "insert", text: "}" },
    alphaAction: { type: "insert", text: "L" },
    color: "darkgray",
  },
  {
    id: "divide",
    label: "\u00F7",
    secondLabel: "e",
    alphaLabel: "M",
    action: { type: "insert", text: "/" },
    secondAction: { type: "insert", text: "e" },
    alphaAction: { type: "insert", text: "M" },
    color: "darkgray",
  },
];

// ─── Row 7: Log + 7 8 9 x ──────────────────────────────────────────────────

export const ROW_7: TI84ButtonDef[] = [
  {
    id: "log",
    label: "log",
    secondLabel: "10\u02E3",
    alphaLabel: "N",
    action: { type: "insert", text: "log(" },
    secondAction: { type: "insert", text: "10^(" },
    alphaAction: { type: "insert", text: "N" },
    color: "darkgray",
  },
  {
    id: "7",
    label: "7",
    alphaLabel: "O",
    action: { type: "insert", text: "7" },
    alphaAction: { type: "insert", text: "O" },
    color: "lightgray",
  },
  {
    id: "8",
    label: "8",
    alphaLabel: "P",
    action: { type: "insert", text: "8" },
    alphaAction: { type: "insert", text: "P" },
    color: "lightgray",
  },
  {
    id: "9",
    label: "9",
    alphaLabel: "Q",
    action: { type: "insert", text: "9" },
    alphaAction: { type: "insert", text: "Q" },
    color: "lightgray",
  },
  {
    id: "multiply",
    label: "\u00D7",
    alphaLabel: "R",
    action: { type: "insert", text: "*" },
    alphaAction: { type: "insert", text: "R" },
    color: "darkgray",
  },
];

// ─── Row 8: Ln + 4 5 6 - ───────────────────────────────────────────────────

export const ROW_8: TI84ButtonDef[] = [
  {
    id: "ln",
    label: "ln",
    secondLabel: "e\u02E3",
    alphaLabel: "S",
    action: { type: "insert", text: "ln(" },
    secondAction: { type: "insert", text: "exp(" },
    alphaAction: { type: "insert", text: "S" },
    color: "darkgray",
  },
  {
    id: "4",
    label: "4",
    alphaLabel: "T",
    action: { type: "insert", text: "4" },
    alphaAction: { type: "insert", text: "T" },
    color: "lightgray",
  },
  {
    id: "5",
    label: "5",
    alphaLabel: "U",
    action: { type: "insert", text: "5" },
    alphaAction: { type: "insert", text: "U" },
    color: "lightgray",
  },
  {
    id: "6",
    label: "6",
    alphaLabel: "V",
    action: { type: "insert", text: "6" },
    alphaAction: { type: "insert", text: "V" },
    color: "lightgray",
  },
  {
    id: "subtract",
    label: "\u2212",
    alphaLabel: "W",
    action: { type: "insert", text: "-" },
    alphaAction: { type: "insert", text: "W" },
    color: "darkgray",
  },
];

// ─── Row 9: Sto + 1 2 3 + ──────────────────────────────────────────────────

export const ROW_9: TI84ButtonDef[] = [
  {
    id: "sto",
    label: "sto\u2192",
    secondLabel: "rcl",
    alphaLabel: "X",
    action: { type: "noop" },
    secondAction: { type: "noop" },
    alphaAction: { type: "insert", text: "X" },
    color: "darkgray",
  },
  {
    id: "1",
    label: "1",
    alphaLabel: "Y",
    action: { type: "insert", text: "1" },
    alphaAction: { type: "insert", text: "Y" },
    color: "lightgray",
  },
  {
    id: "2",
    label: "2",
    alphaLabel: "Z",
    action: { type: "insert", text: "2" },
    alphaAction: { type: "insert", text: "Z" },
    color: "lightgray",
  },
  {
    id: "3",
    label: "3",
    alphaLabel: "\u03B8",
    action: { type: "insert", text: "3" },
    alphaAction: { type: "insert", text: "theta" },
    color: "lightgray",
  },
  {
    id: "add",
    label: "+",
    secondLabel: "mem",
    alphaLabel: "\"",
    action: { type: "insert", text: "+" },
    secondAction: { type: "noop" },
    alphaAction: { type: "insert", text: "\"" },
    color: "darkgray",
  },
];

// ─── Row 10: On + 0 . (-) Enter ────────────────────────────────────────────

export const ROW_10: TI84ButtonDef[] = [
  {
    id: "on",
    label: "on",
    secondLabel: "off",
    action: { type: "noop" },
    secondAction: { type: "noop" },
    color: "darkgray",
  },
  {
    id: "0",
    label: "0",
    secondLabel: "catalog",
    action: { type: "insert", text: "0" },
    secondAction: { type: "callback", key: "openPalette" },
    color: "lightgray",
  },
  {
    id: "decimal",
    label: ".",
    secondLabel: ":",
    action: { type: "insert", text: "." },
    secondAction: { type: "insert", text: ":" },
    color: "lightgray",
  },
  {
    id: "negate",
    label: "(\u2212)",
    secondLabel: "ans",
    alphaLabel: "?",
    action: { type: "insert", text: "-" },
    secondAction: { type: "insert", text: "ans" },
    alphaAction: { type: "insert", text: "?" },
    color: "darkgray",
  },
  {
    id: "enter",
    label: "enter",
    secondLabel: "solve",
    action: { type: "enter" },
    secondAction: { type: "enter" },
    color: "enter",
  },
];

// ─── Full-body rows for rendering (rows 5-10, all 5 columns) ───────────────

export const BODY_ROWS: TI84ButtonDef[][] = [
  ROW_5,
  ROW_6,
  ROW_7,
  ROW_8,
  ROW_9,
  ROW_10,
];
