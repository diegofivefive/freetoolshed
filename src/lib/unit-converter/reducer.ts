import type { ConverterState, ConverterAction } from "./types";
import { DEFAULT_CATEGORY, DEFAULT_FROM_UNIT, DEFAULT_TO_UNIT, MAX_FAVORITES, MAX_RECENT } from "./constants";

export const INITIAL_STATE: ConverterState = {
  category: DEFAULT_CATEGORY,
  fromUnitId: DEFAULT_FROM_UNIT,
  toUnitId: DEFAULT_TO_UNIT,
  inputValue: "1",
  batchMode: false,
  batchInput: "",
  favorites: [],
  recentConversions: [],
  showFormula: true,
  showGraph: false,
  showScale: false,
};

export function converterReducer(
  state: ConverterState,
  action: ConverterAction
): ConverterState {
  switch (action.type) {
    case "SET_CATEGORY": {
      // When switching categories, pick the first two units of the new category
      // The component will resolve actual unit IDs from the category
      return {
        ...state,
        category: action.payload,
        fromUnitId: "",
        toUnitId: "",
        inputValue: "1",
      };
    }
    case "SET_FROM_UNIT":
      return { ...state, fromUnitId: action.payload };
    case "SET_TO_UNIT":
      return { ...state, toUnitId: action.payload };
    case "SET_INPUT":
      return { ...state, inputValue: action.payload };
    case "SWAP_UNITS":
      return {
        ...state,
        fromUnitId: state.toUnitId,
        toUnitId: state.fromUnitId,
        // Carry the output value as the new input so the value follows the unit
        inputValue: action.payload ?? state.inputValue,
      };
    case "TOGGLE_BATCH":
      return { ...state, batchMode: !state.batchMode, batchInput: "" };
    case "SET_BATCH_INPUT":
      return { ...state, batchInput: action.payload };
    case "ADD_FAVORITE": {
      if (state.favorites.length >= MAX_FAVORITES) return state;
      if (state.favorites.some((f) => f.id === action.payload.id)) return state;
      return { ...state, favorites: [...state.favorites, action.payload] };
    }
    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter((f) => f.id !== action.payload),
      };
    case "ADD_RECENT": {
      const filtered = state.recentConversions.filter(
        (r) =>
          !(
            r.fromUnitId === action.payload.fromUnitId &&
            r.toUnitId === action.payload.toUnitId
          )
      );
      return {
        ...state,
        recentConversions: [action.payload, ...filtered].slice(0, MAX_RECENT),
      };
    }
    case "TOGGLE_FORMULA":
      return { ...state, showFormula: !state.showFormula };
    case "TOGGLE_GRAPH":
      return { ...state, showGraph: !state.showGraph };
    case "TOGGLE_SCALE":
      return { ...state, showScale: !state.showScale };
    case "LOAD_STATE":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...INITIAL_STATE, favorites: state.favorites };
    default:
      return state;
  }
}
