"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, Atom, Thermometer, Layers, Clock, Lightbulb, FlaskConical } from "lucide-react";
import type { Element, PeriodicTableAction } from "@/lib/periodic-table/types";
import { CATEGORY_COLORS } from "@/lib/periodic-table/constants";
import { getElementState } from "@/lib/periodic-table/elements-data";
import { BohrModel } from "./bohr-model";

interface ElementDetailPanelProps {
  element: Element;
  dispatch: React.Dispatch<PeriodicTableAction>;
}

function PropertyRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium tabular-nums">
        {value}
        {unit && (
          <span className="ml-0.5 text-[10px] text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="mt-5 mb-2 flex items-center gap-2 border-t border-border pt-4">
      <Icon className="size-3.5 text-brand" />
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand">
        {title}
      </h3>
    </div>
  );
}

function ElectronShellDiagram({ shells }: { shells: number[] }) {
  const maxElectrons = Math.max(...shells);
  return (
    <div className="mt-2 flex items-end gap-1">
      {shells.map((count, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold tabular-nums text-foreground">
            {count}
          </span>
          <div
            className="rounded-sm bg-brand/80"
            style={{
              width: "14px",
              height: `${Math.max(4, (count / maxElectrons) * 36)}px`,
            }}
          />
          <span className="text-[8px] text-muted-foreground">
            {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ElementDetailPanel({
  element,
  dispatch,
}: ElementDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const categoryColor = CATEGORY_COLORS[element.category];
  const stateAtRT = getElementState(element, 298);

  const handleClose = useCallback(() => {
    dispatch({ type: "CLOSE_DETAIL_PANEL" });
  }, [dispatch]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Focus trap — focus panel on open
  useEffect(() => {
    panelRef.current?.focus();
  }, [element.atomicNumber]);

  const crystalLabels: Record<string, string> = {
    fcc: "Face-Centered Cubic",
    bcc: "Body-Centered Cubic",
    hcp: "Hexagonal Close-Packed",
    "simple-cubic": "Simple Cubic",
    "diamond-cubic": "Diamond Cubic",
    rhombohedral: "Rhombohedral",
    orthorhombic: "Orthorhombic",
    tetragonal: "Tetragonal",
    monoclinic: "Monoclinic",
    triclinic: "Triclinic",
    hexagonal: "Hexagonal",
    unknown: "Unknown",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity lg:hidden"
        onClick={handleClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`${element.name} details`}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl outline-none transition-transform duration-200 ease-out sm:w-[420px]"
        style={{
          animation: "slideInRight 200ms ease-out",
        }}
      >
        {/* Header — colored by category */}
        <div
          className="relative flex-shrink-0 px-5 pb-4 pt-5"
          style={{ backgroundColor: categoryColor.bg }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-1.5 transition-colors hover:bg-black/10"
            style={{ color: categoryColor.text }}
            aria-label="Close detail panel"
          >
            <X className="size-5" />
          </button>

          {/* Atomic number badge */}
          <div
            className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: categoryColor.border,
              color: categoryColor.bg,
            }}
          >
            #{element.atomicNumber}
          </div>

          {/* Symbol + Name */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: categoryColor.text }}
            >
              {element.symbol}
            </span>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: categoryColor.text }}
              >
                {element.name}
              </h2>
              <p
                className="text-xs font-medium opacity-70"
                style={{ color: categoryColor.text }}
              >
                {categoryColor.label} · {element.block.toUpperCase()}-block
              </p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-3 flex gap-3">
            {[
              { label: "Mass", value: `${element.atomicMass.toFixed(4)} u` },
              { label: "State", value: stateAtRT.charAt(0).toUpperCase() + stateAtRT.slice(1) },
              { label: "Period", value: String(element.period) },
              { label: "Group", value: element.group ? String(element.group) : "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-md px-2 py-1"
                style={{ backgroundColor: `${categoryColor.border}40` }}
              >
                <p
                  className="text-[9px] uppercase tracking-wider opacity-60"
                  style={{ color: categoryColor.text }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-xs font-bold"
                  style={{ color: categoryColor.text }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Body — scrollable property sections */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* Electron Configuration */}
          <SectionHeader icon={Atom} title="Electron Configuration" />
          <p className="font-mono text-sm font-medium">
            {element.electronConfiguration}
          </p>
          <ElectronShellDiagram shells={element.electronShells} />
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Electrons per shell: {element.electronShells.join(", ")}
          </p>

          {/* Bohr Model */}
          <BohrModel
            symbol={element.symbol}
            atomicNumber={element.atomicNumber}
            electronShells={element.electronShells}
          />

          {/* Atomic Properties */}
          <SectionHeader icon={FlaskConical} title="Atomic Properties" />
          <div className="divide-y divide-border/50">
            <PropertyRow
              label="Electronegativity"
              value={element.electronegativity}
              unit="Pauling"
            />
            <PropertyRow
              label="Atomic Radius"
              value={element.atomicRadius}
              unit="pm"
            />
            <PropertyRow
              label="Ionization Energy"
              value={element.ionizationEnergy}
              unit="kJ/mol"
            />
            <PropertyRow
              label="Electron Affinity"
              value={element.electronAffinity}
              unit="kJ/mol"
            />
          </div>

          {/* Physical Properties */}
          <SectionHeader icon={Thermometer} title="Physical Properties" />
          <div className="divide-y divide-border/50">
            <PropertyRow
              label="Melting Point"
              value={element.meltingPoint?.toFixed(2) ?? null}
              unit="K"
            />
            <PropertyRow
              label="Boiling Point"
              value={element.boilingPoint?.toFixed(2) ?? null}
              unit="K"
            />
            <PropertyRow
              label="Density"
              value={element.density}
              unit="g/cm³"
            />
            <PropertyRow
              label="Crystal Structure"
              value={crystalLabels[element.crystalStructure] ?? element.crystalStructure}
            />
            <PropertyRow
              label="State at 25°C"
              value={stateAtRT.charAt(0).toUpperCase() + stateAtRT.slice(1)}
            />
          </div>

          {/* Isotopes */}
          {element.isotopes.length > 0 && (
            <>
              <SectionHeader icon={Layers} title="Isotopes" />
              <div className="space-y-1.5">
                {element.isotopes.map((iso) => (
                  <div
                    key={iso.massNumber}
                    className="flex items-center gap-2"
                  >
                    <span className="min-w-[3rem] text-xs font-mono font-medium">
                      <sup>{iso.massNumber}</sup>{element.symbol}
                    </span>
                    {iso.abundance !== null ? (
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-brand/70 transition-all"
                            style={{ width: `${Math.max(1, iso.abundance)}%` }}
                          />
                        </div>
                        <span className="min-w-[3rem] text-right text-[10px] tabular-nums text-muted-foreground">
                          {iso.abundance}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        Synthetic · t½ {iso.halfLife}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Discovery */}
          <SectionHeader icon={Clock} title="Discovery" />
          <div className="divide-y divide-border/50">
            <PropertyRow
              label="Year"
              value={
                element.yearDiscovered === "Ancient"
                  ? "Ancient"
                  : element.yearDiscovered
              }
            />
            <PropertyRow
              label="Discovered by"
              value={element.discoverer ?? "Unknown (ancient)"}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Name origin:</span>{" "}
            {element.nameOrigin}
          </p>

          {/* Uses */}
          {element.uses.length > 0 && (
            <>
              <SectionHeader icon={Lightbulb} title="Real-World Uses" />
              <div className="flex flex-wrap gap-1.5">
                {element.uses.map((use) => (
                  <span
                    key={use}
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border px-5 py-3">
          <p className="text-center text-[10px] text-muted-foreground">
            Click another element or press <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">Esc</kbd> to close
          </p>
        </div>
      </div>

    </>
  );
}
