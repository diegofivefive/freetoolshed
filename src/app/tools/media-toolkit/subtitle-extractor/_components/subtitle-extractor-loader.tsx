"use client";

import dynamic from "next/dynamic";

const SubtitleExtractor = dynamic(
  () => import("./subtitle-extractor").then((mod) => mod.SubtitleExtractor),
  { ssr: false }
);

export function SubtitleExtractorLoader() {
  return <SubtitleExtractor />;
}
