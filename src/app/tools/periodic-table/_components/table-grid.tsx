"use client";

import { useCallback, useMemo } from "react";
import type {
  Element,
  PeriodicTableState,
  PeriodicTableAction,
} from "@/lib/periodic-table/types";
import { ELEMENTS, getElementState } from "@/lib/periodic-table/elements-data";
import {
  CATEGORY_COLORS,
  STATE_COLORS,
  TABLE_COLS,
} from "@/lib/periodic-table/constants";
import { ElementCell } from "./element-cell";
import { CategoryLegend } from "./category-legend";

interface TableGridProps {
  state: PeriodicTableState;
  dispatch: React.Dispatch<PeriodicTableAction>;
}

/**
 * Determine if an element should be dimmed based on active filters/search.
 */
function isElementDimmed(
  element: Element,
  state: PeriodicTableState
): boolean {
  const { searchQuery, activeFilters } = state;

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      element.name.toLowerCase().includes(q) ||
      element.symbol.toLowerCase().includes(q) ||
      element.atomicNumber.toString() === q;
    if (!matchesSearch) return true;
  }

  // Category filter
  if (
    activeFilters.categories.length > 0 &&
    !activeFilters.categories.includes(element.category)
  ) {
    return true;
  }

  // State filter
  if (activeFilters.states.length > 0) {
    const elementState =
      state.viewMode === "temperature"
        ? getElementState(element, state.temperature)
        : element.stateAtRT;
    if (!activeFilters.states.includes(elementState)) return true;
  }

  // Block filter
  if (
    activeFilters.blocks.length > 0 &&
    !activeFilters.blocks.includes(element.block)
  ) {
    return true;
  }

  return false;
}

/**
 * Get the heatmap color for an element based on the selected property.
 * Returns an oklch color string interpolated between cool (blue) and warm (orange).
 */
function getHeatmapColor(
  element: Element,
  property: PeriodicTableState["heatmapProperty"],
  isDark: boolean
): { bg: string; bgDark: string } | null {
  const value = element[property];
  if (value === null || value === undefined) return null;

  // Predefined ranges for each property (approximate min/max across all elements)
  const ranges: Record<string, [number, number]> = {
    electronegativity: [0.7, 4.0],
    atomicRadius: [25, 350],
    ionizationEnergy: [370, 2400],
    density: [0.00008, 23],
    meltingPoint: [0.95, 3695],
    boilingPoint: [4.22, 5869],
    atomicMass: [1, 294],
    electronAffinity: [-350, 0],
  };

  const [min, max] = ranges[property] ?? [0, 1];
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Interpolate hue from 250 (blue) → 163 (teal) → 30 (orange)
  const hue = 250 - t * 220; // blue to orange
  const lightL = 0.55 + t * 0.25;
  const darkL = 0.30 + t * 0.18;
  const chroma = 0.12 + t * 0.04;

  return {
    bg: `oklch(${lightL.toFixed(2)} ${chroma.toFixed(2)} ${hue.toFixed(0)})`,
    bgDark: `oklch(${darkL.toFixed(2)} ${chroma.toFixed(2)} ${hue.toFixed(0)})`,
  };
}

/**
 * Get temperature-mode color for an element.
 */
function getTemperatureColor(
  element: Element,
  temperature: number
): { bg: string; bgDark: string } {
  const elState = getElementState(element, temperature);
  return {
    bg: STATE_COLORS[elState].bg,
    bgDark: STATE_COLORS[elState].bgDark,
  };
}

export function TableGrid({ state, dispatch }: TableGridProps) {
  const handleElementClick = useCallback(
    (element: Element) => {
      if (state.showComparison) {
        // In comparison mode, toggle element in/out of comparison
        if (state.comparisonElements.some((e) => e.atomicNumber === element.atomicNumber)) {
          dispatch({ type: "REMOVE_COMPARISON", payload: element.atomicNumber });
        } else {
          dispatch({ type: "ADD_COMPARISON", payload: element });
        }
      } else {
        dispatch({ type: "SELECT_ELEMENT", payload: element });
      }
    },
    [dispatch, state.showComparison, state.comparisonElements]
  );

  // Build a 2D grid map: gridMap[row][col] = element | null
  const gridMap = useMemo(() => {
    const map: (Element | null)[][] = Array.from({ length: 10 }, () =>
      Array.from({ length: TABLE_COLS }, () => null)
    );
    for (const el of ELEMENTS) {
      if (el.gridRow >= 0 && el.gridRow < 10 && el.gridCol >= 0 && el.gridCol < TABLE_COLS) {
        map[el.gridRow][el.gridCol] = el;
      }
    }
    return map;
  }, []);

  return (
    <div className="space-y-3" data-periodic-grid>
      {/* Main table — scrollable on smaller screens */}
      <div className="overflow-x-auto overflow-y-visible pb-2">
        <div
          className="mx-auto grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${TABLE_COLS}, minmax(42px, 1fr))`,
            minWidth: "760px",
          }}
        >
          {/* Rows 0-6: Main table (periods 1-7) */}
          {gridMap.slice(0, 7).flatMap((row, rowIdx) =>
            row.map((element, colIdx) => {
              if (!element) {
                // Special labels
                if (rowIdx === 0 && colIdx === 1) {
                  return (
                    <div
                      key={`empty-${rowIdx}-${colIdx}`}
                      className="hidden items-end justify-center p-1 lg:flex"
                      style={{ gridColumn: "2 / 13" }}
                    >
                      <span className="text-center text-xs font-medium text-muted-foreground/50">
                        Interactive Periodic Table
                      </span>
                    </div>
                  );
                }
                // Lanthanide/Actinide placeholder markers
                if (rowIdx === 5 && colIdx === 2) {
                  return null; // La is placed here directly
                }
                if (rowIdx === 6 && colIdx === 2) {
                  return null; // Ac is placed here directly
                }
                return (
                  <div
                    key={`empty-${rowIdx}-${colIdx}`}
                    className="aspect-[7/8]"
                  />
                );
              }

              const isDimmed = isElementDimmed(element, state);
              const isSelected =
                state.selectedElement?.atomicNumber === element.atomicNumber ||
                state.comparisonElements.some((e) => e.atomicNumber === element.atomicNumber);

              let cellColor: string | undefined;
              let cellColorDark: string | undefined;

              if (state.viewMode === "temperature") {
                const tColor = getTemperatureColor(
                  element,
                  state.temperature
                );
                cellColor = tColor.bg;
                cellColorDark = tColor.bgDark;
              } else if (state.viewMode === "heatmap") {
                const hColor = getHeatmapColor(
                  element,
                  state.heatmapProperty,
                  false
                );
                if (hColor) {
                  cellColor = hColor.bg;
                  cellColorDark = hColor.bgDark;
                }
              }

              return (
                <div
                  key={element.atomicNumber}
                  className="aspect-[7/8]"
                  style={{
                    gridRow: rowIdx + 1,
                    gridColumn: colIdx + 1,
                  }}
                >
                  <ElementCell
                    element={element}
                    isSelected={isSelected}
                    isDimmed={isDimmed}
                    viewMode={state.viewMode}
                    cellColor={cellColor}
                    cellColorDark={cellColorDark}
                    column={colIdx + 1}
                    row={rowIdx + 1}
                    onClick={handleElementClick}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Gap indicator — arrow/label pointing to f-block rows */}
        <div className="my-2 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
            Lanthanides &amp; Actinides
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Rows 8-9: Lanthanides and Actinides */}
        <div
          className="mx-auto grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${TABLE_COLS}, minmax(42px, 1fr))`,
            minWidth: "760px",
          }}
        >
          {gridMap.slice(8, 10).flatMap((row, rowOffset) =>
            row.map((element, colIdx) => {
              const rowIdx = rowOffset + 8;
              if (!element) {
                // Label cells for La* and Ac* series
                if (colIdx === 0 && rowOffset === 0) {
                  return (
                    <div
                      key={`label-${rowIdx}`}
                      className="flex items-center justify-center"
                      style={{ gridColumn: "1 / 4" }}
                    >
                      <span className="text-[9px] font-semibold text-muted-foreground/60 lg:text-[10px]">
                        57–71
                      </span>
                    </div>
                  );
                }
                if (colIdx === 0 && rowOffset === 1) {
                  return (
                    <div
                      key={`label-${rowIdx}`}
                      className="flex items-center justify-center"
                      style={{ gridColumn: "1 / 4" }}
                    >
                      <span className="text-[9px] font-semibold text-muted-foreground/60 lg:text-[10px]">
                        89–103
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={`empty-${rowIdx}-${colIdx}`}
                    className="aspect-[7/8]"
                  />
                );
              }

              const isDimmed = isElementDimmed(element, state);
              const isSelected =
                state.selectedElement?.atomicNumber === element.atomicNumber ||
                state.comparisonElements.some((e) => e.atomicNumber === element.atomicNumber);

              let cellColor: string | undefined;
              let cellColorDark: string | undefined;

              if (state.viewMode === "temperature") {
                const tColor = getTemperatureColor(
                  element,
                  state.temperature
                );
                cellColor = tColor.bg;
                cellColorDark = tColor.bgDark;
              } else if (state.viewMode === "heatmap") {
                const hColor = getHeatmapColor(
                  element,
                  state.heatmapProperty,
                  false
                );
                if (hColor) {
                  cellColor = hColor.bg;
                  cellColorDark = hColor.bgDark;
                }
              }

              return (
                <div
                  key={element.atomicNumber}
                  className="aspect-[7/8]"
                  style={{
                    gridRow: rowOffset + 1,
                    gridColumn: colIdx + 1,
                  }}
                >
                  <ElementCell
                    element={element}
                    isSelected={isSelected}
                    isDimmed={isDimmed}
                    viewMode={state.viewMode}
                    cellColor={cellColor}
                    cellColorDark={cellColorDark}
                    column={colIdx + 1}
                    row={rowOffset + 9}
                    onClick={handleElementClick}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <CategoryLegend viewMode={state.viewMode} />
    </div>
  );
}
