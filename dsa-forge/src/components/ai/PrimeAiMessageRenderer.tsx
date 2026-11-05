"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ━━ Complexity Regex & Classifier ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Matches expressions like O(1), O(n), O(n²), O(min(n, m)), O(n log n), O(V + E)
const COMPLEXITY_PATTERN =
  /\bO\([^\n\r()]+(?:\([^\n\r()]+\)[^\n\r()]*)*\)/g;

function isPureComplexity(text: string): boolean {
  return /^O\([^\n\r()]+(?:\([^\n\r()]+\)[^\n\r()]*)*\)$/.test(text.trim());
}

function ComplexityBadge({ value }: { value: string }) {
  const inner = value.replace(/^O\(|\)$/g, "").trim().toLowerCase();

  let colorClasses = "bg-violet-500/15 border-violet-500/30 text-violet-200";
  let dotColor = "bg-violet-400";

  if (inner === "1" || inner.includes("log")) {
    // Constant / Logarithmic: Optimal (Emerald)
    colorClasses =
      "bg-emerald-500/15 border-emerald-500/35 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
    dotColor = "bg-emerald-400";
  } else if (
    inner === "n" ||
    inner.includes("min") ||
    inner.includes("max") ||
    inner.includes("v + e") ||
    inner.includes("v+e") ||
    inner.includes("m + n") ||
    inner === "k"
  ) {
    // Linear / Multi-variable: Proportional (Cyan)
    colorClasses =
      "bg-cyan-500/15 border-cyan-500/35 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.15)]";
    dotColor = "bg-cyan-400";
  } else if (
    inner.includes("n²") ||
    inner.includes("n^2") ||
    inner.includes("n³") ||
    inner.includes("n^3") ||
    inner.includes("2^n") ||
    inner.includes("n!")
  ) {
    // Quadratic / Cubic / Exponential: Heavy (Rose)
    colorClasses =
      "bg-rose-500/15 border-rose-500/35 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
    dotColor = "bg-rose-400";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 mx-0.5 rounded-md border align-baseline tracking-tight whitespace-nowrap transition-transform hover:scale-105 select-all",
        colorClasses
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      <span>{value}</span>
    </span>
  );
}

// ━━ Code Block with Copy Button ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayLang = lang ? lang.toUpperCase() : "CODE";

  return (
    <div className="my-2.5 rounded-xl border border-white/10 bg-[#070610] overflow-hidden shadow-lg shadow-black/40">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500/70" />
            <span className="w-2 h-2 rounded-full bg-amber-500/70" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-violet-300 ml-1">
            {displayLang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3 overflow-x-auto text-[11px] sm:text-xs font-mono text-emerald-300/90 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ━━ Inline Tokenizer & Renderer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function renderPrimeAiInline(text: string): React.ReactNode {
  // Pattern matches:
  // 1. `inline code`
  // 2. **bold**
  // 3. *italic*
  // 4. [text](url)
  // 5. Bare Big-O notation O(...)
  const tokenRegex =
    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|\bO\([^\n\r()]+(?:\([^\n\r()]+\)[^\n\r()]*)*\))/g;

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
      const code = val.slice(1, -1);
      if (isPureComplexity(code)) {
        parts.push(<ComplexityBadge key={key} value={code} />);
      } else {
        parts.push(
          <code
            key={key}
            className="bg-white/10 text-cyan-300 px-1 py-0.5 rounded text-[11px] font-mono border border-white/[0.06]"
          >
            {code}
          </code>
        );
      }
    } else if (val.startsWith("**") && val.endsWith("**")) {
      const inner = val.slice(2, -2);
      if (isPureComplexity(inner)) {
        parts.push(<ComplexityBadge key={key} value={inner} />);
      } else {
        parts.push(
          <strong key={key} className="text-white font-bold">
            {renderPrimeAiInline(inner)}
          </strong>
        );
      }
    } else if (val.startsWith("*") && val.endsWith("*") && val.length > 2) {
      parts.push(
        <em key={key} className="text-violet-200/90 italic">
          {renderPrimeAiInline(val.slice(1, -1))}
        </em>
      );
    } else if (val.startsWith("[")) {
      const linkMatch = val.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline underline-offset-2 font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(val);
      }
    } else if (val.startsWith("O(") && isPureComplexity(val)) {
      parts.push(<ComplexityBadge key={key} value={val} />);
    } else {
      parts.push(val);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

// ━━ Table Parser & Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TableBlockData {
  headers: string[];
  alignments: ("left" | "center" | "right")[];
  rows: string[][];
}

function parseTableBlock(headerLine: string, dividerLine: string, rowLines: string[]): TableBlockData {
  const cleanCells = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const headers = cleanCells(headerLine);

  const dividerCells = cleanCells(dividerLine);
  const alignments: ("left" | "center" | "right")[] = dividerCells.map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });

  const rows = rowLines.map(cleanCells);

  return { headers, alignments, rows };
}

function TableView({ data }: { data: TableBlockData }) {
  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#090814]/90 shadow-xl shadow-black/30">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-gradient-to-r from-violet-950/50 via-indigo-950/40 to-violet-950/50">
            {data.headers.map((h, idx) => (
              <th
                key={idx}
                className={cn(
                  "px-3 py-2 font-bold uppercase tracking-wider text-[10px] text-violet-200 border-r last:border-r-0 border-white/[0.06]",
                  data.alignments[idx] === "center"
                    ? "text-center"
                    : data.alignments[idx] === "right"
                    ? "text-right"
                    : "text-left"
                )}
              >
                {renderPrimeAiInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {data.rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="hover:bg-white/[0.04] transition-colors odd:bg-white/[0.015] even:bg-transparent"
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={cn(
                    "px-3 py-2 align-middle text-white/85 text-xs border-r last:border-r-0 border-white/[0.04]",
                    data.alignments[cIdx] === "center"
                      ? "text-center"
                      : data.alignments[cIdx] === "right"
                      ? "text-right"
                      : "text-left"
                  )}
                >
                  {renderPrimeAiInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ━━ Full Block-Level Parser ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type Block =
  | { type: "code"; lang: string; code: string }
  | { type: "table"; data: TableBlockData }
  | { type: "heading"; level: number; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code blocks (``` or ````)
    if (line.trim().startsWith("```")) {
      const fenceMatch = line.trim().match(/^(`{3,})/);
      const fence = fenceMatch ? fenceMatch[1] : "```";
      const lang = line.trim().slice(fence.length).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    // 2. Tables: lines containing | followed by divider row
    if (line.includes("|") && lines[i + 1]?.trim().match(/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/)) {
      const headerRow = line;
      const dividerRow = lines[i + 1].trim();
      i += 2;
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim() !== "") {
        tableRows.push(lines[i].trim());
        i++;
      }
      blocks.push({
        type: "table",
        data: parseTableBlock(headerRow, dividerRow, tableRows),
      });
      continue;
    }

    // 3. Headings
    if (line.startsWith("#")) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({ type: "heading", level: match[1].length, text: match[2] });
        i++;
        continue;
      }
    }

    // 4. Blockquotes
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join("\n") });
      continue;
    }

    // 5. Unordered Lists
    if (/^\s*[-*•]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items: listItems });
      continue;
    }

    // 6. Ordered Lists
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items: listItems });
      continue;
    }

    // 7. Empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 8. Paragraphs
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      // Break if a table starts
      if (
        lines[i].includes("|") &&
        lines[i + 1]?.trim().match(/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/)
      ) {
        break;
      }
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ━━ Main Exported Renderer Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function PrimeAiMessageRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={cn("space-y-2 text-xs sm:text-sm text-white/90 leading-relaxed", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "code":
            return <CodeBlock key={index} code={block.code} lang={block.lang} />;

          case "table":
            return <TableView key={index} data={block.data} />;

          case "heading": {
            if (block.level === 1) {
              return (
                <h1
                  key={index}
                  className="font-extrabold text-white text-base mt-3 mb-1 pb-1 border-b border-white/10"
                >
                  {renderPrimeAiInline(block.text)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2 key={index} className="font-bold text-violet-200 text-sm mt-2.5 mb-1">
                  {renderPrimeAiInline(block.text)}
                </h2>
              );
            }
            return (
              <h3 key={index} className="font-semibold text-violet-300 text-xs mt-2 mb-0.5">
                {renderPrimeAiInline(block.text)}
              </h3>
            );
          }

          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-violet-500/60 bg-violet-950/20 pl-3 pr-2 py-1.5 my-2 rounded-r-xl text-white/80 text-xs italic"
              >
                {renderPrimeAiInline(block.text)}
              </blockquote>
            );

          case "ul":
            return (
              <ul key={index} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-white/85 text-xs leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0 shadow-sm shadow-violet-500/50" />
                    <div className="flex-1 min-w-0">{renderPrimeAiInline(item)}</div>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={index} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-white/85 text-xs leading-relaxed">
                    <span className="font-mono text-violet-400 font-bold text-xs shrink-0 mt-0.5">
                      {iIdx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">{renderPrimeAiInline(item)}</div>
                  </li>
                ))}
              </ol>
            );

          case "paragraph":
            return (
              <p key={index} className="text-white/85 text-xs leading-relaxed">
                {renderPrimeAiInline(block.text)}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
