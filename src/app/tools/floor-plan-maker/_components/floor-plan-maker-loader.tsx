"use client";

import dynamic from "next/dynamic";

const FloorPlanMaker = dynamic(
  () =>
    import("./floor-plan-maker").then((mod) => mod.FloorPlanMaker),
  { ssr: false }
);

export function FloorPlanMakerLoader() {
  return <FloorPlanMaker />;
}
