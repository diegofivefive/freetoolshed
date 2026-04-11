"use client";

interface CountdownOverlayProps {
  count: number;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
      role="status"
      aria-live="assertive"
      aria-label={`Recording starts in ${count}`}
    >
      <div
        // key forces a DOM rerender each tick so the CSS animation re-runs
        key={count}
        className="flex size-32 animate-in zoom-in-50 fade-in items-center justify-center rounded-full border-4 border-brand bg-black/40 text-7xl font-bold text-brand duration-300"
      >
        {count}
      </div>
    </div>
  );
}
