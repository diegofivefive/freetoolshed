import type { CalcState } from "./types";
import { STORAGE_KEY } from "./constants";
import { INITIAL_STATE } from "./reducer";

/** Persisted subset of CalcState — only user preferences and entered data */
interface PersistedState {
  angleMode: CalcState["angleMode"];
  functions: CalcState["functions"];
  viewport: CalcState["viewport"];
  tableSettings: CalcState["tableSettings"];
  statLists: CalcState["statLists"];
  matrices: CalcState["matrices"];
}

/** Save calculator state to localStorage */
export function saveCalcState(state: CalcState): void {
  try {
    const persisted: PersistedState = {
      angleMode: state.angleMode,
      functions: state.functions,
      viewport: state.viewport,
      tableSettings: state.tableSettings,
      statLists: state.statLists,
      matrices: state.matrices,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}

/** Load calculator state from localStorage, merging with defaults */
export function loadCalcState(): CalcState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;

    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    // Validate and merge with defaults
    const angleMode =
      parsed.angleMode === "radian" || parsed.angleMode === "degree"
        ? parsed.angleMode
        : INITIAL_STATE.angleMode;

    const functions = Array.isArray(parsed.functions)
      ? parsed.functions
      : INITIAL_STATE.functions;

    const viewport =
      parsed.viewport &&
      typeof parsed.viewport.xMin === "number" &&
      typeof parsed.viewport.xMax === "number" &&
      typeof parsed.viewport.yMin === "number" &&
      typeof parsed.viewport.yMax === "number"
        ? parsed.viewport
        : INITIAL_STATE.viewport;

    const tableSettings =
      parsed.tableSettings &&
      typeof parsed.tableSettings.tblStart === "number" &&
      typeof parsed.tableSettings.deltaTbl === "number"
        ? { ...INITIAL_STATE.tableSettings, ...parsed.tableSettings }
        : INITIAL_STATE.tableSettings;

    const statLists = Array.isArray(parsed.statLists)
      ? parsed.statLists
      : INITIAL_STATE.statLists;

    const matrices = Array.isArray(parsed.matrices)
      ? parsed.matrices
      : INITIAL_STATE.matrices;

    return {
      ...INITIAL_STATE,
      angleMode,
      functions,
      viewport,
      tableSettings,
      statLists,
      matrices,
    };
  } catch {
    return INITIAL_STATE;
  }
}
