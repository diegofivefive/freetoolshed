"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ToolGuideSection {
  title: string;
  content: string;
  steps?: string[];
}

interface ToolGuideProps {
  sections: ToolGuideSection[];
}

interface ToolGuideWithOverlayProps {
  sections: ToolGuideSection[];
  overlay: ReactNode;
  overlayLabel?: string;
}

function GuideSections({ sections }: { sections: ToolGuideSection[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <div key={i} className={i > 0 ? "mt-4 border-t border-border pt-4" : ""}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">
            {section.title}
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
          {section.steps && (
            <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-muted-foreground">
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

/** Original ToolGuide — backward compatible, used by all other tools. */
export function ToolGuide({ sections }: ToolGuideProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("tool-guide-portal"));
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <div className="mt-4">
      <div
        className="overflow-y-auto rounded-lg border border-border bg-card p-4"
        style={{ maxHeight: "calc(100vh - 5rem - 250px - 3rem)" }}
      >
        <h3 className="mb-4 border-b border-brand/30 pb-2 text-sm font-semibold">Guide</h3>
        <GuideSections sections={sections} />
      </div>
    </div>,
    portalTarget
  );
}

/**
 * ToolGuide with a tabbed overlay (e.g., TI-84 buttons).
 * Renders a segmented toggle above the content panel.
 */
export function ToolGuideWithOverlay({
  sections,
  overlay,
  overlayLabel = "TI-84",
}: ToolGuideWithOverlayProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<"guide" | "overlay">("guide");

  useEffect(() => {
    setPortalTarget(document.getElementById("tool-guide-portal"));
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <div className="mt-4">
      {/* Segmented tab toggle */}
      <div className="mb-2 flex rounded-lg border border-border bg-muted p-0.5">
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "guide"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Guide
        </button>
        <button
          onClick={() => setActiveTab("overlay")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "overlay"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {overlayLabel}
        </button>
      </div>

      {/* Content */}
      {activeTab === "guide" ? (
        <div
          className="overflow-y-auto rounded-lg border border-border bg-card p-4"
          style={{ maxHeight: "calc(100vh - 5rem - 250px - 3rem)" }}
        >
          <h3 className="mb-4 border-b border-brand/30 pb-2 text-sm font-semibold">Guide</h3>
          <GuideSections sections={sections} />
        </div>
      ) : (
        overlay
      )}
    </div>,
    portalTarget
  );
}
