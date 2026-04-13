import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { AudioMergerLoader } from "./_components/audio-merger-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Audio Merger",
  description:
    "Combine multiple MP3, M4A, WAV, OGG, or FLAC files into a single audio file with chapter markers. Perfect for audiobooks.",
  slug: "media-toolkit/audio-merger",
  paidAlternative: "Adobe Audition",
};

export const metadata = generateToolMetadata(toolConfig);

export default function AudioMergerPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this audio merger really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, no watermarks, and no sign-up required. The tool is ad-supported, which is how it stays free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "How many files can I merge at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "There's no hard file count limit. We've tested with 300+ audiobook chapters successfully. The practical limit is your browser's available memory — for most desktop browsers, that's around 1-2 GB of total input file size.",
        },
      },
      {
        "@type": "Question",
        name: "Can I combine MP3 files into a single M4A?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can combine files of any supported format (MP3, M4A, WAV, OGG, FLAC, AAC, WebM) and output to M4A (AAC), MP3, or OGG. The audio is decoded and re-encoded to your chosen format using ffmpeg running locally in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "Does it add chapter markers for audiobooks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enable the Chapter Markers toggle and each input file becomes a chapter in the output M4A. Chapter titles are derived from filenames. This makes it easy to navigate between chapters in your audiobook player.",
        },
      },
      {
        "@type": "Question",
        name: "Do my files get uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side using WebAssembly (ffmpeg.wasm). Your files never leave your device. The processing happens entirely in your browser tab — close the tab and the data is gone.",
        },
      },
      {
        "@type": "Question",
        name: "Why is the first merge slow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The first merge lazy-loads ffmpeg.wasm — about 30 MB of WebAssembly code served from a CDN and cached by your browser. Subsequent merges skip the download and start immediately.",
        },
      },
      {
        "@type": "Question",
        name: "Can I reorder the files before merging?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Drag and drop files in the queue to reorder them, or use the Natural Sort button to automatically sort by filename with proper numeric ordering (Chapter 1, Chapter 2, ... Chapter 10, not Chapter 1, Chapter 10, Chapter 2).",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between this and the Audio Editor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Audio Editor is a single-track DAW for editing one audio file (trim, effects, waveform editing). The Audio Merger is built for batch operations — combining hundreds of files into one with drag-to-reorder and chapter markers. Use the editor for precision work, the merger for bulk operations.",
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
          { label: "Audio Merger" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Audio Merger — Combine MP3s Into One File
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Merge hundreds of audio files into a single M4A, MP3, or OGG — a free
        alternative to Adobe Audition. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Merge 300+ Files</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag and drop hundreds of audiobook chapters, podcast episodes, or
            music tracks. Reorder by dragging or auto-sort by filename.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Chapter Markers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each input file becomes a chapter in the output M4A. Navigate your
            audiobook by chapter in any player that supports M4A chapters.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Multiple Output Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Export as M4A (AAC), MP3, or OGG with configurable bitrate from
            64 kbps to 320 kbps. Mix and match input formats freely.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens in your browser using WebAssembly. Your
            files never leave your device — no uploads, no servers, no accounts.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <AudioMergerLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
