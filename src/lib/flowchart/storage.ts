import type {
  FlowchartDiagram,
  SavedDiagram,
  ExportEnvelope,
} from "./types";
import { exportEnvelopeSchema } from "./schema";
import { createDefaultDiagram } from "./constants";

// ── Storage keys ────────────────────────────────────────────

const DRAFT_KEY = "freetoolshed-flowchart-draft";
const HISTORY_KEY = "freetoolshed-flowchart-history";

// ── Migration ───────────────────────────────────────────────

export function migrateDiagram(
  raw: Record<string, unknown>
): FlowchartDiagram {
  const defaults = createDefaultDiagram();

  return {
    id: (raw.id as string) ?? defaults.id,
    name: (raw.name as string) ?? defaults.name,
    nodes: Array.isArray(raw.nodes) ? raw.nodes : [],
    edges: Array.isArray(raw.edges) ? raw.edges : [],
    gridSize: (raw.gridSize as number) ?? defaults.gridSize,
    gridSnap: (raw.gridSnap as boolean) ?? defaults.gridSnap,
    gridVisible: (raw.gridVisible as boolean) ?? defaults.gridVisible,
    backgroundColor:
      (raw.backgroundColor as string) ?? defaults.backgroundColor,
  };
}

// ── Draft persistence ───────────────────────────────────────

export function saveDraft(diagram: FlowchartDiagram): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(diagram));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function loadDraft(): FlowchartDiagram | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrateDiagram(parsed);
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

// ── Diagram history ─────────────────────────────────────────

export function loadHistory(): SavedDiagram[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDiagram[];
    return parsed.map((entry) => ({
      ...entry,
      diagram: migrateDiagram(
        entry.diagram as unknown as Record<string, unknown>
      ),
    }));
  } catch {
    return [];
  }
}

function persistHistory(history: SavedDiagram[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function saveToHistory(diagram: FlowchartDiagram): SavedDiagram {
  const history = loadHistory();
  const now = new Date().toISOString();
  const saved: SavedDiagram = {
    id: crypto.randomUUID(),
    diagram: structuredClone(diagram),
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

export function duplicateFromHistory(
  id: string
): FlowchartDiagram | null {
  const history = loadHistory();
  const source = history.find((entry) => entry.id === id);
  if (!source) return null;

  const cloned = structuredClone(source.diagram);
  cloned.id = crypto.randomUUID();
  cloned.name = `${cloned.name} (Copy)`;
  return cloned;
}

// ── JSON export / import ────────────────────────────────────

export function exportDiagramJson(diagram: FlowchartDiagram): string {
  const saved: SavedDiagram = {
    id: crypto.randomUUID(),
    diagram,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-flowchart-maker",
    version: 1,
    exportedAt: new Date().toISOString(),
    diagrams: [saved],
  };
  return JSON.stringify(envelope, null, 2);
}

export function exportAllJson(history: SavedDiagram[]): string {
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-flowchart-maker",
    version: 1,
    exportedAt: new Date().toISOString(),
    diagrams: history,
  };
  return JSON.stringify(envelope, null, 2);
}

export interface ImportResult {
  success: true;
  diagrams: SavedDiagram[];
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
        error:
          "Invalid flowchart file format. Please use a file exported from Free Tool Shed.",
      };
    }

    const diagrams: SavedDiagram[] = result.data.diagrams.map((entry) => ({
      ...entry,
      diagram: migrateDiagram(
        entry.diagram as unknown as Record<string, unknown>
      ),
    }));

    return { success: true, diagrams };
  } catch {
    return {
      success: false,
      error: "Could not read the file. Make sure it is a valid JSON file.",
    };
  }
}
