"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dumbbell, Zap, Sparkles, RefreshCw, ArrowRight, Play, ExternalLink } from "lucide-react";
import { getSmartNextProblem, TOP_PROBLEMS } from "@/lib/db";
import { DifficultyBadge } from "@/components/ui/badge";
import type { Problem } from "@/lib/types";

export default function PracticePage() {
  const [smartProblem, setSmartProblem] = useState<Problem | null>(null);
  const [randomProblem, setRandomProblem] = useState<Problem | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");

  useEffect(() => {
    setSmartProblem(getSmartNextProblem());
    pickRandom();
  }, []);

  const pickRandom = () => {
    let pool = TOP_PROBLEMS;
    if (filterDifficulty !== "ALL") {
      pool = pool.filter((p) => p.difficulty.toLowerCase() === filterDifficulty.toLowerCase());
    }
    if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      setRandomProblem(pool[idx]);
    }
  };

  const handleRefreshSmart = () => {
    setSmartProblem(getSmartNextProblem());
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-1">
          <Dumbbell className="w-4 h-4" /> Focused Practice Arena
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Smart Practice</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Let our recommendation engine guide your next practice session based on recency, difficulty progression, and unvisited patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Next Box */}
        <div className="p-6 bg-gradient-to-br from-violet-950/40 via-zinc-900 to-zinc-900 border border-violet-500/30 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Next
              </span>
              <button
                onClick={handleRefreshSmart}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Re-evaluate recommendation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {smartProblem ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={smartProblem.difficulty} />
                  <span className="text-xs text-zinc-400 font-mono">Priority Score: {smartProblem.priorityScore}</span>
                </div>
                <h2 className="text-xl font-bold text-white hover:text-violet-400 transition-colors">
                  <Link href={`/dsa/questions/${smartProblem.slug}`}>{smartProblem.title}</Link>
                </h2>
                <p className="text-xs text-zinc-400 line-clamp-3">
                  This question is selected based on high company frequency and optimal difficulty curve for your learning path.
                </p>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">No problem available.</p>
            )}
          </div>

          {smartProblem && (
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
              <Link
                href={`/dsa/questions/${smartProblem.slug}`}
                className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-600/20"
              >
                Start Practice <Play className="w-3.5 h-3.5 fill-current" />
              </Link>
              {smartProblem.canonicalUrl && (
                <a
                  href={smartProblem.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors border border-zinc-700/60"
                >
                  Platform <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Quick Shuffle Box */}
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Random Quick Drill
              </span>
              <div className="flex gap-1">
                {["ALL", "Easy", "Medium", "Hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setFilterDifficulty(d);
                      setTimeout(pickRandom, 50);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      filterDifficulty === d
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {randomProblem ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={randomProblem.difficulty} />
                </div>
                <h2 className="text-xl font-bold text-white hover:text-violet-400 transition-colors">
                  <Link href={`/dsa/questions/${randomProblem.slug}`}>{randomProblem.title}</Link>
                </h2>
                <p className="text-xs text-zinc-400">
                  Targeted question shuffle from your selected difficulty tier. Great for timed test simulations.
                </p>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">No problem matches filter.</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={pickRandom}
              className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700/60"
            >
              Shuffle <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {randomProblem && (
              <Link
                href={`/dsa/questions/${randomProblem.slug}`}
                className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Solve Problem <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
