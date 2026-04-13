import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { AudioTrimmerLoader } from "./_components/audio-trimmer-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Audio Trimmer",
  description:
    "Trim audio files to a specific time range or split them at multiple time markers. Stream copy for instant cuts.",
  slug: "media-toolkit/audio-trimmer",
  paidAlternative: "Adobe Audition",
};

export const metadata = generateToolMetadata(toolConfig);

export default function AudioTrimmerPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this audio trimmer free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No watermarks, no sign-up, no file limits. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "How is this different from the Audio Editor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Audio Editor is a full waveform-based editor with effects, undo/redo, and visual selection. The Audio Trimmer is for quick, precise cuts using time stamps — no waveform needed. It uses stream copy (no re-encoding) so cuts are instant.",
        },
      },
      {
        "@type": "Question",
        name: "Can I split an audio file into multiple parts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Switch to Split mode, add time markers where you want to cut, and the file will be split into multiple segments. Each segment downloads separately.",
        },
      },
      {
        "@type": "Question",
        name: "Does trimming re-encode the audio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The trimmer uses ffmpeg's stream copy mode (-c copy), which cuts without re-encoding. This means trimming is nearly instant and preserves the original audio quality exactly. The only caveat is that cuts may not be frame-accurate on some compressed formats.",
        },
      },
      {
        "@type": "Question",
        name: "What time formats can I enter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can enter time as seconds (90), minutes:seconds (1:30), or hours:minutes:seconds (1:02:30). Decimal seconds are also supported (90.5).",
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
          { label: "Audio Trimmer" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Audio Trimmer — Cut & Split Audio Files
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Trim audio to a time range or split into segments — a free alternative
        to Adobe Audition. No sign-up, no re-encoding.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Instant Cuts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uses stream copy — no re-encoding means near-instant trimming
            with zero quality loss. Cut a 2-hour audiobook in seconds.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Trim or Split</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Trim mode extracts a single segment. Split mode cuts at multiple
            time markers, producing separate files for each part.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Flexible Time Input</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter time as seconds (90), MM:SS (1:30), or HH:MM:SS (1:02:30).
            Decimal seconds supported for precise cuts.
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
        <AudioTrimmerLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
