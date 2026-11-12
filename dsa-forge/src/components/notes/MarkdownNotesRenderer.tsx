"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownNotesRendererProps {
  content: string;
  className?: string;
  isCompact?: boolean;
}

/**
 * Tokenizes inline Markdown:
 * - Bold: **text**
 * - Italic: *text*
 * - Underline: <u>text</u> or __text__
 * - Inline code: `code`
 * - Big-O notation: O(1), O(n), O(n log n), etc.
 */
function renderInlineTokens(text: string, depth = 0): React.ReactNode {
  if (!text) return null;
  if (depth > 5) return text;

  // Regex matches:
  // 1. `inline code`
  // 2. <u>underline</u>
  // 3. __underline__
  // 4. **bold**
  // 5. *italic*
  // 6. O(...) complexity (non-backtracking)
  const tokenRegex =
    /(`[^`]+`|<u>[\s\S]*?<\/u>|__[^_]+__|\*\*[^*]+\*\*|\*[^*]+\*|\bO\([^()\n\r]+(?:\([^()\n\r]+\)[^()\n\r]*)?\))/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const val = match[0];
    const key = `${match.index}-${val.slice(0, 8)}`;

    if (val.startsWith("`") && val.endsWith("`")) {
      parts.push(
        <code
          key={key}
          className="bg-violet-500/15 border border-violet-500/30 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono tracking-tight"
        >
          {val.slice(1, -1)}
        </code>
      );
    } else if (
      (val.startsWith("<u>") && val.endsWith("</u>")) ||
      (val.startsWith("__") && val.endsWith("__"))
    ) {
      const inner = val.startsWith("<u>") ? val.slice(3, -4) : val.slice(2, -2);
      parts.push(
        <span
          key={key}
          className="underline underline-offset-2 decoration-violet-400 text-slate-100 font-medium decoration-1.5"
        >
          {renderInlineTokens(inner, depth + 1)}
        </span>
      );
    } else if (val.startsWith("**") && val.endsWith("**")) {
      parts.push(
        <strong key={key} className="text-white font-bold tracking-tight">
          {renderInlineTokens(val.slice(2, -2), depth + 1)}
        </strong>
      );
    } else if (val.startsWith("*") && val.endsWith("*") && val.length > 2) {
      parts.push(
        <em key={key} className="text-violet-200/95 italic">
          {renderInlineTokens(val.slice(1, -1), depth + 1)}
        </em>
      );
    } else if (/^\bO\(.+\)$/.test(val)) {
      parts.push(
        <span
          key={key}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 mx-0.5 rounded-md border align-baseline bg-violet-500/15 border-violet-500/30 text-violet-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
          <span>{val}</span>
        </span>
      );
    }

    lastIndex = match.index + val.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

interface Block {
  type: "h1" | "h2" | "h3" | "ul" | "ol" | "code" | "quote" | "p";
  items?: string[];
  text?: string;
  lang?: string;
}

function parseBlocks(markdown: string): Block[] {
  if (!markdown) return [];
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const startI = i;
    const line = lines[i];

    // 1. Fenced Code Block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      blocks.push({ type: "code", lang, text: codeLines.join("\n") });
      continue;
    }

    // 2. Headings (#, ##, ###) - safely consume empty or populated headings
    const headingMatch = line.trim().match(/^(#{1,3})(?:\s+(.*))?$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = (headingMatch[2] || "").trim();
      if (text) {
        blocks.push({
          type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
          text,
        });
      }
      i++;
      continue;
    }

    // 3. Blockquote (> ...)
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join("\n") });
      continue;
    }

    // 4. Bullet list (- or * or •)
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // 5. Ordered list (1. 2. 3.)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // 6. Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 7. Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !/^#{1,3}(?:\s|$)/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "p", text: paraLines.join(" ") });
    }

    // Absolute failsafe: guarantee forward progress on any malformed input
    if (i === startI) {
      blocks.push({ type: "p", text: lines[i] });
      i++;
    }
  }

  return blocks;
}

export function MarkdownNotesRenderer({
  content,
  className,
  isCompact = false,
}: MarkdownNotesRendererProps) {
  if (!content || !content.trim()) {
    return (
      <div className="text-zinc-500 text-xs italic py-2">
        No notes yet. Click to write your approach, time complexity & edge cases.
      </div>
    );
  }

  const blocks = parseBlocks(content);

  return (
    <div
      className={cn(
        "space-y-2.5 text-zinc-200 leading-relaxed font-sans select-text",
        isCompact ? "text-xs space-y-1.5" : "text-xs sm:text-sm",
        className
      )}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={idx}
                className={cn(
                  "font-bold text-white border-b border-white/10 pb-1 tracking-tight",
                  isCompact ? "text-sm mt-1 mb-0.5" : "text-base sm:text-lg mt-3 mb-1.5"
                )}
              >
                {renderInlineTokens(block.text || "")}
              </h1>
            );

          case "h2":
            return (
              <h2
                key={idx}
                className={cn(
                  "font-bold text-violet-300 tracking-tight",
                  isCompact ? "text-xs mt-1 mb-0.5" : "text-sm sm:text-base mt-2.5 mb-1"
                )}
              >
                {renderInlineTokens(block.text || "")}
              </h2>
            );

          case "h3":
            return (
              <h3
                key={idx}
                className={cn(
                  "font-semibold text-cyan-300 tracking-tight",
                  isCompact ? "text-[11px] mt-0.5" : "text-xs sm:text-sm mt-2 mb-0.5"
                )}
              >
                {renderInlineTokens(block.text || "")}
              </h3>
            );

          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-violet-500/70 bg-violet-950/20 pl-3 pr-2 py-1 my-1.5 rounded-r-lg text-zinc-300 text-xs italic"
              >
                {renderInlineTokens(block.text || "")}
              </blockquote>
            );

          case "ul":
            return (
              <ul key={idx} className="space-y-1 my-1 pl-1">
                {block.items?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-200 text-xs leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0 shadow-sm shadow-violet-500/40" />
                    <span className="flex-1 min-w-0">{renderInlineTokens(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={idx} className="space-y-1 my-1 pl-1 counter-reset-item">
                {block.items?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-200 text-xs leading-relaxed">
                    <span className="font-mono text-[10px] font-bold text-violet-400/90 shrink-0 mt-0.5 w-4 text-right">
                      {i + 1}.
                    </span>
                    <span className="flex-1 min-w-0">{renderInlineTokens(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case "code":
            return (
              <div
                key={idx}
                className="my-2 rounded-xl border border-white/10 bg-[#080914] overflow-hidden shadow-md"
              >
                {block.lang && (
                  <div className="px-3 py-1 bg-white/[0.03] border-b border-white/[0.07] text-[10px] font-mono text-violet-300 uppercase tracking-wider font-bold">
                    {block.lang}
                  </div>
                )}
                <pre className="p-3 overflow-x-auto text-[11px] font-mono text-cyan-300/95 leading-relaxed">
                  <code>{block.text}</code>
                </pre>
              </div>
            );

          case "p":
          default:
            return (
              <p key={idx} className="text-zinc-200/95 leading-relaxed">
                {renderInlineTokens(block.text || "")}
              </p>
            );
        }
      })}
    </div>
  );
}
