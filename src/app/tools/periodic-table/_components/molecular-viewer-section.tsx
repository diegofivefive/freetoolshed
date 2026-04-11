"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { fetchMolecularData, type MolecularData } from "@/lib/periodic-table/pubchem";

const MolecularViewer = dynamic(
  () => import("./molecular-viewer").then((mod) => mod.MolecularViewer),
  { ssr: false }
);

interface MolecularViewerSectionProps {
  formula: string | null;
}

export function MolecularViewerSection({ formula }: MolecularViewerSectionProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MolecularData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!formula) {
      setData(null);
      setError(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(false);

      const result = await fetchMolecularData(formula, controller.signal);

      if (cancelled) return;

      if (result) {
        setData(result);
        setError(false);
      } else {
        setData(null);
        setError(true);
      }
      setLoading(false);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [formula]);

  if (!formula) return null;

  if (loading) {
    return (
      <div className="mt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          3D Structure
        </span>
        <div className="mt-1.5 flex h-[280px] items-center justify-center rounded-md border border-border bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-5 animate-spin text-brand" />
            <span className="text-[10px] text-muted-foreground">
              Loading 3D model…
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          3D Structure
        </span>
        <div className="mt-1.5 flex h-[100px] items-center justify-center rounded-md border border-border/50 bg-muted/10">
          <span className="text-[10px] text-muted-foreground/60">
            Structure not available for {formula}
          </span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <MolecularViewer sdfData={data.sdfData} compoundName={data.compoundName} is2d={data.is2d} />
  );
}
