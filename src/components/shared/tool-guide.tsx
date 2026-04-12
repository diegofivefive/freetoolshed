"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface ToolGuideSection {
  title: string;
  content: string;
  steps?: string[];
}

interface ToolGuideProps {
  sections: ToolGuideSection[];
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

