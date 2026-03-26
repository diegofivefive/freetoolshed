"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import { RichTextInput } from "./rich-text-input";
import { stripHtml } from "@/lib/resume/rich-text";
import type { ResumeAction, SummarySection } from "@/lib/resume/types";

interface SummaryEditorProps {
  section: SummarySection;
  dispatch: Dispatch<ResumeAction>;
}

const MAX_CHARS = 500;

export function SummaryEditor({ section, dispatch }: SummaryEditorProps) {
  const charCount = stripHtml(section.content).length;

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
      <RichTextInput
        value={section.content}
        onChange={(html) =>
          dispatch({
            type: "SET_SECTION_CONTENT",
            payload: { sectionId: section.id, content: html },
          })
        }
        placeholder="Experienced software engineer with 5+ years building scalable web applications..."
        multiline
      />
      <p className="text-xs text-muted-foreground">
        A concise 2-4 sentence overview of your experience, skills, and career goals.
      </p>
    </div>
  );
}
