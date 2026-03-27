"use client";

import { useState, type Dispatch } from "react";
import type { FloorPlan, FloorPlanAction } from "@/lib/floor-plan/types";
import { exportSvg, exportPng, exportPdf } from "@/lib/floor-plan/export";
import { Download, X } from "lucide-react";

interface ExportPanelProps {
  plan: FloorPlan;
  onClose: () => void;
}

type ExportFormat = "svg" | "png" | "pdf";

export function ExportPanel({ plan, onClose }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [includeGrid, setIncludeGrid] = useState(true);
  const [includeDimensions, setIncludeDimensions] = useState(true);
  const [pngScale, setPngScale] = useState(2);
  const [paperSize, setPaperSize] = useState<"a4" | "letter">("letter");

  const handleExport = () => {
    switch (format) {
      case "svg":
        exportSvg(plan, { includeGrid, includeDimensions });
        break;
      case "png":
        exportPng(plan, { includeGrid, includeDimensions, scale: pngScale });
        break;
      case "pdf":
        exportPdf(plan, { includeGrid, includeDimensions, paperSize });
        break;
    }
  };

  return (
    <div className="absolute right-3 top-12 z-50 w-64 rounded-lg border border-border bg-card p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Export
        </h3>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {/* Format selector */}
        <div>
          <label className="text-xs text-muted-foreground">Format</label>
          <div className="mt-1 flex gap-1">
            {(["svg", "png", "pdf"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium uppercase transition-colors ${
                  format === f
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* PNG scale */}
        {format === "png" && (
          <div>
            <label className="text-xs text-muted-foreground">Resolution</label>
            <select
              value={pngScale}
              onChange={(e) => setPngScale(Number(e.target.value))}
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value={1}>1x (Standard)</option>
              <option value={2}>2x (Retina)</option>
              <option value={4}>4x (High-res)</option>
            </select>
          </div>
        )}

        {/* PDF paper size */}
        {format === "pdf" && (
          <div>
            <label className="text-xs text-muted-foreground">Paper Size</label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as "a4" | "letter")}
              className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="letter">Letter (8.5 × 11)</option>
              <option value="a4">A4 (210 × 297mm)</option>
            </select>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
              className="rounded"
            />
            Include Grid
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeDimensions}
              onChange={(e) => setIncludeDimensions(e.target.checked)}
              className="rounded"
            />
            Include Dimensions
          </label>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download {format.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
