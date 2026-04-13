"use client";

import dynamic from "next/dynamic";

const ImageConverter = dynamic(
  () => import("./image-converter").then((mod) => mod.ImageConverter),
  { ssr: false }
);

export function ImageConverterLoader() {
  return <ImageConverter />;
}
