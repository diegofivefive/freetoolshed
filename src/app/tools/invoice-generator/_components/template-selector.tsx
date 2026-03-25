"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InvoiceAction, TemplateName } from "@/lib/invoice/types";

interface TemplateSelectorProps {
  template: TemplateName;
  accentColor: string;
  dispatch: Dispatch<InvoiceAction>;
}

const TEMPLATES: {
  value: TemplateName;
  name: string;
  description: string;
}[] = [
  {
    value: "modern",
    name: "Modern",
    description: "Clean and minimal with lots of whitespace",
  },
  {
    value: "classic",
    name: "Classic",
    description: "Traditional business invoice with borders",
  },
  {
    value: "compact",
    name: "Compact",
    description: "Dense layout for many line items",
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

  if (template === "modern") {
    return (
      <svg viewBox="0 0 120 160" className="h-full w-full">
        <rect width="120" height="160" fill="white" />
        {/* Header accent bar */}
        <rect x="12" y="12" width="24" height="4" rx="1" fill={accent} />
        <rect x="12" y="19" width="32" height="2" rx="0.5" fill={textGray} />
        <rect x="80" y="12" width="28" height="8" rx="1" fill={accent} opacity="0.15" />
        <rect x="84" y="14.5" width="20" height="3" rx="0.5" fill={accent} />
        {/* Company / Client */}
        <rect x="12" y="36" width="36" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="40" width="28" height="2" rx="0.5" fill={lightGray} />
        <rect x="70" y="36" width="38" height="2" rx="0.5" fill={gray} />
        <rect x="70" y="40" width="30" height="2" rx="0.5" fill={lightGray} />
        {/* Table header */}
        <rect x="12" y="56" width="96" height="6" rx="1" fill={accent} opacity="0.1" />
        {/* Table rows */}
        <rect x="12" y="66" width="96" height="0.5" fill={lightGray} />
        <rect x="12" y="68" width="50" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="68" width="18" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="76" width="96" height="0.5" fill={lightGray} />
        <rect x="12" y="78" width="40" height="2" rx="0.5" fill={gray} />
        <rect x="90" y="78" width="18" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="86" width="96" height="0.5" fill={lightGray} />
        {/* Total */}
        <rect x="70" y="96" width="38" height="8" rx="1" fill={accent} opacity="0.1" />
        <rect x="74" y="98.5" width="30" height="3" rx="0.5" fill={accent} />
        {/* Notes */}
        <rect x="12" y="116" width="44" height="2" rx="0.5" fill={lightGray} />
        <rect x="12" y="120" width="36" height="2" rx="0.5" fill={lightGray} />
      </svg>
    );
  }

  if (template === "classic") {
    return (
      <svg viewBox="0 0 120 160" className="h-full w-full">
        <rect width="120" height="160" fill="white" />
        {/* Top bar */}
        <rect x="0" y="0" width="120" height="20" fill={accent} />
        <rect x="40" y="6" width="40" height="3" rx="0.5" fill="white" />
        <rect x="44" y="11" width="32" height="2" rx="0.5" fill="white" opacity="0.6" />
        {/* Bill To box */}
        <rect x="12" y="28" width="44" height="22" rx="2" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="16" y="32" width="20" height="2" rx="0.5" fill={accent} />
        <rect x="16" y="36" width="32" height="2" rx="0.5" fill={gray} />
        <rect x="16" y="40" width="28" height="2" rx="0.5" fill={lightGray} />
        {/* Invoice details box */}
        <rect x="64" y="28" width="44" height="22" rx="2" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="68" y="32" width="24" height="2" rx="0.5" fill={accent} />
        <rect x="68" y="36" width="32" height="2" rx="0.5" fill={gray} />
        <rect x="68" y="40" width="28" height="2" rx="0.5" fill={lightGray} />
        {/* Table with borders */}
        <rect x="12" y="58" width="96" height="8" fill={accent} opacity="0.15" />
        <rect x="12" y="58" width="96" height="8" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="12" y="66" width="96" height="8" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="16" y="69" width="40" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="74" width="96" height="8" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="16" y="77" width="36" height="2" rx="0.5" fill={gray} />
        <rect x="12" y="82" width="96" height="8" fill="none" stroke={gray} strokeWidth="0.5" />
        <rect x="16" y="85" width="44" height="2" rx="0.5" fill={gray} />
        {/* Total */}
        <rect x="64" y="98" width="44" height="8" rx="1" fill={accent} />
        <rect x="68" y="100.5" width="36" height="3" rx="0.5" fill="white" />
        {/* Notes */}
        <rect x="12" y="116" width="44" height="2" rx="0.5" fill={lightGray} />
      </svg>
    );
  }

  // compact
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full">
      <rect width="120" height="160" fill="white" />
      {/* Side-by-side header */}
      <rect x="8" y="8" width="18" height="2" rx="0.5" fill={accent} />
      <rect x="8" y="12" width="40" height="1.5" rx="0.5" fill={gray} />
      <rect x="8" y="15" width="36" height="1.5" rx="0.5" fill={lightGray} />
      <rect x="8" y="18" width="30" height="1.5" rx="0.5" fill={lightGray} />
      <rect x="66" y="8" width="18" height="2" rx="0.5" fill={accent} />
      <rect x="66" y="12" width="40" height="1.5" rx="0.5" fill={gray} />
      <rect x="66" y="15" width="36" height="1.5" rx="0.5" fill={lightGray} />
      <rect x="66" y="18" width="30" height="1.5" rx="0.5" fill={lightGray} />
      {/* Invoice meta */}
      <rect x="8" y="28" width="24" height="3" rx="0.5" fill={accent} opacity="0.8" />
      <rect x="36" y="28" width="30" height="1.5" rx="0.5" fill={gray} />
      <rect x="36" y="31" width="24" height="1.5" rx="0.5" fill={lightGray} />
      {/* Dense table */}
      <rect x="8" y="40" width="104" height="5" fill={accent} opacity="0.1" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect x="8" y={48 + i * 8} width="104" height="0.3" fill={lightGray} />
          <rect x="10" y={50 + i * 8} width={30 + (i % 3) * 6} height="1.5" rx="0.5" fill={gray} />
          <rect x="94" y={50 + i * 8} width="16" height="1.5" rx="0.5" fill={gray} />
        </g>
      ))}
      {/* Total row */}
      <rect x="8" y="116" width="104" height="0.5" fill={accent} />
      <rect x="78" y="120" width="34" height="3" rx="0.5" fill={accent} />
      {/* Notes */}
      <rect x="8" y="132" width="44" height="1.5" rx="0.5" fill={lightGray} />
      <rect x="8" y="135" width="36" height="1.5" rx="0.5" fill={lightGray} />
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
      <Label>Invoice Template</Label>
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
