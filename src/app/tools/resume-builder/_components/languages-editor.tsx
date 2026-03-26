"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { LANGUAGE_PROFICIENCY_OPTIONS } from "@/lib/resume/constants";
import type { ResumeAction, LanguagesSection, LanguageProficiency } from "@/lib/resume/types";

interface LanguagesEditorProps {
  section: LanguagesSection;
  dispatch: Dispatch<ResumeAction>;
}

export function LanguagesEditor({ section, dispatch }: LanguagesEditorProps) {
  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            placeholder="English"
            value={item.name}
            onChange={(e) =>
              dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { name: e.target.value } } })
            }
            className="flex-1"
          />
          <Select
            value={item.proficiency}
            onValueChange={(val) =>
              dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, data: { proficiency: val as LanguageProficiency } } })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_PROFICIENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {section.items.length > 1 && (
            <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground"
              onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { sectionId: section.id, itemId: item.id } })}>
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm"
        onClick={() => dispatch({ type: "ADD_ITEM", payload: { sectionId: section.id } })}>
        <Plus className="size-4" data-icon="inline-start" />
        Add Language
      </Button>
    </div>
  );
}
