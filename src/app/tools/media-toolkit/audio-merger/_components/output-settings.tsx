"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMAT_CONFIGS, BITRATE_PRESETS } from "@/lib/media-toolkit/constants";
import type { MergeOptions, OutputFormat } from "@/lib/media-toolkit/types";

interface OutputSettingsProps {
  options: MergeOptions;
  onUpdate: (patch: Partial<MergeOptions>) => void;
  disabled?: boolean;
}

export function OutputSettings({
  options,
  onUpdate,
  disabled,
}: OutputSettingsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Format */}
      <div className="space-y-1.5">
        <Label htmlFor="output-format">Output Format</Label>
        <Select
          value={options.outputFormat}
          onValueChange={(v) => {
            if (!v) return;
            const fmt = v as OutputFormat;
            onUpdate({
              outputFormat: fmt,
              // Only M4A supports chapters
              chapterMarkers: fmt === "m4a" ? options.chapterMarkers : false,
            });
          }}
          disabled={disabled}
        >
          <SelectTrigger id="output-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FORMAT_CONFIGS).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bitrate */}
      <div className="space-y-1.5">
        <Label htmlFor="output-bitrate">Bitrate</Label>
        <Select
          value={options.outputBitrate}
          onValueChange={(v) => { if (v) onUpdate({ outputBitrate: v }); }}
          disabled={disabled}
        >
          <SelectTrigger id="output-bitrate">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BITRATE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chapter markers */}
      <div className="space-y-1.5">
        <Label htmlFor="chapter-markers">Chapter Markers</Label>
        <Select
          value={options.chapterMarkers ? "on" : "off"}
          onValueChange={(v) => { if (v) onUpdate({ chapterMarkers: v === "on" }); }}
          disabled={disabled || options.outputFormat !== "m4a"}
        >
          <SelectTrigger id="chapter-markers">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="on">Enabled</SelectItem>
            <SelectItem value="off">Disabled</SelectItem>
          </SelectContent>
        </Select>
        {options.outputFormat !== "m4a" && (
          <p className="text-xs text-muted-foreground">
            Only available for M4A output
          </p>
        )}
      </div>

      {/* Output filename */}
      <div className="space-y-1.5">
        <Label htmlFor="output-filename">Filename</Label>
        <Input
          id="output-filename"
          value={options.outputFilename}
          onChange={(e) => onUpdate({ outputFilename: e.target.value })}
          disabled={disabled}
          placeholder="merged-audio"
        />
      </div>
    </div>
  );
}
