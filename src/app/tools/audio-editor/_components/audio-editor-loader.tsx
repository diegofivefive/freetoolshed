"use client";

import dynamic from "next/dynamic";

const AudioEditor = dynamic(
  () => import("./audio-editor").then((mod) => mod.AudioEditor),
  { ssr: false }
);

export function AudioEditorLoader() {
  return <AudioEditor />;
}
