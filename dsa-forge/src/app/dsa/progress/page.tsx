"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, CheckCircle2, Circle, RefreshCw, BarChart3, Target, Award } from "lucide-react";
import { getLocalProgress, resetProgress, TOP_PROBLEMS, PATTERNS } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";

export default function ProgressPage() {
  const [progress, setProgress] = useState<Record<string, any>>({});

  const reloadProgress = () => {
    setProgress(getLocalProgress());
  };

  useEffect(() => {
    reloadProgress();
  }, []);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your practice progress?")) {
      resetProgress();
      reloadProgress();
    }
  };

  const solvedSlugs = Object.keys(progress).filter(
    (key) => progress[key].status === "solved" || progress[key].status === "mastered"
  );

  const easySolved = TOP_PROBLEMS.filter(
    (p) => p.difficulty === "Easy" && (progress[p.slug]?.status === "solved" || progress[p.slug]?.status === "mastered")
  ).length;

  const mediumSolved = TOP_PROBLEMS.filter(
    (p) => p.difficulty === "Medium" && (progress[p.slug]?.status === "solved" || progress[p.slug]?.status === "mastered")
  ).length;

  const hardSolved = TOP_PROBLEMS.filter(
    (p) => p.difficulty === "Hard" && (progress[p.slug]?.status === "solved" || progress[p.slug]?.status === "mastered")
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-1">
            <TrendingUp className="w-4 h-4" /> Personal Analytics & Tracker
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Progress</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Monitor your solved problems, pattern coverage, and preparation velocity.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium rounded-lg hover:bg-red-900/50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset All Progress
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="text-xs text-zinc-400 uppercase font-semibold mb-1">Total Solved</div>
          <div className="text-3xl font-extrabold text-white">
            {solvedSlugs.length}{" "}
            <span className="text-sm font-normal text-zinc-500">/ {TOP_PROBLEMS.length}</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-violet-500 h-full transition-all"
              style={{ width: `${(solvedSlugs.length / TOP_PROBLEMS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="text-xs text-emerald-400 uppercase font-semibold mb-1">Easy Solved</div>
          <div className="text-3xl font-extrabold text-white">
            {easySolved}{" "}
            <span className="text-sm font-normal text-zinc-500">
              / {TOP_PROBLEMS.filter((p) => p.difficulty === "Easy").length}
            </span>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="text-xs text-amber-400 uppercase font-semibold mb-1">Medium Solved</div>
          <div className="text-3xl font-extrabold text-white">
            {mediumSolved}{" "}
            <span className="text-sm font-normal text-zinc-500">
              / {TOP_PROBLEMS.filter((p) => p.difficulty === "Medium").length}
            </span>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <div className="text-xs text-rose-400 uppercase font-semibold mb-1">Hard Solved</div>
          <div className="text-3xl font-extrabold text-white">
            {hardSolved}{" "}
            <span className="text-sm font-normal text-zinc-500">
              / {TOP_PROBLEMS.filter((p) => p.difficulty === "Hard").length}
            </span>
          </div>
        </div>
      </div>

      {/* Pattern Progress Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" /> Pattern Mastery Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PATTERNS.map((pattern) => {
            const patternProbs = TOP_PROBLEMS.filter(
              (p) => p.primaryPattern?.toLowerCase() === pattern.name.toLowerCase() || p.primaryPattern?.toLowerCase() === pattern.slug.toLowerCase()
            );
            const patternSolved = patternProbs.filter(
              (p) => progress[p.slug]?.status === "solved" || progress[p.slug]?.status === "mastered"
            ).length;
            const pct = patternProbs.length > 0 ? Math.round((patternSolved / patternProbs.length) * 100) : 0;

            return (
              <div key={pattern.id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-200">{pattern.name}</span>
                  <span className="text-violet-400">{pct}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-zinc-500">
                  {patternSolved} of {patternProbs.length} completed
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
