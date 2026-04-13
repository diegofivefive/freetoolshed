"use client";

import dynamic from "next/dynamic";

const VideoTrimmer = dynamic(
  () => import("./video-trimmer").then((mod) => mod.VideoTrimmer),
  { ssr: false }
);

export function VideoTrimmerLoader() {
  return <VideoTrimmer />;
}
