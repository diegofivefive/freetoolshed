"use client";

import { useState, useEffect } from "react";
import { Download, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPORT_FORMAT_LABELS } from "@/lib/ocr/constants";
import { exportOcrResult, copyTextToClipboard } from "@/lib/ocr/export";
import type { ExportFormat } from "@/lib/ocr/types";
import type { SearchablePdfPage } from "@/lib/ocr/export";

type ExportStatus = "idle" | "exporting" | "success" | "error";

interface ExportPanelProps {
  text: string;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  pages: SearchablePdfPage[];
  disabled?: boolean;
  defaultFilename?: string;
}

export function ExportPanel({
  text,
  format,
  onFormatChange,
  pages,
  disabled = false,
  defaultFilename = "ocr-result",
}: ExportPanelProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [copyStatus, setCopyStatus] = useState<ExportStatus>("idle");
  const [filename, setFilename] = useState(defaultFilename);

  // Update filename when the default changes (e.g. new file uploaded)
  useEffect(() => {
    setFilename(defaultFilename);
  }, [defaultFilename]);

  const hasText = text.trim().length > 0;
  const isDisabled = disabled || !hasText;

  const handleExport = async () => {
    if (isDisabled) return;
    setExportStatus("exporting");

    try {
      await exportOcrResult({
        format,
        text,
        filename: filename || "ocr-result",
        pages: format === "pdf" ? pages : undefined,
      });
      setExportStatus("success");
      setTimeout(() => setExportStatus("idle"), 2500);
    } catch {
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2500);
    }
  };

  const handleCopy = async () => {
    if (!hasText) return;
    setCopyStatus("exporting");

    const ok = await copyTextToClipboard(text);
    setCopyStatus(ok ? "success" : "error");
    setTimeout(() => setCopyStatus("idle"), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
      <p className="mr-1 text-sm font-medium text-muted-foreground">Export:</p>

      {/* Filename input */}
      <input
        type="text"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        placeholder="filename"
        className="w-36 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        disabled={isDisabled}
      />

      {/* Format selector */}
      <select
        value={format}
        onChange={(e) => onFormatChange(e.target.value as ExportFormat)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        disabled={isDisabled}
      >
        {(Object.entries(EXPORT_FORMAT_LABELS) as [ExportFormat, string][]).map(
          ([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ),
        )}
      </select>

      {/* Download button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isDisabled || exportStatus === "exporting"}
      >
        {exportStatus === "exporting" ? (
          <Loader2 className="mr-1.5 size-4 animate-spin" />
        ) : exportStatus === "success" ? (
          <Check className="mr-1.5 size-4 text-emerald-500" />
        ) : (
          <Download className="mr-1.5 size-4" />
        )}
        {exportStatus === "success"
          ? "Downloaded"
          : exportStatus === "error"
            ? "Failed"
            : "Download"}
      </Button>

      {/* Copy button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={!hasText || copyStatus === "exporting"}
      >
        {copyStatus === "success" ? (
          <Check className="mr-1.5 size-4 text-emerald-500" />
        ) : (
          <Copy className="mr-1.5 size-4" />
        )}
        {copyStatus === "success"
          ? "Copied!"
          : copyStatus === "error"
            ? "Failed"
            : "Copy Text"}
      </Button>

      {/* Hint for PDF export */}
      {format === "pdf" && hasText && (
        <p className="text-xs text-muted-foreground">
          Creates a searchable PDF with invisible text over the scanned image
        </p>
      )}
    </div>
  );
}
