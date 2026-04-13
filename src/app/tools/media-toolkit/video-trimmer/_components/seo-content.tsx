import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <section className="prose prose-sm dark:prose-invert max-w-none">
      <Separator className="my-8" />

      <h2 className="text-2xl font-semibold tracking-tight">
        Free Video Trimmer — Cut & Split Video Files Online
      </h2>
      <p className="mt-4 text-muted-foreground">
        The Free Video Trimmer lets you cut video files to a specific time
        range or split them into multiple segments at custom time markers —
        all directly in your browser. No sign-up, no uploads, no watermarks,
        no file size limits. Powered by ffmpeg.wasm with stream copy mode for
        near-instant cuts and zero quality loss.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Features
      </h2>
      <ul className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>Instant stream copy</strong> — Uses ffmpeg&apos;s{" "}
          <code>-c copy</code> mode. No re-encoding means near-instant
          processing and zero quality loss, even for large video files.
        </li>
        <li>
          <strong>Trim mode</strong> — Extract a single clip by entering a
          start and end time. Perfect for pulling highlights from gameplay,
          cutting intros from recordings, or grabbing a scene from a movie.
        </li>
        <li>
          <strong>Split mode</strong> — Add multiple time markers and split
          the video into separate segments. Great for breaking a long
          recording into chapters or extracting multiple clips at once.
        </li>
        <li>
          <strong>Video preview</strong> — Watch and scrub through your video
          before cutting. Verify your timestamps visually to get precise
          results.
        </li>
        <li>
          <strong>Flexible time input</strong> — Enter time as seconds (90),
          MM:SS (1:30), or HH:MM:SS (1:02:30). Decimal seconds supported for
          precision.
        </li>
        <li>
          <strong>100% client-side</strong> — Uses ffmpeg.wasm (WebAssembly).
          Your files never leave your device. No server uploads, no privacy
          concerns.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How to Trim a Video
      </h2>
      <ol className="mt-4 space-y-2 text-muted-foreground">
        <li>
          <strong>1. Add a file</strong> — Drag and drop a video file into the
          upload area, or click to browse. MP4, WebM, MOV, AVI, and MKV are
          supported.
        </li>
        <li>
          <strong>2. Preview</strong> — Use the built-in player to scrub to the
          exact timestamps you want to cut.
        </li>
        <li>
          <strong>3. Choose mode</strong> — Click <em>Trim</em> to extract a
          single clip, or <em>Split</em> to cut at multiple markers.
        </li>
        <li>
          <strong>4. Enter times</strong> — For Trim mode, set the start and end
          time. For Split mode, add one or more time markers where you want to
          cut.
        </li>
        <li>
          <strong>5. Process & Download</strong> — Click the action button.
          Stream copy mode makes this fast regardless of file length. Download
          your clip(s) when done.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Video Trimmer vs. Video Editor
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Feature</th>
              <th className="py-2 pr-4 text-left font-semibold">
                Video Trimmer
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
              <td className="py-2 pr-4">Quick cuts by timestamp</td>
              <td className="py-2 pr-4">Full video editing suite</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Speed</td>
              <td className="py-2 pr-4">
                Near-instant (stream copy, no re-encoding)
              </td>
              <td className="py-2 pr-4">
                Depends on export settings and hardware
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Split support</td>
              <td className="py-2 pr-4">
                Yes — multiple markers, separate files
              </td>
              <td className="py-2 pr-4">Yes — timeline-based</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Quality</td>
              <td className="py-2 pr-4">Lossless (exact copy)</td>
              <td className="py-2 pr-4">Re-encoded on export</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-medium">Privacy</td>
              <td className="py-2 pr-4">100% browser-based, no uploads</td>
              <td className="py-2 pr-4">Desktop app, Creative Cloud sync</td>
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
            Why is trimming so fast?
          </h3>
          <p className="mt-1">
            The trimmer uses ffmpeg&apos;s stream copy mode (<code>-c copy</code>
            ), which copies the video and audio data without decoding or
            re-encoding. The only work is reading the container, copying the
            relevant packets, and writing a new container. This makes it
            orders of magnitude faster than re-encoding.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Are the cuts frame-exact?
          </h3>
          <p className="mt-1">
            Stream copy mode cuts at the nearest keyframe (I-frame). For most
            videos encoded with keyframes every 1–2 seconds, the cut point
            will be within a second of your requested time. If you need
            frame-exact cuts, you would need to re-encode the video, which
            our Video Converter can help with.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Can I trim very large video files?
          </h3>
          <p className="mt-1">
            Yes, but keep in mind that the entire file must be loaded into
            browser memory via WebAssembly. Files up to ~2 GB work well on
            most modern machines with 8+ GB RAM. For very large files, the
            loading step may take a moment, but the actual cutting is still
            fast.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Does trimming add a watermark?
          </h3>
          <p className="mt-1">
            No. The output is an exact copy of the original video data —
            nothing is added, removed, or modified. There are no watermarks,
            logos, or branding of any kind.
          </p>
        </div>
      </div>
    </section>
  );
}
