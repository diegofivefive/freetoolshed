import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { SubtitleExtractorLoader } from "./_components/subtitle-extractor-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Subtitle Extractor",
  description:
    "Extract subtitle tracks from video files. Export to SRT, ASS, or VTT format. Supports multiple tracks and languages.",
  slug: "media-toolkit/subtitle-extractor",
  paidAlternative: "HandBrake",
};

export const metadata = generateToolMetadata(toolConfig);

export default function SubtitleExtractorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this subtitle extractor free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No sign-up, no file limits. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MP4, MKV, WebM, MOV, and AVI are supported. MKV files are the most common source for embedded subtitles.",
        },
      },
      {
        "@type": "Question",
        name: "What subtitle formats can I export to?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SRT (SubRip), ASS (Advanced SubStation Alpha), and VTT (WebVTT). SRT is the most widely compatible format.",
        },
      },
      {
        "@type": "Question",
        name: "Can I extract multiple subtitle tracks at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The tool probes the video for all embedded subtitle tracks and lets you extract individual tracks or all of them at once with a single click.",
        },
      },
      {
        "@type": "Question",
        name: "Do my files get uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side using ffmpeg.wasm. Your files never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "Why were no subtitles found in my video?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not all videos have embedded subtitle tracks. MP4 files from streaming services often use separate subtitle files or burned-in (hardcoded) subtitles that cannot be extracted. MKV files are the most common format for embedded subtitles.",
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

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Media Toolkit", href: "/tools/media-toolkit" },
          { label: "Subtitle Extractor" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Subtitle Extractor — Pull Subtitles from Video
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Extract embedded subtitle tracks from MKV, MP4, and other video files —
        a free alternative to HandBrake. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Auto-Detect Tracks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatically probes the video and lists all embedded subtitle
            tracks with language and codec info.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">3 Output Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Export to SRT, ASS, or WebVTT. SRT is the most widely compatible.
            ASS preserves styling. VTT is for web players.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Batch Extract</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Extract a single track or all tracks at once. Each track downloads
            as a separate file with language tags.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens in your browser using WebAssembly. Your
            files never leave your device.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SubtitleExtractorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
