import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold">
          Free Flowchart Maker Online
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Build professional flowcharts, process diagrams, and decision trees
          directly in your browser with Free Tool Shed&apos;s Flowchart Maker.
          Unlike Lucidchart ($8/month), Visio ($5/user/month), and other paid
          diagram tools that require subscriptions and accounts, our tool gives
          you drag-and-drop shape placement, smart connection routing, and
          instant SVG/PNG/PDF export at no cost. No sign-up, no account, no
          hidden fees. Your data stays in your browser and is never sent to a
          server.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>11 shape types (process, decision, terminal, I/O, and more)</li>
          <li>Click-to-place shape tool with shape palette</li>
          <li>Bezier, straight, and orthogonal edge routing</li>
          <li>Automatic anchor snapping (top, right, bottom, left)</li>
          <li>Edge labels and multiple arrowhead styles</li>
          <li>Drag-and-drop shape repositioning</li>
          <li>8-point resize handles on all shapes</li>
          <li>Shape fill, stroke, font, and opacity customization</li>
          <li>Edge stroke, dash pattern, and width styling</li>
          <li>Grid overlay with configurable snap spacing</li>
          <li>Zoom and pan with scroll wheel and controls</li>
          <li>Zoom-to-fit for quick overview</li>
          <li>50-step undo/redo history</li>
          <li>Copy, paste, and duplicate with Ctrl shortcuts</li>
          <li>Bring to front / send to back layer ordering</li>
          <li>Lock shapes to prevent accidental edits</li>
          <li>SVG, PNG (1x/2x/4x), and PDF export</li>
          <li>Copy diagram to clipboard as PNG</li>
          <li>PDF export with A4 or Letter paper size</li>
          <li>Auto-save draft to local storage</li>
          <li>Save multiple diagrams to browser history</li>
          <li>4 starter templates (flowchart, decision tree, process map, SDLC)</li>
          <li>JSON export/import for backup and sharing</li>
          <li>Keyboard shortcuts for all common actions</li>
          <li>Client-side only — data never leaves your browser</li>
        </ul>
      </section>

      {/* ── How To ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">
          How to Create a Flowchart
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "1. Choose or start fresh",
              desc: "Open the File menu and select From Template to start with a pre-built flowchart, decision tree, process map, or SDLC diagram. Or start with a blank canvas.",
            },
            {
              title: "2. Place shapes",
              desc: "Select the Add Shape tool (S) and pick a shape type from the palette — process, decision, terminal, I/O, document, database, and more. Click anywhere on the canvas to place it. Double-click to edit the label text.",
            },
            {
              title: "3. Connect shapes",
              desc: "Switch to the Connect tool (C) and click on a source shape, then click on a target shape. The edge automatically snaps to the nearest anchor point. Choose between bezier, straight, or orthogonal routing in the properties panel.",
            },
            {
              title: "4. Style your diagram",
              desc: "Select any shape or edge to customize its appearance in the right panel. Change fill colors, stroke styles, font sizes, edge dash patterns, arrowhead types, and more.",
            },
            {
              title: "5. Export or share",
              desc: "Click the export button in the top bar. Download as SVG for scalable vector graphics, PNG at up to 4x resolution for high-quality images, PDF for print-ready documents, or copy directly to your clipboard.",
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
          Free Tool Shed vs Paid Flowchart Software
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold">Free Tool Shed</th>
                <th className="py-2 pr-4 font-semibold">Lucidchart</th>
                <th className="py-2 pr-4 font-semibold">Visio</th>
                <th className="py-2 font-semibold">Draw.io</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free forever", "$7.95/mo", "$5/user/mo", "Free"],
                ["Account Required", "No", "Yes", "Yes (Microsoft)", "No"],
                ["Shape Types", "11 built-in", "100+", "200+", "100+"],
                ["Connection Routing", "3 types (bezier, straight, orthogonal)", "Auto-route", "Auto-route", "Auto-route"],
                ["SVG Export", "Free", "Paid tier", "Paid", "Free"],
                ["PNG Export", "Free (up to 4x)", "Free (limited)", "Paid", "Free"],
                ["PDF Export", "Free", "Paid tier", "Paid", "Free"],
                ["Clipboard Copy", "Yes", "Yes", "No", "No"],
                ["Starter Templates", "4 templates", "1000+", "100+", "50+"],
                ["Auto-Save", "Yes (browser)", "Yes (cloud)", "Yes (cloud)", "Yes (cloud)"],
                ["JSON Backup", "Yes", "No", "No", "XML export"],
                ["Keyboard Shortcuts", "Full set", "Full set", "Full set", "Full set"],
                ["Data Privacy", "Client-side only", "Cloud-stored", "Cloud-stored", "Cloud or local"],
                ["Undo/Redo", "50 steps", "Unlimited", "Unlimited", "Unlimited"],
                ["Offline Support", "Yes", "No", "Desktop app", "Yes"],
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
              q: "Is this flowchart maker really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. You can start building flowcharts immediately without signing up or providing any personal information.",
            },
            {
              q: "What types of diagrams can I create?",
              a: "Flowcharts, process diagrams, decision trees, data flow diagrams, SDLC diagrams, and any box-and-arrow diagram. The tool includes 11 standard shape types covering all common flowchart symbols.",
            },
            {
              q: "Can I export my flowchart as a PDF?",
              a: "Yes — click the export button in the top bar and select PDF. Choose between A4 and Letter paper sizes. The PDF includes a title header, and the diagram is automatically scaled to fit the page.",
            },
            {
              q: "What export formats are available?",
              a: "Four options: SVG for scalable vector graphics, PNG at 1x, 2x, or 4x resolution, PDF for print-ready documents, and clipboard copy to paste directly into other applications.",
            },
            {
              q: "Is my data private and secure?",
              a: "Your flowchart data never leaves your browser. All processing happens client-side on your device, so your diagrams stay completely private.",
            },
            {
              q: "Can I save multiple diagrams?",
              a: "Yes. Use File > Save to History to save snapshots of your work. Load any saved diagram from the history list. You can also export all diagrams as a JSON backup file and import them on any computer.",
            },
            {
              q: "Are there starter templates?",
              a: "Yes — four built-in templates: Simple Flowchart, Decision Tree, Process Map, and SDLC (Software Development Lifecycle). Open File > From Template to get started quickly.",
            },
            {
              q: "What keyboard shortcuts are available?",
              a: "V for select, H for pan, S for add shape, C for connect, T for text. Ctrl+Z to undo, Ctrl+Shift+Z to redo, Ctrl+C/V for copy/paste, Ctrl+D to duplicate, Delete to remove, and Escape to deselect.",
            },
            {
              q: "How does the auto-save work?",
              a: "Your diagram is automatically saved to your browser storage every few seconds. When you return to the tool, your last diagram is restored exactly as you left it. For permanent saves, use File > Save to History.",
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
