"use client";

import { useRef, useEffect } from "react";
import { Atom } from "lucide-react";

interface MolecularViewerProps {
  sdfData: string;
  compoundName: string;
}

export function MolecularViewer({ sdfData, compoundName }: MolecularViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ReturnType<typeof import("3dmol")["createViewer"]> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    async function init() {
      const $3Dmol = await import("3dmol");

      if (disposed || !containerRef.current) return;

      // Clear any previous viewer
      if (viewerRef.current) {
        viewerRef.current.clear();
        containerRef.current.innerHTML = "";
      }

      // Detect dark/light mode from the document
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? 0x18181b : 0xffffff;

      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: bgColor,
        antialias: true,
      });

      viewer.addModel(sdfData, "sdf");
      viewer.setStyle({}, {
        stick: { radius: 0.14, colorscheme: "Jmol" },
        sphere: { scale: 0.28, colorscheme: "Jmol" },
      });
      viewer.zoomTo();
      viewer.render();

      viewerRef.current = viewer;
    }

    init();

    return () => {
      disposed = true;
      if (viewerRef.current) {
        viewerRef.current.clear();
        viewerRef.current = null;
      }
    };
  }, [sdfData]);

  useEffect(() => {
    if (!containerRef.current || !viewerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (viewerRef.current) {
        viewerRef.current.resize();
        viewerRef.current.render();
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        3D Structure
      </span>
      <div className="mt-1.5 overflow-hidden rounded-md border border-border">
        <div
          ref={containerRef}
          className="h-[280px] w-full cursor-grab active:cursor-grabbing"
          style={{ position: "relative" }}
        />
        <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-1.5">
          <Atom className="size-3 text-brand" />
          <span className="text-[10px] text-muted-foreground">
            {compoundName}
          </span>
          <span className="ml-auto text-[9px] text-muted-foreground/50">
            Drag to rotate · Scroll to zoom
          </span>
        </div>
      </div>
    </div>
  );
}
