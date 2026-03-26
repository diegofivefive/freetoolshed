"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import type { ResumeAction, ExperienceSection, WorkExperience } from "@/lib/resume/types";

interface ExperienceEditorProps {
  section: ExperienceSection;
  dispatch: Dispatch<ResumeAction>;
}

function ExperienceItem({
  item,
  sectionId,
  dispatch,
  canRemove,
}: {
  item: WorkExperience;
  sectionId: string;
  dispatch: Dispatch<ResumeAction>;
  canRemove: boolean;
}) {
  const update = (data: Partial<WorkExperience>) => {
    dispatch({ type: "UPDATE_ITEM", payload: { sectionId, itemId: item.id, data } });
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = [...item.bullets];
    bullets[index] = value;
    update({ bullets });
  };

  const addBullet = () => {
    update({ bullets: [...item.bullets, ""] });
  };

  const removeBullet = (index: number) => {
    if (item.bullets.length <= 1) return;
    update({ bullets: item.bullets.filter((_, i) => i !== index) });
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Job Title</Label>
            <Input
              placeholder="Software Engineer"
              value={item.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input
              placeholder="Acme Inc."
              value={item.company}
              onChange={(e) => update({ company: e.target.value })}
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
            disabled={item.isCurrentRole}
            onChange={(e) => update({ endDate: e.target.value })}
          />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={item.isCurrentRole}
              onChange={(e) => update({ isCurrentRole: e.target.checked, endDate: "" })}
              className="rounded"
            />
            Current role
          </label>
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            placeholder="San Francisco, CA"
            value={item.location}
            onChange={(e) => update({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Key Achievements / Responsibilities</Label>
        {item.bullets.map((bullet, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">&bull;</span>
            <Input
              placeholder="Led a team of 5 engineers to deliver..."
              value={bullet}
              onChange={(e) => updateBullet(i, e.target.value)}
              className="flex-1"
            />
            {item.bullets.length > 1 && (
              <button
                type="button"
                onClick={() => removeBullet(i)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addBullet} className="text-xs">
          <Plus className="size-3.5" data-icon="inline-start" />
          Add bullet
        </Button>
      </div>
    </div>
  );
}

export function ExperienceEditor({ section, dispatch }: ExperienceEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <ExperienceItem
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
        Add Experience
      </Button>
    </div>
  );
}
