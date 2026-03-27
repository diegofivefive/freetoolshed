"use client";

import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ExportFormat } from "@/lib/audio/types";
import { FORMAT_LABELS, MP3_BITRATES } from "@/lib/audio/constants";
import { exportAudio, downloadBlob } from "@/lib/audio/export";

interface ExportPanelProps {
  buffer: AudioBuffer;
  trackName: string;
  format: ExportFormat;
  bitrate: number;
  onFormatChange: (format: ExportFormat) => void;
  onBitrateChange: (bitrate: number) => void;
}

export function ExportPanel({
  buffer,
  trackName,
  format,
  bitrate,
  onFormatChange,
  onBitrateChange,
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const baseName = trackName.replace(/\.[^.]+$/, "");

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportAudio(buffer, format, bitrate);
      downloadBlob(result.blob, `${baseName}.${result.extension}`);
    } catch {
      // Export failed silently — user can retry
    } finally {
      setIsExporting(false);
    }
  }, [buffer, format, bitrate, baseName]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">
        Export:
      </span>

      {/* Format selector */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor="export-format" className="text-xs">
          Format
        </Label>
        <select
          id="export-format"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as ExportFormat)}
          className="h-8 rounded border border-border bg-background px-2 text-xs"
        >
          {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      {/* Bitrate (only for mp3/ogg) */}
      {format !== "wav" && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor="export-bitrate" className="text-xs">
            Bitrate
          </Label>
          <select
            id="export-bitrate"
            value={bitrate}
            onChange={(e) => onBitrateChange(Number(e.target.value))}
            className="h-8 rounded border border-border bg-background px-2 text-xs"
          >
            {MP3_BITRATES.map((b) => (
              <option key={b} value={b}>
                {b} kbps
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File info */}
      <span className="text-xs text-muted-foreground">
        {buffer.numberOfChannels === 1 ? "Mono" : "Stereo"} ·{" "}
        {buffer.sampleRate} Hz · {buffer.duration.toFixed(1)}s
      </span>

      {/* Export button */}
      <Button
        variant="default"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
        className="ml-auto"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            Exporting…
          </>
        ) : (
          <>
            <Download className="mr-1.5 size-3.5" />
            Download {format.toUpperCase()}
          </>
        )}
      </Button>
    </div>
  );
}
