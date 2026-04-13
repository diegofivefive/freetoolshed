import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Audio Extractor — Rip Audio from Video Files Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Audio Extractor lets you pull the audio track from any video
        file — directly in your browser. Convert to MP3, M4A, WAV, OGG, or
        FLAC, or use stream copy to keep the original codec with zero quality
        loss. No sign-up, no uploads, no file size limits.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Stream copy mode</strong> — &quot;Original&quot; mode copies
          the audio track without re-encoding. Near-instant extraction with
          zero quality loss.
        </li>
        <li>
          <strong>5 output formats</strong> — MP3, M4A (AAC), WAV, OGG
          (Vorbis), and FLAC. Lossy and lossless options for every use case.
        </li>
        <li>
          <strong>Bitrate control</strong> — Choose from 64 kbps to 320 kbps
          for lossy formats. Lossless formats preserve full audio quality
          automatically.
        </li>
        <li>
          <strong>Video preview</strong> — Watch the video before extracting
          to confirm you have the right file.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Extract Audio from a Video
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add a video</strong> — Drag and drop a video file into
          the upload area, or click to browse. MP4, WebM, MOV, AVI, and MKV
          are supported.
        </li>
        <li>
          <strong>2. Choose format</strong> — Select your desired audio
          format. Use &quot;Original&quot; for the fastest, lossless extraction.
        </li>
        <li>
          <strong>3. Set bitrate</strong> — For lossy formats (MP3, M4A,
          OGG), choose a bitrate. 128 kbps is standard; 320 kbps is maximum
          quality.
        </li>
        <li>
          <strong>4. Extract</strong> — Click &quot;Extract Audio&quot;. Stream
          copy is nearly instant; re-encoding takes longer depending on file
          length.
        </li>
        <li>
          <strong>5. Download</strong> — Download your extracted audio file.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Audio Extractor vs. Adobe Premiere Pro
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Feature</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Audio Extractor
              </th>
              <th className="py-2 pr-4 text-left font-semibold">
                Adobe Premiere Pro
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Price</td>
              <td className="py-2 pr-4">Free</td>
              <td className="py-2 pr-4">$22.99/mo</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Purpose</td>
              <td className="py-2 pr-4">Extract audio from video</td>
              <td className="py-2 pr-4">Full video editing suite</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Stream copy</td>
              <td className="py-2 pr-4">Yes — instant, lossless</td>
              <td className="py-2 pr-4">Requires export workflow</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Output formats</td>
              <td className="py-2 pr-4">MP3, M4A, WAV, OGG, FLAC</td>
              <td className="py-2 pr-4">Depends on export settings</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Privacy</td>
              <td className="py-2 pr-4">100% browser-based</td>
              <td className="py-2 pr-4">Desktop app</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Install required</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2 pr-4">Yes (large download)</td>
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
            When should I use &quot;Original&quot; vs. a specific format?
          </h3>
          <p className="mt-1">
            Use Original when you want the fastest extraction with no quality
            loss — the audio is copied byte-for-byte. Choose a specific format
            when you need compatibility (e.g. MP3 for older devices) or want
            to change the codec.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Why did stream copy fail and fall back to AAC?
          </h3>
          <p className="mt-1">
            Stream copy requires the original audio codec to be compatible
            with the output container. If the video uses an uncommon codec,
            the tool automatically falls back to AAC re-encoding to ensure
            you get a working output file.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I extract from very large video files?
          </h3>
          <p className="mt-1">
            Yes, but the entire file must be loaded into browser memory via
            WebAssembly. Files up to ~2 GB work well on most modern machines.
            The loading step may take a moment for large files.
          </p>
        </div>
      </div>
    </section>
  );
}
