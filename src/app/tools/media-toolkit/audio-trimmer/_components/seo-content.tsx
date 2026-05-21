import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ToolInsights } from "@/components/shared/tool-insights";

const TIPS = [
  "Use the time-display readout (not the visual handle) for frame-accurate trim points.",
  "When splitting at multiple markers, plan your filenames first — auto-generated names use the source name plus an index.",
  "Export to the same format as the source to avoid an unnecessary re-encode pass — much faster.",
  "Apply a short fade at trim boundaries if cutting mid-track — abrupt cuts produce audible clicks.",
];

const MISTAKES = [
  "Trusting the waveform display as exact at every zoom level — for sub-second precision, use numeric time entry.",
  "Trimming a lossless source down to MP3 just to 'save space' — you've now baked compression into the keeper.",
  "Closing the tab before clicking export — the trimmed audio lives only in memory until you save it.",
];

const TAKEAWAYS = [
  "Visual-waveform trim and split for any common audio format.",
  "All processing happens in your browser — source files stay on your device.",
  "Not a multi-track editor — single track in, single track or split-set out.",
];

export const HOW_TO_STEPS = [
  { title: "1. Add a file", desc: "Drag and drop an audio file into the upload area, or click to browse. MP3, M4A, WAV, OGG, FLAC, AAC, and WebM are supported." },
  { title: "2. Choose mode", desc: "Click Trim to extract a single segment, or Split to cut at multiple markers." },
  { title: "3. Enter times", desc: "For Trim mode, set the start and end time. For Split mode, add one or more time markers where you want to cut." },
  { title: "4. Process", desc: "Click the action button. Stream copy mode makes this nearly instant regardless of file length." },
  { title: "5. Download", desc: "Download your trimmed clip or all split segments." },
];

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Audio Trimmer — Cut & Split Audio Files Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Audio Trimmer lets you trim audio files to a specific time
        range or split them into multiple segments at custom time markers —
        all directly in your browser. No sign-up, no uploads, no file size
        limits. Powered by ffmpeg.wasm with stream copy mode for instant cuts
        and zero quality loss.
      </p>
      <p className="mt-3 text-muted-foreground">
        Stitching multiple trimmed clips back into one file? The{" "}
        <Link href="/tools/media-toolkit/audio-merger">
          free audio merger
        </Link>{" "}
        joins them in any order with optional chapter markers. Need to swap
        formats while you&apos;re at it? Use the{" "}
        <Link href="/tools/media-toolkit/audio-converter">
          free audio converter
        </Link>{" "}
        to batch-convert between MP3, M4A, WAV, OGG, and FLAC.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Instant stream copy</strong> — Uses ffmpeg&apos;s{" "}
          <code>-c copy</code> mode. No re-encoding means near-instant
          processing and zero quality loss, even for long files.
        </li>
        <li>
          <strong>Trim mode</strong> — Extract a single segment by entering a
          start and end time. Perfect for grabbing a clip from a podcast or
          cutting silence from a recording.
        </li>
        <li>
          <strong>Split mode</strong> — Add multiple time markers and split the
          file into separate segments. Great for breaking audiobooks into
          chapters or splitting a DJ mix into individual tracks.
        </li>
        <li>
          <strong>Flexible time input</strong> — Enter time as seconds (90),
          MM:SS (1:30), or HH:MM:SS (1:02:30). Decimal seconds supported for
          precision.
        </li>
        <li>
          <strong>Audio preview</strong> — Listen to the file before trimming to
          verify your time markers are correct.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Trim Audio
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add a file</strong> — Drag and drop an audio file into the
          upload area, or click to browse. MP3, M4A, WAV, OGG, FLAC, AAC, and
          WebM are supported.
        </li>
        <li>
          <strong>2. Choose mode</strong> — Click <em>Trim</em> to extract a
          single segment, or <em>Split</em> to cut at multiple markers.
        </li>
        <li>
          <strong>3. Enter times</strong> — For Trim mode, set the start and end
          time. For Split mode, add one or more time markers where you want to
          cut.
        </li>
        <li>
          <strong>4. Process</strong> — Click the action button. Stream copy mode
          makes this nearly instant regardless of file length.
        </li>
        <li>
          <strong>5. Download</strong> — Download your trimmed clip or all split
          segments.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Audio Trimmer vs. Audio Editor
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Feature</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Audio Trimmer
              </th>
              <th className="py-2 pr-4 text-left font-semibold">
                Audio Editor
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Purpose</td>
              <td className="py-2 pr-4">Quick, precise cuts by timestamp</td>
              <td className="py-2 pr-4">
                Full waveform editing with effects
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Speed</td>
              <td className="py-2 pr-4">
                Near-instant (stream copy, no re-encoding)
              </td>
              <td className="py-2 pr-4">
                Depends on file length (re-encodes)
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Split support</td>
              <td className="py-2 pr-4">
                Yes — multiple markers, separate files
              </td>
              <td className="py-2 pr-4">No — single track editing</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Effects</td>
              <td className="py-2 pr-4">None (cut only)</td>
              <td className="py-2 pr-4">
                Gain, fade, normalize, reverse, speed
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Waveform</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2 pr-4">Yes — visual selection</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Quality</td>
              <td className="py-2 pr-4">Lossless (exact copy)</td>
              <td className="py-2 pr-4">Re-encoded output</td>
            </tr>
          </tbody>
        </table>
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
            Why is trimming so fast?
          </h3>
          <p className="mt-1">
            The trimmer uses ffmpeg&apos;s stream copy mode (<code>-c copy</code>
            ), which copies the audio data without decoding or re-encoding it.
            This means a 2-hour audiobook can be trimmed in under a second. The
            only processing is reading/writing the container format.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Are the cuts frame-accurate?
          </h3>
          <p className="mt-1">
            Stream copy mode cuts at the nearest keyframe, which may be slightly
            before your requested timestamp (typically within a few
            milliseconds). For compressed formats like MP3, this is usually
            imperceptible. For frame-exact cuts, you would need re-encoding,
            which our Audio Editor supports.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I split an audiobook into chapters?
          </h3>
          <p className="mt-1">
            Yes. Switch to Split mode and enter the timestamp for each chapter
            break. The tool will produce one file per chapter, numbered
            sequentially (e.g. book-part001.mp3, book-part002.mp3, etc.). Use
            Download All to grab them all at once.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            What happens to metadata and tags?
          </h3>
          <p className="mt-1">
            Stream copy preserves most metadata from the original file (title,
            artist, album, etc.) in each output segment. However, chapter
            markers in the original file are not automatically adjusted for new
            segment boundaries.
          </p>
        </div>
      </div>
    </section>
  );
}
