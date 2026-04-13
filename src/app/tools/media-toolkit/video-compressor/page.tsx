import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { VideoCompressorLoader } from "./_components/video-compressor-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Video Compressor",
  description:
    "Reduce video file size with quality presets or custom CRF. H.264 encoding in your browser — no uploads.",
  slug: "media-toolkit/video-compressor",
  paidAlternative: "HandBrake",
};

export const metadata = generateToolMetadata(toolConfig);

export default function VideoCompressorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this video compressor really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No watermarks, no file size limits, no sign-up required. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Do my videos get uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side using ffmpeg.wasm (WebAssembly). Your video never leaves your device — no uploads, no servers, no cloud processing.",
        },
      },
      {
        "@type": "Question",
        name: "Why is compression slow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Video encoding runs in single-threaded WebAssembly, which is slower than native desktop software. A 1-minute 1080p video typically takes 2-5 minutes to compress. Longer or higher-resolution videos take proportionally longer. The trade-off is privacy — your video never leaves your browser.",
        },
      },
      {
        "@type": "Question",
        name: "What is CRF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CRF (Constant Rate Factor) controls the quality-to-size trade-off. Lower values mean higher quality and larger files. 18 is visually lossless, 23 is the ffmpeg default (good balance), and 28+ gives aggressive compression with noticeable quality loss.",
        },
      },
      {
        "@type": "Question",
        name: "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Input: MP4, WebM, MOV, AVI, MKV, and most formats ffmpeg can decode. Output is always MP4 (H.264 + AAC) for maximum compatibility across devices and platforms.",
        },
      },
      {
        "@type": "Question",
        name: "Can I also reduce the resolution?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Choose a maximum height (1080p, 720p, 480p, 360p) to downscale the video while maintaining aspect ratio. Downscaling combined with CRF compression can dramatically reduce file size.",
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
          { label: "Video Compressor" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Video Compressor — Reduce File Size Online
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Compress videos with H.264 encoding right in your browser — a free
        alternative to HandBrake. No sign-up, no uploads.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Quality Presets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose Small File, Balanced, or High Quality — or set a custom CRF
            value for precise control over the quality/size trade-off.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Resolution Control</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optionally downscale to 1080p, 720p, 480p, or 360p while
            maintaining aspect ratio. Great for cutting file size further.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">H.264 + AAC Output</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Output is MP4 with H.264 video and AAC audio — the most
            universally compatible format for web, mobile, and social media.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens in your browser using WebAssembly. Your
            video never leaves your device — no uploads, no servers.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <VideoCompressorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
