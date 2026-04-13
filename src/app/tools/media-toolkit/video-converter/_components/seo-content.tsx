import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Video Converter — Change Video Formats Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Video Converter lets you convert videos between MP4, WebM,
        AVI, and GIF directly in your browser. Whether you need to convert a
        MOV from your iPhone to MP4, create a GIF from a video clip, or batch
        convert files for web compatibility, drop your files in and download
        the results. No sign-up, no uploads, no file size limits.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>4 output formats</strong> — MP4 (H.264), WebM (VP8), AVI
          (MPEG-4), and GIF cover web, mobile, legacy, and social media needs.
        </li>
        <li>
          <strong>Video to GIF</strong> — Two-pass GIF conversion with
          per-frame palette optimization. Capped at 12 fps and 720p for
          reasonable file sizes.
        </li>
        <li>
          <strong>Batch conversion</strong> — Add multiple files and convert
          them all to the same format sequentially.
        </li>
        <li>
          <strong>Optimal codecs</strong> — Each format uses its best codec
          automatically: H.264 for MP4, VP8 for WebM, MPEG-4 for AVI.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your videos never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Convert Video Files
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add videos</strong> — Drag and drop video files into the
          upload area, or click to browse. Supports MP4, WebM, MOV, AVI, MKV.
        </li>
        <li>
          <strong>2. Choose format</strong> — Select your target format: MP4,
          WebM, AVI, or GIF.
        </li>
        <li>
          <strong>3. Convert</strong> — Click Convert and wait for processing.
          Each file shows its own progress bar.
        </li>
        <li>
          <strong>4. Download</strong> — Click the download icon next to each
          file, or use Download All to grab everything.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Video Format Comparison
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Format</th>
              <th className="py-2 pr-4 text-left font-semibold">Codec</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Best For
              </th>
              <th className="py-2 pr-4 text-left font-semibold">
                Compatibility
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">MP4</td>
              <td className="py-2 pr-4">H.264 + AAC</td>
              <td className="py-2 pr-4">
                Universal sharing, social media, web
              </td>
              <td className="py-2 pr-4 text-brand">
                Plays everywhere
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">WebM</td>
              <td className="py-2 pr-4">VP8 + Vorbis</td>
              <td className="py-2 pr-4">
                Web embedding, open-source projects
              </td>
              <td className="py-2 pr-4">
                Chrome, Firefox, Edge
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">AVI</td>
              <td className="py-2 pr-4">MPEG-4 + MP3</td>
              <td className="py-2 pr-4">
                Legacy systems, older software
              </td>
              <td className="py-2 pr-4">
                Windows, legacy players
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">GIF</td>
              <td className="py-2 pr-4">Palette-indexed</td>
              <td className="py-2 pr-4">
                Short clips, memes, social media
              </td>
              <td className="py-2 pr-4 text-brand">
                Universal (image format)
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
            Which format should I use for sharing?
          </h3>
          <p className="mt-1">
            MP4 (H.264) is the safest choice. It plays on every device,
            browser, and social media platform. WebM is a good alternative
            for web-only use. GIF is best for short animated clips.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            How do I convert a MOV file from my iPhone?
          </h3>
          <p className="mt-1">
            Drop the .mov file into the converter and select MP4 as the
            output format. The video will be re-encoded to H.264 + AAC,
            which plays on all devices and platforms.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Why are GIF files so large?
          </h3>
          <p className="mt-1">
            GIF is an old format that doesn&apos;t compress efficiently.
            A 10-second video clip can produce a 20+ MB GIF. Keep GIFs short
            (under 10 seconds) and at lower resolution for reasonable sizes.
            For longer animations, consider WebM or MP4 instead.
          </p>
        </div>
      </div>
    </section>
  );
}
