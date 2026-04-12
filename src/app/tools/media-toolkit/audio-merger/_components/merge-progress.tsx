"use client";

import { Download, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MergeStatus } from "@/lib/media-toolkit/types";
import { FORMAT_CONFIGS } from "@/lib/media-toolkit/constants";
import type { OutputFormat } from "@/lib/media-toolkit/types";

const STATUS_LABELS: Record<MergeStatus, string> = {
  idle: "",
  "loading-ffmpeg": "Loading ffmpeg engine…",
  concatenating: "Reading input files…",
  encoding: "Merging audio…",
  done: "Merge complete!",
  error: "Merge failed",
};

interface MergeProgressProps {
  status: MergeStatus;
  progress: number;
  error: string | null;
  outputBlob: Blob | null;
  outputFilename: string;
  outputFormat: OutputFormat;
  onCancel: () => void;
  onReset: () => void;
}

export function MergeProgress({
  status,
  progress,
  error,
  outputBlob,
  outputFilename,
  outputFormat,
  onCancel,
  onReset,
}: MergeProgressProps) {
  if (status === "idle") return null;

  const isRunning =
    status === "loading-ffmpeg" ||
    status === "concatenating" ||
    status === "encoding";

  const handleDownload = () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${outputFilename}.${FORMAT_CONFIGS[outputFormat].extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Status label */}
      <div className="mb-2 flex items-center gap-2 text-sm">
        {isRunning && (
          <Loader2 className="size-4 animate-spin text-brand" />
        )}
        <span
          className={
            status === "error"
              ? "text-pink-400"
              : status === "done"
                ? "text-brand"
                : "text-muted-foreground"
          }
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {status === "error" && error && (
        <p className="mb-3 text-sm text-pink-400">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isRunning && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            <XCircle className="mr-1.5 size-4" />
            Cancel
          </Button>
        )}

        {status === "done" && (
          <Button size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 size-4" />
            Download
          </Button>
        )}

        {(status === "done" || status === "error") && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 size-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
