import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { PayStubGeneratorLoader } from "./_components/pay-stub-generator-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Pay Stub Generator",
  description:
    "Create professional pay stubs with earnings, deductions, YTD tracking, and instant PDF export.",
  slug: "pay-stub-generator",
  paidAlternative: "PayStubCreator",
};

export const metadata = generateToolMetadata(toolConfig);

export default function PayStubGeneratorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this pay stub generator really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no per-stub charges, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. You can start creating pay stubs immediately without signing up or providing any personal information.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data private and secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your pay stub data never leaves your browser. All processing happens client-side on your device, so employee information stays completely private.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this for both hourly and salaried employees?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Toggle between hourly and salary mode. Hourly mode auto-calculates pay from hours and rate, while salary mode lets you enter a flat amount per pay period.",
        },
      },
      {
        "@type": "Question",
        name: "Does this calculate taxes automatically?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool provides standard US deduction categories (Federal, State, Social Security, Medicare, 401k, insurance) but you enter the amounts manually. This gives you full control and avoids errors from incorrect tax table assumptions.",
        },
      },
      {
        "@type": "Question",
        name: "What templates are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three professional templates are included: Standard (traditional table layout), Modern (clean card-based design), and Compact (dense layout for detailed stubs).",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate multiple pay stubs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Save pay stubs to your history, duplicate them for the next pay period, and export all stubs as JSON for backup. Year-to-date tracking helps maintain accuracy across periods.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add my company logo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload your company logo in PNG, JPEG, or SVG format and it will appear on your pay stub and PDF export.",
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
        Free Pay Stub Generator
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Create professional pay stubs with earnings, deductions, and YTD
        tracking — a free alternative to PayStubCreator and ThePayStubs. No
        sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Hourly &amp; Salary Support</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate pay stubs for hourly employees with overtime or salaried
            workers with flat amounts. Supports bonus, commission, and tips.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant PDF Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download professional pay stubs as PDF in one click. Your data never
            leaves your browser — everything is processed locally on your device.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Standard US Deductions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One-click setup for Federal, State, Social Security, Medicare,
            401(k), and health insurance deductions. Add custom deductions too.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Year-to-Date Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track cumulative earnings and deductions across pay periods with YTD
            totals on every pay stub. Save stubs to history for easy reference.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <PayStubGeneratorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
