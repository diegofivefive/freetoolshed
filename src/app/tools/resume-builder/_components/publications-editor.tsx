"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ResumeAction, PublicationsSection } from "@/lib/resume/types";

interface PublicationsEditorProps {
  section: PublicationsSection;
  dispatch: Dispatch<ResumeAction>;
}

export function PublicationsEditor({ section, dispatch }: PublicationsEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input placeholder="Machine Learning in Healthcare" value={item.title}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { title: e.target.value } } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Publisher / Journal</Label>
                <Input placeholder="IEEE" value={item.publisher}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { publisher: e.target.value } } })} />
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
              <Label>Date</Label>
              <Input type="month" value={item.date}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { date: e.target.value } } })} />
            </div>
            <div className="space-y-1.5">
              <Label>URL (optional)</Label>
              <Input placeholder="https://doi.org/..." value={item.url}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { url: e.target.value } } })} />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm"
        onClick={() => dispatch({ type: "ADD_ITEM", payload: { sectionId: section.id } })}>
        <Plus className="size-4" data-icon="inline-start" />
        Add Publication
      </Button>
    </div>
  );
}
