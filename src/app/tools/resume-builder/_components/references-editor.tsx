"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ResumeAction, ReferencesSection } from "@/lib/resume/types";

interface ReferencesEditorProps {
  section: ReferencesSection;
  dispatch: Dispatch<ResumeAction>;
}

export function ReferencesEditor({ section, dispatch }: ReferencesEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input placeholder="Jane Doe" value={item.name}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { name: e.target.value } } })} />
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input placeholder="Engineering Manager" value={item.title}
                  onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { title: e.target.value } } })} />
              </div>
            </div>
            {section.items.length > 1 && (
              <Button variant="ghost" size="sm" className="ml-2 shrink-0 text-muted-foreground"
                onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { sectionId: section.id, itemId: item.id } })}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input placeholder="Acme Inc." value={item.company}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { company: e.target.value } } })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="jane@example.com" value={item.email}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { email: e.target.value } } })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+1 (555) 987-6543" value={item.phone}
                onChange={(e) => dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { phone: e.target.value } } })} />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm"
        onClick={() => dispatch({ type: "ADD_ITEM", payload: { sectionId: section.id } })}>
        <Plus className="size-4" data-icon="inline-start" />
        Add Reference
      </Button>
    </div>
  );
}
