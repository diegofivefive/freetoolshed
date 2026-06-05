/**
 * Shared ad-slot constants used by every ad provider (Adsterra, AdSense, house).
 * Kept in one place so slot dimensions can't drift between providers and cause
 * layout shift.
 */

export type AdSlotName = "leaderboard" | "sidebar" | "in-feed" | "mid-content";

export const SLOT_DIMENSIONS: Record<AdSlotName, { width: number; height: number }> = {
  leaderboard: { width: 728, height: 90 },
  sidebar: { width: 300, height: 250 },
  "in-feed": { width: 728, height: 90 },
  "mid-content": { width: 728, height: 90 },
};

export const SLOT_FORMAT: Record<AdSlotName, string> = {
  leaderboard: "horizontal",
  sidebar: "rectangle",
  "in-feed": "horizontal",
  "mid-content": "horizontal",
};
