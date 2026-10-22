"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Code2,
  Clock,
  Zap,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { getAllPatterns, TOP_PROBLEMS } from "@/lib/db";
import {
  getExtraDatasetPatterns,
  matchesPatternValue,
} from "@/lib/pattern-map";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/hooks/use-progress";
import type { Difficulty, Timeframe } from "@/lib/types";

/* ─── Types ─────────────────────────────────────────────────── */
type TimeframeId = "30d" | "3m" | "6m" | "8-12m" | "ALL";
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/* ─── Timeframe config ───────────────────────────────────────── */
const TIMEFRAME_CARDS: Array<{
  id: TimeframeId;
  label: string;
  sublabel: string;
  desc: string;
  icon: React.ElementType;
  activeGradient: string;
  activeBorder: string;
  activeRing: string;
  iconActive: string;
}> = [
  {
    id: "30d",
    label: "Last 30 Days",
    sublabel: "🔥 Urgent",
    desc: "Freshly asked in recent rounds — highest interview signal",
    icon: Zap,
    activeGradient: "from-rose-950/60 to-[#101322]",
    activeBorder: "border-rose-500/60",
    activeRing: "ring-rose-500/40",
    iconActive: "text-rose-300",
  },
  {
    id: "3m",
    label: "Last 3 Months",
    sublabel: "⚡ Hot",
    desc: "Active pool from this quarter's hiring cycle",
    icon: Clock,
    activeGradient: "from-amber-950/50 to-[#101322]",
    activeBorder: "border-amber-500/60",
    activeRing: "ring-amber-500/40",
    iconActive: "text-amber-300",
  },
  {
    id: "6m",
    label: "Last 6 Months",
    sublabel: "📅 Recent",
    desc: "Medium-term question pool across top companies",
    icon: CalendarDays,
    activeGradient: "from-indigo-950/50 to-[#101322]",
    activeBorder: "border-indigo-500/60",
    activeRing: "ring-indigo-500/40",
    iconActive: "text-indigo-300",
  },
  {
    id: "8-12m",
    label: "Last Year",
    sublabel: "🗓️ Classic",
    desc: "Evergreen problems — still regularly appearing",
    icon: CalendarRange,
    activeGradient: "from-violet-950/50 to-[#101322]",
    activeBorder: "border-violet-500/60",
    activeRing: "ring-violet-500/40",
    iconActive: "text-violet-300",
  },
  {
    id: "ALL",
    label: "All Time",
    sublabel: "📚 Full Bank",
    desc: "Complete question bank across all recency windows",
    icon: Code2,
    activeGradient: "from-slate-800/60 to-[#101322]",
    activeBorder: "border-slate-500/60",
    activeRing: "ring-slate-500/40",
    iconActive: "text-slate-300",
  },
];

/* ─── Timeframe filter helper ────────────────────────────────── */
function matchesTimeframe(p: (typeof TOP_PROBLEMS)[0], tf: TimeframeId) {
  if (tf === "ALL") return true;
  if (tf === "30d") return p.timeframes.includes("30d");
  if (tf === "3m") return p.timeframes.includes("3m");
  if (tf === "6m") return p.timeframes.includes("6m");
  if (tf === "8-12m")
    return (
      p.timeframes.includes("6m+" as Timeframe) ||
      p.timeframes.includes("all" as Timeframe)
    );
  return true;
}

/* ─── Recency badge ──────────────────────────────────────────── */
function RecencyBadge({ timeframes }: { timeframes: string[] }) {
  const urgency = timeframes.includes("30d")
    ? { label: "30d", cls: "bg-rose-500/20 text-rose-300 border-rose-500/40" }
    : timeframes.includes("3m")
    ? { label: "3m", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" }
    : timeframes.includes("6m")
    ? { label: "6m", cls: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" }
    : timeframes.includes("6m+") || timeframes.includes("all")
    ? { label: "1yr+", cls: "bg-violet-500/20 text-violet-300 border-violet-500/40" }
    : null;

  if (!urgency) return <span className="text-slate-600 text-[11px]">—</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${urgency.cls}`}
    >
      <Clock className="w-2.5 h-2.5" />
      {urgency.label}
    </span>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function QuestionsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeId>("ALL");
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty[]>([]);
  const [selectedPattern, setSelectedPattern] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "difficulty" | "title" | "recency">(
    "priority"
  );

  const patterns = getAllPatterns();
  const extraPatterns = getExtraDatasetPatterns();
  const { progress } = useProgressStore();

  function cardCount(tfId: TimeframeId) {
    return TOP_PROBLEMS.filter((p) => matchesTimeframe(p, tfId)).length;
  }

  /* apply all filters */
  let problems = TOP_PROBLEMS.filter((p) => {
    const matchesTf = matchesTimeframe(p, selectedTimeframe);
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDiff =
      selectedDifficulty.length === 0 || selectedDifficulty.includes(p.difficulty);
    const matchesPattern =
      !selectedPattern || matchesPatternValue(p, selectedPattern);
    return matchesTf && matchesSearch && matchesDiff && matchesPattern;
  });

  /* sort */
  const recencyOrder: Record<string, number> = { "30d": 1, "3m": 2, "6m": 3, "6m+": 4, all: 5 };
  function bestRecency(tf: string[]) {
    return Math.min(...tf.map((t) => recencyOrder[t] ?? 99));
  }

  if (sortBy === "priority") {
    problems = [...problems].sort((a, b) => b.priorityScore - a.priorityScore);
  } else if (sortBy === "title") {
    problems = [...problems].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "difficulty") {
    const order = { Easy: 1, Medium: 2, Hard: 3 };
    problems = [...problems].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  } else if (sortBy === "recency") {
    problems = [...problems].sort(
      (a, b) => bestRecency(a.timeframes) - bestRecency(b.timeframes)
    );
  }

  const toggleDifficulty = (d: Difficulty) => {
    setSelectedDifficulty((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Code2 className="w-4 h-4" /> LeetPrime Question Bank · Recency Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Question Explorer
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          The complete LeetCode Pro library filtered by{" "}
          <span className="text-violet-300 font-semibold">interview recency</span>,
          difficulty, and pattern — all in one place.
        </p>
      </div>

      {/* ── Timeframe Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TIMEFRAME_CARDS.map((tf) => {
          const isActive = selectedTimeframe === tf.id;
          const count = cardCount(tf.id);
          const Icon = tf.icon;
          return (
            <button
              key={tf.id}
              id={`tf-card-${tf.id}`}
              onClick={() => setSelectedTimeframe(tf.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-2 overflow-hidden ${
                isActive
                  ? `bg-gradient-to-br ${tf.activeGradient} ${tf.activeBorder} ring-1 ${tf.activeRing} shadow-[0_8px_28px_-6px_rgba(124,58,237,0.28)]`
                  : "bg-[#10131f]/70 border-white/10 hover:border-white/25 hover:bg-[#141828]"
              }`}
            >
              {/* glow strip */}
              {isActive && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-70" />
              )}

              <div className="flex items-center justify-between">
                <Icon
                  className={`w-4 h-4 ${isActive ? tf.iconActive : "text-slate-500"}`}
                />
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${
                    isActive
                      ? "bg-white/10 text-white border-white/20"
                      : "bg-slate-800 text-slate-300 border-slate-700/60"
                  }`}
                >
                  {count}
                </span>
              </div>

              <div>
                <div
                  className={`text-sm font-bold leading-snug ${
                    isActive ? "text-white" : "text-slate-200"
                  }`}
                >
                  {tf.label}
                </div>
                <div
                  className={`text-[11px] font-semibold mt-0.5 ${
                    isActive ? tf.iconActive : "text-slate-500"
                  }`}
                >
                  {tf.sublabel}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {tf.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Filter Toolbar ─────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="questions-search"
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
                  id={`diff-toggle-${d.toLowerCase()}`}
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
            id="pattern-select"
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            <option value="">All Patterns</option>
            <optgroup label="Pattern Roadmaps">
              {patterns.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            {extraPatterns.length > 0 && (
              <optgroup label="Other Categories">
                {extraPatterns.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {/* Sort Control */}
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
          >
            <option value="priority">Sort: Priority Score</option>
            <option value="recency">Sort: Recency</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing{" "}
            <strong className="text-violet-400 font-bold">{problems.length}</strong>{" "}
            questions
            {selectedTimeframe !== "ALL" && (
              <span className="ml-1 text-slate-500">
                · filtered by{" "}
                <span className="text-violet-300 font-semibold">
                  {TIMEFRAME_CARDS.find((t) => t.id === selectedTimeframe)?.label}
                </span>
              </span>
            )}
          </span>
          <span className="hidden sm:block text-[11px] text-slate-600">
            {problems.filter((p) => progress[p.id]?.status === "solved").length} solved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c0e17]/80 text-slate-400 uppercase tracking-wider border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-5 w-10">·</th>
                <th className="py-3.5 px-5">Problem Title</th>
                <th className="py-3.5 px-5">Difficulty</th>
                <th className="py-3.5 px-5">Recency</th>
                <th className="py-3.5 px-5">Pattern</th>
                <th className="py-3.5 px-5">Companies</th>
                <th className="py-3.5 px-5 text-right font-mono">Priority</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {problems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500 text-sm">
                    No questions match your current filters.
                  </td>
                </tr>
              ) : (
                problems.map((prob) => {
                  const userProg = progress[prob.id]?.status || "todo";
                  const topCompanies = prob.companies.slice(0, 3);
                  const remaining = prob.companies.length - topCompanies.length;

                  return (
                    <tr
                      key={prob.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Status dot */}
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

                      {/* Title */}
                      <td className="py-4 px-5 font-semibold text-white group-hover:text-violet-300 transition-colors">
                        <Link href={`/dsa/questions/${prob.slug}`}>{prob.title}</Link>
                      </td>

                      {/* Difficulty */}
                      <td className="py-4 px-5">
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>

                      {/* Recency badge */}
                      <td className="py-4 px-5">
                        <RecencyBadge timeframes={prob.timeframes} />
                      </td>

                      {/* Pattern */}
                      <td className="py-4 px-5">
                        <span className="text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/5 font-medium">
                          {prob.primaryPattern || "General"}
                        </span>
                      </td>

                      {/* Companies */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {topCompanies.map((c) => (
                            <span
                              key={c}
                              className="px-2.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 text-[11px] font-medium border border-white/5"
                            >
                              {c}
                            </span>
                          ))}
                          {remaining > 0 && (
                            <span
                              className="px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[11px] font-bold border border-violet-500/30"
                              title={`${remaining} more companies`}
                            >
                              +{remaining}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-5 text-right font-mono font-bold text-violet-400">
                        {prob.priorityScore}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dsa/questions/${prob.slug}`}>
                            <Button variant="outline" size="sm">
                              Solve
                            </Button>
                          </Link>
                          {prob.canonicalUrl && (
                            <a
                              href={prob.canonicalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-white transition-colors"
                              title="Open on LeetCode"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
