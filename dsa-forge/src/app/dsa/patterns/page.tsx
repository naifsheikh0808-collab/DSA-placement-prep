"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllPatterns } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { GitBranch, ArrowRight, Search, Sparkles, Compass, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pattern } from "@/lib/types";

type TierTab = "all" | "core" | "advanced";

function PatternCard({ pattern }: { pattern: Pattern }) {
  const isAdvanced = pattern.tier === "advanced";
  const orderBadge = `#${String(pattern.orderIndex).padStart(2, "0")}`;

  return (
    <Link
      href={`/dsa/patterns/${pattern.slug}`}
      className="group relative p-6 rounded-2xl bg-[#10131f]/70 border border-white/10 hover:border-violet-500/40 backdrop-blur-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.18)]"
      style={{
        borderColor: pattern.color ? `${pattern.color}30` : undefined,
      }}
    >
      <div>
        {/* Header row: Index order, Tier tag, Question count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border"
              style={{
                backgroundColor: `${pattern.color}15`,
                borderColor: `${pattern.color}35`,
                color: pattern.color,
              }}
            >
              {orderBadge}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                isAdvanced
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-violet-500/15 text-violet-300 border-violet-500/30"
              )}
            >
              {isAdvanced ? "Advanced" : "Core"}
            </span>
          </div>

          <Badge variant="violet" className="text-[11px]">
            {pattern.questions?.length || pattern.questionCount} Curated
          </Badge>
        </div>

        <h2 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
          {pattern.name}
        </h2>
        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
          {pattern.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          Interview Signal:{" "}
          <strong className="text-slate-200">{pattern.companyCoverage}%</strong>
        </span>
        <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Explore <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

export default function PatternsPage() {
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<TierTab>("all");

  const patterns = getAllPatterns().sort((a, b) => a.orderIndex - b.orderIndex);

  const corePatterns = patterns.filter((p) => p.tier === "core");
  const advancedPatterns = patterns.filter((p) => p.tier === "advanced");

  const filtered = patterns.filter((p) => {
    const matchesTier = activeTier === "all" || p.tier === activeTier;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Compass className="w-4 h-4 text-violet-400" /> Pedagogical DSA Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DSA Pattern Explorer
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Master 24 battle-tested algorithmic templates sequenced in chronological interview order.
            Solve 24 patterns instead of grinding 1,000 random problems.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search 24 patterns, techniques..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#10131f]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTier("all")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2",
            activeTier === "all"
              ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
              : "text-slate-400 hover:text-white bg-[#10131f]/60 border border-white/5"
          )}
        >
          <span>All Templates</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] text-slate-300">
            {patterns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTier("core")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2",
            activeTier === "core"
              ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
              : "text-slate-400 hover:text-white bg-[#10131f]/60 border border-white/5"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span>Tier 1: Core Foundations</span>
          <span className="px-1.5 py-0.5 rounded-md bg-violet-500/20 text-[10px] text-violet-300 font-mono">
            {corePatterns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTier("advanced")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2",
            activeTier === "advanced"
              ? "bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white bg-[#10131f]/60 border border-white/5"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Tier 2: Advanced Frameworks</span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[10px] text-amber-300 font-mono">
            {advancedPatterns.length}
          </span>
        </button>
      </div>

      {/* Grid Content with Separation */}
      {activeTier === "all" && !search ? (
        <div className="space-y-10">
          {/* ─── Tier 1 Section ─── */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>Tier 1: Core Foundations (#01 – #15)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {corePatterns.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </div>

          {/* ─── Thin Divider Line with Separation Badge ─── */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-[#0b0d14] px-4 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-amber-300 flex items-center gap-2 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Tier 2: Advanced & Specialized Frameworks</span>
                <span className="font-mono text-[10px] text-amber-400/90 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  #16 – #24
                </span>
              </div>
            </div>
          </div>

          {/* ─── Tier 2 Section ─── */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {advancedPatterns.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Filtered Grid (by specific tab or search) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-[#10131f]/40 border border-white/5 rounded-2xl">
          <p className="text-slate-400 text-sm">No patterns matched your search.</p>
        </div>
      )}
    </div>
  );
}
