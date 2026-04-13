import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { VideoConverterLoader } from "./_components/video-converter-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Video Converter",
  description:
    "Convert videos between MP4, WebM, MOV, AVI, and GIF. Browser-based, no uploads, no sign-up.",
  slug: "media-toolkit/video-converter",
  paidAlternative: "Adobe Media Encoder",
};

export const metadata = generateToolMetadata(toolConfig);

export default function VideoConverterPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this video converter really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No watermarks, no file size limits, no sign-up required. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What video formats can I convert between?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Input: MP4, WebM, MOV, AVI, MKV, and most formats ffmpeg supports. Output: MP4 (H.264), WebM (VP8), AVI (MPEG-4), and GIF. Output is always re-encoded to the target format's native codec.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert a video to GIF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Select GIF as the output format. GIFs are capped at 12 fps and 720p width for reasonable file sizes. The palette is optimized per-frame for the best quality. For longer videos, expect large GIF files — GIF is best for short clips.",
        },
      },
      {
        "@type": "Question",
        name: "Do my videos get uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side using ffmpeg.wasm (WebAssembly). Your video never leaves your device — no uploads, no servers, no cloud processing.",
        },
      },
      {
        "@type": "Question",
        name: "Why is conversion slow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Video transcoding runs in single-threaded WebAssembly, which is slower than native desktop software. A 1-minute video typically takes 2-5 minutes. The trade-off is complete privacy — your video stays on your device.",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between this and the Video Compressor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Video Compressor reduces file size while keeping the MP4 format, with fine-tuned CRF and resolution controls. The Video Converter changes the container format (MP4 to WebM, to GIF, etc.). Use the compressor to shrink MP4s, the converter to change formats.",
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
          { label: "Video Converter" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Video Converter — MP4, WebM, AVI, GIF
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Convert videos between formats right in your browser — a free
        alternative to Adobe Media Encoder. No sign-up, no uploads.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">4 Output Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Convert to MP4 (H.264), WebM (VP8), AVI (MPEG-4), or GIF.
            Each format uses its optimal codec automatically.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Video to GIF</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Convert video clips to optimized GIFs with palette generation.
            Capped at 12 fps and 720p for reasonable file sizes.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Batch Conversion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add multiple videos and convert them all to the same format.
            Each file converts independently with its own download.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens in your browser using WebAssembly. Your
            videos never leave your device — no uploads, no servers.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <VideoConverterLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
