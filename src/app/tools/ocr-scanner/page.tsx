import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { OcrScannerLoader } from "./_components/ocr-scanner-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "OCR Scanner",
  description:
    "Extract text from images and scanned PDFs using OCR. Supports 15+ languages with instant export to .txt, .docx, and searchable PDF.",
  slug: "ocr-scanner",
  paidAlternative: "Adobe Acrobat",
};

export const metadata = generateToolMetadata(toolConfig);

export default function OcrScannerPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this OCR tool really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "How do I extract text from an image?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Drop your image (PNG, JPG, TIFF, BMP, or WebP) onto the editor. OCR runs automatically in your browser and displays the extracted text in seconds. You can then copy it or export as .txt, .docx, or searchable PDF.",
        },
      },
      {
        "@type": "Question",
        name: "Can I extract text from a scanned PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Drop a scanned PDF and each page is rendered and processed with OCR. Multi-page PDFs are fully supported with sequential page processing.",
        },
      },
      {
        "@type": "Question",
        name: "What languages are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Over 15 languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Korean, Chinese (Simplified and Traditional), Arabic, and Hindi.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All OCR processing happens locally in your browser using WebAssembly. Your images and PDFs are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "What export formats are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Export extracted text as plain text (.txt), Word document (.docx), or searchable PDF with an invisible text layer over the original scan.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to install anything?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The OCR engine runs entirely in your browser via WebAssembly. No desktop app, no plugins, no extensions. Open the page and start scanning.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the OCR?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Accuracy depends on image quality. Clean, high-resolution scans (300+ DPI) typically achieve 95%+ accuracy. The tool shows a confidence score for each processed page so you can verify results.",
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
        Free OCR Scanner — Image &amp; PDF to Text
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Extract text from images and scanned PDFs instantly — a free alternative
        to Adobe Acrobat OCR and ABBYY FineReader. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant Text Extraction</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop an image or scanned PDF, get editable text in seconds. Powered
            by tesseract.js OCR running entirely in your browser.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">15+ Languages Supported</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            English, Spanish, French, German, Chinese, Japanese, Arabic, and
            more. Switch languages with one click.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Multiple Export Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy text, download as .txt or .docx, or create a searchable PDF
            with an invisible text layer over your original scan.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">
            100% Private, No Upload
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All OCR processing happens in your browser using WebAssembly. Your
            files never leave your device.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <OcrScannerLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
