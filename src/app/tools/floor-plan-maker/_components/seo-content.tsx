import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold">
          Free Floor Plan Maker Online
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Design professional floor plans and room layouts in minutes with Free
          Tool Shed&apos;s Floor Plan Maker. Unlike SmartDraw ($10/month),
          RoomSketcher, and Floorplanner — which require paid subscriptions or
          accounts for full features — our tool gives you drag-and-drop room
          design, furniture placement, and instant SVG/PNG/PDF export at no cost.
          No sign-up, no account, no hidden fees. Your data stays in your browser
          and is never sent to a server.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Click-and-drag room drawing with live preview</li>
          <li>11 room presets (bedroom, kitchen, bathroom, garage, and more)</li>
          <li>58+ furniture items across 6 categories</li>
          <li>Wall drawing tool with horizontal/vertical snapping</li>
          <li>Text annotations for labels and notes</li>
          <li>Grid overlay with configurable size (0.5, 1, 2, or 5 ft/m)</li>
          <li>Snap-to-grid for precise placement</li>
          <li>Resize handles with 8-point selection</li>
          <li>Rotation with 15-degree snapping</li>
          <li>Dimension labels on rooms (feet or meters)</li>
          <li>Bring to front / send to back layer ordering</li>
          <li>Lock elements to prevent accidental edits</li>
          <li>50-step undo/redo history</li>
          <li>Copy and paste elements with new IDs</li>
          <li>SVG, PNG (1x/2x/4x), and PDF export</li>
          <li>PDF export with A4 or Letter paper size</li>
          <li>Auto-save draft to local storage</li>
          <li>Save multiple plans to local history</li>
          <li>JSON export/import for backup and sharing</li>
          <li>Keyboard shortcuts for all common actions</li>
          <li>Zoom and pan with scroll wheel and controls</li>
          <li>Feet and meters unit support</li>
          <li>Client-side only — data never leaves your browser</li>
        </ul>
      </section>

      {/* ── How To ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">How to Create a Floor Plan</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "1. Set up your plan dimensions",
              desc: "Choose the width, height, and measurement unit (feet or meters) for your floor plan in the right panel. Enable grid snapping for precise alignment.",
            },
            {
              title: "2. Draw rooms",
              desc: "Select the Room tool (R) and click-drag on the canvas to draw rectangular rooms. Choose from 11 room presets — bedroom, kitchen, bathroom, living room, and more — each with a default size and color.",
            },
            {
              title: "3. Add walls and text",
              desc: "Use the Wall tool (W) to draw walls between rooms. Walls automatically snap to horizontal or vertical alignment. Add text labels with the Text tool (T) for annotations.",
            },
            {
              title: "4. Place furniture",
              desc: "Open the Furniture palette (F) and browse 58+ items across six categories: living room, bedroom, kitchen, bathroom, office, and outdoor. Click any item to place it on the canvas, then drag to position.",
            },
            {
              title: "5. Export your floor plan",
              desc: "Click Export in the top bar and choose SVG for scalable graphics, PNG for high-resolution images (up to 4x), or PDF for print-ready documents on A4 or Letter paper.",
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
          Free Tool Shed vs Paid Floor Plan Software
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold">Free Tool Shed</th>
                <th className="py-2 pr-4 font-semibold">SmartDraw</th>
                <th className="py-2 pr-4 font-semibold">RoomSketcher</th>
                <th className="py-2 font-semibold">Floorplanner</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free forever", "$9.95/mo", "$49/year", "Free (limited) / $4.99+"],
                ["Account Required", "No", "Yes", "Yes", "Yes"],
                ["SVG Export", "Free", "Paid", "No", "No"],
                ["PNG Export", "Free (up to 4x)", "Paid", "Paid", "Paid"],
                ["PDF Export", "Free", "Paid", "Paid", "Paid"],
                ["Furniture Library", "95+ items", "500+", "1000+", "150+"],
                ["Doors & Windows", "12 items", "Yes", "Yes", "Yes"],
                ["Electrical Symbols", "14 items", "Yes", "Limited", "No"],
                ["Starter Templates", "5 layouts", "100+", "20+", "10+"],
                ["Blueprint Underlay", "Free", "Yes", "Paid", "Paid"],
                ["Smart Alignment", "Yes", "Yes", "Yes", "Yes"],
                ["Room Area Display", "Auto-calculated", "Yes", "Yes", "Yes"],
                ["Room Drawing", "Click-drag", "Click-drag", "Click-drag", "Click-drag"],
                ["Data Privacy", "Client-side only", "Cloud-stored", "Cloud-stored", "Cloud-stored"],
                ["Undo/Redo", "50 steps", "Unlimited", "Limited", "Limited"],
                ["JSON Backup", "Yes", "No", "No", "No"],
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
              q: "Is this floor plan maker really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. You can start designing your floor plan immediately without signing up or providing any personal information.",
            },
            {
              q: "Can I export my floor plan as a PDF?",
              a: "Yes — click Export in the top bar and select PDF. Choose between A4 and Letter paper sizes. The PDF includes a header with your plan name and dimensions, and the layout automatically switches between portrait and landscape orientation.",
            },
            {
              q: "What export formats are available?",
              a: "Three formats: SVG for scalable vector graphics (perfect for further editing), PNG at 1x, 2x, or 4x resolution for high-quality images, and PDF for print-ready documents.",
            },
            {
              q: "Is my data private and secure?",
              a: "Your floor plan data never leaves your browser. All processing happens client-side on your device, so your designs and measurements stay completely private.",
            },
            {
              q: "Can I save multiple floor plans?",
              a: "Yes. Save plans to your local history, name them, and switch between versions. You can also export all plans as JSON for backup and import them later on any computer.",
            },
            {
              q: "What furniture is available?",
              a: "Over 58 furniture items across six categories: living room (sofas, tables, TV units), bedroom (beds, dressers, nightstands), kitchen (stoves, sinks, islands), bathroom (tubs, toilets, vanities), office (desks, chairs, bookshelves), and outdoor (benches, grills, planters).",
            },
            {
              q: "Can I change the measurement units?",
              a: "Yes. Switch between feet and meters at any time in the Plan Settings panel on the right side. All dimensions, grid sizes, and measurements update automatically.",
            },
            {
              q: "What keyboard shortcuts are available?",
              a: "V for select tool, R for room drawing, W for wall drawing, T for text, F to toggle furniture palette, Delete to remove selected elements, Ctrl+Z to undo, Ctrl+Shift+Z to redo, Ctrl+C to copy, and Ctrl+V to paste.",
            },
            {
              q: "How accurate are the measurements?",
              a: "The tool uses a precise coordinate system with configurable grid sizes (0.5, 1, 2, or 5 units). Snap-to-grid ensures elements align precisely. Dimension labels display in feet-inches or meters depending on your unit setting.",
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
