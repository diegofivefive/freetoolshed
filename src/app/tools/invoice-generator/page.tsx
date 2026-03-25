import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { InvoiceGeneratorLoader } from "./_components/invoice-generator-loader";

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
          text: "Your current invoice is automatically saved as a draft in your browser. You can also download a PDF copy at any time. Invoice numbers auto-increment for your convenience.",
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

      <h1 className="text-3xl font-bold tracking-tight">
        Free Invoice Generator
      </h1>
      <p className="mt-2 text-muted-foreground">
        Create professional invoices with custom templates, automatic tax
        calculations, and instant PDF download. No sign-up required.
      </p>

      <div className="mt-6">
        <InvoiceGeneratorLoader />
      </div>

      <SeoContent />
    </>
  );
}
