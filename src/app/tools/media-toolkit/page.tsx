import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { TOOLKIT_TOOLS } from "@/lib/media-toolkit/constants";
import { AdSlot } from "@/components/layout/ad-slot";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combine,
  ArrowLeftRight,
  Minimize2,
  Film,
  Scissors,
  Image,
  ScissorsLineDashed,
  Tags,
  Music,
  Subtitles,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ToolByline } from "@/components/shared/tool-byline";
import { ToolTldr } from "@/components/shared/tool-tldr";
import { SeoContent } from "./_components/seo-content";

export const metadata = generatePageMetadata({
  title: "Free Media Toolkit Online — No Sign Up",
  description:
    "Merge, convert, compress, and trim audio and video files — all in your browser. A free alternative to Adobe Media Encoder. No sign-up required.",
  path: "/tools/media-toolkit",
});

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine,
  ArrowLeftRight,
  Minimize2,
  Film,
  Scissors,
  Image,
  ScissorsLineDashed,
  Tags,
  Music,
  Subtitles,
};

export default function MediaToolkitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Media Toolkit",
    description:
      "A collection of free browser-based tools for merging, converting, compressing, and trimming audio and video files.",
    url: "https://freetoolshed.com/tools/media-toolkit",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Media Toolkit" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Media Toolkit
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Merge, convert, compress, and trim audio and video files — a free
        alternative to Adobe Media Encoder. Everything runs in your browser.
      </p>

      <ToolTldr>
        A collection of browser-based tools for audio and video work: merge
        audiobook chapters into a single M4A, convert between formats, compress
        video, trim clips, extract audio from video, edit metadata, pull
        subtitles. Every tool runs on ffmpeg.wasm in your browser tab — no
        upload, no install, no account. A free alternative to Adobe Media
        Encoder, HandBrake, and similar paid or install-heavy desktop suites.
      </ToolTldr>

      <ToolByline />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLKIT_TOOLS.map((tool) => {
          const Icon = ICON_MAP[tool.icon];
          const isLive = tool.status === "live";

          const card = (
            <Card
              className={`relative h-full transition-colors ${
                isLive
                  ? "hover:border-brand/50 hover:bg-muted/50"
                  : "opacity-60"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="size-4 text-brand" />}
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                  </div>
                  {!isLive && (
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          );

          if (isLive) {
            return (
              <Link
                key={tool.slug}
                href={`/tools/media-toolkit/${tool.slug}`}
              >
                {card}
              </Link>
            );
          }

          return <div key={tool.slug}>{card}</div>;
        })}
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
