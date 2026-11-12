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
  Check,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial notes when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes);
      setIsSaved(true);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 80);
    }
  }, [isOpen, initialNotes]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSaveAndClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSaveAndClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        applyFormat("**", "**", "bold text");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        applyFormat("*", "*", "italic text");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        applyFormat("<u>", "</u>", "underlined text");
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
    setTimeout(() => setIsSaved(true), 500);
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
    setTimeout(() => setIsSaved(true), 500);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    }, 10);
  };

  // Helper to apply line-level prefixes (Heading, Bullets, Ordered lists)
  const applyLinePrefix = (prefix: string, defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lastNewline = notes.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    if (start === end && start === lineStart) {
      const replacement = prefix + (defaultText ? defaultText : "");
      const newNotes = notes.substring(0, lineStart) + replacement + notes.substring(lineStart);
      setNotes(newNotes);
      setIsSaved(false);
      onSave(newNotes);
      setTimeout(() => setIsSaved(true), 500);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + prefix.length, lineStart + replacement.length);
      }, 10);
      return;
    }

    const selected = notes.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}`;
    const newNotes = notes.substring(0, start) + replacement + notes.substring(end);

    setNotes(newNotes);
    setIsSaved(false);
    onSave(newNotes);
    setTimeout(() => setIsSaved(true), 500);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length);
    }, 10);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={handleSaveAndClose}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Fixed Comfortable Dialog */}
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl h-[520px] max-h-[85vh] bg-[#0d0f1e] border border-white/10 rounded-2xl flex flex-col shadow-2xl shadow-black/80 overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate">
                Notes
              </h2>
              <p className="text-[11px] text-zinc-400 truncate max-w-[220px] sm:max-w-md">
                {problemExternalId ? `#${problemExternalId} ` : ""}
                {problemTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-medium text-emerald-400/90 hidden sm:inline">
              {isSaved ? "Saved" : "Saving..."}
            </span>
            <button
              onClick={handleSaveAndClose}
              type="button"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Essential Formatting Toolbar (Zero Clutter) ── */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/[0.06] bg-white/[0.015] flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* Headings */}
          <button
            type="button"
            onClick={() => applyLinePrefix("# ", "Heading")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Large Heading"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyLinePrefix("## ", "Subheading")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Medium Heading"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Bold, Italic, Underline */}
          <button
            type="button"
            onClick={() => applyFormat("**", "**", "bold text")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat("*", "*", "italic text")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat("<u>", "</u>", "underlined text")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 underline underline-offset-2"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => applyLinePrefix("- ", "List item")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyLinePrefix("1. ", "Numbered item")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* ── Large Comfortable Writing Area ── */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col overflow-hidden">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={handleChange}
            placeholder="Write your notes here..."
            className="w-full flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none font-sans leading-relaxed select-text"
            spellCheck={false}
          />
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-white/[0.08] bg-black/30 flex items-center justify-between text-xs text-zinc-500">
          <span>{wordCount} words</span>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
