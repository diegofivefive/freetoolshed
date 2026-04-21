"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  History,
  Trash2,
  Copy,
  FileDown,
  Upload,
  Download,
  Save,
  Settings2,
} from "lucide-react";
import type { SavedResume, ResumeData } from "@/lib/resume/types";
import {
  loadHistory,
  saveToHistory,
  deleteFromHistory,
  duplicateFromHistory,
  exportResumeJson,
  exportAllJson,
  parseImportedJson,
  saveDefaults,
  mergeIntoHistory,
} from "@/lib/resume/storage";

interface ResumeHistoryProps {
  currentState: ResumeData;
  onLoad: (data: ResumeData) => void;
}

export function ResumeHistory({ currentState, onLoad }: ResumeHistoryProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<SavedResume[]>([]);
  const [saveName, setSaveName] = useState("");
  const [importError, setImportError] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const refreshHistory = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) refreshHistory();
    },
    [refreshHistory]
  );

  const handleSave = useCallback(() => {
    const name = saveName.trim() || `Resume ${new Date().toLocaleDateString()}`;
    saveToHistory(currentState, name);
    setSaveName("");
    refreshHistory();
  }, [currentState, saveName, refreshHistory]);

  const handleLoad = useCallback(
    (data: ResumeData) => {
      onLoad(data);
      setOpen(false);
    },
    [onLoad]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const data = duplicateFromHistory(id);
      if (data) {
        onLoad(data);
        setOpen(false);
      }
    },
    [onLoad]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteFromHistory(id);
      refreshHistory();
    },
    [refreshHistory]
  );

  const handleExportSingle = useCallback(
    (resume: SavedResume) => {
      const json = exportResumeJson(resume.data, resume.name);
      downloadJson(json, `resume-${resume.name.replace(/[^a-zA-Z0-9]/g, "_")}.json`);
    },
    []
  );

  const handleExportAll = useCallback(() => {
    const json = exportAllJson(history);
    downloadJson(json, "freetoolshed-resumes-export.json");
  }, [history]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImportError("");
      const reader = new FileReader();
      reader.onload = () => {
        const result = parseImportedJson(reader.result as string);
        if (!result.success) {
          setImportError(result.error);
          return;
        }
        const { added } = mergeIntoHistory(result.resumes);
        if (added === 0) {
          setImportError("All resumes in this file already exist in your history.");
          return;
        }
        refreshHistory();
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [refreshHistory]
  );

  const handleSaveDefaults = useCallback(() => {
    saveDefaults(currentState);
  }, [currentState]);

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger
        render={
          <Button variant="outline">
            <History className="size-4" data-icon="inline-start" />
            History
          </Button>
        }
      />
      <SheetContent className="flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle>Resume History</SheetTitle>
          <SheetDescription>
            Save, load, and manage your resumes.
          </SheetDescription>
        </SheetHeader>

        {/* Save current */}
        <div className="flex items-center gap-2 px-1">
          <Input
            placeholder="Resume name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSave}>
            <Save className="size-4" data-icon="inline-start" />
            Save
          </Button>
        </div>

        <Separator />

        {/* History list */}
        <div className="flex-1 space-y-2 overflow-y-auto px-1">
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No saved resumes yet.
            </p>
          ) : (
            history.map((resume) => (
              <div
                key={resume.id}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{resume.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLoad(resume.data)}
                    className="text-xs"
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(resume.id)}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportSingle(resume)}
                  >
                    <FileDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* Import error */}
        {importError && (
          <p className="px-1 text-sm text-pink-400">{importError}</p>
        )}

        {/* Footer actions */}
        <SheetFooter className="flex-row flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDefaults}>
            <Settings2 className="size-4" data-icon="inline-start" />
            Save Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={history.length === 0}
          >
            <Download className="size-4" data-icon="inline-start" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => importRef.current?.click()}
          >
            <Upload className="size-4" data-icon="inline-start" />
            Import
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
