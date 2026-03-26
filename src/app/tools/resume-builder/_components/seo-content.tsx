import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold">
          Free Resume Builder Online
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Create a professional, ATS-friendly resume in minutes with Free Tool
          Shed&apos;s Resume Builder. Unlike Resume.io, Zety, and Novoresume — which
          let you build for free then charge $25+/month to download — our tool
          gives you instant, watermark-free PDF export at no cost. No sign-up, no
          account, no hidden fees. Your data stays in your browser and is never
          sent to a server.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>4 ATS-friendly PDF templates (Modern, Classic, Professional, Minimal)</li>
          <li>Instant PDF download — no watermark, no paywall</li>
          <li>Real-time split-pane preview as you type</li>
          <li>Drag-and-drop section reordering</li>
          <li>Show/hide sections without losing data</li>
          <li>Professional photo upload support</li>
          <li>Customizable accent colors and fonts</li>
          <li>Multiple font size presets (Compact, Standard, Spacious)</li>
          <li>Save multiple resumes to local history</li>
          <li>Duplicate, rename, and manage saved resumes</li>
          <li>JSON export/import for backup and migration</li>
          <li>Print-ready output via browser print dialog</li>
          <li>11 section types: Summary, Experience, Education, Skills, Certifications, Languages, Projects, Volunteer, Awards, Publications, References</li>
          <li>Bullet-point editor for work experience entries</li>
          <li>Flexible date formatting (Jan 2024, 01/2024, 2024)</li>
          <li>Client-side only — data never leaves your browser</li>
        </ul>
      </section>

      {/* ── How To ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">How to Build Your Resume</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "1. Enter your personal information",
              desc: "Add your name, job title, email, phone, location, and optionally upload a professional photo.",
            },
            {
              title: "2. Fill in your experience and education",
              desc: "Add your work history with bullet points for achievements, plus your education details. Use the 'Current role' toggle for your present job.",
            },
            {
              title: "3. Add skills and optional sections",
              desc: "List your skills with proficiency levels. Add certifications, languages, projects, volunteer work, awards, publications, or references as needed.",
            },
            {
              title: "4. Customize the design",
              desc: "Choose from 4 professional templates, pick an accent color, select a font family, and adjust the font size to fit your content.",
            },
            {
              title: "5. Download your PDF",
              desc: "Click 'Download PDF' for an instant, watermark-free resume file. You can also print directly or save to history for later editing.",
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
          Free Tool Shed vs Paid Resume Builders
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold">Free Tool Shed</th>
                <th className="py-2 pr-4 font-semibold">Resume.io</th>
                <th className="py-2 pr-4 font-semibold">Zety</th>
                <th className="py-2 font-semibold">Novoresume</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free forever", "$24.95/mo", "$23.80/mo", "$19.99/mo"],
                ["PDF Download", "Free, no watermark", "Paid only", "Paid only", "Paid (1 free with watermark)"],
                ["Account Required", "No", "Yes", "Yes", "Yes"],
                ["Templates", "4 ATS-friendly", "20+", "18+", "12+"],
                ["ATS-Optimized", "Yes", "Yes", "Yes", "Yes"],
                ["Data Privacy", "Client-side only", "Server-stored", "Server-stored", "Server-stored"],
                ["Photo Support", "Yes", "Yes", "Yes", "Yes"],
                ["Section Reordering", "Yes", "Yes", "Limited", "Limited"],
                ["JSON Backup", "Yes", "No", "No", "No"],
                ["Custom Colors", "Yes", "Paid", "Paid", "Paid"],
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
              q: "Is this resume builder really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Are the resumes ATS-friendly?",
              a: "Yes. All four templates use real text (not images), standard fonts, and a clean heading hierarchy that Applicant Tracking Systems can parse correctly.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. You can start building your resume immediately without signing up or providing any personal information.",
            },
            {
              q: "Is my data private and secure?",
              a: "Your resume data never leaves your browser. All processing happens client-side on your device, so your personal and professional information stays completely private.",
            },
            {
              q: "Can I download my resume as a PDF?",
              a: "Yes — click 'Download PDF' and get an instant, high-quality PDF with no watermarks and no paywall. Unlike Resume.io and Zety, the download is truly free.",
            },
            {
              q: "Can I save multiple resumes?",
              a: "Yes. Save resumes to your local history, name them, and switch between versions. You can also export all resumes as JSON for backup and import them later.",
            },
            {
              q: "What sections can I add to my resume?",
              a: "11 section types are available: Professional Summary, Work Experience, Education, Skills, Certifications, Languages, Projects, Volunteer Experience, Awards & Honors, Publications, and References. You can add, remove, reorder, and show/hide any section.",
            },
            {
              q: "Can I customize the look of my resume?",
              a: "Yes. Choose from 4 professional templates, pick an accent color from presets or a custom hex value, select a font family (Helvetica, Times, Courier), and choose between Compact, Standard, or Spacious font sizes.",
            },
            {
              q: "How do I print my resume?",
              a: "Click the Print button to open your browser's print dialog, or download the PDF and print from your PDF viewer. Both options produce professional, print-ready output.",
            },
            {
              q: "Can I add a photo to my resume?",
              a: "Yes. Upload a professional headshot in PNG, JPEG, or WebP format. The photo appears in templates that support it (like the Modern sidebar layout) and in the PDF export.",
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
