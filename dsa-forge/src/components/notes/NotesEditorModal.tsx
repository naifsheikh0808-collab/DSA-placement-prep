"use client";

import React, { useEffect, useRef, useCallback } from "react";
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

/**
 * Converts Markdown string to HTML for the WYSIWYG contentEditable editor.
 */
function markdownToHtml(md: string): string {
  if (!md || !md.trim()) return "";
  const trimmedMd = md.trim();

  // If already HTML format, return directly
  if (/^<(p|div|h1|h2|ul|ol)\b/i.test(trimmedMd)) {
    return trimmedMd;
  }

  const lines = trimmedMd.split("\n");
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  const formatInline = (str: string) =>
    str
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/__(.+?)__/g, "<u>$1</u>")
      .replace(/<u>(.*?)<\/u>/gi, "<u>$1</u>")
      .replace(/\*([^*]+?)\*/g, "<i>$1</i>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      result.push(`<h2>${formatInline(trimmed.slice(4))}</h2>`);
    } else if (trimmed.startsWith("## ")) {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      result.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      result.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (inOl) { result.push("</ol>"); inOl = false; }
      if (!inUl) { result.push("<ul>"); inUl = true; }
      result.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (!inOl) { result.push("<ol>"); inOl = true; }
      const content = trimmed.replace(/^\d+\.\s/, "");
      result.push(`<li>${formatInline(content)}</li>`);
    } else if (trimmed === "") {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      result.push("<p><br></p>");
    } else {
      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }
      result.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inUl) result.push("</ul>");
  if (inOl) result.push("</ol>");

  return result.join("");
}

/**
 * Converts WYSIWYG HTML back to clean, compact Markdown string for storage.
 */
function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return "";
  let text = html;

  // Normalize empty break lines
  text = text.replace(/<(p|div)>\s*<br\s*[\/]?>\s*<\/\1>/gi, "\n\n");

  // Headings
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n## $1\n");

  // Lists
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1");
  text = text.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");

  // Paragraphs & Divs
  text = text.replace(/<(p|div)[^>]*>(.*?)<\/\1>/gi, "\n$2\n");
  text = text.replace(/<br\s*[\/]?>/gi, "\n");

  // Inline tags
  text = text.replace(/<(b|strong)[^>]*>(.*?)<\/\1>/gi, "**$2**");
  text = text.replace(/<(i|em)[^>]*>(.*?)<\/\1>/gi, "*$2*");
  text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, "<u>$1</u>");
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Remove any remaining unwanted HTML tags except <u>
  text = text.replace(/<(?!\/?u\b)[^>]+>/g, "");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  // Normalize multi-newlines
  return text
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function NotesEditorModal({
  isOpen,
  onClose,
  problemTitle,
  problemExternalId,
  initialNotes,
  onSave,
}: NotesEditorModalProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const wordCountRef = useRef<HTMLSpanElement>(null);
  const saveStatusRef = useRef<HTMLSpanElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasOpenRef = useRef(false);
  const lastSavedMdRef = useRef(initialNotes);

  // Initialize editor content ONLY once when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      lastSavedMdRef.current = initialNotes;
      if (editorRef.current) {
        const html = markdownToHtml(initialNotes || "");
        editorRef.current.innerHTML = html;

        // Initialize word count directly on DOM
        if (wordCountRef.current) {
          const text = editorRef.current.innerText || "";
          const trimmed = text.trim();
          const count = trimmed ? trimmed.split(/\s+/).length : 0;
          wordCountRef.current.textContent = `${count} words`;
        }
        if (saveStatusRef.current) {
          saveStatusRef.current.textContent = "Saved";
          saveStatusRef.current.className = "text-[11px] font-medium text-emerald-400/90 hidden sm:inline";
        }

        // Focus editor
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }, 50);
      }
    } else if (!isOpen) {
      wasOpenRef.current = false;
    }
  }, [isOpen, initialNotes]);

  // Handle saving and closing safely
  const handleSaveAndClose = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    try {
      if (editorRef.current) {
        const md = htmlToMarkdown(editorRef.current.innerHTML);
        if (md !== lastSavedMdRef.current) {
          lastSavedMdRef.current = md;
          onSave(md);
        }
      }
    } catch (err) {
      console.error("[NotesEditorModal] Error saving notes:", err);
    } finally {
      onClose();
    }
  }, [onSave, onClose]);

  // Handle typing & content change without triggering ANY React re-renders (zero thread blocking)
  const handleInput = () => {
    // 1. Direct DOM update for word count (0ms, 0 React renders)
    if (wordCountRef.current && editorRef.current) {
      const text = editorRef.current.innerText || "";
      const trimmed = text.trim();
      const count = trimmed ? trimmed.split(/\s+/).length : 0;
      wordCountRef.current.textContent = `${count} words`;
    }

    // 2. Direct DOM update for status indicator (0ms, 0 React renders)
    if (saveStatusRef.current) {
      saveStatusRef.current.textContent = "Saving...";
      saveStatusRef.current.className = "text-[11px] font-medium text-amber-400/90 hidden sm:inline";
    }

    // 3. Debounced quiet background sync
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (editorRef.current) {
          const md = htmlToMarkdown(editorRef.current.innerHTML);
          if (md !== lastSavedMdRef.current) {
            lastSavedMdRef.current = md;
            onSave(md);
          }
        }
      } catch (err) {
        console.error("[NotesEditorModal] Auto-save error:", err);
      } finally {
        if (saveStatusRef.current) {
          saveStatusRef.current.textContent = "Saved";
          saveStatusRef.current.className = "text-[11px] font-medium text-emerald-400/90 hidden sm:inline";
        }
      }
    }, 2000);
  };

  // Keyboard shortcuts (Escape, Ctrl+Enter)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSaveAndClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSaveAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleSaveAndClose]);

  if (!isOpen) return null;

  // Execute formatting command on text selection
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, value);
      handleInput();
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

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
              <h2 className="text-sm font-bold text-white truncate">Notes</h2>
              <p className="text-[11px] text-zinc-400 truncate max-w-[220px] sm:max-w-md">
                {problemExternalId ? `#${problemExternalId} ` : ""}
                {problemTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              ref={saveStatusRef}
              className="text-[11px] font-medium text-emerald-400/90 hidden sm:inline"
            >
              Saved
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

        {/* ── Visual WYSIWYG Formatting Toolbar (Zero Asterisks) ── */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/[0.06] bg-white/[0.015] flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* Headings */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("formatBlock", "<h1>");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Large Heading"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("formatBlock", "<h2>");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Medium Heading"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Bold, Italic, Underline - Instant Visual Application */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("bold");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("italic");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("underline");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 underline underline-offset-2"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("insertUnorderedList");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd("insertOrderedList");
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* ── Visual WYSIWYG Writing Area ── */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col overflow-hidden">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            data-placeholder="Add your approach, time complexity or insight..."
            className={cn(
              "w-full flex-1 bg-transparent text-sm sm:text-base text-zinc-100 focus:outline-none overflow-y-auto leading-relaxed select-text scrollbar-thin",
              // Instant Visual Formatting Styles
              "[&_h1]:text-lg [&_h1]:sm:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-2 [&_h1]:mt-2",
              "[&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-1.5 [&_h2]:mt-2",
              "[&_b]:font-bold [&_b]:text-white [&_strong]:font-bold [&_strong]:text-white",
              "[&_i]:italic [&_i]:text-violet-200 [&_em]:italic [&_em]:text-violet-200",
              "[&_u]:underline [&_u]:underline-offset-2 [&_u]:decoration-violet-400",
              "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ul]:space-y-1",
              "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_ol]:space-y-1",
              "[&_p]:my-1",
              "[&_code]:bg-violet-500/15 [&_code]:border [&_code]:border-violet-500/30 [&_code]:text-cyan-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
              // Clean placeholder when empty
              "empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-600 empty:before:pointer-events-none"
            )}
            spellCheck={false}
          />
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-white/[0.08] bg-black/30 flex items-center justify-between text-xs text-zinc-500">
          <span ref={wordCountRef}>0 words</span>

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
