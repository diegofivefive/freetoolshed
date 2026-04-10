"use client";

import { useState, useCallback } from "react";
import { Download, FileSpreadsheet, FileJson, FileText, Image, X, Check } from "lucide-react";
import type { Element, PeriodicTableAction } from "@/lib/periodic-table/types";
import { ELEMENTS } from "@/lib/periodic-table/elements-data";

interface ExportControlsProps {
  dispatch: React.Dispatch<PeriodicTableAction>;
}

/** Properties to include in exports */
const EXPORT_PROPERTIES: {
  key: keyof Element;
  label: string;
  unit?: string;
  csvHeader: string;
}[] = [
  { key: "atomicNumber", label: "Atomic Number", csvHeader: "Atomic Number" },
  { key: "symbol", label: "Symbol", csvHeader: "Symbol" },
  { key: "name", label: "Name", csvHeader: "Name" },
  { key: "atomicMass", label: "Atomic Mass", unit: "u", csvHeader: "Atomic Mass (u)" },
  { key: "category", label: "Category", csvHeader: "Category" },
  { key: "block", label: "Block", csvHeader: "Block" },
  { key: "group", label: "Group", csvHeader: "Group" },
  { key: "period", label: "Period", csvHeader: "Period" },
  { key: "electronConfiguration", label: "Electron Config", csvHeader: "Electron Configuration" },
  { key: "electronegativity", label: "Electronegativity", unit: "Pauling", csvHeader: "Electronegativity" },
  { key: "atomicRadius", label: "Atomic Radius", unit: "pm", csvHeader: "Atomic Radius (pm)" },
  { key: "ionizationEnergy", label: "Ionization Energy", unit: "kJ/mol", csvHeader: "Ionization Energy (kJ/mol)" },
  { key: "electronAffinity", label: "Electron Affinity", unit: "kJ/mol", csvHeader: "Electron Affinity (kJ/mol)" },
  { key: "meltingPoint", label: "Melting Point", unit: "K", csvHeader: "Melting Point (K)" },
  { key: "boilingPoint", label: "Boiling Point", unit: "K", csvHeader: "Boiling Point (K)" },
  { key: "density", label: "Density", unit: "g/cm³", csvHeader: "Density (g/cm³)" },
  { key: "stateAtRT", label: "State at RT", csvHeader: "State at Room Temp" },
  { key: "crystalStructure", label: "Crystal Structure", csvHeader: "Crystal Structure" },
  { key: "yearDiscovered", label: "Year Discovered", csvHeader: "Year Discovered" },
  { key: "discoverer", label: "Discoverer", csvHeader: "Discoverer" },
];

/** Default selected properties for export */
const DEFAULT_SELECTED = new Set<string>([
  "atomicNumber",
  "symbol",
  "name",
  "atomicMass",
  "category",
  "block",
  "electronConfiguration",
  "electronegativity",
  "atomicRadius",
  "meltingPoint",
  "boilingPoint",
  "density",
  "stateAtRT",
]);

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportControls({ dispatch }: ExportControlsProps) {
  const [selectedProps, setSelectedProps] = useState<Set<string>>(
    () => new Set(DEFAULT_SELECTED)
  );
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const toggleProp = useCallback((key: string) => {
    setSelectedProps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Don't allow deselecting all
        if (next.size <= 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedProps(new Set(EXPORT_PROPERTIES.map((p) => p.key)));
  }, []);

  const selectDefault = useCallback(() => {
    setSelectedProps(new Set(DEFAULT_SELECTED));
  }, []);

  const getSelectedProperties = useCallback(() => {
    return EXPORT_PROPERTIES.filter((p) => selectedProps.has(p.key));
  }, [selectedProps]);

  const showStatus = useCallback((msg: string) => {
    setExportStatus(msg);
    setTimeout(() => setExportStatus(null), 2500);
  }, []);

  // CSV Export
  const exportCSV = useCallback(() => {
    const props = getSelectedProperties();
    const header = props.map((p) => `"${p.csvHeader}"`).join(",");
    const rows = ELEMENTS.map((el) =>
      props
        .map((p) => {
          const val = formatValue(el[p.key]);
          // Escape quotes in CSV
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    triggerDownload(csv, "periodic-table-elements.csv", "text/csv;charset=utf-8");
    showStatus("CSV exported successfully");
  }, [getSelectedProperties, showStatus]);

  // JSON Export
  const exportJSON = useCallback(() => {
    const props = getSelectedProperties();
    const data = ELEMENTS.map((el) => {
      const obj: Record<string, unknown> = {};
      for (const p of props) {
        obj[p.key] = el[p.key];
      }
      return obj;
    });
    const json = JSON.stringify(data, null, 2);
    triggerDownload(json, "periodic-table-elements.json", "application/json");
    showStatus("JSON exported successfully");
  }, [getSelectedProperties, showStatus]);

  // PDF Export
  const exportPDF = useCallback(async () => {
    showStatus("Generating PDF...");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const props = getSelectedProperties();
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Title
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text("Periodic Table — Element Data", 14, 18);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Generated by Free Tool Shed (freetoolshed.com)", 14, 24);
      doc.text(`${ELEMENTS.length} elements · ${props.length} properties · ${new Date().toLocaleDateString()}`, 14, 29);

      // Table
      const headers = props.map((p) => p.csvHeader);
      const body = ELEMENTS.map((el) =>
        props.map((p) => formatValue(el[p.key]))
      );

      autoTable(doc, {
        startY: 34,
        head: [headers],
        body,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontSize: 6.5,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "auto",
        margin: { left: 10, right: 10 },
      });

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} — freetoolshed.com`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: "center" }
        );
      }

      doc.save("periodic-table-elements.pdf");
      showStatus("PDF exported successfully");
    } catch {
      showStatus("PDF export failed");
    }
  }, [getSelectedProperties, showStatus]);

  // PNG Export (screenshot of current table view)
  const exportPNG = useCallback(async () => {
    showStatus("Capturing table...");
    try {
      // Find the table grid element
      const gridEl = document.querySelector("[data-periodic-grid]") as HTMLElement | null;
      if (!gridEl) {
        showStatus("Could not find table grid");
        return;
      }

      // Use canvas to render
      const canvas = document.createElement("canvas");
      const rect = gridEl.getBoundingClientRect();
      const scale = 2; // High DPI
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        showStatus("Canvas not supported");
        return;
      }

      // Draw background
      const isDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "#09090b" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use SVG foreignObject approach for accurate rendering
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${gridEl.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new window.Image();
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error("Failed to render"));
        };
        img.src = svgUrl;
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "periodic-table.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showStatus("PNG exported successfully");
        }
      }, "image/png");
    } catch {
      showStatus("PNG export failed — try CSV or PDF instead");
    }
  }, [showStatus]);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Download className="size-4 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Export Data
        </span>
        {exportStatus && (
          <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-medium text-brand">
            <Check className="size-3" />
            {exportStatus}
          </span>
        )}
        <button
          onClick={() => dispatch({ type: "TOGGLE_EXPORT" })}
          className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
          Close
        </button>
      </div>

      <div className="px-4 pb-4 pt-3">
        {/* Export format buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 transition-all hover:border-brand/50 hover:bg-brand/5"
          >
            <FileSpreadsheet className="size-4 text-emerald-500" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-foreground">
                CSV
              </span>
              <span className="block text-[9px] text-muted-foreground">
                Spreadsheet-ready
              </span>
            </div>
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 transition-all hover:border-brand/50 hover:bg-brand/5"
          >
            <FileJson className="size-4 text-amber-500" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-foreground">
                JSON
              </span>
              <span className="block text-[9px] text-muted-foreground">
                Developer-friendly
              </span>
            </div>
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 transition-all hover:border-brand/50 hover:bg-brand/5"
          >
            <FileText className="size-4 text-pink-400" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-foreground">
                PDF
              </span>
              <span className="block text-[9px] text-muted-foreground">
                Print-ready table
              </span>
            </div>
          </button>

          <button
            onClick={exportPNG}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 transition-all hover:border-brand/50 hover:bg-brand/5"
          >
            <Image className="size-4 text-blue-400" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-foreground">
                PNG
              </span>
              <span className="block text-[9px] text-muted-foreground">
                Table screenshot
              </span>
            </div>
          </button>
        </div>

        {/* Property selector */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Properties to Export ({selectedProps.size}/{EXPORT_PROPERTIES.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-[10px] font-medium text-brand hover:underline"
              >
                Select All
              </button>
              <button
                onClick={selectDefault}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EXPORT_PROPERTIES.map((prop) => {
              const isSelected = selectedProps.has(prop.key);
              return (
                <button
                  key={prop.key}
                  onClick={() => toggleProp(prop.key)}
                  className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${
                    isSelected
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-muted-foreground/50 hover:border-border hover:text-muted-foreground"
                  }`}
                >
                  {isSelected && <Check className="mr-0.5 inline size-2.5" />}
                  {prop.label}
                  {prop.unit && (
                    <span className="ml-0.5 text-[8px] opacity-60">
                      ({prop.unit})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data preview */}
        <div className="mt-3 rounded-md bg-muted/50 px-3 py-2">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Preview
          </span>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {ELEMENTS.length} elements × {selectedProps.size} properties ={" "}
            <span className="font-bold text-foreground">
              {(ELEMENTS.length * selectedProps.size).toLocaleString()} data
              points
            </span>
          </p>
          <div className="mt-1.5 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  {getSelectedProperties()
                    .slice(0, 6)
                    .map((p) => (
                      <th
                        key={p.key}
                        className="px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {p.label}
                      </th>
                    ))}
                  {selectedProps.size > 6 && (
                    <th className="px-2 py-1 text-[8px] text-muted-foreground/50">
                      +{selectedProps.size - 6} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {ELEMENTS.slice(0, 3).map((el) => (
                  <tr
                    key={el.atomicNumber}
                    className="border-b border-border/30"
                  >
                    {getSelectedProperties()
                      .slice(0, 6)
                      .map((p) => (
                        <td
                          key={p.key}
                          className="px-2 py-1 text-[10px] tabular-nums text-foreground"
                        >
                          {formatValue(el[p.key]) || "—"}
                        </td>
                      ))}
                    {selectedProps.size > 6 && (
                      <td className="px-2 py-1 text-[10px] text-muted-foreground/40">
                        …
                      </td>
                    )}
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan={Math.min(selectedProps.size, 7)}
                    className="px-2 py-1 text-[9px] text-muted-foreground/50"
                  >
                    … and {ELEMENTS.length - 3} more elements
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
