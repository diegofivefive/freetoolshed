"use client";

import { useReducer, useEffect, useRef } from "react";
import type {
  PeriodicTableState,
  PeriodicTableAction,
} from "@/lib/periodic-table/types";
import { DEFAULT_STATE, HEATMAP_PROPERTIES } from "@/lib/periodic-table/constants";
import { loadSettings, saveSettings } from "@/lib/periodic-table/storage";
import { TableGrid } from "./table-grid";
import { ElementDetailPanel } from "./element-detail-panel";
import { SearchFilterBar } from "./search-filter-bar";
import { TemperatureSlider } from "./temperature-slider";
import { PropertyHeatmap } from "./property-heatmap";
import { ElementComparison } from "./element-comparison";
import { MolarMassCalculator } from "./molar-mass-calculator";
import { ElectronConfigBuilder } from "./electron-config-builder";
import { ExportControls } from "./export-controls";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";

const TOOL_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Explore all 118 elements on the interactive periodic table. Hover over any element to see a quick tooltip, or click to open the full detail panel.",
    steps: [
      "Click any element to view its properties",
      "Use the toolbar to switch between view modes",
      "Press Escape to close the detail panel",
    ],
  },
  {
    title: "View Modes",
    content:
      "Switch between three visualization modes using the toolbar buttons.",
    steps: [
      "Categories — color-coded by element type (default)",
      "Temperature — see phase states at any temperature from 0K to 6000K",
      "Heatmap — gradient visualization of any property (electronegativity, density, etc.)",
    ],
  },
  {
    title: "Search & Filter",
    content:
      "Quickly find elements by name, symbol, or atomic number. Apply filters to highlight specific groups.",
    steps: [
      "Type in the search bar to filter by name, symbol, or number",
      "Click Block filters (s, p, d, f) to highlight electron blocks",
      "Click State or Category filters to narrow the view",
      "Use 'Clear all' to reset all filters at once",
    ],
  },
  {
    title: "Temperature Slider",
    content:
      "In Temperature mode, drag the slider from 0K to 6000K to see which elements are solid, liquid, or gas at any temperature. Use preset buttons for common reference points.",
  },
  {
    title: "Element Comparison",
    content:
      "Compare up to 4 elements side by side with bar charts for key properties like mass, electronegativity, and density.",
    steps: [
      "Click 'Compare' in the toolbar to enter comparison mode",
      "Click elements on the table to add them (max 4)",
      "View bar charts comparing 8 properties",
      "Click the X on any element chip to remove it",
    ],
  },
  {
    title: "Molar Mass Calculator",
    content:
      "Calculate the molar mass of any chemical compound. Supports complex formulas with parentheses, brackets, and subscripts.",
    steps: [
      "Click 'Molar Mass' in the toolbar",
      "Type a formula like H2SO4 or Ca(OH)2",
      "View the element-by-element breakdown and percentage composition",
    ],
  },
  {
    title: "Electron Configuration",
    content:
      "Build electron configurations interactively by filling orbitals following the Aufbau principle and Hund's rule.",
    steps: [
      "Click 'Electron Config' in the toolbar",
      "Use quick-load buttons or click individual orbital boxes",
      "The tool identifies which element matches your configuration",
    ],
  },
  {
    title: "Export Data",
    content:
      "Export element data in multiple formats. Choose which properties to include and download as CSV, JSON, PDF, or PNG.",
  },
];

function periodicTableReducer(
  state: PeriodicTableState,
  action: PeriodicTableAction
): PeriodicTableState {
  switch (action.type) {
    case "SELECT_ELEMENT":
      return {
        ...state,
        selectedElement: action.payload,
        detailPanelOpen: action.payload !== null,
      };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };
    case "SET_TEMPERATURE":
      return { ...state, temperature: action.payload };
    case "SET_HEATMAP_PROPERTY":
      return { ...state, heatmapProperty: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "TOGGLE_CATEGORY_FILTER": {
      const categories = state.activeFilters.categories.includes(action.payload)
        ? state.activeFilters.categories.filter((c) => c !== action.payload)
        : [...state.activeFilters.categories, action.payload];
      return {
        ...state,
        activeFilters: { ...state.activeFilters, categories },
      };
    }
    case "TOGGLE_STATE_FILTER": {
      const states = state.activeFilters.states.includes(action.payload)
        ? state.activeFilters.states.filter((s) => s !== action.payload)
        : [...state.activeFilters.states, action.payload];
      return { ...state, activeFilters: { ...state.activeFilters, states } };
    }
    case "TOGGLE_BLOCK_FILTER": {
      const blocks = state.activeFilters.blocks.includes(action.payload)
        ? state.activeFilters.blocks.filter((b) => b !== action.payload)
        : [...state.activeFilters.blocks, action.payload];
      return { ...state, activeFilters: { ...state.activeFilters, blocks } };
    }
    case "CLEAR_FILTERS":
      return {
        ...state,
        searchQuery: "",
        activeFilters: { categories: [], states: [], blocks: [] },
      };
    case "ADD_COMPARISON":
      if (
        state.comparisonElements.length >= 4 ||
        state.comparisonElements.some(
          (e) => e.atomicNumber === action.payload.atomicNumber
        )
      ) {
        return state;
      }
      return {
        ...state,
        comparisonElements: [...state.comparisonElements, action.payload],
      };
    case "REMOVE_COMPARISON":
      return {
        ...state,
        comparisonElements: state.comparisonElements.filter(
          (e) => e.atomicNumber !== action.payload
        ),
      };
    case "CLEAR_COMPARISON":
      return { ...state, comparisonElements: [], showComparison: false };
    case "TOGGLE_COMPARISON":
      return { ...state, showComparison: !state.showComparison };
    case "TOGGLE_MOLAR_MASS_CALC":
      return { ...state, showMolarMassCalc: !state.showMolarMassCalc };
    case "TOGGLE_ELECTRON_CONFIG_BUILDER":
      return {
        ...state,
        showElectronConfigBuilder: !state.showElectronConfigBuilder,
      };
    case "TOGGLE_EXPORT":
      return { ...state, showExport: !state.showExport };
    case "OPEN_DETAIL_PANEL":
      return { ...state, detailPanelOpen: true };
    case "CLOSE_DETAIL_PANEL":
      return { ...state, detailPanelOpen: false, selectedElement: null };
    case "RESET":
      return DEFAULT_STATE;
    default:
      return state;
  }
}

function getInitialState(): PeriodicTableState {
  const saved = loadSettings();
  return {
    ...DEFAULT_STATE,
    viewMode: saved.viewMode,
    temperature: saved.temperature,
    heatmapProperty: saved.heatmapProperty,
  };
}

export function PeriodicTable() {
  const [state, dispatch] = useReducer(periodicTableReducer, undefined, getInitialState);
  const isFirstRender = useRef(true);

  // Persist settings when they change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveSettings({
      viewMode: state.viewMode,
      temperature: state.temperature,
      heatmapProperty: state.heatmapProperty,
    });
  }, [state.viewMode, state.temperature, state.heatmapProperty]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          View
        </span>
        <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
          <button
            onClick={() =>
              dispatch({ type: "SET_VIEW_MODE", payload: "category" })
            }
            className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
              state.viewMode === "category"
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() =>
              dispatch({ type: "SET_VIEW_MODE", payload: "temperature" })
            }
            className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
              state.viewMode === "temperature"
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() =>
              dispatch({ type: "SET_VIEW_MODE", payload: "heatmap" })
            }
            className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
              state.viewMode === "heatmap"
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Heatmap
          </button>
        </div>

        {/* Temperature hint in toolbar */}
        {state.viewMode === "temperature" && (
          <span className="text-[10px] text-muted-foreground">
            {state.temperature} K
          </span>
        )}

        {/* Heatmap hint in toolbar */}
        {state.viewMode === "heatmap" && (
          <span className="text-[10px] text-muted-foreground">
            {HEATMAP_PROPERTIES[state.heatmapProperty].label}
          </span>
        )}

        {/* Separator */}
        <div className="h-5 w-px bg-border" />

        {/* Compare toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_COMPARISON" })}
          className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
            state.showComparison
              ? "bg-brand text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Compare
          {state.comparisonElements.length > 0 && (
            <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
              {state.comparisonElements.length}
            </span>
          )}
        </button>

        {/* Molar Mass Calculator toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_MOLAR_MASS_CALC" })}
          className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
            state.showMolarMassCalc
              ? "bg-brand text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Molar Mass
        </button>

        {/* Electron Config Builder toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_ELECTRON_CONFIG_BUILDER" })}
          className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
            state.showElectronConfigBuilder
              ? "bg-brand text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Electron Config
        </button>

        {/* Export toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_EXPORT" })}
          className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-all ${
            state.showExport
              ? "bg-brand text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Export
        </button>

        {/* Selected element quick info */}
        {state.selectedElement && !state.showComparison && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Selected:
            </span>
            <span className="rounded-md bg-brand/10 px-2 py-1 text-xs font-bold text-brand">
              {state.selectedElement.symbol} — {state.selectedElement.name}
            </span>
            <button
              onClick={() =>
                dispatch({ type: "SELECT_ELEMENT", payload: null })
              }
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label="Deselect element"
            >
              ✕
            </button>
          </div>
        )}

        {/* Compare mode hint */}
        {state.showComparison && state.comparisonElements.length < 4 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            Click elements to add to comparison
          </span>
        )}
      </div>

      {/* Search & Filter */}
      <SearchFilterBar state={state} dispatch={dispatch} />

      {/* Temperature Slider — shown in temperature mode */}
      {state.viewMode === "temperature" && (
        <TemperatureSlider
          temperature={state.temperature}
          dispatch={dispatch}
        />
      )}

      {/* Property Heatmap — shown in heatmap mode */}
      {state.viewMode === "heatmap" && (
        <PropertyHeatmap
          heatmapProperty={state.heatmapProperty}
          dispatch={dispatch}
        />
      )}

      {/* Periodic Table Grid */}
      <TableGrid state={state} dispatch={dispatch} />

      {/* Element Comparison Panel */}
      {state.showComparison && (
        <ElementComparison
          elements={state.comparisonElements}
          dispatch={dispatch}
        />
      )}

      {/* Molar Mass Calculator */}
      {state.showMolarMassCalc && (
        <MolarMassCalculator dispatch={dispatch} />
      )}

      {/* Electron Configuration Builder */}
      {state.showElectronConfigBuilder && (
        <ElectronConfigBuilder dispatch={dispatch} />
      )}

      {/* Export Controls */}
      {state.showExport && <ExportControls dispatch={dispatch} />}

      {/* Element Detail Panel */}
      {state.detailPanelOpen && state.selectedElement && (
        <ElementDetailPanel
          element={state.selectedElement}
          dispatch={dispatch}
        />
      )}

      <ToolGuide sections={TOOL_GUIDE_SECTIONS} />
    </div>
  );
}
