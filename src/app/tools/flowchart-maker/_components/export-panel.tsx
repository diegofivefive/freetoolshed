"use client";

import { useState, useCallback } from "react";
import type { FlowchartDiagram } from "@/lib/flowchart/types";
import {
  exportSvg,
  exportPng,
  exportPdf,
  copyToClipboard,
} from "@/lib/flowchart/export";
import {
  Download,
  FileImage,
  FileText,
  FileCode2,
  Clipboard,
  Check,
  X,
} from "lucide-react";

interface ExportPanelProps {
  diagram: FlowchartDiagram;
  onClose: () => void;
}

type ExportStatus = "idle" | "exporting" | "success" | "error";

export function ExportPanel({ diagram, onClose }: ExportPanelProps) {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const showStatus = useCallback(
    (type: "success" | "error", message: string) => {
      setStatus(type);
      setStatusMessage(message);
      setTimeout(() => {
        setStatus("idle");
        setStatusMessage("");
      }, 2500);
    },
    []
  );

  const handleExportSvg = useCallback(() => {
    try {
      exportSvg(diagram);
      showStatus("success", "SVG exported");
    } catch {
      showStatus("error", "Export failed");
    }
  }, [diagram, showStatus]);

  const handleExportPng = useCallback(
    (scale: number) => {
      try {
        setStatus("exporting");
        exportPng(diagram, scale);
        showStatus("success", `PNG exported (${scale}x)`);
      } catch {
        showStatus("error", "Export failed");
      }
    },
    [diagram, showStatus]
  );

  const handleExportPdf = useCallback(
    async (paperSize: "a4" | "letter") => {
      try {
        setStatus("exporting");
        await exportPdf(diagram, paperSize);
        showStatus("success", "PDF exported");
      } catch {
        showStatus("error", "Export failed");
      }
    },
    [diagram, showStatus]
  );

  const handleCopyClipboard = useCallback(async () => {
    try {
      setStatus("exporting");
      const ok = await copyToClipboard(diagram);
      if (ok) {
        showStatus("success", "Copied to clipboard");
      } else {
        showStatus("error", "Copy failed");
      }
    } catch {
      showStatus("error", "Copy failed");
    }
  }, [diagram, showStatus]);

  const isEmpty = diagram.nodes.length === 0;

  return (
    <div className="absolute left-1/2 top-4 z-50 w-72 -translate-x-1/2 rounded-lg border border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold">Export Diagram</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Export options */}
      <div className="space-y-1 p-2">
        {isEmpty && (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            Add shapes to your diagram before exporting.
          </p>
        )}

        {!isEmpty && (
          <>
            {/* SVG */}
            <button
              onClick={handleExportSvg}
              disabled={status === "exporting"}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <FileCode2 className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="font-medium">SVG</div>
                <div className="text-xs text-muted-foreground">
                  Scalable vector — best for editing
                </div>
              </div>
            </button>

            {/* PNG */}
            <div className="flex items-center gap-1 rounded-md px-3 py-2 hover:bg-accent">
              <FileImage className="mr-2 h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">PNG</div>
                <div className="text-xs text-muted-foreground">
                  Raster image — best for sharing
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleExportPng(s)}
                    disabled={status === "exporting"}
                    className="rounded border border-border px-1.5 py-0.5 text-xs hover:bg-background disabled:opacity-50"
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* PDF */}
            <div className="flex items-center gap-1 rounded-md px-3 py-2 hover:bg-accent">
              <FileText className="mr-2 h-4 w-4 text-pink-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">PDF</div>
                <div className="text-xs text-muted-foreground">
                  Print-ready document
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleExportPdf("a4")}
                  disabled={status === "exporting"}
                  className="rounded border border-border px-1.5 py-0.5 text-xs hover:bg-background disabled:opacity-50"
                >
                  A4
                </button>
                <button
                  onClick={() => handleExportPdf("letter")}
                  disabled={status === "exporting"}
                  className="rounded border border-border px-1.5 py-0.5 text-xs hover:bg-background disabled:opacity-50"
                >
                  Letter
                </button>
              </div>
            </div>

            {/* Clipboard */}
            <button
              onClick={handleCopyClipboard}
              disabled={status === "exporting"}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <Clipboard className="h-4 w-4 text-amber-500" />
              <div>
                <div className="font-medium">Copy to Clipboard</div>
                <div className="text-xs text-muted-foreground">
                  PNG — paste into any app
                </div>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Status message */}
      {status !== "idle" && status !== "exporting" && (
        <div
          className={`mx-2 mb-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs ${
            status === "success"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-pink-500/10 text-pink-500"
          }`}
        >
          {status === "success" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          {statusMessage}
        </div>
      )}
    </div>
  );
}
