"use client";

import { useState, useMemo, useCallback } from "react";
import { Atom, X, RotateCcw, Zap, ArrowUp, ArrowDown } from "lucide-react";
import type { PeriodicTableAction } from "@/lib/periodic-table/types";
import { ELEMENTS } from "@/lib/periodic-table/elements-data";

interface ElectronConfigBuilderProps {
  dispatch: React.Dispatch<PeriodicTableAction>;
}

/**
 * Orbital definition with quantum numbers.
 * Aufbau order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p
 */
interface Orbital {
  n: number; // principal quantum number
  l: number; // angular momentum (0=s, 1=p, 2=d, 3=f)
  label: string; // e.g. "1s", "3d"
  maxElectrons: number; // 2, 6, 10, 14
  block: "s" | "p" | "d" | "f";
}

const SUBSHELL_LETTERS = ["s", "p", "d", "f"] as const;
const SUBSHELL_MAX = [2, 6, 10, 14];

/** Aufbau-order orbital list */
const AUFBAU_ORBITALS: Orbital[] = [
  { n: 1, l: 0, label: "1s", maxElectrons: 2, block: "s" },
  { n: 2, l: 0, label: "2s", maxElectrons: 2, block: "s" },
  { n: 2, l: 1, label: "2p", maxElectrons: 6, block: "p" },
  { n: 3, l: 0, label: "3s", maxElectrons: 2, block: "s" },
  { n: 3, l: 1, label: "3p", maxElectrons: 6, block: "p" },
  { n: 4, l: 0, label: "4s", maxElectrons: 2, block: "s" },
  { n: 3, l: 2, label: "3d", maxElectrons: 10, block: "d" },
  { n: 4, l: 1, label: "4p", maxElectrons: 6, block: "p" },
  { n: 5, l: 0, label: "5s", maxElectrons: 2, block: "s" },
  { n: 4, l: 2, label: "4d", maxElectrons: 10, block: "d" },
  { n: 5, l: 1, label: "5p", maxElectrons: 6, block: "p" },
  { n: 6, l: 0, label: "6s", maxElectrons: 2, block: "s" },
  { n: 4, l: 3, label: "4f", maxElectrons: 14, block: "f" },
  { n: 5, l: 2, label: "5d", maxElectrons: 10, block: "d" },
  { n: 6, l: 1, label: "6p", maxElectrons: 6, block: "p" },
  { n: 7, l: 0, label: "7s", maxElectrons: 2, block: "s" },
  { n: 5, l: 3, label: "5f", maxElectrons: 14, block: "f" },
  { n: 6, l: 2, label: "6d", maxElectrons: 10, block: "d" },
  { n: 7, l: 1, label: "7p", maxElectrons: 6, block: "p" },
];

/** Block colors */
const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  s: { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-400" },
  p: { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400" },
  d: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400" },
  f: { bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-400" },
};

/**
 * Anomalous electron configurations — elements that deviate from Aufbau filling.
 * Each entry maps atomic number → [orbitalIndex, correctElectronCount] overrides.
 * Orbital indices: 5=4s, 6=3d, 8=5s, 9=4d, 11=6s, 12=4f, 13=5d, 15=7s, 16=5f, 17=6d, 18=7p
 */
const ANOMALOUS_CONFIGS: Record<number, [number, number][]> = {
  24: [[5, 1], [6, 5]],    // Cr: [Ar] 3d⁵ 4s¹
  29: [[5, 1], [6, 10]],   // Cu: [Ar] 3d¹⁰ 4s¹
  41: [[8, 1], [9, 4]],    // Nb: [Kr] 4d⁴ 5s¹
  42: [[8, 1], [9, 5]],    // Mo: [Kr] 4d⁵ 5s¹
  44: [[8, 1], [9, 7]],    // Ru: [Kr] 4d⁷ 5s¹
  45: [[8, 1], [9, 8]],    // Rh: [Kr] 4d⁸ 5s¹
  46: [[8, 0], [9, 10]],   // Pd: [Kr] 4d¹⁰ 5s⁰
  47: [[8, 1], [9, 10]],   // Ag: [Kr] 4d¹⁰ 5s¹
  57: [[12, 0], [13, 1]],  // La: [Xe] 5d¹ 6s²
  58: [[12, 1], [13, 1]],  // Ce: [Xe] 4f¹ 5d¹ 6s²
  64: [[12, 7], [13, 1]],  // Gd: [Xe] 4f⁷ 5d¹ 6s²
  78: [[11, 1], [13, 9]],  // Pt: [Xe] 4f¹⁴ 5d⁹ 6s¹
  79: [[11, 1], [13, 10]], // Au: [Xe] 4f¹⁴ 5d¹⁰ 6s¹
  89: [[16, 0], [17, 1]],  // Ac: [Rn] 6d¹ 7s²
  90: [[16, 0], [17, 2]],  // Th: [Rn] 6d² 7s²
  91: [[16, 2], [17, 1]],  // Pa: [Rn] 5f² 6d¹ 7s²
  92: [[16, 3], [17, 1]],  // U:  [Rn] 5f³ 6d¹ 7s²
  93: [[16, 4], [17, 1]],  // Np: [Rn] 5f⁴ 6d¹ 7s²
  96: [[16, 7], [17, 1]],  // Cm: [Rn] 5f⁷ 6d¹ 7s²
  103: [[17, 0], [18, 1]], // Lr: [Rn] 5f¹⁴ 7s² 7p¹
};

/** Build electron config for a given atomic number, using real anomalous configs when known */
function buildAufbauConfig(atomicNumber: number): number[] {
  const config = new Array(AUFBAU_ORBITALS.length).fill(0);
  let remaining = atomicNumber;
  for (let i = 0; i < AUFBAU_ORBITALS.length && remaining > 0; i++) {
    const fill = Math.min(remaining, AUFBAU_ORBITALS[i].maxElectrons);
    config[i] = fill;
    remaining -= fill;
  }
  // Apply anomalous overrides
  const overrides = ANOMALOUS_CONFIGS[atomicNumber];
  if (overrides) {
    for (const [idx, count] of overrides) {
      config[idx] = count;
    }
  }
  return config;
}

/** Count total electrons from config array */
function totalElectrons(config: number[]): number {
  return config.reduce((sum, n) => sum + n, 0);
}

/** Generate notation string from config */
function configToNotation(config: number[]): string {
  const parts: string[] = [];
  for (let i = 0; i < config.length; i++) {
    if (config[i] > 0) {
      parts.push(`${AUFBAU_ORBITALS[i].label}${superscript(config[i])}`);
    }
  }
  return parts.join(" ");
}

/** Convert number to superscript string */
function superscript(n: number): string {
  const sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return n
    .toString()
    .split("")
    .map((d) => sup[parseInt(d)])
    .join("");
}

/** Find matching element for a given electron config */
function findMatchingElement(config: number[]): { symbol: string; name: string; atomicNumber: number } | null {
  const total = totalElectrons(config);
  if (total === 0 || total > 118) return null;

  // buildAufbauConfig already includes anomalous overrides, so this matches
  // both standard Aufbau elements and known anomalous configurations (Cr, Cu, etc.)
  const expectedConfig = buildAufbauConfig(total);
  const isMatch = config.every((v, i) => v === expectedConfig[i]);

  if (isMatch) {
    const el = ELEMENTS.find((e) => e.atomicNumber === total);
    if (el) return { symbol: el.symbol, name: el.name, atomicNumber: el.atomicNumber };
  }

  return null;
}

/** Individual orbital box with electron arrows */
function OrbitalBox({
  electrons,
  maxElectrons,
  onClick,
}: {
  electrons: number;
  maxElectrons: number;
  onClick: () => void;
}) {
  // Each orbital holds 2 electrons (up/down arrows in one box)
  // s=1 box, p=3 boxes, d=5 boxes, f=7 boxes
  const boxCount = maxElectrons / 2;
  const boxes: { up: boolean; down: boolean }[] = [];

  // Fill according to Hund's rule: first all up, then all down
  let remaining = electrons;
  for (let i = 0; i < boxCount; i++) {
    boxes.push({ up: false, down: false });
  }
  // First pass: one up arrow per box
  for (let i = 0; i < boxCount && remaining > 0; i++) {
    boxes[i].up = true;
    remaining--;
  }
  // Second pass: down arrows
  for (let i = 0; i < boxCount && remaining > 0; i++) {
    boxes[i].down = true;
    remaining--;
  }

  return (
    <button
      onClick={onClick}
      className="flex gap-[2px] rounded-sm p-0.5 transition-colors hover:bg-muted/50"
      title="Click to add/remove electrons"
    >
      {boxes.map((box, i) => (
        <div
          key={i}
          className="flex size-5 items-center justify-center rounded-[3px] border border-border/60 bg-background"
        >
          <div className="flex flex-col items-center leading-none">
            {box.up && (
              <ArrowUp
                className="size-2.5 text-brand"
                strokeWidth={3}
              />
            )}
            {box.down && (
              <ArrowDown
                className="size-2.5 text-brand"
                strokeWidth={3}
              />
            )}
          </div>
        </div>
      ))}
    </button>
  );
}

export function ElectronConfigBuilder({
  dispatch,
}: ElectronConfigBuilderProps) {
  const [config, setConfig] = useState<number[]>(
    () => new Array(AUFBAU_ORBITALS.length).fill(0)
  );

  const total = useMemo(() => totalElectrons(config), [config]);
  const notation = useMemo(() => configToNotation(config), [config]);
  const matchedElement = useMemo(() => findMatchingElement(config), [config]);

  /** Check if current config exactly matches a given atomic number's config */
  const configMatchesElement = useCallback(
    (atomicNumber: number) => {
      const expected = buildAufbauConfig(atomicNumber);
      return config.every((v, i) => v === expected[i]);
    },
    [config]
  );

  const handleOrbitalClick = useCallback(
    (index: number) => {
      setConfig((prev) => {
        const next = [...prev];
        const orbital = AUFBAU_ORBITALS[index];
        // Cycle: 0 → max → 0 (or click increments by 1, wrapping to 0)
        next[index] = (prev[index] + 1) % (orbital.maxElectrons + 1);
        return next;
      });
    },
    []
  );

  const handleLoadElement = useCallback((atomicNumber: number) => {
    setConfig(buildAufbauConfig(atomicNumber));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(new Array(AUFBAU_ORBITALS.length).fill(0));
  }, []);

  const handleFillNext = useCallback(() => {
    setConfig((prev) => {
      const next = [...prev];
      // Find first orbital that's not full
      for (let i = 0; i < AUFBAU_ORBITALS.length; i++) {
        if (next[i] < AUFBAU_ORBITALS[i].maxElectrons) {
          next[i]++;
          return next;
        }
      }
      return prev;
    });
  }, []);

  const handleRemoveLast = useCallback(() => {
    setConfig((prev) => {
      const next = [...prev];
      // Find last orbital with electrons
      for (let i = AUFBAU_ORBITALS.length - 1; i >= 0; i--) {
        if (next[i] > 0) {
          next[i]--;
          return next;
        }
      }
      return prev;
    });
  }, []);

  // Group orbitals by energy level (n) for display
  const orbitalsByLevel = useMemo(() => {
    const levels = new Map<number, { orbital: Orbital; index: number }[]>();
    AUFBAU_ORBITALS.forEach((orbital, index) => {
      const group = levels.get(orbital.n) ?? [];
      group.push({ orbital, index });
      levels.set(orbital.n, group);
    });
    return levels;
  }, []);

  // Quick-load element buttons (common elements)
  const quickElements = [
    { z: 1, symbol: "H" },
    { z: 6, symbol: "C" },
    { z: 7, symbol: "N" },
    { z: 8, symbol: "O" },
    { z: 11, symbol: "Na" },
    { z: 17, symbol: "Cl" },
    { z: 20, symbol: "Ca" },
    { z: 26, symbol: "Fe" },
    { z: 29, symbol: "Cu" },
    { z: 47, symbol: "Ag" },
    { z: 79, symbol: "Au" },
    { z: 92, symbol: "U" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Atom className="size-4 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Electron Configuration Builder
        </span>
        <button
          onClick={() => dispatch({ type: "TOGGLE_ELECTRON_CONFIG_BUILDER" })}
          className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
          Close
        </button>
      </div>

      <div className="px-4 pb-4 pt-3">
        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/50 px-3 py-2.5">
          {/* Total electron count */}
          <div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Electrons
            </span>
            <p className="text-xl font-black tabular-nums text-foreground">
              {total}
            </p>
          </div>

          {/* Matched element */}
          <div className="h-8 w-px bg-border" />
          {matchedElement ? (
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-md bg-brand/15 text-sm font-black text-brand">
                {matchedElement.symbol}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {matchedElement.name}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Z = {matchedElement.atomicNumber}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-md bg-muted text-sm font-black text-muted-foreground/40">
                ?
              </div>
              <p className="text-[10px] text-muted-foreground">
                {total === 0
                  ? "Add electrons to build a configuration"
                  : "Non-standard configuration"}
              </p>
            </div>
          )}

          {/* Notation */}
          {notation && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Configuration
                </span>
                <p className="truncate font-mono text-[11px] font-medium text-foreground">
                  {notation}
                </p>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={handleRemoveLast}
              disabled={total === 0}
              className="rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
              title="Remove last electron"
            >
              − 1
            </button>
            <button
              onClick={handleFillNext}
              disabled={total >= 118}
              className="rounded-md border border-brand/40 bg-brand/10 px-2 py-1 text-[10px] font-medium text-brand transition-colors hover:bg-brand/20 disabled:opacity-30"
              title="Add next electron (aufbau order)"
            >
              <Zap className="mr-0.5 inline size-3" />
              + 1
            </button>
            <button
              onClick={handleReset}
              disabled={total === 0}
              className="rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
              title="Reset all orbitals"
            >
              <RotateCcw className="inline size-3" />
            </button>
          </div>
        </div>

        {/* Quick load */}
        <div className="mt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Load Element
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {quickElements.map((el) => (
              <button
                key={el.z}
                onClick={() => handleLoadElement(el.z)}
                className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${
                  configMatchesElement(el.z)
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                }`}
              >
                <span className="font-mono font-bold">{el.symbol}</span>
                <span className="ml-1 text-muted-foreground/70">{el.z}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orbital diagram */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Orbital Diagram
            </span>
            <div className="flex gap-3">
              {(["s", "p", "d", "f"] as const).map((block) => (
                <span
                  key={block}
                  className={`text-[9px] font-bold ${BLOCK_COLORS[block].text}`}
                >
                  {block}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {Array.from(orbitalsByLevel.entries())
              .sort(([a], [b]) => a - b)
              .map(([n, orbitals]) => (
                <div key={n} className="flex items-center gap-2">
                  {/* Energy level label */}
                  <span className="w-4 text-right text-[10px] font-bold text-muted-foreground">
                    {n}
                  </span>
                  {/* Orbitals in this level */}
                  <div className="flex flex-wrap items-center gap-2">
                    {orbitals
                      .sort((a, b) => a.orbital.l - b.orbital.l)
                      .map(({ orbital, index }) => {
                        const electrons = config[index];
                        const isFull =
                          electrons === orbital.maxElectrons;
                        const isEmpty = electrons === 0;
                        const colors = BLOCK_COLORS[orbital.block];

                        return (
                          <div
                            key={orbital.label}
                            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 transition-all ${
                              isFull
                                ? `${colors.bg} ${colors.border}`
                                : isEmpty
                                ? "border-border/40 opacity-50"
                                : `${colors.bg} ${colors.border} opacity-90`
                            }`}
                          >
                            <span
                              className={`w-5 text-[10px] font-bold ${
                                isEmpty
                                  ? "text-muted-foreground/50"
                                  : colors.text
                              }`}
                            >
                              {orbital.label}
                            </span>
                            <OrbitalBox
                              electrons={electrons}
                              maxElectrons={orbital.maxElectrons}
                              onClick={() => handleOrbitalClick(index)}
                            />
                            <span className="w-5 text-right text-[9px] tabular-nums text-muted-foreground">
                              {electrons > 0 ? electrons : ""}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Aufbau order visualization */}
        <div className="mt-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Filling Order (Aufbau Principle)
          </span>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {AUFBAU_ORBITALS.map((orbital, i) => {
              const electrons = config[i];
              const isFull = electrons === orbital.maxElectrons;
              const hasElectrons = electrons > 0;
              const colors = BLOCK_COLORS[orbital.block];

              return (
                <div key={orbital.label} className="flex items-center">
                  <button
                    onClick={() => handleOrbitalClick(i)}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition-all ${
                      isFull
                        ? `${colors.bg} ${colors.text}`
                        : hasElectrons
                        ? `${colors.bg} ${colors.text} opacity-75`
                        : "text-muted-foreground/30 hover:text-muted-foreground/60"
                    }`}
                  >
                    {orbital.label}
                    {hasElectrons && (
                      <sup className="ml-0.5 text-[8px]">{electrons}</sup>
                    )}
                  </button>
                  {i < AUFBAU_ORBITALS.length - 1 && (
                    <span className="mx-0.5 text-[8px] text-muted-foreground/20">
                      →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shell summary */}
        {total > 0 && (
          <div className="mt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Shell Summary
            </span>
            <div className="mt-1.5 flex gap-2">
              {Array.from(orbitalsByLevel.entries())
                .sort(([a], [b]) => a - b)
                .map(([n, orbitals]) => {
                  const shellTotal = orbitals.reduce(
                    (sum, { index }) => sum + config[index],
                    0
                  );
                  const shellMax = orbitals.reduce(
                    (sum, { orbital }) => sum + orbital.maxElectrons,
                    0
                  );
                  if (shellTotal === 0) return null;
                  const pct =
                    shellMax > 0 ? (shellTotal / shellMax) * 100 : 0;

                  return (
                    <div
                      key={n}
                      className="flex-1 rounded-md border border-border/60 px-2 py-1.5 text-center"
                    >
                      <span className="text-[9px] font-semibold uppercase text-muted-foreground">
                        Shell {n}
                      </span>
                      <p className="text-sm font-black tabular-nums text-foreground">
                        {shellTotal}
                      </p>
                      <div className="mx-auto mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[8px] tabular-nums text-muted-foreground">
                        / {shellMax}
                      </span>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {total === 0 && (
          <div className="mt-4 flex flex-col items-center justify-center py-4 text-center">
            <Atom className="size-8 text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">
              Click orbital boxes to add electrons, or use the quick-load
              buttons
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">
              Follows the Aufbau principle and Hund&apos;s rule
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
