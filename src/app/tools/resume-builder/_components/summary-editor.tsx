"use client";

import type { Dispatch } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeAction, SummarySection } from "@/lib/resume/types";

interface SummaryEditorProps {
  section: SummarySection;
  dispatch: Dispatch<ResumeAction>;
}

const MAX_CHARS = 500;

export function SummaryEditor({ section, dispatch }: SummaryEditorProps) {
  const charCount = section.content.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="resume-summary">Professional Summary</Label>
        <span
          className={`text-xs ${
            charCount > MAX_CHARS ? "text-pink-400" : "text-muted-foreground"
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>
      <Textarea
        id="resume-summary"
        placeholder="Experienced software engineer with 5+ years building scalable web applications..."
        value={section.content}
        onChange={(e) =>
          dispatch({
            type: "SET_SECTION_CONTENT",
            payload: { sectionId: section.id, content: e.target.value },
          })
        }
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        A concise 2-4 sentence overview of your experience, skills, and career goals.
      </p>
    </div>
  );
}
