"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MARGIN_OPTIONS, SECTION_SPACING_OPTIONS, LINE_SPACING_OPTIONS } from "@/lib/resume/constants";
import type { ResumeAction, ResumeMarginSize, ResumeSectionSpacing, ResumeLineSpacing } from "@/lib/resume/types";

interface SpacingControlsProps {
  marginSize: ResumeMarginSize;
  sectionSpacing: ResumeSectionSpacing;
  lineSpacing: ResumeLineSpacing;
  dispatch: Dispatch<ResumeAction>;
}

export function SpacingControls({ marginSize, sectionSpacing, lineSpacing, dispatch }: SpacingControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Page Margins</Label>
        <Select
          value={marginSize}
          onValueChange={(val) =>
            dispatch({ type: "SET_SETTINGS", payload: { marginSize: val as ResumeMarginSize } })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MARGIN_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Section Spacing</Label>
        <Select
          value={sectionSpacing}
          onValueChange={(val) =>
            dispatch({ type: "SET_SETTINGS", payload: { sectionSpacing: val as ResumeSectionSpacing } })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTION_SPACING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Line Spacing</Label>
        <Select
          value={lineSpacing}
          onValueChange={(val) =>
            dispatch({ type: "SET_SETTINGS", payload: { lineSpacing: val as ResumeLineSpacing } })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LINE_SPACING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
