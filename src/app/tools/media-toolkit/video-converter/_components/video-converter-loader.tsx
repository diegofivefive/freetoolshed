"use client";

import dynamic from "next/dynamic";

const VideoConverter = dynamic(
  () => import("./video-converter").then((mod) => mod.VideoConverter),
  { ssr: false }
);

export function VideoConverterLoader() {
  return <VideoConverter />;
}
