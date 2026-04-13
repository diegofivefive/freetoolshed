import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { AudioConverterLoader } from "./_components/audio-converter-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Audio Converter",
  description:
    "Convert audio files between MP3, M4A, WAV, OGG, and FLAC. Single file or batch mode, with configurable bitrate.",
  slug: "media-toolkit/audio-converter",
  paidAlternative: "Adobe Audition",
};

export const metadata = generateToolMetadata(toolConfig);

export default function AudioConverterPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this audio converter really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no watermarks, no file size limits, and no sign-up required. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What audio formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Input: MP3, M4A/AAC, WAV, OGG, FLAC, WebM, and any format your browser can decode. Output: MP3, M4A (AAC), WAV, OGG (Vorbis), and FLAC.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert multiple files at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Add multiple files and they'll be converted sequentially to your chosen format. Each file gets its own progress bar and download button.",
        },
      },
      {
        "@type": "Question",
        name: "Do my files get uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side using ffmpeg.wasm (WebAssembly). Your files never leave your device — no uploads, no servers, no accounts.",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between lossy and lossless formats?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lossy formats (MP3, M4A, OGG) compress audio by discarding data the human ear is less likely to notice, producing smaller files. Lossless formats (WAV, FLAC) preserve the original audio perfectly but produce larger files. FLAC compresses losslessly (smaller than WAV), while WAV is uncompressed.",
        },
      },
      {
        "@type": "Question",
        name: "What bitrate should I use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For speech (podcasts, audiobooks), 64-128 kbps is sufficient. For music, 192-320 kbps provides good quality. 320 kbps is the maximum for MP3 and is virtually indistinguishable from lossless for most listeners. Lossless formats (WAV, FLAC) ignore the bitrate setting.",
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
          { label: "Audio Converter" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Audio Converter — MP3, M4A, WAV, OGG, FLAC
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Convert audio files between formats — a free alternative to Adobe
        Audition. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">5 Output Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Convert to MP3, M4A (AAC), WAV, OGG (Vorbis), or FLAC with
            configurable bitrate from 64 to 320 kbps.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Batch Conversion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add multiple files and convert them all to the same format. Each
            file converts independently with its own progress and download.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Lossy & Lossless</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose lossy (MP3, M4A, OGG) for smaller files or lossless (WAV,
            FLAC) for perfect quality. FLAC compresses without losing data.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens in your browser using WebAssembly. Your
            files never leave your device — no uploads, no servers.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <AudioConverterLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
