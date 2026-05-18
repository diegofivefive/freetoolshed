import { ToolInsights } from "@/components/shared/tool-insights";

const TIPS = [
  "Pin frequently-used units to favorites — saves scrolling through 800+ entries every time.",
  "Use the command palette (Ctrl/Cmd+K) to jump straight to a unit instead of clicking through categories.",
  "Batch convert by pasting a column of values — the result column updates in real time.",
  "Toggle the inline formula display when you need to show the work, not just the answer.",
  "Adjust decimal precision when working with very small or very large numbers — defaults are tuned for everyday use.",
];

const MISTAKES = [
  "Confusing US gallons with Imperial gallons — they're 3.785 L vs 4.546 L. The category label distinguishes them.",
  "Converting between dimensionally non-equivalent units (energy → power) and expecting a result — they're different physical quantities.",
  "Trusting locale-specific defaults silently — verify category and unit selection match what you actually mean.",
];

const TAKEAWAYS = [
  "Conversions run client-side — no network round-trip, no rate limits, works offline once cached.",
  "Covers everyday measurements through specialist engineering units like viscosity, torque, and thermal conductivity.",
  "Designed for quick lookups and bulk conversions, not symbolic algebra over units.",
];

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <section className="prose prose-sm dark:prose-invert max-w-none">
        <h2>About Free Unit Converter</h2>
        <p>
          Free Tool Shed&apos;s Unit Converter is a comprehensive conversion tool
          covering 800+ units across 23 categories — from everyday measurements
          like length and temperature to specialized engineering units like
          viscosity, thermal conductivity, and torque. Unlike basic converters,
          it features animated scale visualizations, real-time formula display,
          batch conversion, and a keyboard-first command palette.
        </p>
      </section>

      <ToolInsights tips={TIPS} mistakes={MISTAKES} takeaways={TAKEAWAYS} />
    </div>
  );
}
