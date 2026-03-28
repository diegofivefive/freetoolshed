"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import type { ResumeData, ResumeAction, ResumeSection } from "@/lib/resume/types";
import { createDefaultResumeData, createEmptySection, createEmptySectionItem } from "@/lib/resume/constants";
import { saveDraft, loadDraft, loadDefaults } from "@/lib/resume/storage";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";

const RESUME_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Start in the Content tab with your personal information — name, title, email, phone, and location. Then fill in each section below. Your resume auto-saves as you type.",
    steps: [
      "Fill in your personal details at the top",
      "Add a professional summary",
      "Add work experience, education, and skills",
      "Choose a template and customize in the Style tab",
      "Download as PDF when ready",
    ],
  },
  {
    title: "Managing Sections",
    content:
      "Use the Sections tab to control which sections appear on your resume. Drag to reorder, toggle visibility, or add new sections. Hidden sections keep their data — just toggle them back on.",
    steps: [
      "Drag the handle to reorder sections",
      "Toggle the eye icon to show/hide a section",
      "Click \"Add Section\" for optional sections like certifications or languages",
      "Create custom sections with your own titles",
      "Core sections (Summary, Experience, Education, Skills) can be hidden but not deleted",
    ],
  },
  {
    title: "Templates & Styling",
    content:
      "Choose from 12 professionally designed templates in the Style tab. Each can be customized with your brand color, font, spacing, and margins.",
    steps: [
      "12 templates: Modern, Classic, Professional, Minimal, Executive, Creative, Compact, Elegant, Bold, Technical, Columns, Timeline",
      "8 accent color presets or custom hex color",
      "3 font families: Sans-Serif, Serif, Monospace",
      "Adjustable font size, margins, section spacing, and line spacing",
    ],
  },
  {
    title: "ATS Keyword Checker",
    content:
      "Paste a job description in the ATS tab to see how well your resume matches. The checker extracts keywords and shows which ones you're missing.",
    steps: [
      "Paste the full job description text",
      "Click \"Analyze Match\" to run the check",
      "Green (70%+) = strong match",
      "Amber (40-69%) = moderate — add missing keywords",
      "Pink (<40%) = weak — review missing keywords list",
      "Results update live as you edit your resume",
    ],
  },
  {
    title: "Work Experience Tips",
    content:
      "Each experience entry supports multiple bullet points. Check \"Current Role\" to auto-set the end date to \"Present\". Use the rich text toolbar for bold, italic, and links.",
    steps: [
      "Click \"Add Item\" to add a new position",
      "Add/remove bullet points within each entry",
      "Check \"Current Role\" for your present job",
      "Rich text: bold, italic, underline, and links supported",
    ],
  },
  {
    title: "Export & Print",
    content:
      "Download your resume as a PDF or print directly. Your full name is required to export. The filename auto-generates as Resume-FirstName_LastName.pdf.",
  },
  {
    title: "Saving & History",
    content:
      "Your current resume auto-saves every second. Use History to save named snapshots, duplicate resumes for different jobs, or export/import as JSON backups.",
    steps: [
      "Auto-saves draft to localStorage continuously",
      "Save named snapshots in History",
      "Duplicate a saved resume to tailor for different jobs",
      "Export/import as JSON for backup or transfer",
      "\"Save Defaults\" stores your preferred template and style settings",
    ],
  },
];

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

    case "ADD_CUSTOM_SECTION": {
      const maxOrd = state.sections.reduce((max, s) => Math.max(max, s.sortOrder), 0);
      const custom = createEmptySection("custom", maxOrd + 1, action.payload) as unknown as ResumeSection;
      return { ...state, sections: [...state.sections, custom] };
    }

    case "RENAME_SECTION": {
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.sectionId && s.type === "custom"
            ? { ...s, title: action.payload.title }
            : s
        ),
      };
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
    <>
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
    <ToolGuide sections={RESUME_GUIDE_SECTIONS} />
    </>
  );
}
