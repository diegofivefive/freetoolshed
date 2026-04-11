import Link from "next/link";
import { Wrench, Shield, Zap, DollarSign } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Tool } from "@/types";

const TOOLS: Tool[] = [
  {
    name: "Invoice Generator",
    slug: "invoice-generator",
    description:
      "Create professional invoices with custom templates, tax calculations, and instant PDF export.",
    category: "Business",
    icon: "FileText",
    paidAlternative: "FreshBooks",
  },
  {
    name: "Pay Stub Generator",
    slug: "pay-stub-generator",
    description:
      "Generate professional pay stubs with earnings, deductions, YTD tracking, and instant PDF export.",
    category: "Business",
    icon: "Receipt",
    paidAlternative: "PayStubCreator",
  },
  {
    name: "Resume Builder",
    slug: "resume-builder",
    description:
      "Build professional, ATS-friendly resumes with multiple templates and instant PDF export.",
    category: "Career",
    icon: "FileUser",
    paidAlternative: "Resume.io",
  },
  {
    name: "Floor Plan Maker",
    slug: "floor-plan-maker",
    description:
      "Design room layouts with drag-and-drop furniture, walls, and rooms. Export as SVG, PNG, or PDF.",
    category: "Design",
    icon: "LayoutGrid",
    paidAlternative: "SmartDraw",
    badge: "Under Construction",
  },
  {
    name: "Audio Editor",
    slug: "audio-editor",
    description:
      "Edit, trim, merge, and convert audio files with a visual waveform editor. Export as WAV, MP3, or OGG.",
    category: "Media",
    icon: "AudioLines",
    paidAlternative: "Adobe Audition",
  },
  {
    name: "Flowchart Maker",
    slug: "flowchart-maker",
    description:
      "Create flowcharts, process diagrams, and decision trees with smart connection routing. Export as SVG, PNG, or PDF.",
    category: "Design",
    icon: "GitBranch",
    paidAlternative: "Lucidchart",
  },
  {
    name: "OCR Scanner",
    slug: "ocr-scanner",
    description:
      "Extract text from images and scanned PDFs with browser-based OCR. Export as .txt, .docx, or searchable PDF.",
    category: "Document",
    icon: "ScanText",
    paidAlternative: "Adobe Acrobat",
  },
  {
    name: "Screen Recorder",
    slug: "screen-recorder",
    description:
      "Record your screen, window, or tab with a webcam picture-in-picture overlay. Trim and export as WebM, MP4, or GIF.",
    category: "Media",
    icon: "Video",
    paidAlternative: "Loom",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Free Tools That Replace Paid Software
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          No sign up, no downloads — just open and use. Every tool is free, forever.
        </p>
      </section>

      {TOOLS.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold">All Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                <Card className="relative h-full overflow-hidden transition-colors hover:border-brand/50 hover:bg-muted/50">
                  {tool.badge && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                      <span className="-rotate-12 rounded-md border-2 border-brand/60 px-4 py-1.5 text-lg font-bold uppercase tracking-wider text-brand/60">
                        {tool.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      {tool.paidAlternative && (
                        <Badge variant="secondary" className="text-xs">
                          Replaces {tool.paidAlternative}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <Wrench className="mb-4 size-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Tools Coming Soon!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re building free alternatives to expensive software. Check back soon.
          </p>
        </section>
      )}

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Why Free Tool Shed?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Too many essential tools hide behind paywalls, subscriptions, and mandatory
          sign-ups. Need to generate an invoice? That&apos;ll be $15/month. Want to build
          a resume? Hand over your email first. We think that&apos;s wrong.
        </p>
        <p className="mt-3 text-muted-foreground">
          Free Tool Shed is a growing collection of browser-based tools that do the same
          job as paid software — completely free, with no account required. Each tool is
          built to be fast, private, and production-quality, so you never have to
          compromise just because you&apos;re not paying.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand">
              <DollarSign className="size-5" />
              <h3 className="font-semibold">100% Free, No Catch</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No subscriptions, no freemium limits, no &quot;free trial&quot; that expires
              in 7 days. Our tools are ad-supported so they stay free for everyone.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand">
              <Shield className="size-5" />
              <h3 className="font-semibold">Private by Design</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Everything runs in your browser. Your files, data, and documents never
              leave your device — we can&apos;t see them, and neither can anyone else.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand">
              <Zap className="size-5" />
              <h3 className="font-semibold">No Sign Up Required</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Just open a tool and start using it. No account creation, no email
              verification, no onboarding flow. Your time matters.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          How It Works
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every tool on Free Tool Shed is a standalone web application that runs entirely
          in your browser. When you create an invoice, build a resume, or use any of our
          tools, the processing happens on your machine using modern web technologies
          like WebAssembly and the Web Audio API. There are no servers storing your data
          and no cloud accounts to manage.
        </p>
        <p className="mt-3 text-muted-foreground">
          Your work is automatically saved to your browser&apos;s local storage so you
          can pick up where you left off. When you&apos;re ready, export your finished
          work as a PDF or other standard format — the file goes straight to your
          device.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          More Tools on the Way
        </h2>
        <p className="mt-4 text-muted-foreground">
          We&apos;re actively building new tools and adding them regularly. From document
          editors and image converters to calculators and data formatters — if there&apos;s a
          paid tool that should be free, we&apos;re working on it. Bookmark this page and
          check back soon, or{" "}
          <Link href="/contact" className="text-brand underline underline-offset-4">
            let us know
          </Link>{" "}
          which tool you&apos;d like to see next.
        </p>
      </section>
    </main>
  );
}
