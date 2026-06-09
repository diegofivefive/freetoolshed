"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Receipt,
  FileUser,
  AudioLines,
  ScanText,
  Atom,
  LineChart,
  Video,
  Clapperboard,
  Ruler,
  LayoutGrid,
  GitBranch,
  Combine,
  ArrowLeftRight,
  Minimize2,
  Film,
  Scissors,
  Image as ImageIcon,
  ScissorsLineDashed,
  Tags,
  Music,
  Subtitles,
  ArrowRight,
  Info,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SLOT_DIMENSIONS, type AdSlotName } from "@/lib/ad-slots";
import {
  hashString,
  pickHouseAds,
  type HouseAdCreative,
} from "@/lib/house-ads";

/** Resolve the icon-name strings stored on the inventory to components. */
const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  FileText,
  Receipt,
  FileUser,
  AudioLines,
  ScanText,
  Atom,
  LineChart,
  Video,
  Clapperboard,
  Ruler,
  LayoutGrid,
  GitBranch,
  Combine,
  ArrowLeftRight,
  Minimize2,
  Film,
  Scissors,
  Image: ImageIcon,
  ScissorsLineDashed,
  Tags,
  Music,
  Subtitles,
};

/** Per-slot seed offset so the slots sharing a page show different tools. */
const SLOT_OFFSET: Record<AdSlotName, number> = {
  leaderboard: 0,
  "mid-content": 1,
  sidebar: 2,
  "in-feed": 3,
};

/**
 * DELIBERATE design-system exception: house ads must read as third-party
 * display ads, not site content. They use fixed hex palettes (never the site's
 * oklch tokens), ignore dark/light mode (real ad networks do), use Arial
 * instead of Geist, and square corners instead of the site's rounded-lg —
 * all so visitors never confuse an ad with the page they're on.
 */
interface AdTheme {
  /** CSS background — bold gradients or flat white, never the site palette. */
  background: string;
  headline: string;
  body: string;
  /** Display-URL line color (classic ad green on the white theme). */
  url: string;
  ctaBg: string;
  ctaText: string;
  iconBg: string;
  iconText: string;
  /** Only the white "classic text ad" theme needs a visible edge. */
  border?: string;
}

const AD_THEMES: AdTheme[] = [
  {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    headline: "#ffffff",
    body: "#bfdbfe",
    url: "#93c5fd",
    ctaBg: "#facc15",
    ctaText: "#1f2937",
    iconBg: "rgba(255, 255, 255, 0.94)",
    iconText: "#2563eb",
  },
  {
    background: "linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)",
    headline: "#ffffff",
    body: "#ddd6fe",
    url: "#c4b5fd",
    ctaBg: "#ffffff",
    ctaText: "#6d28d9",
    iconBg: "rgba(255, 255, 255, 0.94)",
    iconText: "#7c3aed",
  },
  {
    background: "linear-gradient(135deg, #c2410c 0%, #f59e0b 100%)",
    headline: "#ffffff",
    body: "#ffedd5",
    url: "#fed7aa",
    ctaBg: "#1f2937",
    ctaText: "#ffffff",
    iconBg: "rgba(255, 255, 255, 0.94)",
    iconText: "#ea580c",
  },
  {
    background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
    headline: "#ffffff",
    body: "#cbd5e1",
    url: "#7dd3fc",
    ctaBg: "#38bdf8",
    ctaText: "#0c4a6e",
    iconBg: "rgba(255, 255, 255, 0.94)",
    iconText: "#0ea5e9",
  },
  {
    // Classic white "search ad" look — stays white even in dark mode.
    background: "#ffffff",
    headline: "#1558d6",
    body: "#545454",
    url: "#006621",
    ctaBg: "#1a73e8",
    ctaText: "#ffffff",
    iconBg: "#f1f3f4",
    iconText: "#1a73e8",
    border: "#dadce0",
  },
];

const CTA_LABELS = ["Try It Free", "Open Now", "Start Free", "Get Started"];

const AD_FONT = "Arial, Helvetica, sans-serif";

interface HouseAdSlotProps {
  slot: AdSlotName;
  className?: string;
}

interface AdLayoutProps {
  creative: HouseAdCreative;
  slot: AdSlotName;
  width: number;
  height: number;
  className?: string;
}

/** Deterministic theme + CTA per creative, so server and client render alike. */
function getAdStyle(creative: HouseAdCreative): { theme: AdTheme; cta: string } {
  const hash = hashString(creative.href);
  return {
    theme: AD_THEMES[hash % AD_THEMES.length],
    cta: CTA_LABELS[(hash >>> 8) % CTA_LABELS.length],
  };
}

/** AdSense-style "Ad ⓘ" chip pinned to the top-right corner. */
function AdChip() {
  return (
    <span
      className="pointer-events-none absolute right-0 top-0 z-10 flex items-center gap-0.5 rounded-bl border-b border-l border-[#dadce0] bg-white/95 py-0.5 pl-1.5 pr-1 text-[9px] font-medium leading-none text-[#5f6368]"
      style={{ fontFamily: AD_FONT }}
    >
      Ad
      <Info className="size-2.5" />
    </span>
  );
}

/** 728×90 horizontal layout — leaderboard, mid-content, in-feed. */
function BannerAd({ creative, slot, width, height, className }: AdLayoutProps) {
  const Icon = ICON_MAP[creative.icon] ?? Wrench;
  const { theme, cta } = getAdStyle(creative);
  return (
    <Link
      href={creative.href}
      data-ad-slot={slot}
      data-house-ad={creative.href}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden pl-4 pr-5 transition-shadow hover:shadow-lg",
        className,
      )}
      style={{
        width,
        height,
        maxWidth: "100%",
        background: theme.background,
        border: theme.border ? `1px solid ${theme.border}` : undefined,
        fontFamily: AD_FONT,
      }}
    >
      <AdChip />
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full"
        style={{ background: theme.iconBg, color: theme.iconText }}
      >
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="truncate text-[15px] font-bold leading-tight"
          style={{ color: theme.headline }}
        >
          Free {creative.name} — No Sign-Up!
        </span>
        <span className="truncate text-xs" style={{ color: theme.body }}>
          {creative.replaces
            ? `The 100% free ${creative.replaces} alternative. ${creative.description}`
            : creative.description}
        </span>
        <span
          className="text-[10px] leading-none"
          style={{ color: theme.url }}
        >
          freetoolshed.com
        </span>
      </span>
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-sm transition-transform group-hover:translate-x-0.5"
        style={{ background: theme.ctaBg, color: theme.ctaText }}
      >
        {cta}
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

/** 300×250 vertical layout — sidebar. */
function RectangleAd({ creative, slot, width, height, className }: AdLayoutProps) {
  const Icon = ICON_MAP[creative.icon] ?? Wrench;
  const { theme, cta } = getAdStyle(creative);
  return (
    <Link
      href={creative.href}
      data-ad-slot={slot}
      data-house-ad={creative.href}
      className={cn(
        "group relative flex flex-col items-center overflow-hidden p-4 text-center transition-shadow hover:shadow-lg",
        className,
      )}
      style={{
        width,
        height,
        maxWidth: "100%",
        background: theme.background,
        border: theme.border ? `1px solid ${theme.border}` : undefined,
        fontFamily: AD_FONT,
      }}
    >
      <AdChip />
      <span
        className="mt-2 flex size-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: theme.iconBg, color: theme.iconText }}
      >
        <Icon className="size-6" />
      </span>
      <span
        className="mt-2.5 text-base font-bold leading-tight"
        style={{ color: theme.headline }}
      >
        Free {creative.name}
      </span>
      <span
        className="mt-1 line-clamp-2 text-xs leading-snug"
        style={{ color: theme.body }}
      >
        {creative.replaces
          ? `The 100% free alternative to ${creative.replaces}`
          : creative.description}
      </span>
      <span
        className="mt-1.5 text-[11px] font-medium"
        style={{ color: theme.headline }}
      >
        ✓ Free&ensp;✓ No Sign-Up&ensp;✓ Unlimited
      </span>
      <span
        className="mt-auto inline-flex w-full items-center justify-center gap-1 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-sm transition-transform group-hover:scale-[1.02]"
        style={{ background: theme.ctaBg, color: theme.ctaText }}
      >
        {cta}
        <ArrowRight className="size-3.5" />
      </span>
      <span
        className="mt-1.5 text-[10px] leading-none"
        style={{ color: theme.url }}
      >
        freetoolshed.com
      </span>
    </Link>
  );
}

/**
 * House ad: a self-promotion for another tool on the site, sized to the given
 * slot. Selection is deterministic (see `pickHouseAds`) so it's hydration-safe,
 * never advertises the current page, and varies per slot.
 */
export function HouseAdSlot({ slot, className }: HouseAdSlotProps) {
  const pathname = usePathname() ?? "";
  const { width, height } = SLOT_DIMENSIONS[slot];
  const [creative] = pickHouseAds({
    pathname,
    count: 1,
    offset: SLOT_OFFSET[slot],
  });

  // No inventory to show (e.g. the only live tool) — hold the space so the
  // layout stays stable.
  if (!creative) {
    return (
      <div
        className={className}
        style={{ width, height, maxWidth: "100%" }}
        aria-hidden="true"
        data-ad-slot={slot}
      />
    );
  }

  const props: AdLayoutProps = { creative, slot, width, height, className };
  return slot === "sidebar" ? (
    <RectangleAd {...props} />
  ) : (
    <BannerAd {...props} />
  );
}
