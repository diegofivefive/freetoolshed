import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* Intro */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Free Invoice Generator Online
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Create polished, professional invoices in minutes — completely free and
          without signing up. Free Tool Shed&apos;s invoice generator is a free
          alternative to FreshBooks, QuickBooks, and Wave. Your data never leaves
          your browser, so your business information stays private. Just fill in
          your details, pick a template, and download a print-ready PDF.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
        <ul className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "3 professional PDF templates (Modern, Classic, Compact)",
            "Invoice history — save, load, duplicate, and manage invoices",
            "Status tracking — mark invoices as Draft, Sent, Paid, or Overdue",
            "Export and import invoices as JSON for backup and migration",
            "Automatic tax calculations with per-item tax rates",
            "20 currencies with proper symbol and decimal formatting",
            "Company logo upload — appears on invoice and PDF",
            "Flexible payment terms (Net 15, 30, 60 or custom)",
            "Unit types for line items (hour, day, item, unit, service)",
            "4 date format options (Month D YYYY, MM/DD, DD/MM, YYYY-MM-DD)",
            "Payment link field — include a payment URL on your invoice",
            "Save company defaults for faster invoice creation",
            "Percentage or flat-rate discounts",
            "Auto-incrementing invoice numbers",
            "Live preview with real-time updates as you type",
            "Custom accent color to match your brand",
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
          How to Create a Professional Invoice
        </h2>
        <ol className="mt-4 max-w-3xl space-y-4">
          {[
            {
              title: "Enter your business details",
              desc: "Add your company name, address, email, and optionally upload your logo.",
            },
            {
              title: "Add your client information",
              desc: "Fill in the client name, email, and billing address.",
            },
            {
              title: "Add line items",
              desc: "Enter each product or service with a description, quantity, unit type, and unit price. Enable per-item taxes if needed.",
            },
            {
              title: "Choose a template and customize",
              desc: "Pick from Modern, Classic, or Compact templates. Set your brand accent color, date format, and invoice status.",
            },
            {
              title: "Download or save your invoice",
              desc: "Download a print-ready PDF, save to your invoice history for later, or export as JSON for backup.",
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
          Free Invoice Generator vs Paid Alternatives
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full max-w-3xl text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium text-brand">
                  Free Tool Shed
                </th>
                <th className="px-4 py-3 font-medium">FreshBooks</th>
                <th className="px-4 py-3 font-medium">QuickBooks</th>
                <th className="px-4 py-3 font-medium">Wave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Price", "Free", "From $19/mo", "From $30/mo", "Free*"],
                ["Sign-up Required", "No", "Yes", "Yes", "Yes"],
                ["PDF Export", "Yes", "Yes", "Yes", "Yes"],
                ["Custom Templates", "3 included", "Yes", "Yes", "Limited"],
                ["Logo Upload", "Yes", "Yes", "Yes", "Yes"],
                ["Multi-Currency", "20 currencies", "Yes", "Yes", "Limited"],
                ["Invoice History", "Yes (local)", "Yes", "Yes", "Yes"],
                ["Status Tracking", "Yes", "Yes", "Yes", "Limited"],
                ["Export/Import JSON", "Yes", "No", "No", "No"],
                ["Client-Side Privacy", "Yes", "No", "No", "No"],
                ["Tax Calculations", "Yes", "Yes", "Yes", "Yes"],
                ["Recurring Invoices", "No", "Yes", "Yes", "Yes"],
                ["Payment Processing", "No", "Yes", "Yes", "Yes"],
              ].map(([feature, fts, fb, qb, wave]) => (
                <tr key={feature}>
                  <td className="py-2.5 pr-4 font-medium">{feature}</td>
                  <td className="px-4 py-2.5 text-brand">{fts}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fb}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{qb}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{wave}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            * Wave is free for invoicing but requires account creation and
            stores your data on their servers.
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
              q: "Is this invoice generator really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. You can start creating invoices immediately without signing up or providing any personal information.",
            },
            {
              q: "Is my data private and secure?",
              a: "Your invoice data never leaves your browser. All processing happens client-side on your device, so your business information stays completely private.",
            },
            {
              q: "What invoice templates are available?",
              a: "Three professional templates are included: Modern (clean and minimal), Classic (traditional business style), and Compact (dense layout for invoices with many line items).",
            },
            {
              q: "Can I add my company logo?",
              a: "Yes. Upload your company logo in PNG, JPEG, or SVG format and it will appear on your invoice and PDF export.",
            },
            {
              q: "What currencies are supported?",
              a: "20 major currencies are supported including USD, EUR, GBP, CAD, AUD, JPY, CHF, INR, and more. Currency symbols and decimal formatting are handled automatically.",
            },
            {
              q: "Can I save my invoices?",
              a: "Yes. Your current draft auto-saves as you type. You can also save invoices to your history for later access, duplicate them, or export all invoices as JSON for backup.",
            },
            {
              q: "Can I track invoice status?",
              a: "Yes. Mark each invoice as Draft, Sent, Paid, or Overdue. The status appears as a watermark on the PDF and in your invoice history.",
            },
            {
              q: "How do I print my invoice?",
              a: "Click the Print button to open your browser's print dialog, or download the PDF and print from your PDF viewer. Both options produce professional, print-ready output.",
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
