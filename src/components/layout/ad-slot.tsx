interface AdSlotProps {
  slot: "leaderboard" | "sidebar" | "in-feed";
  className?: string;
}

const SLOT_DIMENSIONS: Record<AdSlotProps["slot"], { width: number; height: number }> = {
  leaderboard: { width: 728, height: 90 },
  sidebar: { width: 300, height: 250 },
  "in-feed": { width: 728, height: 90 },
};

export function AdSlot({ slot, className }: AdSlotProps) {
  const { width, height } = SLOT_DIMENSIONS[slot];

  return (
    <div
      className={className}
      aria-hidden="true"
      data-ad-slot={slot}
      style={{ width, height, maxWidth: "100%" }}
    >
      {/* Ad provider script will be injected here */}
    </div>
  );
}
