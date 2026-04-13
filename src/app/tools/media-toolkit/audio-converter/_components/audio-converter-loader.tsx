"use client";

import dynamic from "next/dynamic";

const AudioConverter = dynamic(
  () => import("./audio-converter").then((mod) => mod.AudioConverter),
  { ssr: false }
);

export function AudioConverterLoader() {
  return <AudioConverter />;
}
