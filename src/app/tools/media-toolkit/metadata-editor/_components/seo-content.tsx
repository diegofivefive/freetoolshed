import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ToolInsights } from "@/components/shared/tool-insights";

const TIPS = [
  "Embed cover art at 600×600 or higher — most music apps display covers at that resolution.",
  "Use consistent capitalization across an album (Artist, Album, Genre) — players sort and group on these fields exactly.",
  "Set the track number as 'N/Total' (e.g., 3/12) so players know the album length.",
  "Save originals as a backup before bulk-editing — the tool overwrites tags in place.",
];

const MISTAKES = [
  "Embedding huge cover art (5+ MB) — bloats every file unnecessarily. Resize first.",
  "Mixing tag versions (ID3v1 vs ID3v2.3 vs v2.4) across an album — some players read one and not the other.",
  "Editing metadata on a corrupted or DRM-protected file — the writeback fails silently in some cases.",
];

const TAKEAWAYS = [
  "ID3 and Vorbis-comment tagging across major audio formats, with embedded cover art support.",
  "Browser-only — files stay on your device, never uploaded.",
  "Tagging only — no audio re-encoding, no waveform editing.",
];

export const HOW_TO_STEPS = [
  { title: "1. Add a file", desc: "Drag and drop an audio or video file. MP3, M4A, OGG, FLAC, WAV, MP4, WebM, MKV, MOV, and AVI are supported." },
  { title: "2. Review", desc: "See file properties, streams, and all existing metadata tags." },
  { title: "3. Edit", desc: "Click 'Edit Tags' to modify values, add new tags, or remove existing ones." },
  { title: "4. Save or Strip", desc: "Click 'Save Tags' to write your changes, or 'Strip All Metadata' to remove everything." },
  { title: "5. Download", desc: "Download the modified file. The original audio/video data is preserved exactly (stream copy)." },
];

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Metadata Editor — View & Edit Media Tags Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Metadata Editor lets you view, edit, and strip metadata tags
        from audio and video files — directly in your browser. Edit MP3 ID3
        tags, M4A atoms, MKV properties, and more. No sign-up, no uploads,
        no re-encoding.
      </p>
      <p className="mt-3 text-muted-foreground">
        Resizing the cover art before embedding? The{" "}
        <Link href="/tools/media-toolkit/image-converter">
          free image converter
        </Link>{" "}
        handles batch resize and format conversion. Need to swap the audio
        format before re-tagging an album? Use the{" "}
        <Link href="/tools/media-toolkit/audio-converter">
          free audio converter
        </Link>{" "}
        first — it preserves the file structure metadata editors expect.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>View file properties</strong> — See format, duration,
          bitrate, and all stream details (audio, video, subtitle tracks) at
          a glance.
        </li>
        <li>
          <strong>Read metadata tags</strong> — Displays all embedded tags:
          title, artist, album, date, genre, track number, and any custom
          fields the file contains.
        </li>
        <li>
          <strong>Edit tags</strong> — Modify existing tags or add new ones.
          Quick-add buttons for common tags. Uses stream copy so the audio and
          video data are not re-encoded.
        </li>
        <li>
          <strong>Strip all metadata</strong> — One-click removal of all
          metadata tags. Useful for privacy before sharing files publicly.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Edit Media Metadata
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add a file</strong> — Drag and drop an audio or video
          file. MP3, M4A, OGG, FLAC, WAV, MP4, WebM, MKV, MOV, and AVI are
          supported.
        </li>
        <li>
          <strong>2. Review</strong> — See file properties, streams, and all
          existing metadata tags.
        </li>
        <li>
          <strong>3. Edit</strong> — Click &quot;Edit Tags&quot; to modify
          values, add new tags, or remove existing ones.
        </li>
        <li>
          <strong>4. Save or Strip</strong> — Click &quot;Save Tags&quot; to
          write your changes, or &quot;Strip All Metadata&quot; to remove
          everything.
        </li>
        <li>
          <strong>5. Download</strong> — Download the modified file. The
          original audio/video data is preserved exactly (stream copy).
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Metadata Editor vs. Mp3tag
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Feature</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Metadata Editor
              </th>
              <th className="py-2 pr-4 text-left font-semibold">Mp3tag</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Price</td>
              <td className="py-2 pr-4">Free (browser)</td>
              <td className="py-2 pr-4">Free / $24.99 (Mac)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Platform</td>
              <td className="py-2 pr-4">Any browser</td>
              <td className="py-2 pr-4">Windows / Mac</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Install required</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2 pr-4">Yes</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Video support</td>
              <td className="py-2 pr-4">Yes (MP4, MKV, etc.)</td>
              <td className="py-2 pr-4">Audio only</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Strip metadata</td>
              <td className="py-2 pr-4">Yes — one click</td>
              <td className="py-2 pr-4">Manual field clearing</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Batch editing</td>
              <td className="py-2 pr-4">One file at a time</td>
              <td className="py-2 pr-4">Yes — multi-file</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Album art</td>
              <td className="py-2 pr-4">Not yet</td>
              <td className="py-2 pr-4">Yes</td>
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
            Does editing tags re-encode the audio or video?
          </h3>
          <p className="mt-1">
            No. The editor uses ffmpeg&apos;s stream copy mode (
            <code>-c copy</code>), which modifies only the container metadata.
            The audio and video data are copied byte-for-byte without
            re-encoding, so quality is preserved exactly.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Why should I strip metadata?
          </h3>
          <p className="mt-1">
            Media files can contain personal information — recording software
            name, GPS coordinates (in some video formats), your name in the
            artist field, or encoding details. Stripping metadata before
            sharing publicly helps protect your privacy.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I add album art?
          </h3>
          <p className="mt-1">
            Not yet — album art embedding requires writing cover images into
            the container, which is a more complex operation. For now, the
            editor handles text-based metadata tags only.
          </p>
        </div>
      </div>
    </section>
  );
}
