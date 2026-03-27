import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { AudioEditorLoader } from "./_components/audio-editor-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Audio Editor",
  description:
    "Trim, cut, and convert audio files online — no install, no sign-up. Works on any device with a browser.",
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
        name: "Why use this instead of Audacity?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Audacity is more powerful for advanced work, but it requires a desktop install. This tool is for quick jobs — trim an MP3, cut a clip, convert a format — right in your browser. No download, works on any device, takes under a minute.",
        },
      },
      {
        "@type": "Question",
        name: "How do I trim an MP3 online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Drop your MP3 onto the editor, click and drag on the waveform to select the section you want, click Crop (or press T), then Download. Takes about 30 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert WAV to MP3 online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Import any WAV file, choose MP3 from the export dropdown, select your bitrate (128–320 kbps), and click Download. The conversion happens in your browser — nothing is uploaded.",
        },
      },
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
          text: "No. It runs entirely in your browser. No 100 MB download, no plugins, no extensions. Open the page and start editing.",
        },
      },
      {
        "@type": "Question",
        name: "What audio formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Import: MP3, WAV, OGG, AAC, FLAC, and WebM. Export: WAV (lossless), MP3, or OGG with configurable bitrate.",
        },
      },
      {
        "@type": "Question",
        name: "Is my audio data private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All processing happens locally in your browser using the Web Audio API. Your files are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support effects like fade in and fade out?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Apply fade in, fade out, normalize volume, reverse audio, amplify, and noise reduction — all processed locally in your browser.",
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
        Trim Audio Online — Free, No Install
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Need to trim an MP3, cut a WAV, or convert audio formats? Do it right
        here — no downloading Audacity, no Adobe subscription, no sign-up.
        Just drop your file and edit.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">No Install, Any Device</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Runs entirely in your browser. Works on Windows, Mac, Linux, and
            Chromebooks — no 100 MB download for a 30-second trim.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Trim, Cut & Export in Seconds</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop an MP3 or WAV, drag to select the part you want, hit trim,
            and download. Most edits take under a minute.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Convert MP3, WAV, OGG & More</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Import MP3, WAV, OGG, AAC, FLAC, or WebM. Export as WAV
            (lossless), MP3, or OGG with configurable bitrate.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Your Files Stay Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens locally using the Web Audio API. Nothing is
            uploaded — your audio never leaves your device.
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
