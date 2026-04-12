"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { UnitDefinition } from "@/lib/unit-converter/types";

interface UnitSelectorProps {
  units: UnitDefinition[];
  selectedId: string;
  onChange: (unitId: string) => void;
  label: string;
}

export function UnitSelector({
  units,
  selectedId,
  onChange,
  label,
}: UnitSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => units.find((u) => u.id === selectedId),
    [units, selectedId]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return units;
    const q = search.toLowerCase().trim();
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.symbol.toLowerCase().includes(q) ||
        u.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [units, search]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 text-left text-sm font-medium backdrop-blur-sm transition-all hover:border-border focus:border-brand focus:outline-none focus:shadow-[0_0_16px_oklch(0.696_0.17_162.48/12%)]"
      >
        <span className="truncate">
          {selected ? (
            <>
              {selected.name}{" "}
              <span className="text-muted-foreground">({selected.symbol})</span>
            </>
          ) : (
            "Select unit"
          )}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/50 bg-card/95 shadow-xl shadow-black/20 backdrop-blur-xl">
          {/* Search input */}
          <div className="border-b border-border/30 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search units..."
                className="w-full rounded-md bg-background/50 py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Unit list */}
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No units found
              </p>
            ) : (
              filtered.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => {
                    onChange(unit.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    unit.id === selectedId
                      ? "bg-brand/10 text-brand"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="font-medium">{unit.name}</span>
                  <span
                    className={`ml-2 shrink-0 text-xs ${
                      unit.id === selectedId
                        ? "text-brand/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {unit.symbol}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
