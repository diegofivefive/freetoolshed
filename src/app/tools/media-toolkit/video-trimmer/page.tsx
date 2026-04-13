import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { VideoTrimmerLoader } from "./_components/video-trimmer-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Video Trimmer",
  description:
    "Trim video files to a specific time range or split them at multiple time markers. Stream copy for instant cuts with zero quality loss.",
  slug: "media-toolkit/video-trimmer",
  paidAlternative: "Adobe Premiere Pro",
};

export const metadata = generateToolMetadata(toolConfig);

export default function VideoTrimmerPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this video trimmer free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No watermarks, no sign-up, no file limits. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Does trimming re-encode the video?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The trimmer uses ffmpeg's stream copy mode (-c copy), which cuts without re-encoding. This means trimming is nearly instant and preserves the original video and audio quality exactly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I split a video into multiple parts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Switch to Split mode, add time markers where you want to cut, and the video will be split into multiple segments. Each segment downloads separately.",
        },
      },
      {
        "@type": "Question",
        name: "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MP4, WebM, MOV, AVI, and MKV are all supported. The output format matches the input — no format conversion happens during trimming.",
        },
      },
      {
        "@type": "Question",
        name: "Why might the cut not be frame-exact?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stream copy mode cuts at the nearest keyframe (I-frame), which may be slightly before your requested timestamp. For most videos with keyframes every 1-2 seconds, this is barely noticeable. For frame-exact cuts, re-encoding would be needed.",
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
          { label: "Video Trimmer" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Video Trimmer — Cut & Split Video Files
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Trim videos to a time range or split into segments — a free alternative
        to Adobe Premiere Pro. No sign-up, no re-encoding, no watermarks.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant Stream Copy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No re-encoding means near-instant trimming with zero quality loss.
            Cut a 2-hour movie in seconds, not minutes.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Trim or Split</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Trim mode extracts a single clip. Split mode cuts at multiple time
            markers, producing separate files for each segment.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Video Preview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preview your video and scrub to the exact timestamp before cutting.
            Verify start and end points visually.
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
        <VideoTrimmerLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
