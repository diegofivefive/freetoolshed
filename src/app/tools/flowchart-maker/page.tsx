import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { FlowchartMakerLoader } from "./_components/flowchart-maker-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Flowchart Maker",
  description:
    "Create flowcharts, process diagrams, and decision trees with smart auto-routing connections. Export as SVG, PNG, or PDF.",
  slug: "flowchart-maker",
  paidAlternative: "Lucidchart",
};

export const metadata = generateToolMetadata(toolConfig);

export default function FlowchartMakerPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this flowchart maker really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "How do I create a flowchart online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select a shape from the palette, click on the canvas to place it, then use the connect tool to draw arrows between shapes. You can add labels, change colors, and export as SVG, PNG, or PDF.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my flowchart as an image?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Export as high-resolution PNG, scalable SVG, or print-ready PDF. You can also copy the diagram to your clipboard as a PNG for quick pasting into documents.",
        },
      },
      {
        "@type": "Question",
        name: "What shapes are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All standard flowchart shapes: process (rectangle), decision (diamond), terminal (rounded rectangle), input/output (parallelogram), document, predefined process, manual input, preparation (hexagon), database (cylinder), connector, and comment.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Everything runs in your browser. Your diagrams are never uploaded to any server. Auto-save uses your browser's local storage.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this instead of Lucidchart or Visio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For most flowchart and process diagram needs, yes. You get drag-and-drop shapes, smart connection routing, multiple export formats, and auto-save — all for free, no account required.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support different connection types?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Choose from straight lines, smooth bezier curves, or right-angle orthogonal routing. Each connection can have its own style, arrowheads, and labels.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save and load diagrams?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your work auto-saves as you edit. You can also save diagrams to your history, export as JSON for backup, and import JSON files to restore previous work.",
        },
      },
      {
        "@type": "Question",
        name: "Are there templates to get started?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Start from built-in templates including a simple flowchart, decision tree, process map, and software development lifecycle diagram.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to install anything?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. It runs entirely in your browser. No plugins, no extensions, no desktop app. Open the page and start diagramming.",
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
        Free Flowchart Maker
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Create flowcharts, process diagrams, and decision trees — a free
        alternative to Lucidchart and Visio. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Drag & Drop Flowcharting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Draw process, decision, terminal, and data shapes with intuitive
            click-to-place tools. Connect nodes with auto-routing edges.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Smart Connection Routing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Straight, bezier, and orthogonal edge routing with automatic anchor
            snapping. Add labels and arrowheads to connections.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">SVG, PNG & PDF Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Export diagrams as scalable SVG, high-resolution PNG, or print-ready
            PDF. Copy to clipboard for quick sharing.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Auto-Save & Templates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Auto-saves as you work. Start from templates or build from scratch.
            JSON import/export for backup and sharing.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <FlowchartMakerLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
