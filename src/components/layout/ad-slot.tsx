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

export function AdSlot({ slot, className }: AdSlotProps) {
  const { width, height } = SLOT_DIMENSIONS[slot];

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
