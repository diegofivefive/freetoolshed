"use client";

import { Search, X, Filter } from "lucide-react";
import type {
  PeriodicTableState,
  PeriodicTableAction,
  ElementCategory,
  ElementState,
  Block,
} from "@/lib/periodic-table/types";
import { CATEGORY_COLORS } from "@/lib/periodic-table/constants";

interface SearchFilterBarProps {
  state: PeriodicTableState;
  dispatch: React.Dispatch<PeriodicTableAction>;
}

const BLOCK_OPTIONS: { value: Block; label: string }[] = [
  { value: "s", label: "s-block" },
  { value: "p", label: "p-block" },
  { value: "d", label: "d-block" },
  { value: "f", label: "f-block" },
];

const STATE_OPTIONS: { value: ElementState; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "liquid", label: "Liquid" },
  { value: "gas", label: "Gas" },
  { value: "unknown", label: "Unknown" },
];

const CATEGORY_OPTIONS: { value: ElementCategory; label: string }[] = [
  { value: "alkali-metal", label: "Alkali Metal" },
  { value: "alkaline-earth-metal", label: "Alkaline Earth" },
  { value: "transition-metal", label: "Transition Metal" },
  { value: "post-transition-metal", label: "Post-Transition" },
  { value: "metalloid", label: "Metalloid" },
  { value: "nonmetal", label: "Nonmetal" },
  { value: "halogen", label: "Halogen" },
  { value: "noble-gas", label: "Noble Gas" },
  { value: "lanthanide", label: "Lanthanide" },
  { value: "actinide", label: "Actinide" },
  { value: "unknown", label: "Unknown" },
];

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
        active
          ? "border-brand bg-brand/15 text-brand"
          : "border-border bg-transparent text-muted-foreground hover:border-brand/40 hover:text-foreground"
      }`}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  );
}

export function SearchFilterBar({ state, dispatch }: SearchFilterBarProps) {
  const { searchQuery, activeFilters } = state;
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    activeFilters.categories.length > 0 ||
    activeFilters.states.length > 0 ||
    activeFilters.blocks.length > 0;

  const activeCount =
    activeFilters.categories.length +
    activeFilters.states.length +
    activeFilters.blocks.length;

  return (
    <div className="space-y-2">
      {/* Search + clear row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })
            }
            placeholder="Search by name, symbol, or number..."
            className="h-8 w-full rounded-md border border-border bg-muted/50 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {searchQuery && (
            <button
              onClick={() =>
                dispatch({ type: "SET_SEARCH_QUERY", payload: "" })
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
            className="flex items-center gap-1 rounded-md border border-pink-400/30 bg-pink-400/10 px-2.5 py-1.5 text-[10px] font-medium text-pink-400 transition-colors hover:bg-pink-400/20"
          >
            <X className="size-3" />
            Clear all
            {activeCount > 0 && (
              <span className="rounded-full bg-pink-400/20 px-1.5 text-[9px]">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Block filters */}
        <div className="flex items-center gap-1.5">
          <Filter className="size-3 text-muted-foreground" />
          <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Block
          </span>
          {BLOCK_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={activeFilters.blocks.includes(opt.value)}
              onClick={() =>
                dispatch({ type: "TOGGLE_BLOCK_FILTER", payload: opt.value })
              }
            />
          ))}
        </div>

        {/* State filters */}
        <div className="flex items-center gap-1.5">
          <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            State
          </span>
          {STATE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={activeFilters.states.includes(opt.value)}
              onClick={() =>
                dispatch({ type: "TOGGLE_STATE_FILTER", payload: opt.value })
              }
            />
          ))}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          {CATEGORY_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={activeFilters.categories.includes(opt.value)}
              color={CATEGORY_COLORS[opt.value].bg}
              onClick={() =>
                dispatch({
                  type: "TOGGLE_CATEGORY_FILTER",
                  payload: opt.value,
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
