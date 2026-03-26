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
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, DATE_FORMAT_OPTIONS } from "@/lib/resume/constants";
import type { ResumeAction, ResumeFontFamily, ResumeFontSize, ResumeDateFormat } from "@/lib/resume/types";

interface FontSelectorProps {
  fontFamily: ResumeFontFamily;
  fontSize: ResumeFontSize;
  dateFormat: ResumeDateFormat;
  dispatch: Dispatch<ResumeAction>;
}

export function FontSelector({ fontFamily, fontSize, dateFormat, dispatch }: FontSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Font Family</Label>
        <Select
          value={fontFamily}
          onValueChange={(val) =>
            dispatch({ type: "SET_SETTINGS", payload: { fontFamily: val as ResumeFontFamily } })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Font Size</Label>
        <Select
          value={fontSize}
          onValueChange={(val) =>
            dispatch({ type: "SET_SETTINGS", payload: { fontSize: val as ResumeFontSize } })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label} ({opt.bodyPt}pt body / {opt.headingPt}pt heading)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Date Format</Label>
        <Select
          value={dateFormat}
          onValueChange={(val) =>
            dispatch({ type: "SET_SETTINGS", payload: { dateFormat: val as ResumeDateFormat } })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_OPTIONS.map((opt) => (
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
