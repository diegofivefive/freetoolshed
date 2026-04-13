"use client";

import dynamic from "next/dynamic";

const AudioTrimmer = dynamic(
  () => import("./audio-trimmer").then((mod) => mod.AudioTrimmer),
  { ssr: false }
);

export function AudioTrimmerLoader() {
  return <AudioTrimmer />;
}
