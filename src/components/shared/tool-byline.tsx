import Link from "next/link";
import { generatePersonJsonLd, author } from "@/lib/author";

interface ToolBylineProps {
  updated?: string;
}

export function ToolByline({ updated }: ToolBylineProps) {
  const personJsonLd = generatePersonJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <p className="mt-3 text-sm text-muted-foreground">
        Built and maintained by{" "}
        <Link
          href="/about"
          className="text-foreground underline-offset-4 hover:underline"
        >
          {author.name}
        </Link>
        {updated ? ` · Updated ${updated}` : null}
      </p>
    </>
  );
}
