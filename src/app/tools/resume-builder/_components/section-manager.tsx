"use client";

import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { SECTION_TYPE_LABELS, CORE_SECTIONS, OPTIONAL_SECTIONS } from "@/lib/resume/constants";
import type { ResumeAction, ResumeSection, SectionType } from "@/lib/resume/types";
import { useState } from "react";

interface SectionManagerProps {
  sections: ResumeSection[];
  dispatch: Dispatch<ResumeAction>;
}

export function SectionManager({ sections, dispatch }: SectionManagerProps) {
  const [addType, setAddType] = useState<SectionType | "">("");
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  const existingTypes = new Set(sections.map((s) => s.type));
  const availableToAdd = OPTIONAL_SECTIONS.filter((t) => !existingTypes.has(t));

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const reordered = [...sorted];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    const updated = reordered.map((s, i) => ({ ...s, sortOrder: i }));
    dispatch({ type: "REORDER_SECTIONS", payload: updated as ResumeSection[] });
  };

  const moveDown = (index: number) => {
    if (index >= sorted.length - 1) return;
    const reordered = [...sorted];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const updated = reordered.map((s, i) => ({ ...s, sortOrder: i }));
    dispatch({ type: "REORDER_SECTIONS", payload: updated as ResumeSection[] });
  };

  const handleAdd = () => {
    if (!addType) return;
    dispatch({ type: "ADD_SECTION", payload: addType });
    setAddType("");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Reorder, show/hide, or add new sections to your resume.
      </p>

      <div className="space-y-2">
        {sorted.map((section, index) => {
          const isCore = CORE_SECTIONS.includes(section.type);
          return (
            <div
              key={section.id}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === sorted.length - 1}
                  onClick={() => moveDown(index)}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>

              {/* Section label */}
              <span className={`flex-1 text-sm font-medium ${!section.visible ? "text-muted-foreground line-through" : ""}`}>
                {SECTION_TYPE_LABELS[section.type]}
              </span>

              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "TOGGLE_SECTION_VISIBILITY", payload: section.id })}
                className="text-muted-foreground"
              >
                {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>

              {/* Delete (optional sections only) */}
              {!isCore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: "REMOVE_SECTION", payload: section.id })}
                  className="text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add section */}
      {availableToAdd.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={addType} onValueChange={(v) => setAddType(v as SectionType)}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Add a section..." />
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.map((type) => (
                <SelectItem key={type} value={type}>
                  {SECTION_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleAdd} disabled={!addType}>
            <Plus className="size-4" data-icon="inline-start" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
