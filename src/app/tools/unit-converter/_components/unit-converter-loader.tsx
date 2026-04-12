"use client";

import dynamic from "next/dynamic";

const UnitConverter = dynamic(
  () => import("./unit-converter").then((mod) => mod.UnitConverter),
  { ssr: false }
);

export function UnitConverterLoader() {
  return <UnitConverter />;
}
