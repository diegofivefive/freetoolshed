import type { OutputFormat } from "./types";

export interface FormatConfig {
  label: string;
  extension: string;
  mimeType: string;
  /** ffmpeg codec flags (without bitrate — that's appended separately). */
  codecFlags: string[];
}

export const FORMAT_CONFIGS: Record<OutputFormat, FormatConfig> = {
  m4a: {
    label: "M4A (AAC)",
    extension: "m4a",
    mimeType: "audio/mp4",
    codecFlags: ["-c:a", "aac", "-movflags", "+faststart"],
  },
  mp3: {
    label: "MP3",
    extension: "mp3",
    mimeType: "audio/mpeg",
    codecFlags: ["-c:a", "libmp3lame"],
  },
  ogg: {
    label: "OGG (Vorbis)",
    extension: "ogg",
    mimeType: "audio/ogg",
    codecFlags: ["-c:a", "libvorbis"],
  },
};

export const BITRATE_PRESETS = [
  { label: "64 kbps (small)", value: "64k" },
  { label: "128 kbps (standard)", value: "128k" },
  { label: "192 kbps (high)", value: "192k" },
  { label: "256 kbps (very high)", value: "256k" },
  { label: "320 kbps (maximum)", value: "320k" },
] as const;

export const DEFAULT_MERGE_OPTIONS = {
  outputFormat: "m4a" as const,
  outputBitrate: "128k",
  chapterMarkers: true,
  outputFilename: "merged-audio",
};

/** Accepted audio MIME types for the file picker. */
export const ACCEPTED_AUDIO_TYPES =
  "audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/ogg,audio/wav,audio/flac,audio/aac,audio/webm";

/** Warn the user if total input size exceeds this threshold (bytes). */
export const MEMORY_WARNING_BYTES = 1024 * 1024 * 1024; // 1 GB

/** Sub-tools shown on the hub page. */
export const TOOLKIT_TOOLS = [
  {
    name: "Audio Merger",
    slug: "audio-merger",
    description:
      "Combine multiple audio files into a single file. Perfect for audiobooks, podcast compilations, and music playlists.",
    icon: "Combine",
    status: "live" as const,
  },
  {
    name: "Audio Converter",
    slug: "audio-converter",
    description:
      "Convert between MP3, M4A, WAV, OGG, FLAC, and more. Single file or batch mode.",
    icon: "ArrowLeftRight",
    status: "live" as const,
  },
  {
    name: "Video Compressor",
    slug: "video-compressor",
    description:
      "Reduce video file size with quality presets. H.264 encoding right in your browser.",
    icon: "Minimize2",
    status: "live" as const,
  },
  {
    name: "Video Converter",
    slug: "video-converter",
    description:
      "Convert between MP4, WebM, MOV, AVI, and GIF. No uploads, no file size limits.",
    icon: "Film",
    status: "live" as const,
  },
  {
    name: "Audio Trimmer",
    slug: "audio-trimmer",
    description:
      "Trim audio files or split them by time markers. Quick and precise cuts.",
    icon: "Scissors",
    status: "live" as const,
  },
  {
    name: "Image Converter",
    slug: "image-converter",
    description:
      "Bulk convert images between PNG, JPG, WebP, and AVIF with quality controls.",
    icon: "Image",
    status: "live" as const,
  },
  {
    name: "Video Trimmer",
    slug: "video-trimmer",
    description:
      "Quick-cut video clips without re-encoding the entire file. Fast stream copy mode.",
    icon: "ScissorsLineDashed",
    status: "live" as const,
  },
  {
    name: "Audio Extractor",
    slug: "audio-extractor",
    description:
      "Extract audio tracks from video files. Convert to MP3, M4A, WAV, OGG, or FLAC.",
    icon: "Music",
    status: "live" as const,
  },
  {
    name: "Subtitle Extractor",
    slug: "subtitle-extractor",
    description:
      "Pull embedded subtitle tracks from MKV, MP4, and other video containers.",
    icon: "Subtitles",
    status: "live" as const,
  },
  {
    name: "Metadata Editor",
    slug: "metadata-editor",
    description:
      "View, edit, and strip metadata tags from audio and video files.",
    icon: "Tags",
    status: "live" as const,
  },
] as const;
