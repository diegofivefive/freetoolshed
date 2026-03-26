import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { ResumeBuilderLoader } from "./_components/resume-builder-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Resume Builder",
  description:
    "Build professional, ATS-friendly resumes with multiple templates and instant PDF export.",
  slug: "resume-builder",
  paidAlternative: "Resume.io",
};

export const metadata = generateToolMetadata(toolConfig);

export default function ResumeBuilderPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this resume builder really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Are the resumes ATS-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All four templates use real text (not images), standard fonts, and a clean heading hierarchy that Applicant Tracking Systems can parse correctly.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. You can start building your resume immediately without signing up or providing any personal information.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data private and secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your resume data never leaves your browser. All processing happens client-side on your device, so your personal and professional information stays completely private.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download my resume as a PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — click 'Download PDF' and get an instant, high-quality PDF with no watermarks and no paywall. Unlike Resume.io and Zety, the download is truly free.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save multiple resumes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Save resumes to your local history, name them, and switch between versions. You can also export all resumes as JSON for backup and import them later.",
        },
      },
      {
        "@type": "Question",
        name: "What sections can I add to my resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "11 section types are available: Professional Summary, Work Experience, Education, Skills, Certifications, Languages, Projects, Volunteer Experience, Awards & Honors, Publications, and References.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize the look of my resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Choose from 4 professional templates, pick an accent color, select a font family, and choose between Compact, Standard, or Spacious font sizes.",
        },
      },
      {
        "@type": "Question",
        name: "How do I print my resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the Print button to open your browser's print dialog, or download the PDF and print from your PDF viewer. Both options produce professional, print-ready output.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add a photo to my resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload a professional headshot in PNG, JPEG, or WebP format. The photo appears in templates that support it and in the PDF export.",
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
        Free Resume Builder
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Build professional, ATS-friendly resumes with multiple templates and
        instant PDF download — a free alternative to Resume.io, Zety, and
        Novoresume. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">4 ATS-Friendly Templates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose from Modern, Classic, Professional, or Minimal layouts.
            Every template is optimized for Applicant Tracking Systems.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant PDF Download</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download watermark-free PDF resumes in one click. Your data never
            leaves your browser — everything is processed locally on your device.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Drag-and-Drop Sections</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reorder sections, show or hide them, and add from 11 section types
            including Skills, Certifications, Languages, Projects, and more.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Multiple Resumes &amp; Backup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save resumes to local history, duplicate and rename them, and
            export/import JSON backups. Auto-save keeps your current draft safe.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ResumeBuilderLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
