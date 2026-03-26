"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ResumeAction, ResumeTemplateName } from "@/lib/resume/types";

interface TemplateSelectorProps {
  template: ResumeTemplateName;
  accentColor: string;
  dispatch: Dispatch<ResumeAction>;
}

const TEMPLATES: {
  value: ResumeTemplateName;
  label: string;
  description: string;
}[] = [
  { value: "modern", label: "Modern", description: "Sidebar layout with accent color and photo" },
  { value: "classic", label: "Classic", description: "Centered name, single column, traditional" },
  { value: "professional", label: "Professional", description: "Two-column header, accent bar, clean" },
  { value: "minimal", label: "Minimal", description: "Maximum whitespace, no color, ATS-optimized" },
];

function TemplateThumbnail({ type, accent }: { type: ResumeTemplateName; accent: string }) {
  const w = 120;
  const h = 160;

  switch (type) {
    case "modern":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          <rect width={38} height={h} fill={accent} opacity={0.15} />
          {/* Sidebar: photo circle */}
          <circle cx={19} cy={18} r={8} fill={accent} opacity={0.3} />
          {/* Sidebar: contact lines */}
          <rect x={8} y={32} width={22} height={2} rx={1} fill={accent} opacity={0.3} />
          <rect x={8} y={37} width={18} height={2} rx={1} fill={accent} opacity={0.3} />
          <rect x={8} y={42} width={20} height={2} rx={1} fill={accent} opacity={0.3} />
          {/* Main: name */}
          <rect x={44} y={10} width={50} height={5} rx={1} fill="#333" />
          {/* Main: title */}
          <rect x={44} y={18} width={35} height={3} rx={1} fill={accent} opacity={0.6} />
          {/* Main: section headings + lines */}
          <rect x={44} y={28} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={44} y={33} width={68} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={44} y={37} width={68} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={44} y={41} width={50} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={44} y={50} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={44} y={55} width={68} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={44} y={59} width={60} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "classic":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Centered name */}
          <rect x={30} y={10} width={60} height={5} rx={1} fill="#333" />
          <rect x={38} y={18} width={44} height={3} rx={1} fill="#999" />
          <rect x={25} y={24} width={70} height={2} rx={0.5} fill="#ccc" />
          {/* HR */}
          <line x1={15} y1={30} x2={105} y2={30} stroke="#333" strokeWidth={1} />
          {/* Sections */}
          <rect x={15} y={36} width={30} height={2.5} rx={1} fill="#333" />
          <rect x={15} y={41} width={90} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={15} y={45} width={85} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={15} y={49} width={70} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={15} y={57} width={30} height={2.5} rx={1} fill="#333" />
          <rect x={15} y={62} width={90} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={15} y={66} width={75} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "professional":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Left: name */}
          <rect x={12} y={10} width={48} height={5} rx={1} fill={accent} />
          <rect x={12} y={18} width={32} height={3} rx={1} fill="#999" />
          {/* Right: contact */}
          <rect x={80} y={10} width={28} height={2} rx={0.5} fill="#ccc" />
          <rect x={83} y={14} width={25} height={2} rx={0.5} fill="#ccc" />
          <rect x={85} y={18} width={23} height={2} rx={0.5} fill="#ccc" />
          {/* Accent bar */}
          <rect x={12} y={25} width={96} height={2} fill={accent} />
          {/* Sections */}
          <rect x={12} y={33} width={28} height={2.5} rx={1} fill={accent} opacity={0.7} />
          <rect x={12} y={38} width={96} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={42} width={90} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={46} width={72} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={54} width={28} height={2.5} rx={1} fill={accent} opacity={0.7} />
          <rect x={12} y={59} width={96} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={63} width={80} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "minimal":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Name */}
          <rect x={18} y={14} width={50} height={4.5} rx={1} fill="#333" />
          <rect x={18} y={21} width={30} height={2.5} rx={1} fill="#ccc" />
          <rect x={18} y={26} width={60} height={2} rx={0.5} fill="#ddd" />
          {/* Sections - plain headings */}
          <rect x={18} y={36} width={22} height={2} rx={0.5} fill="#bbb" />
          <rect x={18} y={41} width={84} height={1.5} rx={0.5} fill="#e5e5e5" />
          <rect x={18} y={45} width={80} height={1.5} rx={0.5} fill="#e5e5e5" />
          <rect x={18} y={49} width={60} height={1.5} rx={0.5} fill="#e5e5e5" />
          <rect x={18} y={57} width={22} height={2} rx={0.5} fill="#bbb" />
          <rect x={18} y={62} width={84} height={1.5} rx={0.5} fill="#e5e5e5" />
          <rect x={18} y={66} width={70} height={1.5} rx={0.5} fill="#e5e5e5" />
        </svg>
      );
  }
}

export function TemplateSelector({ template, accentColor, dispatch }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Template</Label>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => dispatch({ type: "SET_SETTINGS", payload: { template: t.value } })}
            className={cn(
              "rounded-lg border-2 p-2 text-left transition-colors hover:border-brand/50",
              template === t.value
                ? "border-brand bg-brand/5"
                : "border-border"
            )}
          >
            <div className="mb-2 overflow-hidden rounded border border-border bg-white">
              <TemplateThumbnail type={t.value} accent={accentColor} />
            </div>
            <p className="text-xs font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
