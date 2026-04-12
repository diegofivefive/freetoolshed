import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { UnitConverterLoader } from "./_components/unit-converter-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Unit Converter",
  description:
    "Convert between 800+ units across 23 categories — from everyday measurements to engineering and scientific units like viscosity, thermal conductivity, and torque. Features animated visualizations, formula display, batch conversion, and a keyboard-first workflow.",
  slug: "unit-converter",
  paidAlternative: "Wolfram Alpha",
};

export const metadata = generateToolMetadata(toolConfig);

export default function UnitConverterPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this unit converter really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free with no sign-up, no downloads, and no hidden fees. It's ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What engineering and scientific units are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This converter covers 23 categories including pressure (Pa, psi, bar, atm, mmHg), viscosity (Pa·s, cP, cSt, Stokes), thermal conductivity (W/m·K, BTU/hr·ft·°F), torque (N·m, ft·lbs, in·lbs), flow rate, electric current, voltage, and more — going well beyond everyday conversions.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate are the conversions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All conversion factors are sourced from NIST reference standards and verified against published engineering tables. Results display up to 15 significant digits for maximum precision in scientific and engineering work.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert multiple values at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Batch mode lets you paste a list of values and convert them all simultaneously. Results cascade in with animated display and can be copied to clipboard or exported as CSV.",
        },
      },
      {
        "@type": "Question",
        name: "What keyboard shortcuts are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Press Ctrl+K (or Cmd+K on Mac) to open the command palette for natural language conversions like '5 miles to km'. Use Tab to cycle through fields, X to swap units, and Ctrl+B for batch mode.",
        },
      },
      {
        "@type": "Question",
        name: "Does it show the conversion formula?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The formula bar shows the mathematical formula for every conversion with animated variable substitution as you type. For temperature and other nonlinear conversions, it displays the step-by-step calculation.",
        },
      },
      {
        "@type": "Question",
        name: "What are the visual scale comparisons?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The scale comparison panel shows animated visualizations of the conversion — thermometers for temperature, balance scales for mass, speedometer gauges for speed, and proportional bars for other categories — so you can see the relative magnitude at a glance.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save frequently used conversions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Pin your most-used conversion pairs as favorites for one-click access. Your favorites, recent conversions, and display preferences are saved automatically in your browser.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Unit Converter
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Convert 800+ units across 23 categories with animated visualizations and
        formula display — a free alternative to Wolfram Alpha. No sign-up
        required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Engineering &amp; Scientific Units
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Go beyond kg-to-lbs — convert viscosity, thermal conductivity,
            torque, pressure, flow rate, and 18 more categories used by
            engineers and scientists daily.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Animated Scale Visualizations
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See your conversions come alive — thermometers for temperature,
            balance scales for mass, speedometer gauges for speed, and
            proportional bars for everything else.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Keyboard-First Workflow</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Press Ctrl+K to type natural language like &quot;5 miles to km&quot;.
            Tab through fields, swap units with a keystroke, and batch-convert
            lists of values.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Instant Formula Display
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every conversion shows the underlying math with syntax-highlighted
            formulas and animated variable substitution — perfect for students
            and engineers.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <UnitConverterLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
