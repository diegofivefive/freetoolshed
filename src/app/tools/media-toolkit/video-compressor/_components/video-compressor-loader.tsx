"use client";

import dynamic from "next/dynamic";

const VideoCompressor = dynamic(
  () => import("./video-compressor").then((mod) => mod.VideoCompressor),
  { ssr: false }
);

export function VideoCompressorLoader() {
  return <VideoCompressor />;
}
