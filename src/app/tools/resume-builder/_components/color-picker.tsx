"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ACCENT_PRESETS } from "@/lib/resume/constants";
import type { ResumeAction } from "@/lib/resume/types";

interface ColorPickerProps {
  accentColor: string;
  dispatch: Dispatch<ResumeAction>;
}

export function ColorPicker({ accentColor, dispatch }: ColorPickerProps) {
  const setColor = (hex: string) =>
    dispatch({ type: "SET_SETTINGS", payload: { accentColor: hex } });

  const isPreset = ACCENT_PRESETS.some((p) => p.hex === accentColor);

  return (
    <div className="space-y-3">
      <Label>Accent Color</Label>
      <div className="flex flex-wrap items-center gap-2">
        {ACCENT_PRESETS.map((preset) => (
          <button
            key={preset.hex}
            type="button"
            title={preset.name}
            onClick={() => setColor(preset.hex)}
            className={cn(
              "size-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              accentColor === preset.hex
                ? "border-foreground scale-110"
                : "border-transparent"
            )}
            style={{ backgroundColor: preset.hex }}
            aria-label={`${preset.name} accent color`}
          />
        ))}

        {/* Custom color input */}
        <label
          className={cn(
            "relative flex size-8 cursor-pointer items-center justify-center rounded-full border-2 transition-transform hover:scale-110",
            !isPreset ? "border-foreground scale-110" : "border-border"
          )}
          title="Custom color"
        >
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer rounded-full opacity-0"
          />
          <span
            className="size-5 rounded-full"
            style={{
              background: !isPreset
                ? accentColor
                : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
            }}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Applied to headings and highlights in your resume.
      </p>
    </div>
  );
}
