"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  LineChart,
  Table,
  BarChart3,
  Grid3X3,
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize,
  Square,
  Plus,
  Crosshair,
  RotateCcw,
  Command,
} from "lucide-react";
import type { CalcMode, AngleMode } from "@/lib/graphing-calculator/types";

// ─── Command Definition ────────────────────────────────────────────────────

interface PaletteCommand {
  id: string;
  label: string;
  description: string;
  category: string;
  keywords: string[];
  icon: typeof LineChart;
  action: () => void;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSetMode: (mode: CalcMode) => void;
  onToggleAngleMode: () => void;
  onAddFunction: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomStandard: () => void;
  onZoomTrig: () => void;
  onZoomSquare: () => void;
  onToggleTrace: () => void;
  onResetState: () => void;
  angleMode: AngleMode;
  currentMode: CalcMode;
  functionCount: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CommandPalette({
  open,
  onClose,
  onSetMode,
  onToggleAngleMode,
  onAddFunction,
  onZoomIn,
  onZoomOut,
  onZoomStandard,
  onZoomTrig,
  onZoomSquare,
  onToggleTrace,
  onResetState,
  angleMode,
  currentMode,
  functionCount,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build commands list
  const commands: PaletteCommand[] = useMemo(
    () => [
      // ── Mode switching ──────────────────────────────────────────────
      {
        id: "mode-graph",
        label: "Graph Mode",
        description: "Plot functions on an interactive canvas",
        category: "Modes",
        keywords: ["graph", "plot", "function", "y=", "equation"],
        icon: LineChart,
        action: () => onSetMode("graph"),
      },
      {
        id: "mode-table",
        label: "Table Mode",
        description: "Generate x/y value tables for active functions",
        category: "Modes",
        keywords: ["table", "values", "x", "y", "list"],
        icon: Table,
        action: () => onSetMode("table"),
      },
      {
        id: "mode-stat",
        label: "Statistics Mode",
        description: "Data lists, 1-Var Stats, and regression analysis",
        category: "Modes",
        keywords: ["stat", "statistics", "regression", "data", "linreg", "1-var"],
        icon: BarChart3,
        action: () => onSetMode("stat"),
      },
      {
        id: "mode-matrix",
        label: "Matrix Mode",
        description: "Matrix editor with RREF, inverse, and determinant",
        category: "Modes",
        keywords: ["matrix", "rref", "inverse", "determinant", "augmented"],
        icon: Grid3X3,
        action: () => onSetMode("matrix"),
      },
      {
        id: "mode-dist",
        label: "Distribution Mode",
        description: "normalcdf, invNorm, tcdf, binomial, and more",
        category: "Modes",
        keywords: [
          "distribution",
          "normal",
          "normalcdf",
          "invnorm",
          "tcdf",
          "binomial",
          "poisson",
          "chi",
          "probability",
        ],
        icon: Activity,
        action: () => onSetMode("distribution"),
      },

      // ── Graph actions ───────────────────────────────────────────────
      {
        id: "add-function",
        label: "Add Function",
        description: `Add a new Y= equation slot (${functionCount}/10)`,
        category: "Graph",
        keywords: ["add", "function", "new", "equation", "y=", "plot"],
        icon: Plus,
        action: onAddFunction,
      },
      {
        id: "toggle-trace",
        label: "Toggle Trace",
        description: "Enable/disable coordinate trace on graph",
        category: "Graph",
        keywords: ["trace", "coordinate", "cursor", "crosshair"],
        icon: Crosshair,
        action: onToggleTrace,
      },

      // ── Zoom ────────────────────────────────────────────────────────
      {
        id: "zoom-in",
        label: "Zoom In",
        description: "Zoom into the graph center",
        category: "Zoom",
        keywords: ["zoom", "in", "closer", "magnify"],
        icon: ZoomIn,
        action: onZoomIn,
      },
      {
        id: "zoom-out",
        label: "Zoom Out",
        description: "Zoom out from the graph center",
        category: "Zoom",
        keywords: ["zoom", "out", "wider", "shrink"],
        icon: ZoomOut,
        action: onZoomOut,
      },
      {
        id: "zoom-standard",
        label: "Zoom Standard",
        description: "Reset viewport to ±10 on both axes",
        category: "Zoom",
        keywords: ["zoom", "standard", "reset", "default", "10"],
        icon: Maximize,
        action: onZoomStandard,
      },
      {
        id: "zoom-trig",
        label: "Zoom Trig",
        description: "Set viewport to ±2π horizontally, ±4 vertically",
        category: "Zoom",
        keywords: ["zoom", "trig", "trigonometric", "pi", "sin", "cos"],
        icon: Maximize,
        action: onZoomTrig,
      },
      {
        id: "zoom-square",
        label: "Zoom Square",
        description: "Equalize axis scales so circles look circular",
        category: "Zoom",
        keywords: ["zoom", "square", "equal", "aspect", "ratio"],
        icon: Square,
        action: onZoomSquare,
      },

      // ── Settings ────────────────────────────────────────────────────
      {
        id: "toggle-angle",
        label: `Switch to ${angleMode === "radian" ? "Degree" : "Radian"} Mode`,
        description: `Currently: ${angleMode === "radian" ? "RAD" : "DEG"} — toggle angle unit`,
        category: "Settings",
        keywords: ["angle", "radian", "degree", "rad", "deg", "trig", "mode"],
        icon: RotateCcw,
        action: onToggleAngleMode,
      },
      {
        id: "reset-all",
        label: "Reset All Data",
        description: "Clear all functions, data, and matrices — start fresh",
        category: "Settings",
        keywords: ["reset", "clear", "fresh", "new", "wipe"],
        icon: RotateCcw,
        action: onResetState,
      },
    ],
    [
      onSetMode,
      onAddFunction,
      onToggleTrace,
      onZoomIn,
      onZoomOut,
      onZoomStandard,
      onZoomTrig,
      onZoomSquare,
      onToggleAngleMode,
      onResetState,
      angleMode,
      functionCount,
    ]
  );

  // Filter commands by query
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const terms = query.toLowerCase().split(/\s+/);
    return commands.filter((cmd) => {
      const searchable = [
        cmd.label,
        cmd.description,
        cmd.category,
        ...cmd.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [commands, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, PaletteCommand[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay to let the dialog render
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-cmd-item]");
    const selected = items[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (cmd: PaletteCommand) => {
      cmd.action();
      onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            executeCommand(filtered[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filtered, selectedIndex, executeCommand, onClose]
  );

  if (!open) return null;

  let flatIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            spellCheck={false}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto overscroll-contain p-2"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matching commands
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="mb-1">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      data-cmd-item
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-brand/10 text-brand"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <cmd.icon
                        className={`h-4 w-4 shrink-0 ${
                          isSelected
                            ? "text-brand"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{cmd.label}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {cmd.description}
                        </div>
                      </div>
                      {cmd.id === `mode-${currentMode}` && (
                        <span className="shrink-0 rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">Esc</kbd>
            Close
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K to toggle</span>
          </span>
        </div>
      </div>
    </>
  );
}
