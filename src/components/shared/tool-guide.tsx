"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface ToolGuideSection {
  title: string;
  content: string;
  steps?: string[];
}

interface ToolGuideProps {
  sections: ToolGuideSection[];
  isOpen: boolean;
  onToggle: () => void;
}

function GuideSections({ sections }: { sections: ToolGuideSection[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <div key={i} className={i > 0 ? "mt-4" : ""}>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">{section.content}</p>
          {section.steps && (
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              {section.steps.map((step, j) => (
                <li key={j}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </>
  );
}

export function ToolGuide({ sections, isOpen, onToggle }: ToolGuideProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.getElementById("tool-guide-portal");
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Desktop: portal into sidebar
  const desktopGuide = portalRef.current
    ? createPortal(
        <div className="mt-4">
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div
                className="overflow-y-auto rounded-lg border border-border bg-card p-4"
                style={{ maxHeight: "calc(100vh - 5rem - 250px - 3rem)" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Guide</h3>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onToggle}
                    title="Close guide"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
                <GuideSections sections={sections} />
              </div>
            </div>
          </div>
        </div>,
        portalRef.current
      )
    : null;

  // Sub-lg: Sheet fallback
  const mobileGuide = (
    <Sheet
      open={isOpen && !isDesktop}
      onOpenChange={(open) => {
        if (!open) onToggle();
      }}
    >
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Guide</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <GuideSections sections={sections} />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {isDesktop ? desktopGuide : mobileGuide}
    </>
  );
}
