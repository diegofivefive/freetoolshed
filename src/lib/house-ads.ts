import { TOOLS } from "@/lib/tools";
import { TOOLKIT_TOOLS } from "@/lib/media-toolkit/constants";

/**
 * A single house-ad creative — a self-promotion for another page on the site.
 * Derived from existing tool metadata (`TOOLS` + `TOOLKIT_TOOLS`) so the ad
 * inventory can never drift out of date: add a tool, it auto-enters rotation.
 */
export interface HouseAdCreative {
  name: string;
  href: string;
  description: string;
  /** Lucide icon name (stored as a string on both inventory sources). */
  icon: string;
  /** The paid product this tool replaces, when applicable. */
  replaces?: string;
}

/** Build the full house-ad inventory from live tools across the site. */
export function getHouseAdCreatives(): HouseAdCreative[] {
  const topLevel: HouseAdCreative[] = TOOLS.filter(
    (tool) => tool.badge !== "Under Construction",
  ).map((tool) => ({
    name: tool.name,
    href: `/tools/${tool.slug}`,
    description: tool.description,
    icon: tool.icon,
    replaces: tool.paidAlternative,
  }));

  const toolkit: HouseAdCreative[] = TOOLKIT_TOOLS.filter(
    (tool) => tool.status === "live",
  ).map((tool) => ({
    name: tool.name,
    href: `/tools/media-toolkit/${tool.slug}`,
    description: tool.description,
    icon: tool.icon,
  }));

  return [...topLevel, ...toolkit];
}

/** Strip trailing slashes so path comparisons are stable. */
function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/** djb2 string hash → stable, non-negative 32-bit integer. */
export function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

interface PickHouseAdsOptions {
  /** Current route, e.g. from `usePathname()`. */
  pathname: string;
  /** How many distinct creatives to return. */
  count: number;
  /** Per-slot offset so different slots on the same page show different tools. */
  offset?: number;
}

/**
 * Deterministically select house-ad creatives for a page.
 *
 * Selection is seeded purely from `pathname` (+ `offset`) — never `Math.random()`
 * or `Date` — so server and client render identically (no hydration mismatch).
 * The creative matching the current path is excluded, so a tool never advertises
 * itself, and distinct `offset`s yield distinct tools across a page's slots.
 */
export function pickHouseAds({
  pathname,
  count,
  offset = 0,
}: PickHouseAdsOptions): HouseAdCreative[] {
  const here = normalizePath(pathname || "/");
  const pool = getHouseAdCreatives().filter(
    (creative) => normalizePath(creative.href) !== here,
  );
  if (pool.length === 0) return [];

  const base = hashString(here);
  const picks: HouseAdCreative[] = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    picks.push(pool[(base + offset + i) % pool.length]);
  }
  return picks;
}
