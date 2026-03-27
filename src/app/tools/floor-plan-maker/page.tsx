import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { FloorPlanMakerLoader } from "./_components/floor-plan-maker-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Floor Plan Maker",
  description:
    "Design floor plans and room layouts with drag-and-drop furniture placement and instant SVG, PNG, or PDF export.",
  slug: "floor-plan-maker",
  paidAlternative: "SmartDraw",
};

export const metadata = generateToolMetadata(toolConfig);

export default function FloorPlanMakerPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this floor plan maker really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. You can start designing floor plans immediately without signing up or providing any personal information.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data private and secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your floor plan data never leaves your browser. All processing happens client-side on your device, so your designs stay completely private.",
        },
      },
      {
        "@type": "Question",
        name: "What export formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can export your floor plans as SVG (scalable vector), PNG (high-resolution image), or PDF (print-ready document). All exports are generated instantly in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "How many furniture pieces are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Over 100 furniture items are included across six categories: living room, bedroom, kitchen, bathroom, office, and outdoor. Each piece uses accurate real-world dimensions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I set room dimensions in feet or meters?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Switch between feet and meters at any time. Dimensions are displayed on room edges and update automatically when you resize rooms.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save my floor plans?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Your current design auto-saves as you work. You can also save multiple plans to your local history, duplicate them, or export all plans as JSON for backup.",
        },
      },
      {
        "@type": "Question",
        name: "Is there an undo/redo feature?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Full undo and redo support is included with keyboard shortcuts (Ctrl+Z and Ctrl+Shift+Z). Up to 50 history steps are stored.",
        },
      },
      {
        "@type": "Question",
        name: "How does grid snapping work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Grid snapping aligns rooms and furniture to a configurable grid (default 1 foot). This makes it easy to create precise, aligned layouts. You can toggle snapping on or off.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a good alternative to SmartDraw or RoomSketcher?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Free Tool Shed's floor plan maker offers drag-and-drop room design, 100+ furniture pieces, grid snapping, and multi-format export — all free with no account required. SmartDraw costs $10/month and RoomSketcher requires sign-up.",
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
        Free Floor Plan Maker
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Design floor plans and room layouts with drag-and-drop furniture
        placement and instant export — a free alternative to SmartDraw,
        RoomSketcher, and Floorplanner. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Drag & Drop Room Design</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Draw rooms, walls, doors, and windows with intuitive click-and-drag
            tools. Grid snapping keeps everything aligned and precise.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100+ Furniture Pieces</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose from over 100 furniture items across six categories — living
            room, bedroom, kitchen, bathroom, office, and outdoor — with
            accurate real-world dimensions.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">SVG, PNG & PDF Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Export your floor plan as a scalable SVG, high-resolution PNG, or
            print-ready PDF. All processing happens in your browser — your data
            stays private.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Auto-Save & JSON Backup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your design auto-saves as you work. Save multiple plans to your
            local history, and export or import JSON backups at any time.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <FloorPlanMakerLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
