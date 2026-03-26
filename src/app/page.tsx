import Link from "next/link";
import { Wrench } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    name: "Resume Builder",
    slug: "resume-builder",
    description:
      "Build professional, ATS-friendly resumes with multiple templates and instant PDF export.",
    category: "Career",
    icon: "FileUser",
    paidAlternative: "Resume.io",
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                <Card className="h-full transition-colors hover:border-brand/50 hover:bg-muted/50">
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
    </main>
  );
}
