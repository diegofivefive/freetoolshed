"use client";

import { useEffect, useRef, useState } from "react";

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

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7700405385978151";

export function AdSlot({ slot, className }: AdSlotProps) {
  const { width, height } = SLOT_DIMENSIONS[slot];
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [adFilled, setAdFilled] = useState(false);

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

    // Poll for ad fill status — hide the <ins> if unfilled
    const timer = setInterval(() => {
      const ins = adRef.current;
      if (!ins) return;
      const status = ins.getAttribute("data-ad-status");
      if (status === "filled") {
        setAdFilled(true);
        clearInterval(timer);
      } else if (status === "unfilled") {
        setAdFilled(false);
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  // Dev placeholder when no AdSense client ID is configured
  if (!CLIENT_ID) {
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-border bg-background ${className ?? ""}`}
        aria-hidden="true"
        data-ad-slot={slot}
        style={{ width, height, maxWidth: "100%" }}
      >
        <span className="text-xs text-muted-foreground/50 select-none">
          Advertisement
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded border border-dashed border-border bg-background ${className ?? ""}`}
      style={{ width, height, maxWidth: "100%" }}
      data-ad-slot={slot}
    >
      <span className="pointer-events-none absolute text-xs text-muted-foreground/50 select-none">
        Advertisement
      </span>
      <div
        className="absolute inset-0"
        style={{ opacity: adFilled ? 1 : 0 }}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={CLIENT_ID}
          data-ad-format={SLOT_FORMAT[slot]}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
