import { Separator } from "@/components/ui/separator";
import { ToolInsights } from "@/components/shared/tool-insights";

const TIPS = [
  "MKV typically embeds multiple subtitle tracks — pick by language code (en, fr, ja) after extraction.",
  "SRT is the most compatible format for downstream video players; VTT is the web-native choice.",
  "If a video has burned-in subtitles (rendered into the picture), extraction won't find them — those need OCR, not extraction.",
  "ASS format preserves styling (font, position, color) — use it when the original styling matters.",
];

const MISTAKES = [
  "Looking for subtitles in a video that doesn't have a separate subtitle track — the burned-in case isn't extractable.",
  "Forgetting to specify the language when the video has multiple tracks — you'll get the first one by default.",
  "Treating extracted SRT timing as perfect — some sources have slight drift that needs manual sync correction.",
];

const TAKEAWAYS = [
  "Pulls all embedded subtitle tracks (multi-language supported) into common subtitle formats.",
  "Runs locally via ffmpeg.wasm — your video never leaves the browser.",
  "Embedded subtitles only — burned-in subtitles require OCR, not extraction.",
];

export const HOW_TO_STEPS = [
  { title: "1. Add a video", desc: "Drag and drop a video file into the upload area, or click to browse. MKV, MP4, WebM, MOV, and AVI are supported." },
  { title: "2. Choose format", desc: "Select your desired subtitle format: SRT, ASS, or VTT." },
  { title: "3. Scan", desc: "Click 'Scan for Subtitles' to probe the video for embedded subtitle tracks." },
  { title: "4. Extract", desc: "Click 'Extract' on a specific track, or 'Extract All' to get every track at once." },
  { title: "5. Download", desc: "Download your subtitle file(s)." },
];

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Subtitle Extractor — Pull Subtitles from Video Files Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Subtitle Extractor lets you pull embedded subtitle tracks
        from any video file — directly in your browser. Export to SRT, ASS,
        or WebVTT format. Supports multiple tracks and languages. No sign-up,
        no uploads, no file size limits.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Auto-detect subtitle tracks</strong> — Probes the video
          container and lists all embedded subtitle streams with language
          codes and codec information.
        </li>
        <li>
          <strong>3 output formats</strong> — SRT (SubRip) for maximum
          compatibility, ASS (Advanced SubStation Alpha) for styled subtitles,
          and VTT (WebVTT) for HTML5 video players.
        </li>
        <li>
          <strong>Single or batch extract</strong> — Extract one specific
          track or all tracks at once. Each track downloads as a separate
          file tagged with its stream index and language code.
        </li>
        <li>
          <strong>Language detection</strong> — Displays language codes
          (eng, spa, jpn, etc.) from the video metadata so you can identify
          which track to extract.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Extract Subtitles
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add a video</strong> — Drag and drop a video file into
          the upload area, or click to browse. MKV, MP4, WebM, MOV, and AVI
          are supported.
        </li>
        <li>
          <strong>2. Choose format</strong> — Select your desired subtitle
          format: SRT, ASS, or VTT.
        </li>
        <li>
          <strong>3. Scan</strong> — Click &quot;Scan for Subtitles&quot; to
          probe the video for embedded subtitle tracks.
        </li>
        <li>
          <strong>4. Extract</strong> — Click &quot;Extract&quot; on a
          specific track, or &quot;Extract All&quot; to get every track at
          once.
        </li>
        <li>
          <strong>5. Download</strong> — Download your subtitle file(s).
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Subtitle Extractor vs. HandBrake
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Feature</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Subtitle Extractor
              </th>
              <th className="py-2 pr-4 text-left font-semibold">HandBrake</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Price</td>
              <td className="py-2 pr-4">Free (browser)</td>
              <td className="py-2 pr-4">Free (desktop app)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Purpose</td>
              <td className="py-2 pr-4">Extract subtitle tracks only</td>
              <td className="py-2 pr-4">Full video transcoder</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Install required</td>
              <td className="py-2 pr-4">No — runs in browser</td>
              <td className="py-2 pr-4">Yes (desktop download)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Batch extract</td>
              <td className="py-2 pr-4">Yes — all tracks at once</td>
              <td className="py-2 pr-4">One at a time via export</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Output formats</td>
              <td className="py-2 pr-4">SRT, ASS, VTT</td>
              <td className="py-2 pr-4">SRT (passthrough)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Privacy</td>
              <td className="py-2 pr-4">100% browser-based</td>
              <td className="py-2 pr-4">Desktop app (local)</td>
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
            Why were no subtitles found?
          </h3>
          <p className="mt-1">
            Not all videos have embedded subtitle tracks. Many MP4 files from
            streaming services use burned-in (hardcoded) subtitles that are
            rendered directly into the video frames — these cannot be
            extracted. MKV files from media libraries are the most common
            source for extractable embedded subtitles.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            What&apos;s the difference between SRT, ASS, and VTT?
          </h3>
          <p className="mt-1">
            <strong>SRT</strong> is the simplest and most widely compatible
            format — plain text with timestamps. <strong>ASS</strong> supports
            rich styling, fonts, colors, and positioning. <strong>VTT</strong>{" "}
            is the web standard used by HTML5{" "}
            <code>&lt;track&gt;</code> elements. For most use cases, SRT is
            the safest choice.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I extract subtitles from a DVD or Blu-ray?
          </h3>
          <p className="mt-1">
            DVD subtitles (VOBsub) and Blu-ray subtitles (PGS) are
            image-based, not text-based. While ffmpeg can extract them, the
            result is a series of bitmap images, not editable text. This tool
            works best with text-based subtitle formats like SRT, ASS, and
            MOV text tracks.
          </p>
        </div>
      </div>
    </section>
  );
}
