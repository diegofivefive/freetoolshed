import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Video Compressor — Reduce Video Size Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Video Compressor lets you reduce video file size directly in
        your browser using H.264 (libx264) encoding via WebAssembly. Choose a
        quality preset or fine-tune with custom CRF and resolution settings.
        Your video never leaves your device — no uploads, no sign-up, no file
        size limits.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Quality presets</strong> — Small File, Balanced, High
          Quality, or Custom. Each preset configures CRF and resolution for
          the best results.
        </li>
        <li>
          <strong>CRF control</strong> — Fine-tune the quality/size trade-off
          with a slider from 0 (lossless) to 51 (maximum compression).
        </li>
        <li>
          <strong>Resolution downscaling</strong> — Reduce from 4K to 1080p,
          720p, 480p, or 360p while maintaining aspect ratio.
        </li>
        <li>
          <strong>Audio passthrough</strong> — Copy the audio stream without
          re-encoding for faster processing, or re-encode to AAC 128k.
        </li>
        <li>
          <strong>MP4 output</strong> — H.264 + AAC with faststart flag for
          instant web playback. Compatible with every device and platform.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your video never leaves your device.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Compress a Video
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add a video</strong> — Drag and drop a video file or
          click to browse. Supports MP4, WebM, MOV, AVI, MKV.
        </li>
        <li>
          <strong>2. Choose a preset</strong> — Select Small File for maximum
          compression, Balanced for a good trade-off, or High Quality for
          minimal loss.
        </li>
        <li>
          <strong>3. Adjust settings</strong> — Optionally tweak CRF,
          resolution, and audio settings for precise control.
        </li>
        <li>
          <strong>4. Compress</strong> — Click Compress and wait. The progress
          bar shows real-time status. Video encoding is CPU-intensive and may
          take a few minutes.
        </li>
        <li>
          <strong>5. Download</strong> — When complete, see the before/after
          file size and click Download.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Video Compressor Comparison
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
                HandBrake
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
              <td className="py-2 pr-4">Free</td>
              <td className="py-2 pr-4">Free (limited) or $5-15/mo</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Installation</td>
              <td className="py-2 pr-4 text-brand">None (browser)</td>
              <td className="py-2 pr-4">Desktop app install</td>
              <td className="py-2 pr-4">None</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Privacy</td>
              <td className="py-2 pr-4 text-brand">
                Local processing only
              </td>
              <td className="py-2 pr-4">Local processing</td>
              <td className="py-2 pr-4">Files uploaded to server</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Speed</td>
              <td className="py-2 pr-4">Slower (single-thread WASM)</td>
              <td className="py-2 pr-4 text-brand">
                Fast (native, multi-thread)
              </td>
              <td className="py-2 pr-4">Varies (server-side)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">File size limit</td>
              <td className="py-2 pr-4 text-brand">
                ~500 MB-1 GB (browser RAM)
              </td>
              <td className="py-2 pr-4">No limit</td>
              <td className="py-2 pr-4">25-500 MB typically</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Sign-up required</td>
              <td className="py-2 pr-4 text-brand">No</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2 pr-4">Usually yes</td>
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
            When should I use this vs. HandBrake?
          </h3>
          <p className="mt-1">
            Use this tool for quick, one-off compressions when you don&apos;t
            want to install software — especially on Chromebooks or work
            machines. Use HandBrake for long videos, batch processing, or when
            you need maximum encoding speed.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            What CRF should I use?
          </h3>
          <p className="mt-1">
            CRF 18-20 is visually lossless for most content. CRF 23-26 is a
            good balance of quality and size. CRF 28-32 produces noticeably
            softer video but much smaller files — fine for low-motion content
            like presentations or screen recordings.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I compress a 4K video to 1080p?
          </h3>
          <p className="mt-1">
            Yes. Set the Max Resolution to 1080p and the video will be
            downscaled while maintaining aspect ratio. Combined with CRF
            compression, this can reduce a 4K video to 10-20% of its
            original size.
          </p>
        </div>
      </div>
    </section>
  );
}
