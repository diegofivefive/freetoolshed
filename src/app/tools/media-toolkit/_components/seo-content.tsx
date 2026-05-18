import { Separator } from "@/components/ui/separator";
import { ToolInsights } from "@/components/shared/tool-insights";

const TIPS = [
  "Pick the dedicated sub-tool over an all-in-one mental model — each one is tuned for its specific job and runs faster than a general-purpose transcoder.",
  "Total input file size caps around 1–2 GB in most desktop browsers — split large jobs into batches when you hit the warning.",
  "Use Chrome, Edge, or Firefox for best ffmpeg.wasm performance. Safari support is partial and some tools won't work reliably.",
  "Keep the tab focused for long encodes — most browsers throttle CPU on background tabs.",
];

const MISTAKES = [
  "Loading a 4 GB video into video-compressor on a low-memory device — the tab will OOM-crash before processing starts.",
  "Switching tabs mid-encode and assuming full speed continues — background-tab throttling can multiply encode time several-fold.",
  "Treating ffmpeg.wasm as identical to native ffmpeg — WASM is slower and a few esoteric codecs are unavailable.",
];

const TAKEAWAYS = [
  "All processing is local via ffmpeg.wasm — your media never reaches a server.",
  "Dedicated single-purpose sub-tools instead of one all-in-one editor.",
  "Browser-bound by design — not a substitute for native ffmpeg on production batch jobs.",
];

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        What Is the Free Media Toolkit?
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Media Toolkit is a growing collection of browser-based tools
        for working with audio and video files. Every tool runs entirely in your
        browser using WebAssembly (ffmpeg.wasm) — your files never leave your
        device, there&apos;s nothing to install, and no account is required.
      </p>
      <p className="mt-3 text-muted-foreground">
        Whether you need to merge hundreds of audiobook chapters into a single
        M4A, convert between audio formats, compress a video before sharing, or
        trim a clip, the Media Toolkit has a dedicated sub-tool for the job.
        Each tool is individually optimized for its task, so you get a focused,
        fast experience instead of a bloated all-in-one editor.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Available Tools
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Audio Merger</strong> — Combine MP3, M4A, WAV, OGG, or FLAC
          files into a single output file with optional chapter markers. Ideal
          for audiobooks and podcast compilations.
        </li>
        <li>
          <strong>Audio Converter</strong> (coming soon) — Convert between audio
          formats with configurable quality. Single file or batch mode.
        </li>
        <li>
          <strong>Video Compressor</strong> (coming soon) — Reduce video file
          size with quality presets while maintaining visual clarity.
        </li>
        <li>
          <strong>Video Converter</strong> (coming soon) — Convert between MP4,
          WebM, MOV, AVI, and GIF formats.
        </li>
        <li>
          <strong>Audio Trimmer</strong> (coming soon) — Trim audio files or
          split them at precise time markers.
        </li>
        <li>
          <strong>Image Converter</strong> (coming soon) — Bulk convert images
          between PNG, JPG, WebP, and AVIF.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Why Use Browser-Based Media Tools?
      </h2>
      <div className="mt-4 text-muted-foreground">
        <ul className="space-y-2">
          <li>
            <strong>Privacy</strong> — Your files stay on your device. No
            uploads, no cloud processing, no data retention policies to worry
            about.
          </li>
          <li>
            <strong>No installation</strong> — Works on any modern browser
            including Chromebooks and locked-down work machines where you
            can&apos;t install software.
          </li>
          <li>
            <strong>No sign-up</strong> — Most online media tools require an
            account or limit free usage. Every tool here is completely free with
            no restrictions.
          </li>
          <li>
            <strong>No file size limits</strong> — The only limit is your
            browser&apos;s available memory (typically 1-2 GB on desktop).
          </li>
        </ul>
      </div>

      <div className="not-prose">
        <ToolInsights tips={TIPS} mistakes={MISTAKES} takeaways={TAKEAWAYS} />
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <div>
          <h3 className="font-semibold text-foreground">
            How does this work without uploading my files?
          </h3>
          <p className="mt-1">
            The Media Toolkit uses ffmpeg.wasm — a WebAssembly port of the
            industry-standard ffmpeg library. It runs entirely in your browser
            tab. Your files are read from disk into browser memory, processed
            by the WASM engine, and the output is downloaded directly to your
            device.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Is there a file size limit?
          </h3>
          <p className="mt-1">
            There&apos;s no artificial limit. The practical limit is your
            browser&apos;s available memory — typically 1-2 GB for the combined
            size of all input files. A warning appears if your files exceed 1 GB
            total.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Which browsers are supported?
          </h3>
          <p className="mt-1">
            Any modern Chromium-based browser (Chrome, Edge, Brave, Opera) and
            Firefox. Safari has limited WebAssembly support and may not work
            with all tools. Desktop browsers are recommended for the best
            performance.
          </p>
        </div>
      </div>
    </section>
  );
}
