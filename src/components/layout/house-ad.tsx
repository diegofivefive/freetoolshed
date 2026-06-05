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
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SLOT_DIMENSIONS, type AdSlotName } from "@/lib/ad-slots";
import { pickHouseAds, type HouseAdCreative } from "@/lib/house-ads";

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

/**
 * Shared container styling. Brand-tinted fill + solid brand border keeps house
 * ads visually distinct from the neutral `bg-card`/`border-border` content cards,
 * so they read as ads rather than page content.
 */
const CONTAINER_CLASSES =
  "group relative overflow-hidden rounded-lg border border-brand/40 bg-brand/5 transition-colors hover:border-brand/70 hover:bg-brand/10";

const CTA_CLASSES =
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition-transform group-hover:translate-x-0.5";

const AD_LABEL =
  "pointer-events-none text-[9px] font-medium uppercase tracking-wider text-muted-foreground/50";

/** 728×90 horizontal layout — leaderboard, mid-content, in-feed. */
function BannerAd({ creative, slot, width, height, className }: AdLayoutProps) {
  const Icon = ICON_MAP[creative.icon] ?? Wrench;
  return (
    <Link
      href={creative.href}
      data-ad-slot={slot}
      data-house-ad={creative.href}
      className={cn(CONTAINER_CLASSES, "flex items-center gap-4 px-4", className)}
      style={{ width, height, maxWidth: "100%" }}
    >
      <span className={cn(AD_LABEL, "absolute left-2 top-1")}>Advertisement</span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">
          {creative.name}
          {creative.replaces ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Free {creative.replaces} alternative
            </span>
          ) : null}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {creative.description}
        </span>
      </span>
      <span className={cn(CTA_CLASSES, "ml-auto")}>
        Open free tool
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

/** 300×250 vertical layout — sidebar. */
function RectangleAd({ creative, slot, width, height, className }: AdLayoutProps) {
  const Icon = ICON_MAP[creative.icon] ?? Wrench;
  return (
    <Link
      href={creative.href}
      data-ad-slot={slot}
      data-house-ad={creative.href}
      className={cn(CONTAINER_CLASSES, "flex flex-col p-4", className)}
      style={{ width, height, maxWidth: "100%" }}
    >
      <span className={AD_LABEL}>Advertisement</span>
      <span className="mt-2 flex size-10 items-center justify-center rounded-md bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <span className="mt-3 text-sm font-semibold text-foreground">
        {creative.name}
      </span>
      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {creative.description}
      </span>
      {creative.replaces ? (
        <Badge variant="secondary" className="mt-2 w-fit text-[10px]">
          Replaces {creative.replaces}
        </Badge>
      ) : null}
      <span className={cn(CTA_CLASSES, "mt-auto w-full py-2")}>
        Open free tool
        <ArrowRight className="size-3.5" />
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
