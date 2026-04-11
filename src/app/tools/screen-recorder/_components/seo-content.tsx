import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold">
          Free Screen Recorder Online — No Install, No Sign Up
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          You shouldn&apos;t have to create yet another account or install a
          100 MB desktop app just to record a quick walkthrough. Free Tool
          Shed&apos;s Screen Recorder runs entirely in your browser — pick a
          quality preset, choose which audio to capture, optionally drop in a
          webcam overlay, and hit record. It works on Windows, macOS, Linux,
          Chromebooks, and even a locked-down work laptop where you can&apos;t
          install anything.
        </p>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Unlike Loom (capped at 5 minutes and 25 videos on the free plan) or
          OBS Studio (powerful but a desktop install with a steep learning
          curve), this tool is built for the common case: record your screen,
          trim the ends, and download. Your video never leaves your browser
          — there are no servers, no accounts, and no upload queues. Export
          as WebM instantly, or convert to MP4 or GIF with an in-browser
          ffmpeg.wasm transcode. The whole thing is free, open, and
          ad-supported so it can stay that way.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Record full screen, a single window, or a browser tab</li>
          <li>720p, 1080p, or 1440p quality presets at 30 fps</li>
          <li>VP9 / Opus encoding when your browser supports it</li>
          <li>System audio capture (tab audio in Chrome)</li>
          <li>Microphone capture for narration</li>
          <li>Mix both audio sources in a single recording</li>
          <li>Optional webcam picture-in-picture overlay</li>
          <li>Choose any of four corners for the overlay</li>
          <li>Small / Medium / Large webcam sizes</li>
          <li>Circle or square webcam shape</li>
          <li>Overlay is baked into the final video</li>
          <li>3-second countdown before recording starts</li>
          <li>Pause and resume without losing the clip</li>
          <li>Up to 2 hours per recording</li>
          <li>Live elapsed timer during recording</li>
          <li>Draggable trim handles on the timeline</li>
          <li>Keyboard nudges for frame-accurate trim boundaries</li>
          <li>Non-destructive trim — reset anytime</li>
          <li>Playback loops inside the trim window</li>
          <li>WebM export with zero re-encode (instant)</li>
          <li>MP4 export via in-browser H.264 / AAC transcode</li>
          <li>GIF export with palette-optimised 12 fps output</li>
          <li>Auto-generated filenames with date stamps</li>
          <li>Cancel an export mid-transcode</li>
          <li>Client-side only — your recording never leaves your browser</li>
          <li>No account, no sign up, no watermarks</li>
          <li>Preferences remembered across sessions</li>
        </ul>
      </section>

      {/* ── How To ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">
          How to Record Your Screen Online (5 Steps)
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "1. Set up your recording",
              desc: "Pick a quality preset (720p for small files, 1080p for the sweet spot, 1440p for crisp walkthroughs). Toggle system audio, your microphone, or both. Optionally enable the webcam overlay and pick a corner, size, and shape — it'll be baked into the final video.",
            },
            {
              title: "2. Start recording",
              desc: "Click Start Recording. Your browser will open its native share picker where you choose a screen, window, or browser tab to capture. In Chrome, check 'Share tab audio' if you want system sound from a tab. After a 3-second countdown, recording begins.",
            },
            {
              title: "3. Record, pause, and stop",
              desc: "Click Pause to freeze the recording (the elapsed timer stops too) and Resume to pick it back up. When you're done, click Stop to finalize. There's no time limit beyond a 2-hour safety cap, and nothing is uploaded as you record — everything lives in your browser's memory.",
            },
            {
              title: "4. Review and trim",
              desc: "Play back your recording with the custom video player. Drag the two green handles on the timeline to cut the start or end. Use ← / → for 0.1s nudges, or hold Shift for 1-second steps. Home and End snap to the boundaries. Hit Reset trim anytime to restore the full range.",
            },
            {
              title: "5. Export your recording",
              desc: "Choose WebM for an instant download (no transcode, no waiting), MP4 for universal H.264 playback, or GIF for a palette-optimised animation. Give the file a name and click Download. MP4 and GIF lazy-load a ~30 MB ffmpeg core on first use — cached afterwards, so follow-up exports are much faster.",
            },
          ].map((step) => (
            <li key={step.title}>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Comparison Table ──────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">
          Free Tool Shed vs Paid Screen Recorders
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold">Free Tool Shed</th>
                <th className="py-2 pr-4 font-semibold">Loom (Free)</th>
                <th className="py-2 pr-4 font-semibold">Loom (Business)</th>
                <th className="py-2 pr-4 font-semibold">OBS Studio</th>
                <th className="py-2 font-semibold">Camtasia</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free forever", "Free", "$15/mo", "Free", "$299 one-time"],
                [
                  "Installation",
                  "None (browser)",
                  "Desktop or extension",
                  "Desktop or extension",
                  "Desktop app",
                  "Desktop app",
                ],
                ["Account Required", "No", "Yes", "Yes", "No", "No"],
                ["Recording Length", "2 hours", "5 minutes", "Unlimited", "Unlimited", "Unlimited"],
                ["Video Count", "Unlimited", "25 total", "Unlimited", "Unlimited", "Unlimited"],
                ["Watermark", "None", "None", "None", "None", "None"],
                [
                  "Record Screen / Window / Tab",
                  "Yes",
                  "Yes",
                  "Yes",
                  "Yes",
                  "Yes",
                ],
                [
                  "Webcam Overlay",
                  "Yes (corner / shape)",
                  "Yes",
                  "Yes",
                  "Yes",
                  "Yes",
                ],
                ["Microphone Audio", "Yes", "Yes", "Yes", "Yes", "Yes"],
                [
                  "System / Tab Audio",
                  "Yes",
                  "Yes",
                  "Yes",
                  "Yes",
                  "Yes",
                ],
                ["Pause / Resume", "Yes", "No", "Yes", "Yes", "Yes"],
                ["Trim Start / End", "Yes (browser)", "Basic", "Yes", "Yes", "Yes"],
                [
                  "Export Formats",
                  "WebM / MP4 / GIF",
                  "Cloud link only",
                  "MP4 download",
                  "MKV / MP4 / FLV",
                  "MP4 / GIF / etc.",
                ],
                [
                  "Data Privacy",
                  "Client-side only",
                  "Uploaded to Loom",
                  "Uploaded to Loom",
                  "Local",
                  "Local",
                ],
                [
                  "Works on Chromebook",
                  "Yes",
                  "Yes (web)",
                  "Yes (web)",
                  "No",
                  "No",
                ],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-border/50">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`py-2 ${i < row.length - 1 ? "pr-4" : ""} ${
                        i === 1 ? "font-medium text-foreground" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        <div className="mt-4 space-y-3">
          {[
            {
              q: "Is this screen recorder really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, no watermarks, and no sign-up required. The tool is ad-supported, which is how it stays free for everyone. Ads only appear outside the recording workspace itself.",
            },
            {
              q: "Do I need to install anything?",
              a: "No. The entire recorder runs inside your browser using the MediaRecorder API, Web Audio API, and canvas compositing. There's nothing to download and nothing to uninstall. It works on any modern Chromium-based browser (Chrome, Edge, Brave, Opera) and Firefox.",
            },
            {
              q: "How long can I record?",
              a: "Up to 2 hours per clip. The cap exists so the in-memory video buffer doesn't exhaust your browser's heap. For most use cases (tutorials, bug reports, walkthroughs) that's plenty of headroom. If you need multi-hour recordings, a desktop app is still the right tool.",
            },
            {
              q: "Does it record system audio?",
              a: "Yes, on Chrome-based browsers you can capture tab audio or entire desktop audio. In the browser's share dialog, check 'Share tab audio' or 'Share system audio'. Firefox has more limited system audio support — microphone capture works everywhere.",
            },
            {
              q: "Can I record with my webcam in the corner like Loom?",
              a: "Yes. Enable the Webcam Overlay in Setup, pick a corner, choose Small/Medium/Large, and switch between a circle or square bubble. The overlay is composited into the recording via a canvas, so it's baked into the final video — it'll look exactly the same when you download it.",
            },
            {
              q: "Can I pause and resume a recording?",
              a: "Yes. Click Pause to freeze the recording — the elapsed timer stops too, and resuming picks up exactly where you left off. Most browser-based recorders don't let you pause at all.",
            },
            {
              q: "How do I trim the start or end of my recording?",
              a: "After you stop recording, drag the two green handles on the timeline. The left handle sets the new start, the right sets the new end. Use ← / → for 0.1s nudges, Shift+← / → for 1-second steps, and Home / End to snap to a boundary. Trimming is non-destructive — hit Reset trim to restore the full range.",
            },
            {
              q: "What export formats are supported?",
              a: "WebM (instant, no transcode — your browser already recorded in this format), MP4 (H.264/AAC for universal compatibility with Quicktime, Premiere, YouTube, and social platforms), and GIF (palette-optimised, capped at 12 fps and 720p width for sane file sizes). MP4 and GIF use ffmpeg.wasm locally — no upload, no server.",
            },
            {
              q: "Why is MP4 export slow the first time?",
              a: "MP4 and GIF exports lazy-load ffmpeg.wasm on first use — that's about 30 MB of WebAssembly code served from unpkg.com and cached by your browser. Subsequent exports skip the download. WebM exports always skip ffmpeg entirely when the trim covers the full recording.",
            },
            {
              q: "Does my recording get uploaded anywhere?",
              a: "No. Everything runs client-side. The recording lives in your browser tab's memory (as a Blob), gets trimmed in-place, and downloads directly to your device. There are no servers, no cloud storage, and no analytics on the video content. Close the tab and the recording is gone.",
            },
            {
              q: "Why would I use this instead of Loom?",
              a: "Loom's free plan caps you at 5 minutes per video and 25 videos total, requires an account, and uploads your video to their servers. This tool has no time cap (beyond a 2-hour safety limit), no account, and no uploads. If you need Loom's sharing and commenting features, keep using Loom. If you just need to record and download, this is faster.",
            },
            {
              q: "Why would I use this instead of OBS Studio?",
              a: "OBS is vastly more powerful — scenes, sources, filters, streaming, plugins. But it's a desktop install with a learning curve. This tool is for the common case: hit record, trim, download. No install, no setup, no scenes.",
            },
            {
              q: "Can I use this on a Chromebook or a work laptop?",
              a: "Yes. Because it runs entirely in the browser, it works on Chromebooks, locked-down work machines, and anywhere a desktop install isn't possible. As long as your browser supports getDisplayMedia (Chrome 72+, Edge 79+, Firefox 66+), you're good.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-lg border border-border px-4 py-3"
            >
              <summary className="cursor-pointer font-medium">{faq.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
