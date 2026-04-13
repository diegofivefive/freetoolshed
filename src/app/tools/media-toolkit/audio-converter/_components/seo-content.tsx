import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Audio Converter — Change Audio Formats Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Audio Converter lets you convert audio files between MP3, M4A
        (AAC), WAV, OGG (Vorbis), and FLAC directly in your browser. Whether
        you need to convert a single podcast episode or batch-convert an entire
        music library, drop your files in and download the results. No sign-up,
        no uploads, no file size limits.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>5 output formats</strong> — MP3, M4A (AAC), WAV, OGG
          (Vorbis), and FLAC cover lossy and lossless needs.
        </li>
        <li>
          <strong>Configurable bitrate</strong> — Choose from 64 to 320 kbps
          for lossy formats. Lossless formats preserve original quality.
        </li>
        <li>
          <strong>Batch conversion</strong> — Add multiple files and convert
          them all at once. Each file gets its own progress bar and download.
        </li>
        <li>
          <strong>Mix input formats</strong> — Convert from any format your
          browser can decode, including MP3, M4A, WAV, OGG, FLAC, AAC, and
          WebM.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Convert Audio Files
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add files</strong> — Drag and drop audio files into the
          upload area, or click to browse. You can add files in multiple
          batches.
        </li>
        <li>
          <strong>2. Choose format</strong> — Select your target format from
          the dropdown: MP3, M4A, WAV, OGG, or FLAC.
        </li>
        <li>
          <strong>3. Set bitrate</strong> — For lossy formats, choose a bitrate
          (64-320 kbps). Lossless formats ignore this setting.
        </li>
        <li>
          <strong>4. Convert</strong> — Click Convert and wait for processing.
          Each file shows its own progress bar.
        </li>
        <li>
          <strong>5. Download</strong> — Click the download icon next to each
          file, or use Download All to grab everything at once.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Audio Format Comparison
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Format</th>
              <th className="py-2 pr-4 text-left font-semibold">Type</th>
              <th className="py-2 pr-4 text-left font-semibold">
                File Size
              </th>
              <th className="py-2 pr-4 text-left font-semibold">
                Best For
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">MP3</td>
              <td className="py-2 pr-4">Lossy</td>
              <td className="py-2 pr-4">Small</td>
              <td className="py-2 pr-4">Universal playback, sharing</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">M4A (AAC)</td>
              <td className="py-2 pr-4">Lossy</td>
              <td className="py-2 pr-4">Small</td>
              <td className="py-2 pr-4">
                Apple devices, audiobooks, better quality than MP3 at same
                bitrate
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">OGG (Vorbis)</td>
              <td className="py-2 pr-4">Lossy</td>
              <td className="py-2 pr-4">Small</td>
              <td className="py-2 pr-4">
                Open-source players, gaming, streaming
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">FLAC</td>
              <td className="py-2 pr-4">Lossless</td>
              <td className="py-2 pr-4">Medium</td>
              <td className="py-2 pr-4">
                Archiving, audiophile playback, editing source files
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">WAV</td>
              <td className="py-2 pr-4">Lossless</td>
              <td className="py-2 pr-4">Large</td>
              <td className="py-2 pr-4">
                Professional audio editing, maximum compatibility
              </td>
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
            Will converting to a higher bitrate improve quality?
          </h3>
          <p className="mt-1">
            No. Converting a 128 kbps MP3 to 320 kbps MP3 won&apos;t recover
            lost audio data — it just makes the file larger. To get higher
            quality, you need to convert from a lossless source (WAV or FLAC).
            Converting from lossy to lossy is fine for format compatibility,
            but each lossy re-encode loses a small amount of quality.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Should I use FLAC or WAV for archiving?
          </h3>
          <p className="mt-1">
            FLAC is generally the better choice. It&apos;s lossless (identical
            quality to WAV) but compressed to about 50-60% of the size. WAV is
            uncompressed and universally supported, so use it when you need
            maximum compatibility with audio editing software.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            What&apos;s the best format for sharing music?
          </h3>
          <p className="mt-1">
            MP3 at 192-320 kbps is still the most universally compatible
            format. M4A (AAC) provides slightly better quality at the same
            bitrate and is the default on Apple devices. OGG is great for
            open-source platforms and gaming.
          </p>
        </div>
      </div>
    </section>
  );
}
