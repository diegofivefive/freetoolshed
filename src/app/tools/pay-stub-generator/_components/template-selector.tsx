"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TemplateName, PayStubAction } from "@/lib/pay-stub/types";

interface TemplateSelectorProps {
  template: TemplateName;
  accentColor: string;
  dispatch: Dispatch<PayStubAction>;
}

const TEMPLATES: {
  value: TemplateName;
  name: string;
  description: string;
}[] = [
  {
    value: "standard",
    name: "Standard",
    description: "Traditional table layout with borders",
  },
  {
    value: "modern",
    name: "Modern",
    description: "Accent header with card-based sections",
  },
  {
    value: "compact",
    name: "Compact",
    description: "Dense layout for minimal page usage",
  },
];

function TemplateThumbnail({
  template,
  accentColor,
}: {
  template: TemplateName;
  accentColor: string;
}) {
  const accent = accentColor;
  const gray = "#e4e4e7";
  const lightGray = "#f4f4f5";
  const textGray = "#a1a1aa";

  if (template === "standard") {
    return (
      <svg viewBox="0 0 120 160" className="h-full w-full">
        <rect width="120" height="160" fill="white" />
        {/* Header */}
        <rect x="12" y="10" width="28" height="4" rx="1" fill={accent} />
        <rect x="12" y="17" width="36" height="2" rx="0.5" fill={textGray} />
        <rect x="12" y="21" width="28" height="2" rx="0.5" fill={lightGray} />
        {/* PAY STUB title */}
        <rect x="72" y="10" width="36" height="6" rx="1" fill={accent} opacity="0.2" />
        <rect x="76" y="12" width="28" height="2" rx="0.5" fill={accent} />
        {/* Divider */}
        <rect x="12" y="30" width="96" height="0.5" fill={gray} />
        {/* Employee */}
        <rect x="12" y="34" width="18" height="2" rx="0.5" fill={accent} />
        <rect x="12" y="38" width="32" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="42" width="24" height="2" rx="0.5" fill={lightGray} />
        {/* Earnings table with borders */}
        <rect x="12" y="50" width="96" height="6" fill={accent} opacity="0.15" />
        <rect x="12" y="50" width="96" height="6" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="12" y="56" width="96" height="7" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="15" y="58" width="36" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="58" width="14" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="63" width="96" height="7" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="15" y="65.5" width="30" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="65.5" width="14" height="2" rx="0.5" fill={gray} />
        {/* Deductions table */}
        <rect x="12" y="76" width="96" height="6" fill={accent} opacity="0.15" />
        <rect x="12" y="76" width="96" height="6" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="12" y="82" width="96" height="7" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="15" y="84.5" width="32" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="84.5" width="14" height="2" rx="0.5" fill={gray} />
        {/* Summary */}
        <rect x="70" y="100" width="38" height="2" rx="0.5" fill={gray} />
        <rect x="70" y="104" width="38" height="0.5" fill={accent} />
        <rect x="70" y="108" width="38" height="4" rx="1" fill={accent} opacity="0.15" />
        <rect x="72" y="109" width="34" height="2" rx="0.5" fill={accent} />
      </svg>
    );
  }

  if (template === "modern") {
    return (
      <svg viewBox="0 0 120 160" className="h-full w-full">
        <rect width="120" height="160" fill="white" />
        {/* Accent header bar */}
        <rect x="0" y="0" width="120" height="22" fill={accent} />
        <rect x="12" y="6" width="32" height="3" rx="0.5" fill="white" />
        <rect x="12" y="11" width="24" height="2" rx="0.5" fill="white" opacity="0.6" />
        <rect x="80" y="6" width="28" height="4" rx="0.5" fill="white" opacity="0.8" />
        {/* Employee card */}
        <rect x="12" y="28" width="44" height="24" rx="2" fill={accent} opacity="0.06" />
        <rect x="16" y="32" width="16" height="2" rx="0.5" fill={accent} />
        <rect x="16" y="36" width="30" height="2" rx="0.5" fill={gray} />
        <rect x="16" y="40" width="24" height="2" rx="0.5" fill={lightGray} />
        {/* Pay period card */}
        <rect x="64" y="28" width="44" height="24" rx="2" fill={accent} opacity="0.06" />
        <rect x="68" y="32" width="20" height="2" rx="0.5" fill={accent} />
        <rect x="68" y="36" width="32" height="2" rx="0.5" fill={gray} />
        <rect x="68" y="40" width="28" height="2" rx="0.5" fill={lightGray} />
        {/* Earnings table */}
        <rect x="12" y="58" width="96" height="6" rx="1" fill={accent} opacity="0.12" />
        <rect x="12" y="67" width="96" height="0.5" fill={lightGray} />
        <rect x="14" y="69" width="40" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="69" width="16" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="76" width="96" height="0.5" fill={lightGray} />
        <rect x="14" y="78" width="34" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="78" width="16" height="2" rx="0.5" fill={gray} />
        {/* Summary card */}
        <rect x="66" y="92" width="42" height="28" rx="2" fill={accent} opacity="0.06" />
        <rect x="70" y="96" width="28" height="2" rx="0.5" fill={gray} />
        <rect x="70" y="100" width="24" height="2" rx="0.5" fill={gray} />
        <rect x="68" y="106" width="38" height="8" rx="1.5" fill={accent} />
        <rect x="72" y="108.5" width="30" height="3" rx="0.5" fill="white" />
      </svg>
    );
  }

  // compact
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full">
      <rect width="120" height="160" fill="white" />
      {/* Side-by-side header */}
      <rect x="8" y="8" width="16" height="2" rx="0.5" fill={accent} />
      <rect x="8" y="12" width="36" height="1.5" rx="0.5" fill={gray} />
      <rect x="8" y="15" width="30" height="1.5" rx="0.5" fill={lightGray} />
      <rect x="66" y="8" width="16" height="2" rx="0.5" fill={accent} />
      <rect x="66" y="12" width="36" height="1.5" rx="0.5" fill={gray} />
      <rect x="66" y="15" width="30" height="1.5" rx="0.5" fill={lightGray} />
      {/* Meta bar */}
      <rect x="8" y="24" width="104" height="5" rx="1" fill={accent} opacity="0.08" />
      <rect x="12" y="25.5" width="20" height="2" rx="0.5" fill={accent} opacity="0.6" />
      <rect x="36" y="25.5" width="30" height="1.5" rx="0.5" fill={gray} />
      {/* Dense earnings table */}
      <rect x="8" y="34" width="104" height="4" fill={accent} opacity="0.12" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="8" y={40 + i * 6} width="104" height="0.3" fill={lightGray} />
          <rect x="10" y={41.5 + i * 6} width={26 + (i % 3) * 5} height="1.5" rx="0.5" fill={gray} />
          <rect x="96" y={41.5 + i * 6} width="14" height="1.5" rx="0.5" fill={gray} />
        </g>
      ))}
      {/* Dense deductions table */}
      <rect x="8" y="66" width="104" height="4" fill={accent} opacity="0.12" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="8" y={72 + i * 6} width="104" height="0.3" fill={lightGray} />
          <rect x="10" y={73.5 + i * 6} width={22 + (i % 2) * 8} height="1.5" rx="0.5" fill={gray} />
          <rect x="96" y={73.5 + i * 6} width="14" height="1.5" rx="0.5" fill={gray} />
        </g>
      ))}
      {/* Summary line */}
      <rect x="8" y="94" width="104" height="0.5" fill={accent} />
      <rect x="70" y="98" width="42" height="3" rx="0.5" fill={accent} />
      {/* YTD row */}
      <rect x="8" y="108" width="80" height="1.5" rx="0.5" fill={textGray} />
    </svg>
  );
}

export function TemplateSelector({
  template,
  accentColor,
  dispatch,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Pay Stub Template</Label>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() =>
              dispatch({
                type: "SET_SETTINGS",
                payload: { template: t.value },
              })
            }
            className={cn(
              "group rounded-lg border-2 p-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              template === t.value
                ? "border-brand bg-brand/5"
                : "border-border hover:border-brand/40"
            )}
          >
            <div className="overflow-hidden rounded border border-border/50 bg-white">
              <TemplateThumbnail
                template={t.value}
                accentColor={accentColor}
              />
            </div>
            <p className="mt-2 text-sm font-medium">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
