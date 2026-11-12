"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  FileCode,
  Eye,
  Edit3,
  Check,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownNotesRenderer } from "./MarkdownNotesRenderer";

interface NotesEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  problemExternalId?: string | number;
  initialNotes: string;
  onSave: (notes: string) => void;
}

export function NotesEditorModal({
  isOpen,
  onClose,
  problemTitle,
  problemExternalId,
  initialNotes,
  onSave,
}: NotesEditorModalProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "split">("write");
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialNotes when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes);
      setIsSaved(true);
      // Auto-focus textarea on desktop
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialNotes]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSaveAndClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSaveAndClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        applyFormat("**", "**");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        applyFormat("*", "*");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        applyFormat("<u>", "</u>");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, notes]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setIsSaved(false);
    onSave(val);
    setTimeout(() => setIsSaved(true), 600);
  };

  const handleSaveAndClose = () => {
    onSave(notes);
    onClose();
  };

  // Helper to wrap selected text in textarea
  const applyFormat = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newNotes = notes.substring(0, start) + replacement + notes.substring(end);

    setNotes(newNotes);
    setIsSaved(false);
    onSave(newNotes);
    setTimeout(() => setIsSaved(true), 600);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 10);
  };

  // Quick DSA templates
  const insertTemplate = (templateContent: string) => {
    const separator = notes.trim().length > 0 ? "\n\n" : "";
    const updated = notes + separator + templateContent;
    setNotes(updated);
    setIsSaved(false);
    onSave(updated);
    setTimeout(() => setIsSaved(true), 600);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 20);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={handleSaveAndClose}
    >
      {/* Frosted Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative z-10 w-full bg-[#0c0e1a] border border-violet-500/30 flex flex-col shadow-2xl shadow-violet-950/60 overflow-hidden",
          // Mobile: Fullscreen sheet
          "h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-3xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-[#14122b]/80 via-[#101324] to-[#0c0e1a]">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                  {problemExternalId ? `#${problemExternalId} ` : ""}
                  {problemTitle}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0">
                  Markdown Notes
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isSaved ? "Saved to Cloud" : "Saving..."}
                </span>
                <span>·</span>
                <span>{wordCount} words</span>
              </div>
            </div>
          </div>

          {/* Action Tabs & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === "write"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                title="Write Markdown"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Write</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === "preview"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                title="Preview Rendered Markdown"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              {/* Split view on large desktop */}
              <button
                type="button"
                onClick={() => setActiveTab("split")}
                className={cn(
                  "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === "split"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                title="Side-by-side Split View"
              >
                <span>Split</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleSaveAndClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Save & Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ── Formatting Toolbar ── */}
        <div className="px-3 sm:px-6 py-2 border-b border-white/[0.06] bg-white/[0.015] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Main Formatting Tools */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => applyFormat("**", "**", "bold text")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => applyFormat("*", "*", "italic text")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => applyFormat("<u>", "</u>", "underlined text")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <button
              type="button"
              onClick={() => applyFormat("# ", "", "Heading 1")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => applyFormat("## ", "", "Heading 2")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <button
              type="button"
              onClick={() => applyFormat("- ", "", "Bullet item")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => applyFormat("1. ", "", "Ordered item")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <button
              type="button"
              onClick={() => applyFormat("`", "`", "code")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => applyFormat("```cpp\n", "\n```", "// Solution snippet")}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Code Block"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick DSA Template Presets */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-white/10">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">
              Insert:
            </span>
            <button
              type="button"
              onClick={() =>
                insertTemplate(
                  "### 💡 Approach & Intuition\n- **Pattern:** Two Pointers\n- Key observation:\n- Step-by-step logic:"
                )
              }
              className="text-[10px] font-semibold px-2 py-1 rounded-md bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              + Approach
            </button>

            <button
              type="button"
              onClick={() =>
                insertTemplate(
                  "**Time Complexity:** O(n) — single pass\n**Space Complexity:** O(1) — in-place pointers"
                )
              }
              className="text-[10px] font-semibold px-2 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              + Complexity
            </button>

            <button
              type="button"
              onClick={() =>
                insertTemplate(
                  "### ⚠️ Edge Cases\n- Empty input / array length 0\n- Single element\n- All duplicates or negative numbers"
                )
              }
              className="text-[10px] font-semibold px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              + Edge Cases
            </button>
          </div>
        </div>

        {/* ── Editor & Preview Workspace ── */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Write Pane */}
          {(activeTab === "write" || activeTab === "split") && (
            <div
              className={cn(
                "flex-1 flex flex-col p-4 sm:p-6 overflow-hidden",
                activeTab === "split" ? "border-r border-white/10" : ""
              )}
            >
              <textarea
                ref={textareaRef}
                value={notes}
                onChange={handleChange}
                placeholder="Write your personal notes, key intuitions, dry run, and complexities here... (Markdown supported)"
                className="w-full flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none font-mono leading-relaxed select-text"
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview Pane */}
          {(activeTab === "preview" || activeTab === "split") && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-black/20">
              <MarkdownNotesRenderer content={notes} />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>{charCount} characters</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Supports **bold**, *italic*, &lt;u&gt;underline&lt;/u&gt;, # headings, - lists</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
