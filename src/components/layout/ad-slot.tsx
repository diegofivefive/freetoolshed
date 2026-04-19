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

const AD_PROVIDER = process.env.NEXT_PUBLIC_AD_PROVIDER || "adsterra";
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7700405385978151";

const ADSTERRA_KEYS: Record<string, string> = {
  "728x90": "dc102e3293f53e26362451a33d38ca10",
  "300x250": "1a7c37f9a68e7017209378c2620c901d",
};

function getAdsterraKey(slot: AdSlotProps["slot"]): string {
  const { width, height } = SLOT_DIMENSIONS[slot];
  return ADSTERRA_KEYS[`${width}x${height}`] ?? "";
}

/** Delay (ms) before loading the mid-content 728x90 — lets top + sidebar ads
 *  claim inventory first so they don't compete for the same fill. */
const MID_CONTENT_DELAY = 1500;

function AdsterraSlot({ slot, className }: AdSlotProps) {
  const { width, height } = SLOT_DIMENSIONS[slot];
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);
  const isMidContent = slot === "mid-content";

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    const key = getAdsterraKey(slot);
    if (!key) return;

    const inject = () => {
      if (injected.current || !containerRef.current) return;
      injected.current = true;
      const container = containerRef.current;

      // Use an iframe to isolate each ad's atOptions global — prevents
      // race conditions when multiple slots share the same key on one page.
      const iframe = document.createElement("iframe");
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.border = "none";
      iframe.style.overflow = "hidden";
      iframe.scrolling = "no";
      iframe.setAttribute("loading", "lazy");
      container.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      iframeDoc.open();
      iframeDoc.write(`
        <!doctype html>
        <html><head><style>body{margin:0;overflow:hidden}</style></head>
        <body>
          <script>
            atOptions = { 'key': '${key}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {} };
          <\/script>
          <script src="https://www.highperformanceformat.com/${key}/invoke.js"><\/script>
        </body></html>
      `);
      iframeDoc.close();
    };

    // Mid-content slots wait so top + sidebar load first
    if (isMidContent) {
      const timer = setTimeout(inject, MID_CONTENT_DELAY);
      return () => clearTimeout(timer);
    } else {
      inject();
    }
  }, [slot, width, height, isMidContent]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-hidden rounded ${className ?? ""}`}
      style={{ width, height, maxWidth: "100%" }}
      data-ad-slot={slot}
    />
  );
}

function AdSenseSlot({ slot, className }: AdSlotProps) {
  const { width, height } = SLOT_DIMENSIONS[slot];
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [adFilled, setAdFilled] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || pushed.current) return;
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet
    }

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
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-format={SLOT_FORMAT[slot]}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

export function AdSlot({ slot, className }: AdSlotProps) {
  if (AD_PROVIDER === "adsterra") {
    return <AdsterraSlot slot={slot} className={className} />;
  }

  if (AD_PROVIDER === "adsense" && ADSENSE_CLIENT_ID) {
    return <AdSenseSlot slot={slot} className={className} />;
  }

  // Fallback dev placeholder
  const { width, height } = SLOT_DIMENSIONS[slot];
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
