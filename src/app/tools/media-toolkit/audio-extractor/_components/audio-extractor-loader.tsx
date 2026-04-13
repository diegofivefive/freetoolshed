"use client";

import dynamic from "next/dynamic";

const AudioExtractor = dynamic(
  () => import("./audio-extractor").then((mod) => mod.AudioExtractor),
  { ssr: false }
);

export function AudioExtractorLoader() {
  return <AudioExtractor />;
}
