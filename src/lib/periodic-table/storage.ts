import type { ViewMode, HeatmapProperty } from "./types";

const STORAGE_KEY = "periodic-table-settings";

/** Persisted settings — only preferences that should survive page reload */
export interface PeriodicTableSettings {
  viewMode: ViewMode;
  temperature: number;
  heatmapProperty: HeatmapProperty;
}

const DEFAULTS: PeriodicTableSettings = {
  viewMode: "category",
  temperature: 298,
  heatmapProperty: "electronegativity",
};

/** Load saved settings from localStorage, falling back to defaults */
export function loadSettings(): PeriodicTableSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;

    const parsed = JSON.parse(raw) as Partial<PeriodicTableSettings>;

    // Validate each field
    const viewMode =
      parsed.viewMode &&
      ["category", "temperature", "heatmap"].includes(parsed.viewMode)
        ? parsed.viewMode
        : DEFAULTS.viewMode;

    const temperature =
      typeof parsed.temperature === "number" &&
      parsed.temperature >= 0 &&
      parsed.temperature <= 6000
        ? parsed.temperature
        : DEFAULTS.temperature;

    const validHeatmapProps = [
      "electronegativity",
      "atomicRadius",
      "ionizationEnergy",
      "density",
      "meltingPoint",
      "boilingPoint",
      "atomicMass",
      "electronAffinity",
    ];
    const heatmapProperty =
      parsed.heatmapProperty &&
      validHeatmapProps.includes(parsed.heatmapProperty)
        ? parsed.heatmapProperty
        : DEFAULTS.heatmapProperty;

    return { viewMode, temperature, heatmapProperty };
  } catch {
    return DEFAULTS;
  }
}

/** Save settings to localStorage */
export function saveSettings(settings: PeriodicTableSettings): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        viewMode: settings.viewMode,
        temperature: settings.temperature,
        heatmapProperty: settings.heatmapProperty,
      })
    );
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}
