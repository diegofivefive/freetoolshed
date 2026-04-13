"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Download,
  Loader2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Subtitles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import {
  probeSubtitles,
  extractSubtitle,
  extractAllSubtitles,
  abortSubtitleExtract,
} from "@/lib/media-toolkit/subtitle-extract";
import type {
  SubtitleResult,
  SubtitleFormat,
} from "@/lib/media-toolkit/subtitle-extract";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Drop a video file, scan for subtitles, then extract.",
    steps: [
      "Drop a video file or click Browse",
      "Click Scan for Subtitles",
      "Review detected tracks",
      "Choose output format (SRT, ASS, VTT)",
      "Extract individual tracks or all at once",
    ],
  },
  {
    title: "Supported Containers",
    content:
      "MKV is the most common source for embedded subtitles. MP4, WebM, MOV, and AVI may also contain subtitle tracks, though it's less common.",
  },
  {
    title: "Output Formats",
    content:
      "SRT (SubRip) is the most widely compatible. ASS (Advanced SubStation Alpha) preserves styling and positioning. VTT (WebVTT) is designed for HTML5 video players.",
  },
  {
    title: "No Subtitles Found?",
    content:
      "Not all videos have embedded subtitles. Burned-in (hardcoded) subtitles are part of the video image and cannot be extracted. Streaming downloads often use separate subtitle files rather than embedding them.",
  },
  {
    title: "Batch Extract",
    content:
      "If a video has multiple subtitle tracks (e.g., different languages), you can extract all of them at once. Each track downloads as a separate file tagged with its language code.",
  },
  {
    title: "Tips",
    content:
      "MKV files from media libraries typically have the most subtitle tracks. Language codes like 'eng', 'spa', 'jpn' follow ISO 639 standards. All processing happens in your browser — files never leave your device.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "idle" | "probing" | "extracting" | "done" | "error";

interface SubTrack {
  index: number;
  language: string;
  codec: string;
}

const FORMAT_OPTIONS: { value: SubtitleFormat; label: string }[] = [
  { value: "srt", label: "SRT (SubRip)" },
  { value: "ass", label: "ASS (SubStation Alpha)" },
  { value: "vtt", label: "VTT (WebVTT)" },
];

const ACCEPTED_VIDEO_TYPES =
  "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function languageLabel(code: string): string {
  const map: Record<string, string> = {
    eng: "English",
    spa: "Spanish",
    fre: "French",
    fra: "French",
    ger: "German",
    deu: "German",
    ita: "Italian",
    por: "Portuguese",
    jpn: "Japanese",
    kor: "Korean",
    chi: "Chinese",
    zho: "Chinese",
    ara: "Arabic",
    rus: "Russian",
    hin: "Hindi",
    und: "Unknown",
  };
  return map[code] || code.toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SubtitleExtractor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<SubtitleFormat>("srt");

  const [tracks, setTracks] = useState<SubTrack[]>([]);
  const [probed, setProbed] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<SubtitleResult[]>([]);

  const isBusy = status === "probing" || status === "extracting";

  // ── File handling ───────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStatus("idle");
    setTracks([]);
    setProbed(false);
    setResults([]);
    setError(null);
    setProgress(0);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isBusy) return;
      const f = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith("video/")
      );
      if (f) handleFile(f);
    },
    [handleFile, isBusy]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  // ── Probe ──────────────────────────────────────────────────────────────

  const handleProbe = useCallback(async () => {
    if (!file) return;

    setStatus("probing");
    setError(null);
    setTracks([]);
    setResults([]);

    try {
      const found = await probeSubtitles(file, {
        onStatus: setStatusLabel,
        onProgress: setProgress,
      });
      setTracks(found);
      setProbed(true);
      setStatus("idle");

      if (found.length === 0) {
        setError(
          "No embedded subtitle tracks found in this video. The video may use burned-in subtitles or external subtitle files."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Probing failed");
      setStatus("error");
    }
  }, [file]);

  // ── Extract single ─────────────────────────────────────────────────────

  const handleExtractOne = useCallback(
    async (track: SubTrack) => {
      if (!file) return;

      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("extracting");
      setError(null);
      setResults([]);
      setProgress(0);

      try {
        const result = await extractSubtitle(
          file,
          track.index,
          format,
          { onStatus: setStatusLabel, onProgress: setProgress },
          controller.signal
        );
        result.language = track.language;
        setResults([result]);
        setStatus("done");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
        } else {
          setError(err instanceof Error ? err.message : "Extraction failed");
          setStatus("error");
        }
      } finally {
        abortRef.current = null;
      }
    },
    [file, format]
  );

  // ── Extract all ────────────────────────────────────────────────────────

  const handleExtractAll = useCallback(async () => {
    if (!file || tracks.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("extracting");
    setError(null);
    setResults([]);
    setProgress(0);

    try {
      const allResults = await extractAllSubtitles(
        file,
        tracks,
        format,
        {
          onTrackStart: (idx, total) =>
            setStatusLabel(`Extracting track ${idx} of ${total}…`),
          onProgress: setProgress,
        },
        controller.signal
      );
      setResults(allResults);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Extraction failed");
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [file, tracks, format]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortSubtitleExtract();
  }, []);

  const handleDownload = useCallback((result: SubtitleResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setTracks([]);
    setProbed(false);
    setResults([]);
    setError(null);
    setProgress(0);
  }, []);

  // ── Render: Empty state ─────────────────────────────────────────────────

  if (!file) {
    return (
      <>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="cursor-pointer rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-brand/50 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Drop a video file here to extract subtitles
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MKV, MP4, WebM, MOV, AVI — MKV is the most common source for
            embedded subtitles.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_VIDEO_TYPES}
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: Extractor UI ────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatSize(file.size)}
            </p>
          </div>
          {!isBusy && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Change File
            </Button>
          )}
        </div>

        {/* Format selector */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="sub-format">Output Format</Label>
            <select
              id="sub-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as SubtitleFormat)}
              disabled={isBusy}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scan button */}
        {!probed && status !== "probing" && (
          <Button size="sm" onClick={handleProbe}>
            <Search className="mr-1.5 size-4" />
            Scan for Subtitles
          </Button>
        )}

        {/* Probing progress */}
        {status === "probing" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin text-brand" />
              <span className="text-muted-foreground">{statusLabel}</span>
            </div>
          </div>
        )}

        {/* Track list */}
        {probed && tracks.length > 0 && status !== "extracting" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {tracks.length} Subtitle Track{tracks.length !== 1 ? "s" : ""}{" "}
                Found
              </h3>
              {tracks.length > 1 && (
                <Button size="sm" variant="outline" onClick={handleExtractAll}>
                  <Download className="mr-1.5 size-4" />
                  Extract All
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {tracks.map((track) => (
                <div
                  key={track.index}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Track {track.index} — {languageLabel(track.language)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Codec: {track.codec} · Language: {track.language}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExtractOne(track)}
                  >
                    <Subtitles className="mr-1 size-4" />
                    Extract
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracting progress */}
        {status === "extracting" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin text-brand" />
              <span className="text-muted-foreground">{statusLabel}</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <XCircle className="mr-1.5 size-4" />
              Cancel
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {status === "done" && results.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-brand">
              Extraction Complete — {results.length} File
              {results.length !== 1 ? "s" : ""}
            </h3>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {result.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(result.blob.size)}
                      {result.language && result.language !== "und" && (
                        <span className="ml-2">
                          · {languageLabel(result.language)}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(result)}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            {results.length > 1 && (
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => results.forEach(handleDownload)}
                >
                  <Download className="mr-1.5 size-4" />
                  Download All
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {status === "done" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 size-4" />
              New File
            </Button>
          </div>
        )}

        {status === "error" && probed && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleProbe}>
              Retry Scan
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 size-4" />
              New File
            </Button>
          </div>
        )}
      </div>
      <ToolGuide sections={GUIDE_SECTIONS} />
    </>
  );
}
