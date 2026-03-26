"use client";

import type { Dispatch, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GripVertical, Eye, EyeOff, Trash2, Plus, LayoutList } from "lucide-react";
import { SECTION_TYPE_LABELS, CORE_SECTIONS, OPTIONAL_SECTIONS, getSectionLabel } from "@/lib/resume/constants";
import type { ResumeAction, ResumeSection, SectionType } from "@/lib/resume/types";
import { useState, useRef } from "react";

interface SectionManagerProps {
  sections: ResumeSection[];
  dispatch: Dispatch<ResumeAction>;
}

export function SectionManager({ sections, dispatch }: SectionManagerProps) {
  const [addType, setAddType] = useState<SectionType | "">("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  const existingTypes = new Set<SectionType>(sections.filter((s) => s.type !== "custom").map((s) => s.type));
  const availableToAdd = OPTIONAL_SECTIONS.filter((t) => !existingTypes.has(t));

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    // Slight delay so the dragged element renders before going translucent
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = "0.4";
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null || index === dragIndex) {
      setOverIndex(null);
      return;
    }
    setOverIndex(index);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIdx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIdx) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIdx, 0, moved);
    const updated = reordered.map((s, i) => ({ ...s, sortOrder: i }));
    dispatch({ type: "REORDER_SECTIONS", payload: updated as ResumeSection[] });
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = "1";
    setDragIndex(null);
    setOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleAdd = () => {
    if (!addType) return;
    dispatch({ type: "ADD_SECTION", payload: addType });
    setAddType("");
  };

  const handleAddCustom = () => {
    dispatch({ type: "ADD_CUSTOM_SECTION", payload: "Custom Section" });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag to reorder, show/hide, or add new sections to your resume.
      </p>

      <div className="space-y-1">
        {sorted.map((section, index) => {
          const isCore = CORE_SECTIONS.includes(section.type);
          const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                isOver
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              {/* Drag handle */}
              <div className="cursor-grab text-muted-foreground active:cursor-grabbing">
                <GripVertical className="size-4" />
              </div>

              {/* Section label */}
              <span className={`flex-1 text-sm font-medium select-none ${!section.visible ? "text-muted-foreground line-through" : ""}`}>
                {getSectionLabel(section)}
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

              {/* Delete (optional and custom sections) */}
              {(!isCore || section.type === "custom") && (
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

      {/* Add preset section */}
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

      {/* Add custom section */}
      <Button variant="outline" size="sm" onClick={handleAddCustom}>
        <LayoutList className="size-4" data-icon="inline-start" />
        Add Custom Section
      </Button>
    </div>
  );
}
