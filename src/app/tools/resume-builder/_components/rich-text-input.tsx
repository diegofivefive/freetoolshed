"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Bold, Italic, Link, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextInputProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Single line (like an input) or multi-line (like a textarea) */
  multiline?: boolean;
}

export function RichTextInput({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
}: RichTextInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInternalUpdate = useRef(false);

  // Sync external value changes into the editor
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalUpdate.current = true;
    // Normalize: strip divs/p tags that contentEditable may insert
    let html = el.innerHTML;
    html = html.replace(/<div>/gi, "<br>").replace(/<\/div>/gi, "");
    html = html.replace(/<p>/gi, "").replace(/<\/p>/gi, "<br>");
    if (!multiline) {
      html = html.replace(/<br\s*\/?>/gi, " ");
    }
    onChange(html);
  }, [onChange, multiline]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
      }
    },
    [multiline]
  );

  const execCmd = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    // Trigger input handler after command
    const el = editorRef.current;
    if (el) {
      isInternalUpdate.current = true;
      onChange(el.innerHTML);
    }
  }, [onChange]);

  const handleBold = useCallback(() => execCmd("bold"), [execCmd]);
  const handleItalic = useCallback(() => execCmd("italic"), [execCmd]);

  const handleLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    // Check if already inside a link
    const anchor = selection.anchorNode?.parentElement?.closest("a");
    if (anchor) {
      execCmd("unlink");
    } else {
      const url = prompt("Enter URL:");
      if (url) {
        const trimmed = url.trim();
        if (/^https?:\/\//i.test(trimmed)) {
          execCmd("createLink", trimmed);
        } else if (/^[a-z]+:/i.test(trimmed)) {
          // Block javascript:, data:, vbscript:, etc.
          return;
        } else {
          // Bare domain — prepend https://
          execCmd("createLink", `https://${trimmed}`);
        }
      }
    }
  }, [execCmd]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      // Paste as plain text to avoid bringing in external formatting
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    []
  );

  const isEmpty = !value || value === "<br>" || value.replace(/<[^>]*>/g, "").trim() === "";

  return (
    <div className="space-y-1">
      {/* Mini toolbar - only visible when focused */}
      {isFocused && (
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleBold(); }}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Bold (Ctrl+B)"
          >
            <Bold className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleItalic(); }}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Italic (Ctrl+I)"
          >
            <Italic className="size-3.5" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Link (select text first)"
          >
            <Link className="size-3.5" />
          </button>
        </div>
      )}
      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onPaste={handlePaste}
          className={cn(
            "min-h-[36px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_a]:text-brand [&_a]:underline",
            !multiline && "whitespace-nowrap overflow-x-auto",
            className
          )}
          role="textbox"
          aria-multiline={multiline}
        />
        {isEmpty && !isFocused && placeholder && (
          <div className="pointer-events-none absolute inset-0 flex items-center px-3 py-2 text-sm text-muted-foreground">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
