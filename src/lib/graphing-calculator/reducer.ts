import type { CalcState, CalcAction } from "./types";
import {
  DEFAULT_VIEWPORT,
  DEFAULT_TABLE_SETTINGS,
  DEFAULT_PARAMETRIC_SETTINGS,
  DEFAULT_POLAR_SETTINGS,
  DEFAULT_DISTRIBUTION_PARAMS,
  STAT_LIST_NAMES,
  MATRIX_NAMES,
  DEFAULT_MATRIX_SIZE,
} from "./constants";

export const INITIAL_STATE: CalcState = {
  mode: "graph",
  angleMode: "radian",

  // Graph
  functions: [],
  viewport: { ...DEFAULT_VIEWPORT },
  tableSettings: { ...DEFAULT_TABLE_SETTINGS },
  parametricSettings: { ...DEFAULT_PARAMETRIC_SETTINGS },
  polarSettings: { ...DEFAULT_POLAR_SETTINGS },
  traceEnabled: false,

  // Stat
  statLists: STAT_LIST_NAMES.map((name) => ({ name, data: [] })),
  activeRegression: "linear",
  statPlotEnabled: false,
  statPlotXList: "L1",
  statPlotYList: "L2",

  // Matrix
  matrices: MATRIX_NAMES.map((name) => ({
    name,
    rows: DEFAULT_MATRIX_SIZE,
    cols: DEFAULT_MATRIX_SIZE,
    data: Array.from({ length: DEFAULT_MATRIX_SIZE }, () =>
      new Array(DEFAULT_MATRIX_SIZE).fill(0)
    ),
  })),
  activeMatrix: "[A]",

  // Distribution
  distributionParams: { ...DEFAULT_DISTRIBUTION_PARAMS },
  distributionResult: null,
};

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_ANGLE_MODE":
      return { ...state, angleMode: action.angleMode };

    // ── Graph ──────────────────────────────────────────────────────────
    case "ADD_FUNCTION":
      return { ...state, functions: [...state.functions, action.fn] };

    case "UPDATE_FUNCTION":
      return {
        ...state,
        functions: state.functions.map((fn) =>
          fn.id === action.id ? { ...fn, ...action.updates } : fn
        ),
      };

    case "REMOVE_FUNCTION":
      return {
        ...state,
        functions: state.functions.filter((fn) => fn.id !== action.id),
      };

    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };

    case "SET_TABLE_SETTINGS":
      return {
        ...state,
        tableSettings: { ...state.tableSettings, ...action.settings },
      };

    case "SET_PARAMETRIC_SETTINGS":
      return {
        ...state,
        parametricSettings: { ...state.parametricSettings, ...action.settings },
      };

    case "SET_POLAR_SETTINGS":
      return {
        ...state,
        polarSettings: { ...state.polarSettings, ...action.settings },
      };

    case "TOGGLE_TRACE":
      return { ...state, traceEnabled: !state.traceEnabled };

    // ── Stat ───────────────────────────────────────────────────────────
    case "UPDATE_STAT_LIST":
      return {
        ...state,
        statLists: state.statLists.map((list) =>
          list.name === action.name ? { ...list, data: action.data } : list
        ),
      };

    case "SET_REGRESSION_TYPE":
      return { ...state, activeRegression: action.regression };

    case "SET_STAT_PLOT":
      return {
        ...state,
        statPlotEnabled: action.enabled,
        statPlotXList: action.xList ?? state.statPlotXList,
        statPlotYList: action.yList ?? state.statPlotYList,
      };

    // ── Matrix ─────────────────────────────────────────────────────────
    case "SET_MATRIX":
      return {
        ...state,
        matrices: state.matrices.map((m) =>
          m.name === action.name ? action.matrix : m
        ),
      };

    case "SET_ACTIVE_MATRIX":
      return { ...state, activeMatrix: action.name };

    // ── Distribution ───────────────────────────────────────────────────
    case "SET_DISTRIBUTION_PARAMS":
      return { ...state, distributionParams: action.params };

    case "SET_DISTRIBUTION_RESULT":
      return { ...state, distributionResult: action.result };

    // ── Persistence ────────────────────────────────────────────────────
    case "LOAD_STATE":
      return action.state;

    default:
      return state;
  }
}
