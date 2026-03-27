"use client";

import { useCallback, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  FlipHorizontal,
  Volume1,
  AudioLines,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Selection } from "@/lib/audio/types";
import {
  fadeIn,
  fadeOut,
  normalize,
  reverse,
  amplify,
  noiseReduction,
} from "@/lib/audio/effects";

interface EffectsPanelProps {
  buffer: AudioBuffer;
  selection: Selection | null;
  audioContext: AudioContext;
  onApply: (buffer: AudioBuffer, label: string) => void;
  disabled: boolean;
}

export function EffectsPanel({
  buffer,
  selection,
  audioContext,
  onApply,
  disabled,
}: EffectsPanelProps) {
  const [amplifyGain, setAmplifyGain] = useState("1.5");
  const [noiseStrength, setNoiseStrength] = useState("0.8");

  const startTime = selection?.start;
  const endTime = selection?.end;
  const regionLabel = selection
    ? ` (${startTime?.toFixed(1)}s–${endTime?.toFixed(1)}s)`
    : " (all)";

  const applyEffect = useCallback(
    (
      fn: (
        ctx: AudioContext,
        buf: AudioBuffer,
        ...args: number[]
      ) => AudioBuffer,
      label: string,
      ...args: number[]
    ) => {
      const result = fn(audioContext, buffer, ...args);
      onApply(result, label);
    },
    [audioContext, buffer, onApply]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">
        Effects{regionLabel}:
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          applyEffect(
            (ctx, buf) => fadeIn(ctx, buf, startTime, endTime),
            "Fade in"
          )
        }
        title="Fade in"
      >
        <TrendingUp className="mr-1.5 size-3.5" />
        Fade In
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          applyEffect(
            (ctx, buf) => fadeOut(ctx, buf, startTime, endTime),
            "Fade out"
          )
        }
        title="Fade out"
      >
        <TrendingDown className="mr-1.5 size-3.5" />
        Fade Out
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          applyEffect(
            (ctx, buf) => normalize(ctx, buf, 1.0, startTime, endTime),
            "Normalize"
          )
        }
        title="Normalize volume to peak"
      >
        <Gauge className="mr-1.5 size-3.5" />
        Normalize
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          applyEffect(
            (ctx, buf) => reverse(ctx, buf, startTime, endTime),
            "Reverse"
          )
        }
        title="Reverse audio"
      >
        <FlipHorizontal className="mr-1.5 size-3.5" />
        Reverse
      </Button>

      {/* Amplify with gain input */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            const gain = parseFloat(amplifyGain);
            if (isNaN(gain) || gain <= 0) return;
            applyEffect(
              (ctx, buf) => amplify(ctx, buf, gain, startTime, endTime),
              `Amplify ×${gain}`
            );
          }}
          title="Amplify volume"
        >
          <Volume1 className="mr-1.5 size-3.5" />
          Amplify
        </Button>
        <Label className="sr-only" htmlFor="amplify-gain">
          Gain factor
        </Label>
        <Input
          id="amplify-gain"
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={amplifyGain}
          onChange={(e) => setAmplifyGain(e.target.value)}
          className="h-8 w-16 text-xs"
          title="Gain factor (e.g. 1.5 = 150%)"
        />
      </div>

      {/* Noise reduction with strength input */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            const strength = parseFloat(noiseStrength);
            if (isNaN(strength) || strength < 0 || strength > 1) return;
            applyEffect(
              (ctx, buf) =>
                noiseReduction(ctx, buf, strength, startTime, endTime),
              `Noise reduction (${Math.round(strength * 100)}%)`
            );
          }}
          title="Reduce background noise"
        >
          <AudioLines className="mr-1.5 size-3.5" />
          Denoise
        </Button>
        <Label className="sr-only" htmlFor="noise-strength">
          Noise reduction strength
        </Label>
        <Input
          id="noise-strength"
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={noiseStrength}
          onChange={(e) => setNoiseStrength(e.target.value)}
          className="h-8 w-16 text-xs"
          title="Strength 0–1 (higher = more aggressive)"
        />
      </div>
    </div>
  );
}
