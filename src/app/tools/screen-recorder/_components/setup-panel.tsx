"use client";

import { Mic, MicOff, Monitor, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QUALITY_ORDER,
  QUALITY_PRESETS,
} from "@/lib/screen-recorder/constants";
import type {
  AudioSourceConfig,
  QualityPresetId,
  WebcamConfig,
} from "@/lib/screen-recorder/types";
import { WebcamOverlayConfig } from "./webcam-overlay-config";

interface SetupPanelProps {
  quality: QualityPresetId;
  audioSources: AudioSourceConfig;
  webcam: WebcamConfig;
  recordingError: string | null;
  onQualityChange: (quality: QualityPresetId) => void;
  onToggleAudioSource: (source: keyof AudioSourceConfig) => void;
  onToggleWebcam: () => void;
  onWebcamChange: (patch: Partial<WebcamConfig>) => void;
  onStart: () => void;
}

export function SetupPanel({
  quality,
  audioSources,
  webcam,
  recordingError,
  onQualityChange,
  onToggleAudioSource,
  onToggleWebcam,
  onWebcamChange,
  onStart,
}: SetupPanelProps) {
  const preset = QUALITY_PRESETS[quality];

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Set Up Your Recording</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a quality preset, choose which audio to capture, and drop in a
          webcam overlay if you want one. You&apos;ll pick the actual screen,
          window, or tab in the next step.
        </p>
      </div>

      {recordingError && (
        <div
          role="alert"
          className="rounded-md border border-pink-400/40 bg-pink-400/10 px-3 py-2 text-sm text-pink-400"
        >
          {recordingError}
        </div>
      )}

      {/* Quality */}
      <section className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold">Quality</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Higher resolution means a sharper video and a larger file.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={quality}
            onValueChange={(val) => onQualityChange(val as QualityPresetId)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_ORDER.map((id) => (
                <SelectItem key={id} value={id}>
                  {QUALITY_PRESETS[id].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {preset.description}
          </span>
        </div>
      </section>

      {/* Audio */}
      <section className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold">Audio</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toggle either or both. You can record silent video by turning both
            off.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AudioToggle
            active={audioSources.system}
            onClick={() => onToggleAudioSource("system")}
            title="System audio"
            description="Captures the screen's sound (Chrome needs 'Share tab audio' when you pick a tab)."
            activeIcon={<Volume2 className="size-4" />}
            inactiveIcon={<VolumeX className="size-4" />}
          />
          <AudioToggle
            active={audioSources.mic}
            onClick={() => onToggleAudioSource("mic")}
            title="Microphone"
            description="Captures your voice so you can narrate while recording."
            activeIcon={<Mic className="size-4" />}
            inactiveIcon={<MicOff className="size-4" />}
          />
        </div>
      </section>

      {/* Webcam overlay */}
      <section>
        <WebcamOverlayConfig
          webcam={webcam}
          onToggle={onToggleWebcam}
          onChange={onWebcamChange}
        />
      </section>

      {/* Start button */}
      <div className="pt-2">
        <Button
          size="lg"
          onClick={onStart}
          className="w-full gap-2 sm:w-auto sm:min-w-[220px]"
        >
          <Monitor className="size-4" />
          Start Recording
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Your browser will ask which screen, window, or tab to share.
        </p>
      </div>
    </div>
  );
}

interface AudioToggleProps {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}

function AudioToggle({
  active,
  onClick,
  title,
  description,
  activeIcon,
  inactiveIcon,
}: AudioToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active
          ? "border-brand bg-brand/10"
          : "border-border bg-muted/30 hover:border-brand/40 hover:bg-muted/50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          active
            ? "bg-brand/20 text-brand"
            : "bg-muted text-muted-foreground",
        )}
      >
        {active ? activeIcon : inactiveIcon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wide",
              active ? "text-brand" : "text-muted-foreground",
            )}
          >
            {active ? "On" : "Off"}
          </span>
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
