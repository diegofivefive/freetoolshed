"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: "leaderboard" | "sidebar" | "in-feed" | "mid-content";
  className?: string;
}

const SLOT_DIMENSIONS: Record<AdSlotProps["slot"], { width: number; height: number }> = {
  leaderboard: { width: 728, height: 90 },
  sidebar: { width: 300, height: 250 },
  "in-feed": { width: 728, height: 90 },
  "mid-content": { width: 728, height: 90 },
};

const SLOT_FORMAT: Record<AdSlotProps["slot"], string> = {
  leaderboard: "horizontal",
  sidebar: "rectangle",
  "in-feed": "horizontal",
  "mid-content": "horizontal",
};

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function AdSlot({ slot, className }: AdSlotProps) {
  const { width, height } = SLOT_DIMENSIONS[slot];
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || pushed.current) return;
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet — silently ignore
    }
  }, []);

  // Dev placeholder when no AdSense client ID is configured
  if (!CLIENT_ID) {
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-muted-foreground/25 bg-muted/30 ${className ?? ""}`}
        aria-hidden="true"
        data-ad-slot={slot}
        style={{ width, height, maxWidth: "100%" }}
      >
        <span className="text-xs text-muted-foreground/40 select-none">Ad</span>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ width, height, maxWidth: "100%" }}
      data-ad-slot={slot}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width, height }}
        data-ad-client={CLIENT_ID}
        data-ad-format={SLOT_FORMAT[slot]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
