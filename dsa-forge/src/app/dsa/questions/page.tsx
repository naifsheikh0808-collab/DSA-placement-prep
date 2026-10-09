"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ExternalLink, X, Code2, ArrowUpDown } from "lucide-react";
import { getAllPatterns, TOP_PROBLEMS } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/hooks/use-progress";
import type { Difficulty } from "@/lib/types";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty[]>([]);
  const [selectedPattern, setSelectedPattern] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "difficulty" | "title">("priority");

  const patterns = getAllPatterns();
  const { progress } = useProgressStore();

  let problems = TOP_PROBLEMS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = selectedDifficulty.length === 0 || selectedDifficulty.includes(p.difficulty);
    const matchesPattern =
      !selectedPattern ||
      p.primaryPattern?.toLowerCase().includes(selectedPattern.toLowerCase()) ||
      p.secondaryPatterns.some((s) => s.toLowerCase().includes(selectedPattern.toLowerCase()));

    return matchesSearch && matchesDiff && matchesPattern;
  });

  if (sortBy === "priority") {
    problems.sort((a, b) => b.priorityScore - a.priorityScore);
  } else if (sortBy === "title") {
    problems.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "difficulty") {
    const order = { Easy: 1, Medium: 2, Hard: 3 };
    problems.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  }

  const toggleDifficulty = (d: Difficulty) => {
    setSelectedDifficulty((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Code2 className="w-4 h-4" /> Curated Question Bank
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Question Explorer</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Filter and sort questions by company interview recency, priority score, and pattern.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c0e17] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Difficulty Toggles */}
          <div className="flex items-center gap-1 bg-[#0c0e17] p-1 rounded-xl border border-white/10">
            {DIFFICULTIES.map((d) => {
              const active = selectedDifficulty.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDifficulty(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? d === "Easy"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : d === "Medium"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Pattern Dropdown */}
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            <option value="">All Patterns</option>
            {patterns.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort Control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            <option value="priority">Sort by Priority Score</option>
            <option value="difficulty">Sort by Difficulty</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{problems.length}</strong> questions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c0e17]/80 text-slate-400 uppercase tracking-wider border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Problem Title</th>
                <th className="py-3.5 px-5">Difficulty</th>
                <th className="py-3.5 px-5">Pattern</th>
                <th className="py-3.5 px-5">Companies</th>
                <th className="py-3.5 px-5 text-right">Priority</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {problems.map((prob) => {
                const userProg = progress[prob.id]?.status || "todo";
                return (
                  <tr key={prob.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          userProg === "solved"
                            ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                            : userProg === "attempted"
                            ? "bg-amber-400"
                            : userProg === "revise"
                            ? "bg-indigo-400"
                            : "bg-slate-700"
                        }`}
                        title={`Status: ${userProg}`}
                      />
                    </td>
                    <td className="py-4 px-5 font-semibold text-white group-hover:text-violet-300 transition-colors">
                      <Link href={`/dsa/questions/${prob.slug}`}>{prob.title}</Link>
                    </td>
                    <td className="py-4 px-5">
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/5 font-medium">
                        {prob.primaryPattern || "General"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1">
                        {prob.companies.slice(0, 3).map((c) => (
                          <span key={c} className="text-[11px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-violet-400">
                      {prob.priorityScore}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link href={`/dsa/questions/${prob.slug}`}>
                        <Button variant="outline" size="sm">
                          Solve
                        </Button>
                      </Link>
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
