"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { TOP_PROBLEMS } from "@/lib/db";
import { DifficultyBadge } from "@/components/ui/badge";
import type { Timeframe } from "@/lib/types";

type TimeframeCardId = "30d" | "3m" | "6m" | "8-12m" | "ALL";

export default function TimeframesPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeCardId>("30d");

  // Requirement 1: Filter logic combining 6m+ and all into 8-12 Months
  const filteredProblems = TOP_PROBLEMS.filter((p) => {
    if (selectedTimeframe === "ALL") return true;
    if (selectedTimeframe === "30d") return p.timeframes.includes("30d");
    if (selectedTimeframe === "3m") return p.timeframes.includes("3m");
    if (selectedTimeframe === "6m") return p.timeframes.includes("6m");
    if (selectedTimeframe === "8-12m") {
      return p.timeframes.includes("6m+") || p.timeframes.includes("all");
    }
    return true;
  });

  // Requirement 1: Timeframe Cards according to Excel file (30 Days, 3 Months, 6 Months, 8-12 Months)
  const timeframeCards: Array<{ id: TimeframeCardId; label: string; range: string; desc: string }> = [
    { id: "30d", label: "30 Days", range: "0–30 Days", desc: "Most urgent / freshly asked questions in recent technical rounds" },
    { id: "3m", label: "3 Months", range: "1–3 Months", desc: "Core active interview pool reported in current hiring quarter" },
    { id: "6m", label: "6 Months", range: "3–6 Months", desc: "Medium-term question pool across tech companies" },
    { id: "8-12m", label: "8–12 Months", range: "8–12 Months", desc: "Combined 6+ months & all-time evergreen questions" },
    { id: "ALL", label: "All Timeframes", range: "All", desc: "Show complete problem set across all recency windows" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" /> Recency & Timeframe Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Timeframe Analysis</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Prioritize your revision based on when questions were reported in real technical interviews.
        </p>
      </div>

      {/* Requirement 1: Timeframe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {timeframeCards.map((tf) => {
          let count = 0;
          if (tf.id === "ALL") count = TOP_PROBLEMS.length;
          else if (tf.id === "8-12m") count = TOP_PROBLEMS.filter((p) => p.timeframes.includes("6m+") || p.timeframes.includes("all")).length;
          else count = TOP_PROBLEMS.filter((p) => p.timeframes.includes(tf.id as Timeframe)).length;

          const isActive = selectedTimeframe === tf.id;

          return (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id)}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? "bg-gradient-to-br from-violet-950/50 to-[#101322] border-violet-500/60 ring-1 ring-violet-500/40 shadow-[0_8px_25px_-5px_rgba(124,58,237,0.25)]"
                  : "bg-[#10131f]/70 border-white/10 hover:border-white/20 hover:bg-[#141828]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-base font-bold ${isActive ? "text-violet-300" : "text-white"}`}>
                    {tf.label}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold border border-slate-700/60">
                    {count}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-violet-400 mb-1.5">{tf.range}</div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{tf.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-violet-400 font-bold">{filteredProblems.length}</strong> questions in current timeframe filter
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c0e17]/80 text-slate-400 uppercase tracking-wider border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-5">Problem Title</th>
                <th className="py-3.5 px-5">Difficulty</th>
                <th className="py-3.5 px-5">Target Companies</th>
                <th className="py-3.5 px-5 text-right font-mono">Priority</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProblems.map((prob) => {
                // Requirement 2: Show top 3 companies and rest as number like "+136 more" or "136+ com"
                const topCompanies = prob.companies.slice(0, 3);
                const remainingCount = prob.companies.length - topCompanies.length;

                return (
                  <tr key={prob.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-5 font-semibold text-white group-hover:text-violet-300 transition-colors">
                      <Link href={`/dsa/questions/${prob.slug}`}>{prob.title}</Link>
                    </td>
                    <td className="py-4 px-5">
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {topCompanies.map((cName) => (
                          <span
                            key={cName}
                            className="px-2.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 text-[11px] font-medium border border-white/5"
                          >
                            {cName}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[11px] font-bold border border-violet-500/30"
                            title={`${remainingCount} more companies`}
                          >
                            {remainingCount}+
                          </span>
                        )}

                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-violet-400">
                      {prob.priorityScore}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dsa/questions/${prob.slug}`}
                          className="px-3 py-1.5 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-600/40 transition-colors font-semibold"
                        >
                          Solve
                        </Link>
                        {prob.canonicalUrl && (
                          <a
                            href={prob.canonicalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                            title="Open Problem"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
