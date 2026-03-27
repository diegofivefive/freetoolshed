import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { AudioEditorLoader } from "./_components/audio-editor-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Audio Editor",
  description:
    "Edit, trim, merge, and convert audio files with a visual waveform editor. Supports MP3, WAV, OGG, and more.",
  slug: "audio-editor",
  paidAlternative: "Adobe Audition",
};

export const metadata = generateToolMetadata(toolConfig);

export default function AudioEditorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this audio editor really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to install anything?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. This audio editor runs entirely in your browser. No downloads, plugins, or sign-ups needed — unlike Audacity which requires a desktop install.",
        },
      },
      {
        "@type": "Question",
        name: "Is my audio data private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All audio processing happens locally in your browser using the Web Audio API. Your files are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "What audio formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can import MP3, WAV, OGG, AAC, FLAC, and WebM audio files. Export is available in WAV, MP3, and OGG formats.",
        },
      },
      {
        "@type": "Question",
        name: "Can I trim and cut audio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Select any region on the waveform to trim, cut, or delete it. You can also split audio at the playhead position.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support effects like fade in and fade out?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Apply fade in, fade out, normalize volume, reverse audio, and basic noise reduction — all processed in real time in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "Can I merge multiple audio files?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Import multiple audio files and merge them sequentially. You can reorder tracks before combining them into a single file.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a good alternative to Audacity or Adobe Audition?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For basic to intermediate editing tasks like trimming, cutting, merging, and applying effects, yes. It runs in the browser with no install required. Adobe Audition costs $22.99/month and Audacity requires a desktop download.",
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
        Free Audio Editor
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Edit, trim, merge, and convert audio files with a visual waveform
        editor — a free alternative to Adobe Audition and Audacity. No
        sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Visual Waveform Editor</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See your audio as a detailed waveform. Click and drag to select
            regions for trimming, cutting, or applying effects with precision.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Trim, Cut & Merge</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Remove unwanted sections, split audio at any point, or combine
            multiple files into one. All edits are non-destructive with full
            undo/redo support.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Built-in Audio Effects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply fade in, fade out, normalize volume, reverse audio, and
            noise reduction — all processed instantly in your browser.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Multi-Format Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Import MP3, WAV, OGG, AAC, FLAC, and WebM. Export as WAV, MP3, or
            OGG. All conversion happens client-side — your files stay private.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <AudioEditorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
