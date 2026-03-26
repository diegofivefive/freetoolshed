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
  { value: "modern", label: "Modern", description: "Left sidebar with accent color and photo" },
  { value: "classic", label: "Classic", description: "Centered name, single column, traditional" },
  { value: "professional", label: "Professional", description: "Two-column header, accent bar, clean" },
  { value: "minimal", label: "Minimal", description: "Maximum whitespace, no color, ATS-optimized" },
  { value: "executive", label: "Executive", description: "Bold accent header banner, authoritative" },
  { value: "creative", label: "Creative", description: "Right sidebar, reversed modern layout" },
  { value: "compact", label: "Compact", description: "Dense layout, tight spacing, info-packed" },
  { value: "elegant", label: "Elegant", description: "Centered headings, decorative hairlines" },
  { value: "bold", label: "Bold", description: "Large all-caps name, thick dividers" },
  { value: "technical", label: "Technical", description: "Left gutter labels, grid-like structure" },
  { value: "columns", label: "Columns", description: "Two equal columns, full-width header" },
  { value: "timeline", label: "Timeline", description: "Vertical timeline dots and connectors" },
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
    case "executive":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Dark accent header */}
          <rect width={w} height={32} fill={accent} />
          <rect x={12} y={8} width={50} height={5} rx={1} fill="#fff" />
          <rect x={12} y={16} width={35} height={3} rx={1} fill="#fff" opacity={0.7} />
          <rect x={30} y={24} width={60} height={2} rx={0.5} fill="#fff" opacity={0.5} />
          {/* Body sections */}
          <rect x={12} y={38} width={28} height={2.5} rx={1} fill={accent} opacity={0.7} />
          <rect x={12} y={43} width={96} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={47} width={88} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={55} width={28} height={2.5} rx={1} fill={accent} opacity={0.7} />
          <rect x={12} y={60} width={96} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={12} y={64} width={80} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "creative":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Right sidebar */}
          <rect x={82} width={38} height={h} fill={accent} opacity={0.15} />
          <circle cx={101} cy={18} r={8} fill={accent} opacity={0.3} />
          <rect x={90} y={32} width={22} height={2} rx={1} fill={accent} opacity={0.3} />
          <rect x={90} y={37} width={18} height={2} rx={1} fill={accent} opacity={0.3} />
          <rect x={90} y={42} width={20} height={2} rx={1} fill={accent} opacity={0.3} />
          {/* Main left */}
          <rect x={8} y={10} width={50} height={5} rx={1} fill="#333" />
          <rect x={8} y={18} width={35} height={3} rx={1} fill={accent} opacity={0.6} />
          <rect x={8} y={28} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={8} y={33} width={66} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={8} y={37} width={66} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={8} y={50} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={8} y={55} width={66} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={8} y={59} width={58} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "compact":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Name left, contact right */}
          <rect x={8} y={8} width={40} height={4} rx={1} fill={accent} />
          <rect x={85} y={8} width={27} height={2} rx={0.5} fill="#ccc" />
          <rect x={88} y={12} width={24} height={2} rx={0.5} fill="#ccc" />
          <rect x={8} y={14} width={28} height={2} rx={0.5} fill="#999" />
          {/* Thin line */}
          <line x1={8} y1={20} x2={112} y2={20} stroke={accent} strokeWidth={0.5} />
          {/* Dense sections */}
          <rect x={8} y={24} width={20} height={2} rx={0.5} fill={accent} opacity={0.6} />
          <rect x={8} y={28} width={104} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={31} width={100} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={34} width={90} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={39} width={20} height={2} rx={0.5} fill={accent} opacity={0.6} />
          <rect x={8} y={43} width={104} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={46} width={96} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={49} width={80} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={54} width={20} height={2} rx={0.5} fill={accent} opacity={0.6} />
          <rect x={8} y={58} width={104} height={1.2} rx={0.5} fill="#e5e5e5" />
          <rect x={8} y={61} width={90} height={1.2} rx={0.5} fill="#e5e5e5" />
        </svg>
      );
    case "elegant":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Double decorative line */}
          <line x1={15} y1={8} x2={105} y2={8} stroke={accent} strokeWidth={0.8} />
          <line x1={15} y1={10} x2={105} y2={10} stroke={accent} strokeWidth={0.3} />
          {/* Centered name */}
          <rect x={30} y={14} width={60} height={5} rx={1} fill="#333" />
          <rect x={38} y={22} width={44} height={3} rx={1} fill={accent} opacity={0.6} />
          <rect x={25} y={28} width={70} height={2} rx={0.5} fill="#ccc" />
          {/* Bottom decorative line */}
          <line x1={15} y1={33} x2={105} y2={33} stroke={accent} strokeWidth={0.3} />
          <line x1={15} y1={35} x2={105} y2={35} stroke={accent} strokeWidth={0.8} />
          {/* Centered heading with side lines */}
          <line x1={15} y1={43} x2={42} y2={43} stroke={accent} strokeWidth={0.3} />
          <rect x={45} y={41} width={30} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <line x1={78} y1={43} x2={105} y2={43} stroke={accent} strokeWidth={0.3} />
          <rect x={15} y={48} width={90} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={15} y={52} width={85} height={1.5} rx={0.5} fill="#ddd" />
          <line x1={15} y1={60} x2={42} y2={60} stroke={accent} strokeWidth={0.3} />
          <rect x={45} y={58} width={30} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <line x1={78} y1={60} x2={105} y2={60} stroke={accent} strokeWidth={0.3} />
          <rect x={15} y={65} width={90} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "bold":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Large all-caps name */}
          <rect x={12} y={8} width={80} height={7} rx={1} fill="#222" />
          {/* Thick accent bar */}
          <rect x={12} y={18} width={96} height={3} fill={accent} />
          {/* Title */}
          <rect x={12} y={24} width={45} height={3.5} rx={1} fill="#666" />
          <rect x={12} y={30} width={70} height={2} rx={0.5} fill="#ccc" />
          {/* Section with left bar */}
          <rect x={12} y={38} width={3} height={8} fill={accent} />
          <rect x={19} y={38} width={35} height={2.5} rx={1} fill="#333" />
          <rect x={12} y={43} width={96} height={0.8} fill="#ddd" />
          <rect x={12} y={47} width={96} height={1.5} rx={0.5} fill="#e5e5e5" />
          <rect x={12} y={51} width={90} height={1.5} rx={0.5} fill="#e5e5e5" />
          <rect x={12} y={58} width={3} height={8} fill={accent} />
          <rect x={19} y={58} width={35} height={2.5} rx={1} fill="#333" />
          <rect x={12} y={63} width={96} height={0.8} fill="#ddd" />
          <rect x={12} y={67} width={96} height={1.5} rx={0.5} fill="#e5e5e5" />
        </svg>
      );
    case "technical":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Header */}
          <rect x={10} y={8} width={48} height={5} rx={1} fill="#333" />
          <rect x={10} y={16} width={30} height={3} rx={1} fill={accent} opacity={0.6} />
          <rect x={10} y={22} width={80} height={2} rx={0.5} fill="#ccc" />
          {/* Accent line */}
          <line x1={10} y1={28} x2={110} y2={28} stroke={accent} strokeWidth={0.5} />
          {/* Gutter + vertical line */}
          <line x1={38} y1={33} x2={38} y2={72} stroke="#ddd" strokeWidth={0.5} />
          {/* Gutter labels */}
          <rect x={10} y={33} width={24} height={2} rx={0.5} fill={accent} opacity={0.5} />
          <rect x={42} y={33} width={66} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={42} y={37} width={60} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={42} y={41} width={50} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={10} y={50} width={24} height={2} rx={0.5} fill={accent} opacity={0.5} />
          <rect x={42} y={50} width={66} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={42} y={54} width={58} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={10} y={63} width={24} height={2} rx={0.5} fill={accent} opacity={0.5} />
          <rect x={42} y={63} width={66} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={42} y={67} width={50} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "columns":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Centered header */}
          <rect x={30} y={8} width={60} height={5} rx={1} fill={accent} />
          <rect x={38} y={16} width={44} height={3} rx={1} fill="#999" />
          <rect x={22} y={22} width={76} height={2} rx={0.5} fill="#ccc" />
          {/* Accent line */}
          <line x1={10} y1={28} x2={110} y2={28} stroke={accent} strokeWidth={0.6} />
          {/* Left column */}
          <rect x={10} y={33} width={22} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={10} y={38} width={46} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={10} y={42} width={42} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={10} y={46} width={38} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={10} y={53} width={22} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={10} y={58} width={46} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={10} y={62} width={40} height={1.5} rx={0.5} fill="#ddd" />
          {/* Right column */}
          <rect x={64} y={33} width={22} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={64} y={38} width={46} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={64} y={42} width={42} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={64} y={46} width={38} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={64} y={53} width={22} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={64} y={58} width={46} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={64} y={62} width={40} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
    case "timeline":
      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="size-full">
          <rect width={w} height={h} fill="#fff" />
          {/* Header */}
          <rect x={10} y={8} width={50} height={5} rx={1} fill="#333" />
          <rect x={10} y={16} width={30} height={3} rx={1} fill={accent} opacity={0.6} />
          <rect x={70} y={8} width={38} height={2} rx={0.5} fill="#ccc" />
          <rect x={75} y={12} width={33} height={2} rx={0.5} fill="#ccc" />
          {/* Accent line */}
          <line x1={10} y1={24} x2={110} y2={24} stroke={accent} strokeWidth={0.5} />
          {/* Timeline dots and line */}
          <line x1={16} y1={32} x2={16} y2={72} stroke={accent} strokeWidth={0.6} />
          <circle cx={16} cy={32} r={2} fill={accent} />
          <rect x={24} y={30} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={24} y={35} width={82} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={24} y={39} width={76} height={1.5} rx={0.5} fill="#ddd" />
          <circle cx={16} cy={49} r={2} fill={accent} />
          <rect x={24} y={47} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={24} y={52} width={82} height={1.5} rx={0.5} fill="#ddd" />
          <rect x={24} y={56} width={70} height={1.5} rx={0.5} fill="#ddd" />
          <circle cx={16} cy={66} r={2} fill={accent} />
          <rect x={24} y={64} width={25} height={2.5} rx={1} fill={accent} opacity={0.5} />
          <rect x={24} y={69} width={82} height={1.5} rx={0.5} fill="#ddd" />
        </svg>
      );
  }
}

export function TemplateSelector({ template, accentColor, dispatch }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Template</Label>
      <div className="grid grid-cols-3 gap-3">
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
