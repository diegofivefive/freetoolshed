"use client";

import { useState, useRef, type Dispatch } from "react";
import type { FloorPlanAction, FloorPlan } from "@/lib/floor-plan/types";
import {
  saveToHistory,
  loadHistory,
  deleteFromHistory,
  duplicateFromHistory,
  exportPlanJson,
  exportAllJson,
  parseImportedJson,
} from "@/lib/floor-plan/storage";
import { FLOOR_PLAN_TEMPLATES } from "@/lib/floor-plan/templates";
import {
  Save,
  FolderOpen,
  FilePlus,
  Download,
  Upload,
  Trash2,
  Copy,
  ChevronDown,
  LayoutTemplate,
} from "lucide-react";

interface PlanManagerProps {
  plan: FloorPlan;
  dispatch: Dispatch<FloorPlanAction>;
}

export function PlanManager({ plan, dispatch }: PlanManagerProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNew = () => {
    if (plan.elements.length > 0) {
      const confirmed = window.confirm(
        "Start a new floor plan? Your current draft is auto-saved."
      );
      if (!confirmed) return;
    }
    dispatch({ type: "RESET" });
    setShowMenu(false);
  };

  const handleSave = () => {
    saveToHistory(plan);
    setShowMenu(false);
  };

  const handleExportJson = () => {
    const json = exportPlanJson(plan);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleExportAll = () => {
    const history = loadHistory();
    if (history.length === 0) return;
    const json = exportAllJson(history);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freetoolshed-floor-plans-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseImportedJson(reader.result as string);
      if (!result.success) {
        setImportError(result.error);
        return;
      }
      if (result.plans.length > 0) {
        dispatch({ type: "LOAD_PLAN", payload: result.plans[0].plan });
      }
      setShowMenu(false);
      setImportError(null);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  };

  const handleLoadPlan = (loadedPlan: FloorPlan) => {
    dispatch({ type: "LOAD_PLAN", payload: loadedPlan });
    setShowLoadDialog(false);
    setShowTemplates(false);
    setShowMenu(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    const tpl = FLOOR_PLAN_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    if (plan.elements.length > 0) {
      const confirmed = window.confirm(
        "Load template? Your current draft is auto-saved."
      );
      if (!confirmed) return;
    }
    // Create a fresh plan with new IDs
    const newPlan: FloorPlan = {
      ...tpl.plan,
      id: crypto.randomUUID(),
      elements: tpl.plan.elements.map((el) => ({ ...el, id: crypto.randomUUID() })),
    };
    dispatch({ type: "LOAD_PLAN", payload: newPlan });
    setShowTemplates(false);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        File
        <ChevronDown className="h-3 w-3" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowMenu(false);
              setShowLoadDialog(false);
              setShowTemplates(false);
            }}
          />

          {/* Menu */}
          <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-border bg-card py-1 shadow-lg">
            <MenuItem icon={FilePlus} label="New Plan" onClick={handleNew} />
            <MenuItem
              icon={LayoutTemplate}
              label="From Template"
              onClick={() => {
                setShowTemplates((prev) => !prev);
                setShowLoadDialog(false);
              }}
            />
            <MenuItem icon={Save} label="Save to History" onClick={handleSave} />
            <MenuItem
              icon={FolderOpen}
              label="Load from History"
              onClick={() => {
                setShowLoadDialog((prev) => !prev);
                setShowTemplates(false);
              }}
            />

            <div className="my-1 h-px bg-border" />

            <MenuItem icon={Download} label="Export JSON" onClick={handleExportJson} />
            <MenuItem icon={Download} label="Export All (Backup)" onClick={handleExportAll} />
            <MenuItem icon={Upload} label="Import JSON" onClick={handleImportClick} />

            {importError && (
              <p className="px-3 py-1 text-xs text-pink-500">{importError}</p>
            )}

            {/* Templates list */}
            {showTemplates && (
              <div className="max-h-60 overflow-y-auto border-t border-border">
                {FLOOR_PLAN_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleLoadTemplate(tpl.id)}
                    className="w-full border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-accent"
                  >
                    <span className="block truncate text-sm font-medium">
                      {tpl.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tpl.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Load dialog */}
            {showLoadDialog && <LoadDialog onLoad={handleLoadPlan} />}
          </div>
        </>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}

// ── Menu item ───────────────────────────────────────────────

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Save;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </button>
  );
}

// ── Load dialog ─────────────────────────────────────────────

function LoadDialog({
  onLoad,
}: {
  onLoad: (plan: FloorPlan) => void;
}) {
  const history = loadHistory();

  if (history.length === 0) {
    return (
      <div className="border-t border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">No saved plans yet.</p>
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto border-t border-border">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
        >
          <button
            onClick={() => onLoad(entry.plan)}
            className="flex-1 text-left text-sm hover:text-brand"
          >
            <span className="block truncate font-medium">{entry.plan.name}</span>
            <span className="text-xs text-muted-foreground">
              {entry.plan.elements.length} elements &middot;{" "}
              {new Date(entry.updatedAt).toLocaleDateString()}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const dup = duplicateFromHistory(entry.id);
              if (dup) onLoad(dup);
            }}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFromHistory(entry.id);
              // Force re-render by toggling — the parent will re-render
              onLoad(entry.plan);
            }}
            className="rounded p-1 text-muted-foreground hover:bg-pink-500/20 hover:text-pink-500"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
