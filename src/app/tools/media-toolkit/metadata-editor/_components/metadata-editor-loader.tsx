"use client";

import dynamic from "next/dynamic";

const MetadataEditor = dynamic(
  () => import("./metadata-editor").then((mod) => mod.MetadataEditor),
  { ssr: false }
);

export function MetadataEditorLoader() {
  return <MetadataEditor />;
}
