import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { SeoContent } from "./_components/seo-content";
import { ImageConverterLoader } from "./_components/image-converter-loader";
import { AdSlot } from "@/components/layout/ad-slot";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

const toolConfig = {
  name: "Image Converter",
  description:
    "Convert images between PNG, JPG, WebP, and AVIF with quality controls. Bulk convert, resize, and download — free, no sign-up, 100% browser-based.",
  slug: "media-toolkit/image-converter",
  paidAlternative: "Adobe Photoshop",
};

export const metadata = generateToolMetadata(toolConfig);

export default function ImageConverterPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I convert PNG to WebP for free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Drop your PNG files in, select WebP as the output format, set quality, and click Convert. All processing happens in your browser — no sign-up or uploads needed.",
        },
      },
      {
        "@type": "Question",
        name: "Does converting to JPG remove transparency?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. JPG doesn't support transparency. Transparent areas are filled with white. If you need transparency, use PNG or WebP instead.",
        },
      },
      {
        "@type": "Question",
        name: "What is WebP and why should I use it?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WebP is a modern image format by Google that offers 25-35% smaller file sizes than JPG at the same quality. It supports both lossy and lossless compression plus transparency. All modern browsers support it.",
        },
      },
      {
        "@type": "Question",
        name: "Is AVIF better than WebP?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AVIF typically achieves 20% smaller files than WebP at similar quality, with better handling of fine detail. However, AVIF encoding is slower and browser support is slightly less universal. Both are excellent modern formats.",
        },
      },
      {
        "@type": "Question",
        name: "Can I resize images while converting?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Set a max dimension (e.g. 1920px) and images larger than that will be scaled down proportionally. Smaller images are left at their original size.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No hard limit. Since everything runs in your browser, the only constraint is your device's available memory. Most devices handle images up to 50-100 megapixels without issues.",
        },
      },
      {
        "@type": "Question",
        name: "Are my images uploaded anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The converter runs entirely in your browser using the Canvas API. Your images never leave your device — there are no server uploads at all.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Media Toolkit", href: "/tools/media-toolkit" },
          { label: "Image Converter" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Image Converter
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Bulk convert images between PNG, JPG, WebP, and AVIF — a free
        alternative to Adobe Photoshop&apos;s batch export. No sign-up required.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">4 Output Formats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Convert to PNG, JPG, WebP, or AVIF. Lossy formats include quality
            control.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Batch Convert</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop multiple images and convert them all at once. Download
            individually or all at once.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Resize on Convert</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optionally set a max dimension to scale down large images while
            preserving aspect ratio.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Client-Side</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uses browser Canvas API — your images never leave your device. No
            uploads, no file limits.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ImageConverterLoader />
      </div>
      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>
      <SeoContent />
    </>
  );
}
