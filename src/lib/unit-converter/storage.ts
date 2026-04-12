import { STORAGE_KEY } from "./constants";
import { persistedStateSchema } from "./schema";
import type { ConverterState } from "./types";

interface PersistedData {
  category: string;
  fromUnitId: string;
  toUnitId: string;
  favorites: ConverterState["favorites"];
  showFormula: boolean;
  showGraph: boolean;
  showScale: boolean;
}

export function saveConverterState(state: ConverterState): void {
  try {
    const data: PersistedData = {
      category: state.category,
      fromUnitId: state.fromUnitId,
      toUnitId: state.toUnitId,
      favorites: state.favorites,
      showFormula: state.showFormula,
      showGraph: state.showGraph,
      showScale: state.showScale,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function loadConverterState(): Partial<ConverterState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validated = persistedStateSchema.safeParse(parsed);
    if (!validated.success) return null;

    return validated.data as Partial<ConverterState>;
  } catch {
    return null;
  }
}
