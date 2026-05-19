import { generateToolMetadata, generateToolJsonLd, generateHowToJsonLd } from "@/lib/seo";
import { ToolByline } from "@/components/shared/tool-byline";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ToolTldr } from "@/components/shared/tool-tldr";
import { SeoContent, HOW_TO_STEPS } from "./_components/seo-content";
import { InvoiceGeneratorLoader } from "./_components/invoice-generator-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Invoice Generator",
  description:
    "Create professional invoices with custom templates, tax calculations, and instant PDF export.",
  slug: "invoice-generator",
  paidAlternative: "FreshBooks",
};

export const metadata = generateToolMetadata(toolConfig);

export default function InvoiceGeneratorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const howToJsonLd = generateHowToJsonLd({
    name: "How to Create a Professional Invoice",
    slug: toolConfig.slug,
    steps: HOW_TO_STEPS,
  });
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this invoice generator really free?",
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
          text: "No. You can start creating invoices immediately without signing up or providing any personal information.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data private and secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your invoice data never leaves your browser. All processing happens client-side on your device, so your business information stays completely private.",
        },
      },
      {
        "@type": "Question",
        name: "What invoice templates are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three professional templates are included: Modern (clean and minimal), Classic (traditional business style), and Compact (dense layout for invoices with many line items).",
        },
      },
      {
        "@type": "Question",
        name: "Can I add my company logo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload your company logo in PNG, JPEG, or SVG format and it will appear on your invoice and PDF export.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "20 major currencies are supported including USD, EUR, GBP, CAD, AUD, JPY, CHF, INR, and more. Currency symbols and decimal formatting are handled automatically.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save my invoices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Your current draft auto-saves as you type. You can also save invoices to your history for later access, duplicate them, or export all invoices as JSON for backup.",
        },
      },
      {
        "@type": "Question",
        name: "Can I track invoice status?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Mark each invoice as Draft, Sent, Paid, or Overdue. The status appears as a watermark on the PDF and in your invoice history.",
        },
      },
      {
        "@type": "Question",
        name: "How do I print my invoice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the Print button to open your browser's print dialog, or download the PDF and print from your PDF viewer. Both options produce professional, print-ready output.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Invoice Generator" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Invoice Generator
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Create professional invoices with custom templates, automatic tax
        calculations, and instant PDF download — a free alternative to
        FreshBooks, QuickBooks, and Wave. No sign-up required.
      </p>

      <ToolTldr>
        Generate professional invoices entirely in your browser — pick from three
        PDF templates, add line items with per-item tax rates, work in 20
        currencies, and download a print-ready PDF or save to a local-only
        invoice history. Drafts auto-save as you type. No sign-up, no upload to a
        server, no recurring fee — a free alternative to FreshBooks, QuickBooks,
        and Wave for one-off and low-volume invoicing.
      </ToolTldr>

      <ToolByline />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">3 Professional Templates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose from Modern, Classic, or Compact layouts. Each template is
            fully customizable with your brand colors and company logo.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant PDF Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download print-ready PDF invoices in one click. Your data never
            leaves your browser — everything is processed locally on your device.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">20 Currencies Supported</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Invoice clients worldwide with automatic currency formatting for
            USD, EUR, GBP, JPY, CAD, AUD, INR, and 13 more.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Invoice History &amp; Status Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save invoices to your local history, track them as Draft, Sent,
            Paid, or Overdue, and export/import JSON backups. Auto-save keeps
            your current draft safe.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <InvoiceGeneratorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
