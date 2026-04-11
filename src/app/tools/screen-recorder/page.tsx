import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { ScreenRecorderLoader } from "./_components/screen-recorder-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Screen Recorder",
  description:
    "Record your screen, window, or tab with webcam overlay and microphone — right in your browser.",
  slug: "screen-recorder",
  paidAlternative: "Loom",
};

export const metadata = generateToolMetadata(toolConfig);

export default function ScreenRecorderPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this screen recorder really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No hidden fees, no premium tiers, no watermarks, and no sign-up required. The tool is ad-supported, which is how it stays free for everyone. Ads only appear outside the recording workspace itself.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to install anything?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The entire recorder runs inside your browser using the MediaRecorder API, Web Audio API, and canvas compositing. There's nothing to download and nothing to uninstall. It works on any modern Chromium-based browser (Chrome, Edge, Brave, Opera) and Firefox.",
        },
      },
      {
        "@type": "Question",
        name: "How long can I record?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Up to 2 hours per clip. The cap exists so the in-memory video buffer doesn't exhaust your browser's heap. For most use cases (tutorials, bug reports, walkthroughs) that's plenty of headroom. If you need multi-hour recordings, a desktop app is still the right tool.",
        },
      },
      {
        "@type": "Question",
        name: "Does it record system audio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, on Chrome-based browsers you can capture tab audio or entire desktop audio. In the browser's share dialog, check 'Share tab audio' or 'Share system audio'. Firefox has more limited system audio support — microphone capture works everywhere.",
        },
      },
      {
        "@type": "Question",
        name: "Can I record with my webcam in the corner like Loom?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enable the Webcam Overlay in Setup, pick a corner, choose Small/Medium/Large, and switch between a circle or square bubble. The overlay is composited into the recording via a canvas, so it's baked into the final video — it'll look exactly the same when you download it.",
        },
      },
      {
        "@type": "Question",
        name: "Can I pause and resume a recording?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Click Pause to freeze the recording — the elapsed timer stops too, and resuming picks up exactly where you left off. Most browser-based recorders don't let you pause at all.",
        },
      },
      {
        "@type": "Question",
        name: "How do I trim the start or end of my recording?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "After you stop recording, drag the two green handles on the timeline. The left handle sets the new start, the right sets the new end. Use arrow keys for 0.1s nudges, Shift+arrow for 1-second steps, and Home/End to snap to a boundary. Trimming is non-destructive — hit Reset trim to restore the full range.",
        },
      },
      {
        "@type": "Question",
        name: "What export formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WebM (instant, no transcode — your browser already recorded in this format), MP4 (H.264/AAC for universal compatibility with Quicktime, Premiere, YouTube, and social platforms), and GIF (palette-optimised, capped at 12 fps and 720p width for sane file sizes). MP4 and GIF use ffmpeg.wasm locally — no upload, no server.",
        },
      },
      {
        "@type": "Question",
        name: "Why is MP4 export slow the first time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MP4 and GIF exports lazy-load ffmpeg.wasm on first use — that's about 30 MB of WebAssembly code served from a CDN and cached by your browser. Subsequent exports skip the download. WebM exports always skip ffmpeg entirely when the trim covers the full recording.",
        },
      },
      {
        "@type": "Question",
        name: "Does my recording get uploaded anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side. The recording lives in your browser tab's memory (as a Blob), gets trimmed in-place, and downloads directly to your device. There are no servers, no cloud storage, and no analytics on the video content. Close the tab and the recording is gone.",
        },
      },
      {
        "@type": "Question",
        name: "Why would I use this instead of Loom?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Loom's free plan caps you at 5 minutes per video and 25 videos total, requires an account, and uploads your video to their servers. This tool has no time cap (beyond a 2-hour safety limit), no account, and no uploads. If you need Loom's sharing and commenting features, keep using Loom. If you just need to record and download, this is faster.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this on a Chromebook or a work laptop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Because it runs entirely in the browser, it works on Chromebooks, locked-down work machines, and anywhere a desktop install isn't possible. As long as your browser supports getDisplayMedia (Chrome 72+, Edge 79+, Firefox 66+), you're good.",
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
        Free Screen Recorder — No Install, No Sign Up
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Record your screen, window, or tab with webcam overlay and microphone —
        a free alternative to Loom. Everything runs in your browser.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">No Time Limits</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Loom&apos;s free plan caps you at 5 minutes per video. Here there
            are no caps, no watermarks, and no upload queue — record as long
            as your browser has memory.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Webcam Picture-in-Picture</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop your webcam into any corner as a circle or square bubble.
            The overlay is baked into the final video, ready to share.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Trim & Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Trim the start or end with draggable handles, then download as
            WebM (instant) or convert to MP4 / GIF in-browser. No uploads.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Your Video Stays Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The recording is held in your browser tab&apos;s memory and never
            uploaded. Close the tab to wipe it — no servers, no accounts.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ScreenRecorderLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
