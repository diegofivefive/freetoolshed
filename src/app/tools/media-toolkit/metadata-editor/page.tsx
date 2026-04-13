import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SeoContent } from "./_components/seo-content";
import { MetadataEditorLoader } from "./_components/metadata-editor-loader";
import { AdSlot } from "@/components/layout/ad-slot";

const toolConfig = {
  name: "Metadata Editor",
  description:
    "View, edit, and strip metadata from audio and video files. Edit MP3 tags, remove personal data, and inspect file properties.",
  slug: "media-toolkit/metadata-editor",
  paidAlternative: "Mp3tag",
};

export const metadata = generateToolMetadata(toolConfig);

export default function MetadataEditorPage() {
  const jsonLd = generateToolJsonLd(toolConfig);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this metadata editor free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No sign-up, no file limits. The tool is ad-supported to stay free for everyone.",
        },
      },
      {
        "@type": "Question",
        name: "What file types are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Audio files (MP3, M4A, OGG, FLAC, WAV) and video files (MP4, WebM, MKV, MOV, AVI). Any media file that ffmpeg can read.",
        },
      },
      {
        "@type": "Question",
        name: "Can I edit MP3 ID3 tags?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can edit common tags like title, artist, album, year, genre, and track number. Changes are written using stream copy, so the audio is not re-encoded.",
        },
      },
      {
        "@type": "Question",
        name: "Can I strip all metadata from a file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Strip All Metadata feature removes all metadata tags using ffmpeg's -map_metadata -1 flag. This is useful for privacy — removing personal info, location data, or software tags before sharing files.",
        },
      },
      {
        "@type": "Question",
        name: "Does editing metadata re-encode the file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Metadata editing uses stream copy (-c copy), so the audio and video data are not re-encoded. Only the container metadata is modified.",
        },
      },
      {
        "@type": "Question",
        name: "Do my files get uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Everything runs client-side using ffmpeg.wasm. Your files never leave your device.",
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
          { label: "Metadata Editor" },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        Free Metadata Editor — View & Edit Media Tags
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        View, edit, and strip metadata from audio and video files — a free
        alternative to Mp3tag. No sign-up, no re-encoding.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">View File Info</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See format, duration, bitrate, streams, and all metadata tags at
            a glance. Works with audio and video files.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Edit Tags</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit title, artist, album, year, genre, and more. Add custom
            metadata fields. Stream copy preserves quality.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Strip Metadata</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Remove all metadata tags in one click. Great for privacy — strip
            personal info, location data, or software tags.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">100% Private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All processing happens in your browser using WebAssembly. Your
            files never leave your device.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <MetadataEditorLoader />
      </div>

      <div className="my-8 flex justify-center">
        <AdSlot slot="mid-content" />
      </div>

      <SeoContent />
    </>
  );
}
