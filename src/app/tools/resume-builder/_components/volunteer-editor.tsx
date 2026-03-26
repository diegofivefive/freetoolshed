"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ResumeAction, VolunteerSection, VolunteerExperience } from "@/lib/resume/types";

interface VolunteerEditorProps {
  section: VolunteerSection;
  dispatch: Dispatch<ResumeAction>;
}

export function VolunteerEditor({ section, dispatch }: VolunteerEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Organization</Label>
                <Input placeholder="Red Cross" value={item.organization}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { organization: e.target.value } } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input placeholder="Volunteer Coordinator" value={item.role}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { role: e.target.value } } })} />
              </div>
            </div>
            {section.items.length > 1 && (
              <Button variant="ghost" size="sm" className="ml-2 shrink-0 text-muted-foreground"
                onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { sectionId: section.id, itemId: item.id } })}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="month" value={item.startDate}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { startDate: e.target.value } } })} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="month" value={item.endDate}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { endDate: e.target.value } } })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="Organized community outreach events..." value={item.description} rows={2}
              onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { description: e.target.value } } })} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm"
        onClick={() => dispatch({ type: "ADD_ITEM", payload: { sectionId: section.id } })}>
        <Plus className="size-4" data-icon="inline-start" />
        Add Volunteer Experience
      </Button>
    </div>
  );
}
