"use client";

import dynamic from "next/dynamic";

const AudioMerger = dynamic(
  () => import("./audio-merger").then((mod) => mod.AudioMerger),
  { ssr: false }
);

export function AudioMergerLoader() {
  return <AudioMerger />;
}
