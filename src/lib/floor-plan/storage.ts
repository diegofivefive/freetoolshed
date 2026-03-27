import type { FloorPlan, SavedFloorPlan, ExportEnvelope } from "./types";
import { exportEnvelopeSchema } from "./schema";
import { createDefaultPlan } from "./constants";

// ── Storage keys ────────────────────────────────────────────

const DRAFT_KEY = "freetoolshed-floor-plan-draft";
const HISTORY_KEY = "freetoolshed-floor-plan-history";

// ── Migration ───────────────────────────────────────────────

export function migrateFloorPlan(raw: Record<string, unknown>): FloorPlan {
  const defaults = createDefaultPlan();

  return {
    id: (raw.id as string) ?? defaults.id,
    name: (raw.name as string) ?? defaults.name,
    width: (raw.width as number) ?? defaults.width,
    height: (raw.height as number) ?? defaults.height,
    unit: (raw.unit as FloorPlan["unit"]) ?? defaults.unit,
    gridSize: (raw.gridSize as number) ?? defaults.gridSize,
    gridSnap: (raw.gridSnap as boolean) ?? defaults.gridSnap,
    showGrid: (raw.showGrid as boolean) ?? defaults.showGrid,
    showDimensions: (raw.showDimensions as boolean) ?? defaults.showDimensions,
    backgroundColor: (raw.backgroundColor as string) ?? defaults.backgroundColor,
    elements: Array.isArray(raw.elements) ? raw.elements : [],
  };
}

// ── Draft persistence ───────────────────────────────────────

export function saveDraft(plan: FloorPlan): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(plan));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function loadDraft(): FloorPlan | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrateFloorPlan(parsed);
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // silently fail
  }
}

// ── Plan history ────────────────────────────────────────────

export function loadHistory(): SavedFloorPlan[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedFloorPlan[];
    return parsed.map((entry) => ({
      ...entry,
      plan: migrateFloorPlan(entry.plan as unknown as Record<string, unknown>),
    }));
  } catch {
    return [];
  }
}

function persistHistory(history: SavedFloorPlan[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function saveToHistory(plan: FloorPlan): SavedFloorPlan {
  const history = loadHistory();
  const now = new Date().toISOString();
  const saved: SavedFloorPlan = {
    id: crypto.randomUUID(),
    plan: structuredClone(plan),
    createdAt: now,
    updatedAt: now,
  };
  history.unshift(saved);
  persistHistory(history);
  return saved;
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter((entry) => entry.id !== id);
  persistHistory(history);
}

export function duplicateFromHistory(id: string): FloorPlan | null {
  const history = loadHistory();
  const source = history.find((entry) => entry.id === id);
  if (!source) return null;

  const cloned = structuredClone(source.plan);
  cloned.id = crypto.randomUUID();
  cloned.name = `${cloned.name} (Copy)`;
  return cloned;
}

// ── JSON export / import ────────────────────────────────────

export function exportPlanJson(plan: FloorPlan): string {
  const saved: SavedFloorPlan = {
    id: crypto.randomUUID(),
    plan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-floor-plan-maker",
    version: 1,
    exportedAt: new Date().toISOString(),
    plans: [saved],
  };
  return JSON.stringify(envelope, null, 2);
}

export function exportAllJson(history: SavedFloorPlan[]): string {
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-floor-plan-maker",
    version: 1,
    exportedAt: new Date().toISOString(),
    plans: history,
  };
  return JSON.stringify(envelope, null, 2);
}

export interface ImportResult {
  success: true;
  plans: SavedFloorPlan[];
}

export interface ImportError {
  success: false;
  error: string;
}

export function parseImportedJson(
  jsonString: string
): ImportResult | ImportError {
  try {
    const parsed = JSON.parse(jsonString);
    const result = exportEnvelopeSchema.safeParse(parsed);

    if (!result.success) {
      return {
        success: false,
        error: "Invalid floor plan file format. Please use a file exported from Free Tool Shed.",
      };
    }

    const plans: SavedFloorPlan[] = result.data.plans.map((entry) => ({
      ...entry,
      plan: migrateFloorPlan(entry.plan as unknown as Record<string, unknown>),
    }));

    return { success: true, plans };
  } catch {
    return {
      success: false,
      error: "Could not read the file. Make sure it is a valid JSON file.",
    };
  }
}
