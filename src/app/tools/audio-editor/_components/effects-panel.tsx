"use client";

import { useCallback, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Gauge,
  FlipHorizontal,
  Volume1,
  AudioLines,
  Zap,
  SlidersHorizontal,
  Activity,
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
  changeSpeed,
  applyEq,
  EQ_PRESETS,
  applyCompressor,
  COMPRESSOR_PRESETS,
} from "@/lib/audio/effects";

interface EffectsPanelProps {
  buffer: AudioBuffer;
  selection: Selection | null;
  audioContext: AudioContext;
  onApply: (buffer: AudioBuffer, label: string) => void;
  onProcessingChange: (value: boolean) => void;
  disabled: boolean;
}

export function EffectsPanel({
  buffer,
  selection,
  audioContext,
  onApply,
  onProcessingChange,
  disabled,
}: EffectsPanelProps) {
  const [amplifyGain, setAmplifyGain] = useState("1.5");
  const [noiseStrength, setNoiseStrength] = useState("0.8");
  const [speedRate, setSpeedRate] = useState("1.0");
  const [compPreset, setCompPreset] = useState("medium");
  const [eqPreset, setEqPreset] = useState("bassBoost");
  const [eqFreq, setEqFreq] = useState("1000");
  const [eqGain, setEqGain] = useState("6");
  const [eqQ, setEqQ] = useState("1.0");

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

  const applyAsyncEffect = useCallback(
    async (work: () => Promise<AudioBuffer>, label: string) => {
      onProcessingChange(true);
      try {
        const result = await work();
        onApply(result, label);
      } finally {
        onProcessingChange(false);
      }
    },
    [onApply, onProcessingChange]
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

      {/* Speed / pitch change */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            const rate = parseFloat(speedRate);
            if (isNaN(rate) || rate <= 0 || rate > 4) return;
            applyAsyncEffect(() => changeSpeed(buffer, rate), `Speed ×${rate}`);
          }}
          title="Change speed and pitch (applies to entire track)"
        >
          <Zap className="mr-1.5 size-3.5" />
          Speed
        </Button>
        <Label className="sr-only" htmlFor="speed-rate">
          Speed rate
        </Label>
        <Input
          id="speed-rate"
          type="number"
          min="0.25"
          max="4"
          step="0.05"
          value={speedRate}
          onChange={(e) => setSpeedRate(e.target.value)}
          className="h-8 w-16 text-xs"
          title="Rate: 0.25–4× (1.0 = normal, 2.0 = double speed)"
        />
      </div>

      {/* EQ preset */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            const preset = EQ_PRESETS[eqPreset];
            if (!preset) return;
            applyAsyncEffect(
              () => applyEq(buffer, preset.bands),
              `EQ: ${preset.label}`
            );
          }}
          title="Apply EQ preset"
        >
          <SlidersHorizontal className="mr-1.5 size-3.5" />
          EQ
        </Button>
        <Label className="sr-only" htmlFor="eq-preset">
          EQ Preset
        </Label>
        <select
          id="eq-preset"
          value={eqPreset}
          onChange={(e) => setEqPreset(e.target.value)}
          className="h-8 rounded border border-border bg-background px-1.5 text-xs"
        >
          {Object.entries(EQ_PRESETS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
          <option value="__custom">Custom...</option>
        </select>
      </div>

      {/* Custom EQ controls */}
      {eqPreset === "__custom" && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              const freq = parseFloat(eqFreq);
              const gain = parseFloat(eqGain);
              const q = parseFloat(eqQ);
              if (isNaN(freq) || isNaN(gain) || isNaN(q)) return;
              applyAsyncEffect(
                () =>
                  applyEq(buffer, [
                    { type: "peaking", frequency: freq, gain, Q: q },
                  ]),
                `EQ: ${freq}Hz ${gain > 0 ? "+" : ""}${gain}dB`
              );
            }}
            title="Apply custom EQ band"
          >
            Apply
          </Button>
          <Input
            id="eq-freq"
            type="number"
            min="20"
            max="20000"
            step="10"
            value={eqFreq}
            onChange={(e) => setEqFreq(e.target.value)}
            className="h-8 w-20 text-xs"
            title="Frequency (Hz)"
            placeholder="Hz"
          />
          <Input
            id="eq-gain"
            type="number"
            min="-24"
            max="24"
            step="1"
            value={eqGain}
            onChange={(e) => setEqGain(e.target.value)}
            className="h-8 w-16 text-xs"
            title="Gain (dB)"
            placeholder="dB"
          />
          <Input
            id="eq-q"
            type="number"
            min="0.1"
            max="20"
            step="0.1"
            value={eqQ}
            onChange={(e) => setEqQ(e.target.value)}
            className="h-8 w-16 text-xs"
            title="Q factor (bandwidth)"
            placeholder="Q"
          />
        </div>
      )}

      {/* Compressor / Limiter */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            const preset = COMPRESSOR_PRESETS[compPreset];
            if (!preset) return;
            applyAsyncEffect(
              () => applyCompressor(buffer, preset.settings),
              `Compressor: ${preset.label}`
            );
          }}
          title="Apply dynamics compression"
        >
          <Activity className="mr-1.5 size-3.5" />
          Compress
        </Button>
        <Label className="sr-only" htmlFor="comp-preset">
          Compressor Preset
        </Label>
        <select
          id="comp-preset"
          value={compPreset}
          onChange={(e) => setCompPreset(e.target.value)}
          className="h-8 rounded border border-border bg-background px-1.5 text-xs"
        >
          {Object.entries(COMPRESSOR_PRESETS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
