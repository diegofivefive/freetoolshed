import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Audio Merger — Combine Audio Files Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Audio Merger lets you combine multiple audio files into a
        single file directly in your browser. Whether you have 5 podcast
        episodes or 300 audiobook chapters, drag them in, arrange the order,
        pick your output format, and hit merge. No sign-up, no uploads, no
        file count limits.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Unlimited file count</strong> — Tested with 300+ files.
          The only limit is your browser&apos;s available memory.
        </li>
        <li>
          <strong>Drag-to-reorder</strong> — Arrange files in any order by
          dragging, or use Natural Sort to auto-order by filename with proper
          numeric sorting.
        </li>
        <li>
          <strong>Chapter markers</strong> — Each input file becomes a chapter
          in the output M4A, with the filename as the chapter title.
        </li>
        <li>
          <strong>Multiple output formats</strong> — Export as M4A (AAC), MP3,
          or OGG with bitrate from 64 to 320 kbps.
        </li>
        <li>
          <strong>Mix input formats</strong> — Combine MP3, M4A, WAV, OGG,
          FLAC, AAC, and WebM files in the same merge. They&apos;re all decoded
          and re-encoded to your chosen output format.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Merge Audio Files
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add files</strong> — Drag and drop audio files into the
          upload area, or click to browse. You can add files in multiple
          batches.
        </li>
        <li>
          <strong>2. Arrange order</strong> — Drag files in the queue to
          reorder, or click Natural Sort to automatically sort by filename.
        </li>
        <li>
          <strong>3. Choose output settings</strong> — Select your output
          format (M4A, MP3, or OGG), bitrate, and whether to include chapter
          markers.
        </li>
        <li>
          <strong>4. Merge</strong> — Click Merge and wait for processing.
          The progress bar shows the current status.
        </li>
        <li>
          <strong>5. Download</strong> — When complete, click Download to save
          the merged file to your device.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Audio Merger Comparison
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Feature</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Free Tool Shed
              </th>
              <th className="py-2 pr-4 text-left font-semibold">
                Adobe Audition
              </th>
              <th className="py-2 pr-4 text-left font-semibold">
                Online Tools
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Price</td>
              <td className="py-2 pr-4 text-brand">Free</td>
              <td className="py-2 pr-4">$22.99/mo</td>
              <td className="py-2 pr-4">Free (limited) or $5-15/mo</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Sign-up required</td>
              <td className="py-2 pr-4 text-brand">No</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2 pr-4">Usually yes</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">File count limit</td>
              <td className="py-2 pr-4 text-brand">No limit</td>
              <td className="py-2 pr-4">No limit</td>
              <td className="py-2 pr-4">10-20 files typically</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">File upload</td>
              <td className="py-2 pr-4 text-brand">None (local processing)</td>
              <td className="py-2 pr-4">None (desktop app)</td>
              <td className="py-2 pr-4">Files uploaded to server</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Chapter markers</td>
              <td className="py-2 pr-4 text-brand">Yes (M4A)</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2 pr-4">Rarely</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Installation</td>
              <td className="py-2 pr-4 text-brand">None</td>
              <td className="py-2 pr-4">Desktop app install</td>
              <td className="py-2 pr-4">None</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <div>
          <h3 className="font-semibold text-foreground">
            Can I merge different audio formats together?
          </h3>
          <p className="mt-1">
            Yes. You can mix MP3, M4A, WAV, OGG, FLAC, AAC, and WebM files in
            the same merge. Each file is decoded and then re-encoded to your
            chosen output format, so format differences don&apos;t matter.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            How long does merging take?
          </h3>
          <p className="mt-1">
            It depends on the total duration and your chosen bitrate. The first
            merge takes longer because ffmpeg.wasm (~30 MB) needs to download.
            After that, merging a typical audiobook (10-20 hours) takes 2-5
            minutes on a modern desktop. The progress bar shows real-time
            status.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            What&apos;s Natural Sort?
          </h3>
          <p className="mt-1">
            Natural Sort orders files the way humans expect: Chapter 1, Chapter
            2, Chapter 10 — not Chapter 1, Chapter 10, Chapter 2. It uses your
            system&apos;s locale-aware numeric collation for correct ordering of
            numbered filenames.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Do chapter markers work in all players?
          </h3>
          <p className="mt-1">
            Chapter markers are embedded in M4A files using the standard
            ffmetadata format. They work in Apple Books, VLC, iTunes, foobar2000,
            and most audiobook players. MP3 and OGG outputs do not support
            chapter markers.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I use this on my phone?
          </h3>
          <p className="mt-1">
            Technically yes, but the tool is optimized for desktop browsers.
            Mobile browsers have tighter memory limits and smaller screens, which
            makes managing hundreds of files impractical. For best results, use a
            desktop or laptop.
          </p>
        </div>
      </div>
    </section>
  );
}
