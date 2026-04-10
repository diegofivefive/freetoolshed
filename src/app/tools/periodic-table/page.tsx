import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { PeriodicTableLoader } from "./_components/periodic-table-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Interactive Periodic Table",
  description:
    "Explore all 118 elements with interactive visualizations, temperature phase changes, property heatmaps, and a molar mass calculator.",
  slug: "periodic-table",
  paidAlternative: "Merck PTE",
};

export const metadata = generateToolMetadata(toolConfig);

export default function PeriodicTablePage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this periodic table tool really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What data is included for each element?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each of the 118 elements includes atomic mass, electron configuration, electronegativity, atomic radius, ionization energy, melting/boiling points, density, crystal structure, isotope data, discovery history, and real-world uses.",
        },
      },
      {
        "@type": "Question",
        name: "How does the temperature slider work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Drag the slider from 0K to 6000K and watch elements change state in real-time. Elements are color-coded as solid, liquid, or gas based on their melting and boiling points at the selected temperature.",
        },
      },
      {
        "@type": "Question",
        name: "What is the property heatmap mode?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select a property like electronegativity, atomic radius, or ionization energy and the entire table becomes a color gradient, letting you instantly visualize periodic trends across all elements.",
        },
      },
      {
        "@type": "Question",
        name: "How does the molar mass calculator work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Type any chemical formula (e.g., H₂SO₄, C₆H₁₂O₆, Ca(OH)₂) and get an instant molar mass calculation with a breakdown showing each element's contribution. Supports parentheses and nested groups.",
        },
      },
      {
        "@type": "Question",
        name: "Can I compare elements side by side?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Select 2 to 4 elements to see a side-by-side comparison with bar charts for key properties including atomic mass, electronegativity, density, melting point, and ionization energy.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export element data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Export the full element dataset or your filtered selection as CSV or JSON. You can also download a print-friendly PDF of the periodic table or a PNG screenshot of your current view.",
        },
      },
      {
        "@type": "Question",
        name: "Does this work on mobile devices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool is optimized for desktop use (1024px+ screens) for the best experience with the full periodic table layout. It works on tablets and larger phones but desktop provides the richest interaction.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a good alternative to paid periodic table apps?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. This tool replaces paid apps like Merck PTE ($2.99) and Periodic Table Pro (subscription) with a free, browser-based alternative that includes interactive features like temperature visualization and property heatmaps.",
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
        Free Interactive Periodic Table
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Explore all 118 elements with real-time temperature phase changes,
        property heatmaps, and a molar mass calculator — a free alternative to
        Merck PTE and Periodic Table Pro. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Temperature Phase Visualization
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag a slider from 0K to 6000K and watch all 118 elements change
            state in real-time. See which elements are solid, liquid, or gas at
            any temperature.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Property Heatmaps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize periodic trends instantly. Select electronegativity, atomic
            radius, ionization energy, or density to see the entire table as a
            color gradient.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Molar Mass Calculator</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Type any chemical formula and get instant molar mass with a full
            element-by-element breakdown. Supports complex formulas with
            parentheses.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Element Comparison &amp; Export
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare 2–4 elements side by side with bar charts. Export data as
            CSV, JSON, or PDF. Every property for all 118 elements, completely
            free.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <PeriodicTableLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
