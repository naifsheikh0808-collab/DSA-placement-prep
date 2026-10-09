"use client";

import { useState } from "react";
import Link from "next/link";
import { Map, Target, Calendar, CheckCircle2, ArrowRight, Zap, BookOpen } from "lucide-react";
import { generateRoadmap, TOP_PROBLEMS, PATTERNS } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";

export default function RoadmapsPage() {
  const [days, setDays] = useState<number>(30);
  const [tier, setTier] = useState<"MAANG" | "Tier-1" | "All">("MAANG");
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any[] | null>(null);

  const handleGenerate = () => {
    const rm = generateRoadmap({ targetDays: days, targetCompanyTier: tier });
    setGeneratedRoadmap(rm);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-1">
          <Map className="w-4 h-4" /> Customized Learning Paths
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">DSA Roadmaps</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Generate an optimized timeline-based study roadmap tailored to your target company tier and remaining preparation time.
        </p>
      </div>

      {/* Generator Tool */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-400" /> Interactive Roadmap Builder
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Preparation Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[14, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    days === d
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "bg-zinc-800/50 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {d} Days Sprint
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Target Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["MAANG", "Tier-1", "All"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    tier === t
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "bg-zinc-800/50 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-violet-600/20"
        >
          Generate Custom Schedule
        </button>
      </div>

      {/* Generated Roadmap Display */}
      {generatedRoadmap && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Your {days}-Day Customized Plan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedRoadmap.map((phase) => (
              <div key={phase.phase} className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    Phase {phase.phase}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Day {phase.days}</span>
                </div>

                <h3 className="text-base font-bold text-white">{phase.title}</h3>

                <div className="space-y-2">
                  <span className="text-xs text-zinc-400 block font-medium">Recommended Patterns:</span>
                  <div className="flex flex-wrap gap-1">
                    {phase.patterns.map((pSlug: string) => {
                      const pat = PATTERNS.find((p) => p.slug === pSlug);
                      return (
                        <span key={pSlug} className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                          {pat ? pat.name : pSlug}
                        </span>
                      );
                    })}

                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Target Problems: <strong className="text-zinc-200">{phase.problemCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
