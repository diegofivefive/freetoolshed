import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { AudioExtractorLoader } from "./_components/audio-extractor-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Audio Extractor",
  description:
    "Extract audio tracks from video files. Convert to MP3, M4A, WAV, OGG, or FLAC — or keep the original codec.",
  slug: "media-toolkit/audio-extractor",
  paidAlternative: "Adobe Premiere Pro",
};

export const metadata = generateToolMetadata(toolConfig);

export default function AudioExtractorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this audio extractor free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No watermarks, no sign-up, no file limits. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MP4, WebM, MOV, AVI, and MKV video files are all supported. The tool works with any video that contains an audio track.",
        },
      },
      {
        "@type": "Question",
        name: "What audio formats can I extract to?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can extract to MP3, M4A (AAC), WAV, OGG (Vorbis), or FLAC. You can also keep the original audio codec with stream copy for instant extraction.",
        },
      },
      {
        "@type": "Question",
        name: "Does 'Original' format preserve quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Original mode uses stream copy (-c:a copy), which copies the audio data without re-encoding. This is the fastest option and preserves the exact original quality.",
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
          { label: "Audio Extractor" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Audio Extractor — Rip Audio from Video
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Extract audio tracks from any video file — a free alternative to Adobe
        Premiere Pro. No sign-up, no watermarks, no limits.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Multiple Output Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Extract to MP3, M4A, WAV, OGG, or FLAC. Or keep the original
            codec with zero-loss stream copy.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant Stream Copy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Original mode copies the audio track without re-encoding —
            near-instant extraction with zero quality loss.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Quality Control</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose bitrate from 64 kbps to 320 kbps for lossy formats.
            Lossless formats (WAV, FLAC) preserve full quality.
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
        <AudioExtractorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
