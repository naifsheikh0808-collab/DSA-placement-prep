"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllPatterns } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { GitBranch, ArrowRight, Layers, Search, Sparkles } from "lucide-react";

export default function PatternsPage() {
  const [search, setSearch] = useState("");
  const patterns = getAllPatterns();

  const filtered = patterns.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <GitBranch className="w-4 h-4" /> Pattern-Based Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DSA Pattern Explorer
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Master the core algorithmic templates. Solve 15 patterns instead of 1,000 random problems.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#10131f]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((pattern) => (
          <Link
            key={pattern.id}
            href={`/dsa/patterns/${pattern.slug}`}
            className="group relative p-6 rounded-2xl bg-[#10131f]/70 border border-white/10 hover:border-violet-500/40 backdrop-blur-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform">
                  <GitBranch className="w-5 h-5" />
                </span>
                <Badge variant="violet">{pattern.questionCount} Questions</Badge>
              </div>

              <h2 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                {pattern.name}
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                {pattern.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Coverage: <strong className="text-slate-200">{pattern.companyCoverage}%</strong>
              </span>
              <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
