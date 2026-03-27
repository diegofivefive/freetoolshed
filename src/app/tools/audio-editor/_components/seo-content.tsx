import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold">
          Free Online Audio Editor
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Edit, trim, merge, and convert audio files directly in your browser
          with Free Tool Shed&apos;s Audio Editor. Unlike Adobe Audition
          ($22.99/month) and Audacity (desktop-only download), our tool runs
          entirely online — no installation, no account, no hidden fees. Import
          MP3, WAV, OGG, AAC, FLAC, or WebM files, make your edits with a
          visual waveform display, and export in seconds. Your audio never
          leaves your device — all processing uses the Web Audio API locally in
          your browser.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Visual waveform display with per-pixel peak rendering</li>
          <li>Click-and-drag region selection on the waveform</li>
          <li>Trim (crop) audio to selection</li>
          <li>Delete selected region and join remaining parts</li>
          <li>Silence selected region</li>
          <li>Split audio at the playhead position</li>
          <li>Fade in and fade out effects</li>
          <li>Normalize volume to peak amplitude</li>
          <li>Reverse audio (entire track or selection)</li>
          <li>Amplify with configurable gain factor</li>
          <li>Noise reduction with adjustable strength</li>
          <li>50-step undo/redo history</li>
          <li>Export as WAV (lossless), MP3, or OGG</li>
          <li>Configurable bitrate for compressed formats</li>
          <li>Zoom and scroll with mouse wheel</li>
          <li>Keyboard shortcuts (Space, Delete, T, Ctrl+Z/Y)</li>
          <li>Time grid overlay with automatic scaling</li>
          <li>Real-time playhead animation during playback</li>
          <li>Selection-only playback preview</li>
          <li>Mute toggle and gain control</li>
          <li>Drag-and-drop file import</li>
          <li>Supports MP3, WAV, OGG, AAC, FLAC, and WebM input</li>
          <li>Export preferences saved across sessions</li>
          <li>Client-side only — audio never leaves your browser</li>
        </ul>
      </section>

      {/* ── How To ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">How to Edit Audio Online</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "1. Import your audio file",
              desc: "Drag and drop an audio file onto the editor, or click to browse. Supported formats include MP3, WAV, OGG, AAC, FLAC, and WebM. Your file is decoded locally in your browser — nothing is uploaded.",
            },
            {
              title: "2. Navigate the waveform",
              desc: "Use the visual waveform to see your audio. Scroll to pan left and right, or hold Ctrl and scroll to zoom in and out. Click anywhere to position the playhead, then press Space to play.",
            },
            {
              title: "3. Select a region",
              desc: "Click and drag on the waveform to highlight a region. The selection is shown in green. Use selection-only playback to preview exactly what you've selected before making edits.",
            },
            {
              title: "4. Edit and apply effects",
              desc: "Use the toolbar buttons to trim, delete, or silence the selection. Apply effects like fade in, fade out, normalize, reverse, amplify, or noise reduction from the effects bar below the waveform.",
            },
            {
              title: "5. Export your edited audio",
              desc: "Choose your export format (WAV for lossless, MP3 or OGG for compressed) and bitrate, then click Download. The file is encoded in your browser and saved directly to your device.",
            },
          ].map((step) => (
            <li key={step.title}>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Comparison Table ──────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">
          Free Tool Shed vs Paid Audio Editors
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold">Free Tool Shed</th>
                <th className="py-2 pr-4 font-semibold">Adobe Audition</th>
                <th className="py-2 pr-4 font-semibold">Audacity</th>
                <th className="py-2 font-semibold">TwistedWave</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free forever", "$22.99/mo", "Free", "$79.90 (Mac)"],
                ["Installation", "None (browser)", "Desktop app", "Desktop app", "Desktop/Web"],
                ["Account Required", "No", "Yes (Adobe ID)", "No", "Yes (web)"],
                ["Waveform Editor", "Yes", "Yes", "Yes", "Yes"],
                ["Trim / Cut / Delete", "Yes", "Yes", "Yes", "Yes"],
                ["Fade In / Fade Out", "Yes", "Yes", "Yes", "Yes"],
                ["Normalize", "Yes", "Yes", "Yes", "Yes"],
                ["Reverse Audio", "Yes", "Yes", "Yes", "Yes"],
                ["Noise Reduction", "Basic", "Advanced (AI)", "Advanced", "Basic"],
                ["Multi-track", "Single track", "Unlimited", "Unlimited", "Single track"],
                ["WAV Export", "Free", "Included", "Free", "Free (limited)"],
                ["MP3 / OGG Export", "Free", "Included", "Free (with plugin)", "Paid"],
                ["Undo / Redo", "50 steps", "Unlimited", "Unlimited", "Unlimited"],
                ["Data Privacy", "Client-side only", "Cloud account", "Local only", "Cloud (web)"],
                ["File Size Limit", "Browser memory", "Disk space", "Disk space", "5 min (free web)"],
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
        <h2 className="text-xl font-semibold">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 space-y-3">
          {[
            {
              q: "Is this audio editor really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Do I need to install anything?",
              a: "No. This audio editor runs entirely in your browser using the Web Audio API. No downloads, plugins, or extensions required — unlike Audacity which needs a desktop install.",
            },
            {
              q: "What audio formats can I import?",
              a: "You can import MP3, WAV, OGG, AAC, FLAC, and WebM audio files. The browser decodes them natively, so there's no server-side processing involved.",
            },
            {
              q: "What export formats are available?",
              a: "Export as WAV (uncompressed, lossless), MP3, or OGG. For MP3 and OGG, you can choose the bitrate (128, 192, 256, or 320 kbps). WAV export is generated natively in the browser for maximum quality.",
            },
            {
              q: "Is my audio data private?",
              a: "Yes. All processing happens locally in your browser. Your audio files are never uploaded to any server. We can't see, access, or store your files.",
            },
            {
              q: "Can I undo my edits?",
              a: "Yes. The editor maintains a 50-step undo/redo history. Use Ctrl+Z to undo and Ctrl+Y (or Ctrl+Shift+Z) to redo. You can also use the undo/redo buttons in the toolbar.",
            },
            {
              q: "How do I trim audio to a specific section?",
              a: "Click and drag on the waveform to select the region you want to keep, then click the Crop (trim) button or press T. Everything outside your selection will be removed.",
            },
            {
              q: "Does the noise reduction actually work?",
              a: "Yes. It uses spectral gating — it estimates the noise floor from the quietest parts of your audio and attenuates sections below that threshold. Adjust the strength slider (0–1) to control aggressiveness. For heavy noise, you may need to apply it multiple times.",
            },
            {
              q: "Is there a file size limit?",
              a: "There's no hard limit, but performance depends on your browser's available memory. Most files under 100 MB work smoothly. Very long recordings (over an hour) may use significant memory.",
            },
            {
              q: "Is this a good alternative to Audacity?",
              a: "For basic to intermediate editing tasks — trimming, cutting, applying effects, and format conversion — yes. The main advantage is zero installation and browser-based convenience. For advanced features like multi-track mixing, spectral editing, or VST plugins, Audacity is more capable.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-lg border border-border px-4 py-3"
            >
              <summary className="cursor-pointer font-medium">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
