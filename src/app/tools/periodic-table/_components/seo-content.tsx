import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ToolInsights } from "@/components/shared/tool-insights";

const TIPS = [
  "Use the temperature slider to watch phase transitions — melting, boiling, and sublimation are color-coded per element.",
  "Filter by category (halogen, noble gas, lanthanide) before exporting — the CSV/JSON reflects the active filter.",
  "Feed the molar mass calculator parenthesized formulas like Ca(OH)2 — it parses nested groups, not just flat chains.",
  "Switch between heatmap and absolute views to see periodic trends (electronegativity, atomic radius) visually.",
];

const MISTAKES = [
  "Reading heatmap shading as exact — it's tuned for visual trend spotting, not precise numerical comparison.",
  "Comparing exported values across property views without noting the unit — some properties have multiple conventions.",
  "Expecting compounds, reactions, or thermochemistry — this is an element-by-element reference, not a chemistry engine.",
];

const TAKEAWAYS = [
  "All element data ships with the page — no API calls, no rate limits, works offline once cached.",
  "Built for chemistry students, teachers, and casual reference — not for research-grade citations.",
  "Export to CSV or JSON for homework, spreadsheets, or downstream tools.",
];

export const HOW_TO_STEPS = [
  {
    title: "Browse the table",
    desc: "Hover over any element to see a tooltip with its name, symbol, atomic mass, and electron configuration. Click an element to open its full detail panel.",
  },
  {
    title: "Switch view modes",
    desc: "Use the toolbar to switch between Categories (color-coded by type), Temperature (phase states at any temp), and Heatmap (gradient by property) views.",
  },
  {
    title: "Explore temperature phase changes",
    desc: "In Temperature mode, drag the slider from 0 K to 6000 K or use preset buttons (Room Temp, Iron Melts, Sun Surface) to watch elements change between solid, liquid, and gas states.",
  },
  {
    title: "Calculate molar mass",
    desc: "Click 'Molar Mass' in the toolbar, type a chemical formula like C6H12O6, and instantly see the total mass with a full element breakdown showing each atom's contribution.",
  },
  {
    title: "Compare and export",
    desc: "Click 'Compare' to select up to 4 elements for side-by-side bar charts. Click 'Export' to download element data as CSV, JSON, PDF, or PNG with your choice of properties.",
  },
];

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* Intro */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Free Interactive Periodic Table Online
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Explore every element in the periodic table with an interactive,
          feature-rich tool that rivals paid apps like Merck PTE and Periodic
          Table Pro — completely free and without signing up. Free Tool
          Shed&apos;s periodic table runs entirely in your browser with no
          downloads or accounts required. Search by name, symbol, or atomic
          number. Visualize property trends with heatmaps. Watch phase
          transitions in real time with the temperature slider. Calculate molar
          masses, build electron configurations, compare elements side by side,
          and export data in four formats.
        </p>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Working through a chemistry or physics problem? Convert between mass,
          volume, energy, and temperature units with the{" "}
          <Link
            href="/tools/unit-converter"
            className="text-brand underline-offset-4 hover:underline"
          >
            free unit converter
          </Link>
          , or plot reaction rates and equations with the{" "}
          <Link
            href="/tools/graphing-calculator"
            className="text-brand underline-offset-4 hover:underline"
          >
            free graphing calculator
          </Link>
          .
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
        <ul className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "All 118 elements with 20+ properties each",
            "Color-coded by category — alkali metals, noble gases, transition metals, and more",
            "Temperature mode — slide from 0 K to 6000 K and watch elements change phase",
            "Property heatmaps — visualize electronegativity, density, atomic radius, and 5 more",
            "Molar mass calculator — supports H2SO4, Ca(OH)2, brackets, and subscripts",
            "Electron configuration builder — interactive orbital filling with Hund's rule",
            "Element comparison — compare up to 4 elements with bar charts",
            "Element detail panel — full data card with Bohr model, isotopes, discovery, and uses",
            "Search and filter by name, symbol, number, block, state, or category",
            "Export as CSV, JSON, PDF, or PNG with customizable property selection",
            "Dark and light mode with automatic theme detection",
            "Settings persistence — your view mode and temperature are remembered",
            "Responsive layout — works on desktop and tablet",
            "No sign-up, no download, no ads inside the tool workspace",
            "Completely client-side — your data never leaves your browser",
            "Print-ready PDF export with branded header and 118-element data table",
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How To */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          How to Use the Interactive Periodic Table
        </h2>
        <ol className="mt-4 max-w-3xl space-y-4">
          {HOW_TO_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Free Ptable &amp; Merck PTE Alternative
        </h2>
        <div className="mt-4 max-w-3xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-6 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                <th className="pb-2 pr-6 text-left font-medium text-brand">
                  Free Tool Shed
                </th>
                <th className="pb-2 pr-6 text-left font-medium text-muted-foreground">
                  Merck PTE ($2.99)
                </th>
                <th className="pb-2 text-left font-medium text-muted-foreground">
                  PTable.com
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free", "$2.99", "Free (ads)"],
                ["All 118 elements", "Yes", "Yes", "Yes"],
                ["Temperature slider", "0–6000 K", "No", "Limited"],
                ["Property heatmaps", "8 properties", "No", "Some"],
                ["Molar mass calculator", "Yes", "No", "Yes"],
                ["Electron config builder", "Interactive", "No", "No"],
                ["Element comparison", "Up to 4", "Yes", "No"],
                ["Data export (CSV/JSON/PDF)", "Yes", "No", "No"],
                ["Dark mode", "Yes", "No", "No"],
                ["Sign-up required", "No", "App Store", "No"],
                ["Works offline", "Yes (cached)", "Yes", "No"],
                ["Bohr model visualization", "Animated SVG", "Static", "No"],
                ["Open in browser", "Yes", "iOS/Android only", "Yes"],
              ].map(([feature, fts, merck, ptable]) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-2 pr-6 font-medium text-foreground">
                    {feature}
                  </td>
                  <td className="py-2 pr-6 font-medium text-brand">{fts}</td>
                  <td className="py-2 pr-6">{merck}</td>
                  <td className="py-2">{ptable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ToolInsights tips={TIPS} mistakes={MISTAKES} takeaways={TAKEAWAYS} />

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <dl className="mt-4 max-w-3xl space-y-6">
          {[
            {
              q: "Is the periodic table completely free to use?",
              a: "Yes. Free Tool Shed's interactive periodic table is 100% free with no sign-up, no download, and no usage limits. The tool is supported by non-intrusive ads displayed outside the workspace.",
            },
            {
              q: "How accurate is the element data?",
              a: "All element data — atomic masses, melting points, boiling points, electronegativities, and other properties — is sourced from IUPAC-recommended values and peer-reviewed references. Data covers all 118 confirmed elements.",
            },
            {
              q: "How does the temperature slider work?",
              a: "Switch to Temperature mode and drag the slider from 0 K (absolute zero) to 6000 K. Each element's cell changes color to show whether it is solid (blue), liquid (green), or gas (orange) at that temperature, based on its melting and boiling points.",
            },
            {
              q: "What formulas does the molar mass calculator support?",
              a: "The calculator handles simple formulas (H2O, NaCl), parentheses (Ca(OH)2), brackets ([Cu(NH3)4]SO4), nested groups (Mg3(PO4)2), hydrate notation (CuSO4·5H2O), and Unicode subscript digits.",
            },
            {
              q: "Can I export the periodic table data?",
              a: "Yes. Click the Export button to download element data as CSV (for spreadsheets), JSON (for developers), PDF (print-ready table with all selected properties), or PNG (screenshot of the current table view). You can choose which properties to include.",
            },
            {
              q: "Does the electron configuration builder follow the Aufbau principle?",
              a: "Yes. The builder fills orbitals in the standard Aufbau order (1s → 2s → 2p → 3s → ...) and displays electrons following Hund's rule (maximum spin multiplicity). You can also click individual orbital boxes to create custom configurations.",
            },
            {
              q: "Does the tool work on mobile?",
              a: "The periodic table is optimized for desktop viewports (1024px+) where you can see the full 18-column layout. It is usable on tablets in landscape mode. On phones, horizontal scrolling is available but the experience is best on larger screens.",
            },
            {
              q: "Is my data stored anywhere?",
              a: "No data is sent to any server. The tool runs entirely in your browser. Your view preferences (mode, temperature, heatmap property) are saved in your browser's localStorage so they persist between visits.",
            },
            {
              q: "What is a property heatmap?",
              a: "A property heatmap recolors every element cell on a gradient from blue (low) to orange (high) based on a selected property — such as electronegativity, atomic radius, ionization energy, or density. This makes periodic trends immediately visible at a glance.",
            },
            {
              q: "How do I compare elements?",
              a: "Click the Compare button in the toolbar, then click up to 4 elements on the table. A comparison panel appears below with bar charts for atomic mass, electronegativity, atomic radius, ionization energy, density, melting point, boiling point, and electron affinity.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <dt className="font-medium text-foreground">{q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
