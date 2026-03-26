"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { RichTextInput } from "./rich-text-input";
import type { ResumeAction, EducationSection, Education } from "@/lib/resume/types";

interface EducationEditorProps {
  section: EducationSection;
  dispatch: Dispatch<ResumeAction>;
}

function EducationItem({
  item,
  sectionId,
  dispatch,
  canRemove,
}: {
  item: Education;
  sectionId: string;
  dispatch: Dispatch<ResumeAction>;
  canRemove: boolean;
}) {
  const update = (data: Partial<Education>) => {
    dispatch({ type: "UPDATE_ITEM", payload: { sectionId, itemId: item.id, data } });
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>School / University</Label>
            <Input
              placeholder="MIT"
              value={item.school}
              onChange={(e) => update({ school: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Degree</Label>
            <Input
              placeholder="Bachelor of Science"
              value={item.degree}
              onChange={(e) => update({ degree: e.target.value })}
            />
          </div>
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 shrink-0 text-muted-foreground"
            onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { sectionId, itemId: item.id } })}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Field of Study</Label>
          <Input
            placeholder="Computer Science"
            value={item.field}
            onChange={(e) => update({ field: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Start Date</Label>
          <Input
            type="month"
            value={item.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>End Date</Label>
          <Input
            type="month"
            value={item.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>GPA (optional)</Label>
          <Input
            placeholder="3.8 / 4.0"
            value={item.gpa}
            onChange={(e) => update({ gpa: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description (optional)</Label>
        <RichTextInput
          value={item.description}
          onChange={(html) => update({ description: html })}
          placeholder="Relevant coursework, honors, activities..."
          multiline
        />
      </div>
    </div>
  );
}

export function EducationEditor({ section, dispatch }: EducationEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <EducationItem
          key={item.id}
          item={item}
          sectionId={section.id}
          dispatch={dispatch}
          canRemove={section.items.length > 1}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => dispatch({ type: "ADD_ITEM", payload: { sectionId: section.id } })}
      >
        <Plus className="size-4" data-icon="inline-start" />
        Add Education
      </Button>
    </div>
  );
}
