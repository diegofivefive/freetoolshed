"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { RichTextInput } from "./rich-text-input";
import type { ResumeAction, AwardsSection } from "@/lib/resume/types";

interface AwardsEditorProps {
  section: AwardsSection;
  dispatch: Dispatch<ResumeAction>;
}

export function AwardsEditor({ section, dispatch }: AwardsEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Award Title</Label>
                <Input placeholder="Employee of the Year" value={item.title}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { title: e.target.value } } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Issuer</Label>
                <Input placeholder="Acme Inc." value={item.issuer}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { issuer: e.target.value } } })} />
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
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <RichTextInput
              value={item.description}
              onChange={(html) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { description: html } } })}
              placeholder="Recognized for outstanding performance..."
              multiline
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm"
        onClick={() => dispatch({ type: "ADD_ITEM", payload: { sectionId: section.id } })}>
        <Plus className="size-4" data-icon="inline-start" />
        Add Award
      </Button>
    </div>
  );
}
