import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* Intro */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Free Pay Stub Generator Online
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Generate professional pay stubs in minutes — completely free and
          without creating an account. Free Tool Shed&apos;s pay stub generator
          is a free alternative to PayStubCreator and ThePayStubs, which charge
          $8 or more per stub. Everything runs locally in your browser, so your
          employer and employee information stays completely private. Enter your
          details, choose a template, and download a print-ready PDF.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
        <ul className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "Hourly and salary pay type support",
            "Automatic amount calculation for hourly workers (hours × rate)",
            "6 earning types: regular, overtime, bonus, commission, tips, other",
            "Standard US deduction presets — one-click setup",
            "13 deduction types with pre-tax and post-tax categories",
            "Year-to-date (YTD) tracking on earnings and deductions",
            "3 professional PDF templates (Standard, Modern, Compact)",
            "Custom accent color — 8 presets plus custom color picker",
            "Company logo upload (PNG, JPEG, SVG)",
            "4 date format options (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, Month D YYYY)",
            "Auto-save — your draft saves every second",
            "Pay stub history — save, load, duplicate, and manage stubs",
            "Export and import stubs as JSON for backup",
            "Save employer defaults for faster stub creation",
            "SSN last-4 display with privacy toggle",
            "Print directly from the browser or download PDF",
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
          How to Create a Pay Stub
        </h2>
        <ol className="mt-4 max-w-3xl space-y-4">
          {[
            {
              title: "Enter employer and employee details",
              desc: "Add your company name, address, EIN, and optionally upload a company logo. Then fill in the employee name, ID, department, and SSN last 4 digits.",
            },
            {
              title: "Set the pay period",
              desc: "Choose a pay frequency (weekly, bi-weekly, semi-monthly, or monthly), set the period start date, and the end date and pay date will auto-fill.",
            },
            {
              title: "Add earnings",
              desc: "Toggle between hourly or salary mode. For hourly workers, enter hours and rate — the amount calculates automatically. Add overtime, bonuses, commission, or tips as needed.",
            },
            {
              title: "Add deductions",
              desc: "Click \"Apply Standard US Deductions\" to set up Federal tax, State tax, Social Security, Medicare, 401(k), and health insurance. Adjust amounts and add custom deductions.",
            },
            {
              title: "Customize and download",
              desc: "Choose a PDF template (Standard, Modern, or Compact), pick an accent color, then click Download PDF. Save the stub to your history for future reference.",
            },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
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
          Free Pay Stub Generator vs Paid Alternatives
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full max-w-3xl text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium text-brand">
                  Free Tool Shed
                </th>
                <th className="px-4 py-3 font-medium">PayStubCreator</th>
                <th className="px-4 py-3 font-medium">ThePayStubs</th>
                <th className="px-4 py-3 font-medium">123PayStubs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Price", "Free", "$8.99/stub", "$7.95/stub", "$3.99/stub"],
                ["Sign-up Required", "No", "Yes", "Yes", "Yes"],
                ["PDF Export", "Yes", "Yes", "Yes", "Yes"],
                ["Templates", "3 included", "1", "3", "1"],
                ["Logo Upload", "Yes", "No", "Yes", "No"],
                ["Hourly & Salary", "Yes", "Yes", "Yes", "Yes"],
                ["YTD Tracking", "Yes", "Yes", "Yes", "Yes"],
                ["Deduction Presets", "Yes", "No", "No", "No"],
                ["Stub History", "Yes (local)", "No", "No", "No"],
                ["Accent Color", "Yes", "No", "No", "No"],
                ["JSON Export", "Yes", "No", "No", "No"],
                ["Client-Side Privacy", "Yes", "No", "No", "No"],
                ["Bulk Generation", "No", "Yes", "Yes", "Yes"],
              ].map(([feature, fts, psc, tps, ops]) => (
                <tr key={feature}>
                  <td className="py-2.5 pr-4 font-medium">{feature}</td>
                  <td className="px-4 py-2.5 text-brand">{fts}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{psc}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{tps}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{ops}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            Pricing based on publicly available information at time of writing.
            All paid services require account creation and store your data on
            their servers.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 max-w-3xl space-y-2">
          {[
            {
              q: "Is this pay stub generator really free?",
              a: "Yes, completely free with no hidden fees, no premium tiers, and no per-stub charges. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. You can start generating pay stubs immediately without signing up or providing any personal information.",
            },
            {
              q: "Is my data private and secure?",
              a: "Yes. All processing happens locally in your browser. Your employer details, employee information, and pay data never leave your device. Nothing is uploaded to any server.",
            },
            {
              q: "Does it support hourly and salaried employees?",
              a: "Yes. Toggle between hourly and salary mode. For hourly workers, enter hours and rate and the amount calculates automatically. For salaried employees, enter the flat pay amount directly.",
            },
            {
              q: "What deductions are included?",
              a: "One-click setup for 6 standard US deductions: Federal Income Tax, State Income Tax, Social Security, Medicare, 401(k), and Health Insurance. You can also add custom deductions for dental/vision, HSA/FSA, Roth 401(k), life insurance, garnishments, union dues, and more.",
            },
            {
              q: "What PDF templates are available?",
              a: "Three templates: Standard (traditional table layout with borders), Modern (accent-colored header with card-based sections), and Compact (dense layout for minimal page usage). All templates support custom accent colors and company logos.",
            },
            {
              q: "Can I track year-to-date totals?",
              a: "Yes. Enter YTD amounts for each earnings and deduction row. YTD totals appear on the PDF when present. When you duplicate a stub from history for a new pay period, YTD values carry over.",
            },
            {
              q: "Can I save and reuse pay stubs?",
              a: "Yes. Your current draft auto-saves every second. You can also save completed stubs to a history panel, then load or duplicate them for future pay periods. Duplicating resets current amounts but preserves employee info, deductions, and YTD values.",
            },
            {
              q: "Can I add my company logo?",
              a: "Yes. Upload your company logo in PNG, JPEG, or SVG format (up to 2MB) on the Style tab. The logo appears on all three PDF templates.",
            },
            {
              q: "How do I print a pay stub?",
              a: "Click the Print button to open your browser\u2019s print dialog, or download the PDF and print from your PDF viewer. Both options produce professional, print-ready output.",
            },
          ].map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-lg border border-border px-4 py-3"
            >
              <summary className="cursor-pointer font-medium marker:text-brand">
                {q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
