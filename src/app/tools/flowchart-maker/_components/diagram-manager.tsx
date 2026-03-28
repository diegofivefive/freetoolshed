"use client";

import { useState, useRef, type Dispatch } from "react";
import type { FlowchartAction, FlowchartDiagram } from "@/lib/flowchart/types";
import {
  saveToHistory,
  loadHistory,
  deleteFromHistory,
  duplicateFromHistory,
  exportDiagramJson,
  exportAllJson,
  parseImportedJson,
} from "@/lib/flowchart/storage";
import { FLOWCHART_TEMPLATES } from "@/lib/flowchart/templates";
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

interface DiagramManagerProps {
  diagram: FlowchartDiagram;
  dispatch: Dispatch<FlowchartAction>;
}

export function DiagramManager({ diagram, dispatch }: DiagramManagerProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNew = () => {
    if (diagram.nodes.length > 0) {
      const confirmed = window.confirm(
        "Start a new diagram? Your current draft is auto-saved."
      );
      if (!confirmed) return;
    }
    dispatch({ type: "RESET" });
    setShowMenu(false);
  };

  const handleSave = () => {
    saveToHistory(diagram);
    setShowMenu(false);
  };

  const handleExportJson = () => {
    const json = exportDiagramJson(diagram);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.name.replace(/\s+/g, "-").toLowerCase()}.json`;
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
    a.download = "freetoolshed-flowcharts-backup.json";
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
      if (result.diagrams.length > 0) {
        dispatch({
          type: "LOAD_DIAGRAM",
          payload: result.diagrams[0].diagram,
        });
      }
      setShowMenu(false);
      setImportError(null);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  };

  const handleLoadDiagram = (loaded: FlowchartDiagram) => {
    dispatch({ type: "LOAD_DIAGRAM", payload: loaded });
    setShowLoadDialog(false);
    setShowTemplates(false);
    setShowMenu(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    const tpl = FLOWCHART_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    if (diagram.nodes.length > 0) {
      const confirmed = window.confirm(
        "Load template? Your current draft is auto-saved."
      );
      if (!confirmed) return;
    }
    // Create a fresh diagram with new IDs
    const idMap = new Map<string, string>();
    const newNodes = tpl.diagram.nodes.map((n) => {
      const newId = crypto.randomUUID();
      idMap.set(n.id, newId);
      return { ...n, id: newId };
    });
    const newEdges = tpl.diagram.edges.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      sourceNodeId: idMap.get(e.sourceNodeId) ?? e.sourceNodeId,
      targetNodeId: idMap.get(e.targetNodeId) ?? e.targetNodeId,
    }));
    const newDiagram: FlowchartDiagram = {
      ...tpl.diagram,
      id: crypto.randomUUID(),
      nodes: newNodes,
      edges: newEdges,
    };
    dispatch({ type: "LOAD_DIAGRAM", payload: newDiagram });
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
            <MenuItem icon={FilePlus} label="New Diagram" onClick={handleNew} />
            <MenuItem
              icon={LayoutTemplate}
              label="From Template"
              onClick={() => {
                setShowTemplates((prev) => !prev);
                setShowLoadDialog(false);
              }}
            />
            <MenuItem
              icon={Save}
              label="Save to History"
              onClick={handleSave}
            />
            <MenuItem
              icon={FolderOpen}
              label="Load from History"
              onClick={() => {
                setShowLoadDialog((prev) => !prev);
                setShowTemplates(false);
              }}
            />

            <div className="my-1 h-px bg-border" />

            <MenuItem
              icon={Download}
              label="Export JSON"
              onClick={handleExportJson}
            />
            <MenuItem
              icon={Download}
              label="Export All (Backup)"
              onClick={handleExportAll}
            />
            <MenuItem
              icon={Upload}
              label="Import JSON"
              onClick={handleImportClick}
            />

            {importError && (
              <p className="px-3 py-1 text-xs text-pink-500">{importError}</p>
            )}

            {/* Templates list */}
            {showTemplates && (
              <div className="max-h-60 overflow-y-auto border-t border-border">
                {FLOWCHART_TEMPLATES.map((tpl) => (
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
            {showLoadDialog && (
              <LoadDialog onLoad={handleLoadDiagram} />
            )}
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
  onLoad: (diagram: FlowchartDiagram) => void;
}) {
  const [, setTick] = useState(0);
  const history = loadHistory();

  if (history.length === 0) {
    return (
      <div className="border-t border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">
          No saved diagrams yet.
        </p>
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
            onClick={() => onLoad(entry.diagram)}
            className="flex-1 text-left text-sm hover:text-brand"
          >
            <span className="block truncate font-medium">
              {entry.diagram.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {entry.diagram.nodes.length} node
              {entry.diagram.nodes.length !== 1 ? "s" : ""}
              {entry.diagram.edges.length > 0 &&
                ` · ${entry.diagram.edges.length} edge${entry.diagram.edges.length !== 1 ? "s" : ""}`}
              {" · "}
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
              setTick((t) => t + 1);
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
