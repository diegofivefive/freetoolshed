import { Separator } from "@/components/ui/separator";

export function SeoContent() {
  return (
    <div className="mt-16 space-y-12">
      <Separator />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-semibold">
          Free OCR — Extract Text from Images &amp; Scanned PDFs
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Scanned documents, photos of receipts, screenshots with text — they
          all contain information you can&apos;t copy-paste. Until now, extracting
          that text meant paying for Adobe Acrobat ($22.99/month) or ABBYY
          FineReader ($199 one-time). Free Tool Shed&apos;s OCR Scanner does the
          same thing for free, right in your browser. Drop a file, get editable
          text in seconds. No account, no install, no upload to a server.
        </p>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          The tool uses tesseract.js — the same Tesseract OCR engine that powers
          Google&apos;s document scanning — compiled to WebAssembly so it runs
          entirely on your machine. Your files never leave your device. It
          supports 15+ languages, handles multi-page PDFs, and exports to plain
          text, Word documents, or searchable PDFs with an invisible text layer
          over your original scan.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Drag-and-drop image upload (PNG, JPG, TIFF, BMP, WebP)</li>
          <li>Scanned PDF support — each page rendered and OCR&apos;d</li>
          <li>15+ OCR languages (English, French, German, Spanish, and more)</li>
          <li>Batch processing — add multiple files at once</li>
          <li>Real-time progress tracking per page</li>
          <li>Confidence score for each recognized page</li>
          <li>Editable text output — fix errors before exporting</li>
          <li>Word and character count in real time</li>
          <li>Export as plain text (.txt)</li>
          <li>Export as Word document (.docx) with page separators</li>
          <li>Export as searchable PDF with invisible text overlay</li>
          <li>Copy extracted text to clipboard</li>
          <li>Re-OCR all pages with a different language</li>
          <li>File thumbnails with per-page status indicators</li>
          <li>Language and export format preferences saved across sessions</li>
          <li>Max 50 MB per file, up to 50 PDF pages</li>
          <li>100% client-side — files never leave your browser</li>
          <li>Powered by tesseract.js WebAssembly engine</li>
        </ul>
      </section>

      {/* ── How To ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold">
          How to Extract Text from an Image or PDF (4 Steps)
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "1. Upload your file",
              desc: "Drag and drop an image or scanned PDF onto the upload area, or click to browse. You can add multiple files at once — images and PDFs can be mixed. Each PDF page is automatically rendered as an image for OCR processing.",
            },
            {
              title: "2. Choose your language",
              desc: "Select the OCR language from the dropdown in the toolbar. The default is English, but you can switch to any of the 15+ supported languages including French, German, Spanish, Chinese, Japanese, Arabic, and Hindi. The OCR engine reinitializes automatically when you change languages.",
            },
            {
              title: "3. Review and edit the text",
              desc: "Once processing completes, the extracted text appears in the right panel. The text is fully editable — fix any OCR errors, remove headers or footers, or reformat the content. Word and character counts update as you type.",
            },
            {
              title: "4. Export the result",
              desc: "Choose your export format: Plain Text (.txt) for simple text, Word Document (.docx) for formatted output with page separators, or Searchable PDF to create a PDF with your original scan plus an invisible text layer for search and selection. Click Download or use Copy Text for the clipboard.",
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
          Free Tool Shed vs Paid OCR Software
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold">Free Tool Shed</th>
                <th className="py-2 pr-4 font-semibold">Adobe Acrobat</th>
                <th className="py-2 pr-4 font-semibold">ABBYY FineReader</th>
                <th className="py-2 font-semibold">Google Drive OCR</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Price", "Free forever", "$22.99/mo", "$199 one-time", "Free (with limits)"],
                ["Installation", "None (browser)", "Desktop app", "Desktop app", "None (web)"],
                ["Account Required", "No", "Yes (Adobe ID)", "Yes", "Yes (Google)"],
                ["Image OCR", "Yes", "Yes", "Yes", "Yes"],
                ["PDF OCR", "Yes", "Yes", "Yes", "Yes (Google Docs)"],
                ["Languages", "15+", "20+", "200+", "200+"],
                ["Batch Processing", "Yes", "Yes", "Yes", "No"],
                ["Searchable PDF Export", "Yes", "Yes", "Yes", "No"],
                ["Word (.docx) Export", "Yes", "Yes", "Yes", "Yes"],
                ["Editable Output", "Yes", "Limited", "Yes", "Yes (in Docs)"],
                ["Handwriting Recognition", "Basic", "Advanced", "Advanced", "Basic"],
                ["Table Recognition", "No", "Yes", "Advanced", "Basic"],
                ["Data Privacy", "Client-side only", "Cloud upload", "Local", "Cloud upload"],
                ["Offline Support", "Yes (after load)", "Yes", "Yes", "No"],
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
              q: "Is this OCR tool really free?",
              a: "Yes, completely free. No hidden fees, no premium tiers, and no sign-up required. The tool is ad-supported so it can remain free for everyone.",
            },
            {
              q: "Do my files get uploaded to a server?",
              a: "No. All OCR processing runs locally in your browser using WebAssembly (tesseract.js). Your images and PDFs never leave your device. There is no server-side component — the page works even offline once loaded.",
            },
            {
              q: "How accurate is the OCR?",
              a: "For clean scans and printed text, expect 90–99% accuracy depending on font quality, resolution, and contrast. Handwritten text, heavily skewed images, or very low-resolution scans may produce lower accuracy. Higher-resolution input images (300 DPI+) give the best results.",
            },
            {
              q: "What languages are supported?",
              a: "15+ languages: English, French, German, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Japanese, Korean, Chinese (Simplified and Traditional), Arabic, and Hindi. Select the language from the toolbar dropdown before processing.",
            },
            {
              q: "Can I OCR a multi-page PDF?",
              a: "Yes. Drop a PDF file and each page is automatically rendered as an image and OCR'd individually. The tool supports up to 50 pages per PDF. All page text is combined with page separators in the output.",
            },
            {
              q: "What is a searchable PDF?",
              a: "A searchable PDF contains your original scanned image with an invisible text layer placed on top. This means the PDF looks exactly like the original scan, but you can select, search, and copy text from it. It's the standard output format of professional OCR software.",
            },
            {
              q: "How do I get the best OCR results?",
              a: "Use high-resolution scans (300 DPI or higher), ensure the text is not skewed or rotated, and use good contrast (dark text on light background). For photos, make sure the text is in focus and evenly lit. Select the correct language before processing.",
            },
            {
              q: "Can I edit the extracted text?",
              a: "Yes. The text output panel is fully editable. Fix any OCR errors, remove unwanted headers or footers, or reformat the content before exporting. Word and character counts update in real time as you type.",
            },
            {
              q: "Why use this instead of Adobe Acrobat?",
              a: "Adobe Acrobat costs $22.99/month and requires a desktop installation plus an Adobe ID. This tool is free, runs in your browser, needs no account, and keeps your files private (no cloud upload). For basic OCR tasks — extracting text from scans, converting images to text, creating searchable PDFs — it does the same job at zero cost.",
            },
            {
              q: "Is there a file size limit?",
              a: "The maximum file size is 50 MB per file, and PDFs are limited to 50 pages. These limits exist to prevent browser memory issues. For most scanned documents and images, this is more than enough.",
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
