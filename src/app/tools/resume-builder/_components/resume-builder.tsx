"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import type { ResumeData, ResumeAction, ResumeSection } from "@/lib/resume/types";
import { createDefaultResumeData, createEmptySection, createEmptySectionItem } from "@/lib/resume/constants";
import { saveDraft, loadDraft, loadDefaults } from "@/lib/resume/storage";

function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case "SET_PERSONAL_INFO":
      return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };

    case "SET_PHOTO":
      return { ...state, personalInfo: { ...state.personalInfo, photoUrl: action.payload } };

    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case "SET_SECTION_CONTENT": {
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.sectionId && s.type === "summary"
            ? { ...s, content: action.payload.content }
            : s
        ),
      };
    }

    case "ADD_SECTION": {
      const maxOrder = state.sections.reduce((max, s) => Math.max(max, s.sortOrder), 0);
      const newSection = createEmptySection(action.payload, maxOrder + 1) as unknown as ResumeSection;
      return { ...state, sections: [...state.sections, newSection] };
    }

    case "REMOVE_SECTION":
      return { ...state, sections: state.sections.filter((s) => s.id !== action.payload) };

    case "TOGGLE_SECTION_VISIBILITY":
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload ? { ...s, visible: !s.visible } : s
        ),
      };

    case "REORDER_SECTIONS":
      return { ...state, sections: action.payload };

    case "ADD_ITEM": {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId || s.type === "summary") return s;
          const newItem = createEmptySectionItem(s.type);
          return { ...s, items: [...(s as { items: unknown[] }).items, newItem] } as ResumeSection;
        }),
      };
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId || s.type === "summary") return s;
          const items = (s as { items: Array<{ id: string }> }).items.filter(
            (item) => item.id !== action.payload.itemId
          );
          return { ...s, items } as ResumeSection;
        }),
      };
    }

    case "UPDATE_ITEM": {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId || s.type === "summary") return s;
          const items = (s as { items: Array<{ id: string }> }).items.map((item) =>
            item.id === action.payload.itemId ? { ...item, ...action.payload.data } : item
          );
          return { ...s, items } as ResumeSection;
        }),
      };
    }

    case "REORDER_ITEMS": {
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.payload.sectionId || s.type === "summary") return s;
          return { ...s, items: action.payload.items } as ResumeSection;
        }),
      };
    }

    case "LOAD_DRAFT":
      return action.payload;

    case "RESET": {
      const fresh = createDefaultResumeData();
      const defaults = loadDefaults();
      if (defaults) {
        fresh.settings = { ...fresh.settings, ...defaults.settings };
      }
      return fresh;
    }

    default:
      return state;
  }
}

export function ResumeBuilder() {
  const [showPreview, setShowPreview] = useState(true);
  const [state, dispatch] = useReducer(
    resumeReducer,
    null,
    () => {
      const draft = loadDraft();
      if (draft) return draft;
      const fresh = createDefaultResumeData();
      const defaults = loadDefaults();
      if (defaults) {
        fresh.settings = { ...fresh.settings, ...defaults.settings };
      }
      return fresh;
    }
  );

  // Auto-save with 1s debounce
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(state);
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const handleNewResume = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <div className="flex gap-6">
      {/* Form */}
      <div className="min-w-0 flex-1">
        <ResumeForm
          state={state}
          dispatch={dispatch}
          onNewResume={handleNewResume}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((p) => !p)}
        />
      </div>

      {/* Preview — visible at xl+ by default, toggle overrides */}
      <div
        className={
          showPreview
            ? "hidden w-[520px] shrink-0 xl:block"
            : "hidden"
        }
      >
        <div className="sticky top-20">
          <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            <ResumePreview state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}
