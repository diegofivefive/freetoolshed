"use client";

import { useReducer, useMemo, useEffect, useRef, useCallback } from "react";
import { PayStubForm } from "./pay-stub-form";
import type {
  PayStubData,
  PayStubAction,
  PayStubCalculations,
} from "@/lib/pay-stub/types";
import {
  createDefaultPayStubData,
  createBlankEarning,
  createBlankDeduction,
  STANDARD_DEDUCTION_PRESET,
} from "@/lib/pay-stub/constants";
import { calculatePayStub, calculateEarningAmount } from "@/lib/pay-stub/calculations";
import { saveDraft, loadDraft, loadDefaults } from "@/lib/pay-stub/storage";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";

const PAY_STUB_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Use the Details tab to enter employer and employee information, then set the pay period dates and frequency.",
    steps: [
      "Fill in company name, address, and EIN",
      "Add employee name, ID, and department",
      "Set pay period start/end dates and pay date",
      "Choose pay frequency (weekly, bi-weekly, etc.)",
      "Period end and pay date auto-fill when you set start date",
    ],
  },
  {
    title: "Earnings",
    content:
      "Switch to the Earnings tab to add pay entries. Toggle between hourly and salary mode at the top.",
    steps: [
      "Select Hourly or Salary pay type",
      "For hourly: enter hours and rate — amount auto-calculates",
      "For salary: enter the flat amount directly",
      "Add overtime, bonus, commission, or tips rows",
      "The first Regular row cannot be deleted",
    ],
  },
  {
    title: "Deductions",
    content:
      "Use the Deductions tab to manage pre-tax and post-tax withholdings. Sections are displayed separately.",
    steps: [
      "Click \"Apply Standard US Deductions\" for 6 common items",
      "Enter current period amounts for each deduction",
      "Selecting a type auto-fills the description label",
      "Add custom deductions to either section",
      "Per-section totals are shown at the bottom",
    ],
  },
  {
    title: "YTD Tracking",
    content:
      "Enter year-to-date amounts in the YTD column on each earnings and deduction row.",
    steps: [
      "YTD fields appear on both Earnings and Deductions tabs",
      "Enter cumulative totals from previous pay periods",
      "YTD summary shows on the PDF when amounts are present",
      "Duplicating a stub from History preserves YTD values",
    ],
  },
  {
    title: "Templates & Styling",
    content:
      "Open the Style tab to customize the look of your pay stub PDF.",
    steps: [
      "Choose Standard, Modern, or Compact template",
      "Pick an accent color from 8 presets or use a custom color",
      "Upload a company logo (PNG, JPEG, or SVG)",
      "Template thumbnails update in real time with your color",
    ],
  },
  {
    title: "Export & Print",
    content:
      "Company name and employee name are required before exporting. Validation errors appear in pink above the toolbar.",
    steps: [
      "Click \"Download PDF\" to save as a file",
      "Click \"Print\" to open the browser print dialog",
      "PDF uses your selected template, color, and logo",
      "Filename includes employee name and pay date",
    ],
  },
  {
    title: "Saving & History",
    content:
      "Your current work auto-saves every second. Use the History panel for long-term storage.",
    steps: [
      "Click \"History\" to open the saved stubs panel",
      "\"Save Current Stub\" adds to your history list",
      "Click a saved stub to reload it into the editor",
      "Duplicate a stub for the next pay period (resets amounts)",
      "Export/Import as JSON for backup or transfer",
      "\"Save Employer as Default\" pre-fills future new stubs",
    ],
  },
  {
    title: "Tips",
    content:
      "Helpful shortcuts for faster pay stub generation.",
    steps: [
      "Save your employer as default to skip re-entering info",
      "Use \"New Stub\" to start fresh (clears the draft)",
      "Duplicate from History to carry over employee and deductions",
      "All data stays in your browser — nothing is uploaded",
    ],
  },
];

function payStubReducer(
  state: PayStubData,
  action: PayStubAction
): PayStubData {
  switch (action.type) {
    case "SET_EMPLOYER":
      return {
        ...state,
        employer: { ...state.employer, ...action.payload },
      };
    case "SET_EMPLOYEE":
      return {
        ...state,
        employee: { ...state.employee, ...action.payload },
      };
    case "SET_PAY_PERIOD":
      return {
        ...state,
        payPeriod: { ...state.payPeriod, ...action.payload },
      };
    case "SET_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case "ADD_EARNING":
      return {
        ...state,
        earnings: [...state.earnings, createBlankEarning()],
      };
    case "REMOVE_EARNING":
      return {
        ...state,
        earnings: state.earnings.filter((e) => e.id !== action.payload),
      };
    case "UPDATE_EARNING": {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        earnings: state.earnings.map((e) => {
          if (e.id !== id) return e;
          const updated = { ...e, ...changes };
          // Auto-calculate currentAmount for hourly types
          if (
            (updated.type === "regular" || updated.type === "overtime") &&
            state.settings.payType === "hourly"
          ) {
            updated.currentAmount = calculateEarningAmount(updated);
          }
          return updated;
        }),
      };
    }
    case "ADD_DEDUCTION":
      return {
        ...state,
        deductions: [
          ...state.deductions,
          createBlankDeduction(action.payload?.category),
        ],
      };
    case "REMOVE_DEDUCTION":
      return {
        ...state,
        deductions: state.deductions.filter((d) => d.id !== action.payload),
      };
    case "UPDATE_DEDUCTION": {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        deductions: state.deductions.map((d) =>
          d.id === id ? { ...d, ...changes } : d
        ),
      };
    }
    case "SET_LOGO":
      return {
        ...state,
        employer: { ...state.employer, logoUrl: action.payload },
      };
    case "APPLY_PRESET_DEDUCTIONS": {
      // Only add deduction types that don't already exist
      const existingTypes = new Set(state.deductions.map((d) => d.type));
      const newDeductions = STANDARD_DEDUCTION_PRESET.filter(
        (preset) => !existingTypes.has(preset.type)
      ).map((preset) => ({
        ...preset,
        id: crypto.randomUUID(),
      }));
      return {
        ...state,
        deductions: [...state.deductions, ...newDeductions],
      };
    }
    case "LOAD_DRAFT":
      return action.payload;
    case "RESET":
      return createDefaultPayStubData();
    default:
      return state;
  }
}

function initState(): PayStubData {
  // Try to restore a saved draft first
  const draft = loadDraft();
  if (draft) return draft;

  // Apply saved employer defaults to a fresh stub
  const defaults = loadDefaults();
  const fresh = createDefaultPayStubData();
  if (defaults) {
    fresh.employer = { ...fresh.employer, ...defaults.employer };
    fresh.settings = { ...fresh.settings, ...defaults.settings };
  }
  return fresh;
}

export function PayStubGenerator() {
  const [state, dispatch] = useReducer(payStubReducer, null, initState);

  const calculations: PayStubCalculations = useMemo(
    () => calculatePayStub(state.earnings, state.deductions),
    [state.earnings, state.deductions]
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

  const handleNewStub = useCallback(() => {
    dispatch({ type: "RESET" });
    saveDraft(createDefaultPayStubData());
  }, []);

  const handleLoadFromHistory = useCallback((data: PayStubData) => {
    dispatch({ type: "LOAD_DRAFT", payload: data });
  }, []);

  return (
    <>
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <PayStubForm
            state={state}
            calculations={calculations}
            dispatch={dispatch}
            onNewStub={handleNewStub}
            onLoadFromHistory={handleLoadFromHistory}
          />
        </div>
      </div>
      <ToolGuide sections={PAY_STUB_GUIDE_SECTIONS} />
    </>
  );
}
