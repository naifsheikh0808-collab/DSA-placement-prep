"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Building2,
  GitBranch,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/ui/badge";
import {
  getCompanyPatternStats,
  getPatternCompanyStats,
  getGlobalPatternRankings,
  getContextRecommendedProblem,
  POPULAR_COMPANIES,
  POPULAR_PATTERNS,
  formatCompanyName,
} from "@/lib/market-stats";

type ViewMode = "company" | "pattern" | "global";

const PATTERN_SHORT_NAMES: Record<string, string> = {
  "Dynamic Programming": "DP",
  "Binary Tree & BST": "Trees",
  "Hash Maps / Hash Sets": "HashMaps",
  "Bit Manipulation & Math": "Math/Bits",
  "Greedy Algorithms": "Greedy",
  "Binary Search": "BinSearch",
  "Prefix Sum": "PrefixSum",
  "Sliding Window": "Window",
  "Two Pointers": "2-Pointers",
  "Graph DFS/BFS": "Graphs",
  "Union-Find / Disjoint Set (DSU)": "DSU",
  "Segment & Fenwick Trees": "SegTrees",
  "Monotonic Stack": "MonoStack",
  "Topological Sort": "TopoSort",
  "Fast & Slow Pointers": "Fast/Slow",
  "Intervals / Merge Intervals": "Intervals",
  "Recursion & Backtracking": "Backtrack",
  "Trie / Prefix Tree": "Trie",
  "Heap / Priority Queue": "Heaps",
  "Linked List In-place": "LinkedList",
  "Matrix / 2D Grid Traversal": "Matrix",
  "Design Data Structures": "Design",
  "String / Pattern Matching": "Strings",
  "SQL": "SQL",
  "General DSA": "General",
};

function shortenLabel(label: string): string {
  return PATTERN_SHORT_NAMES[label] || (label.length > 10 ? label.slice(0, 8) + ".." : label);
}

export function MarketIntelligenceCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<ViewMode>("company");
  const [selectedCompany, setSelectedCompany] = useState<string>("google");
  const [selectedPattern, setSelectedPattern] = useState<string>("Dynamic Programming");
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer helper
  const clearTooltipTimer = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);

  // Check if touch device / mobile screen (< 768px or touch enabled)
  const isTouchDevice = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768
    );
  }, []);

  // Handles mobile tap & desktop hover with 3-second auto-dismiss on mobile
  const handleBarInteraction = useCallback(
    (index: number | null) => {
      clearTooltipTimer();
      setActiveBarIndex(index);
      setShowTooltip(true);

      // On mobile / touch devices: auto-dismiss after 3000ms
      if (index !== null && isTouchDevice()) {
        tooltipTimeoutRef.current = setTimeout(() => {
          setShowTooltip(false);
          setActiveBarIndex(null);
        }, 3000);
      }
    },
    [clearTooltipTimer, isTouchDevice]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTooltipTimer();
  }, [clearTooltipTimer]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const switchMode = (newMode: ViewMode) => {
    clearTooltipTimer();
    setShowTooltip(true);
    setMode(newMode);
    setActiveBarIndex(null);
  };

  const switchCompany = (compId: string) => {
    clearTooltipTimer();
    setShowTooltip(true);
    setSelectedCompany(compId);
    setActiveBarIndex(null);
  };

  const switchPattern = (pat: string) => {
    clearTooltipTimer();
    setShowTooltip(true);
    setSelectedPattern(pat);
    setActiveBarIndex(null);
  };

  // Compute dataset based on active mode
  const chartData = useMemo(() => {
    if (mode === "company") {
      const stats = getCompanyPatternStats(selectedCompany, 6);
      return stats.map((item) => ({
        name: shortenLabel(item.pattern),
        fullName: item.pattern,
        count: item.count,
        easy: item.easy,
        medium: item.medium,
        hard: item.hard,
        pct: item.pctOfTotal,
      }));
    } else if (mode === "pattern") {
      const stats = getPatternCompanyStats(selectedPattern, 6);
      return stats.map((item) => ({
        name: item.companyName,
        fullName: item.companyName,
        count: item.count,
        easy: item.easy,
        medium: item.medium,
        hard: item.hard,
        pct: 0,
      }));
    } else {
      const stats = getGlobalPatternRankings(7);
      return stats.map((item) => ({
        name: shortenLabel(item.pattern),
        fullName: item.pattern,
        count: item.count,
        easy: item.easy,
        medium: item.medium,
        hard: item.hard,
        pct: item.pctOfTotal,
      }));
    }
  }, [mode, selectedCompany, selectedPattern]);

  // Contextual recommended problem (Option A)
  const recommendedProblem = useMemo(() => {
    if (mode === "company") {
      // If a specific bar was hovered, highlight that pattern, else the top pattern for that company
      const activePattern =
        activeBarIndex !== null && chartData[activeBarIndex]
          ? chartData[activeBarIndex].fullName
          : chartData[0]?.fullName;
      return getContextRecommendedProblem(selectedCompany, activePattern);
    } else if (mode === "pattern") {
      const activeCompany =
        activeBarIndex !== null && chartData[activeBarIndex]
          ? chartData[activeBarIndex].fullName
          : undefined;
      return getContextRecommendedProblem(activeCompany, selectedPattern);
    } else {
      const activePattern =
        activeBarIndex !== null && chartData[activeBarIndex]
          ? chartData[activeBarIndex].fullName
          : "Dynamic Programming";
      return getContextRecommendedProblem(undefined, activePattern);
    }
  }, [mode, selectedCompany, selectedPattern, activeBarIndex, chartData]);

  // Subtitle insight
  const contextInsight = useMemo(() => {
    if (mode === "company") {
      const companyTitle = formatCompanyName(selectedCompany);
      const topPat = chartData[0]?.fullName || "Core Patterns";
      const topCount = chartData[0]?.count || 0;
      return `${companyTitle}'s #1 Tested Pattern: ${topPat} (${topCount} Questions)`;
    } else if (mode === "pattern") {
      const topComp = chartData[0]?.fullName || "Top Tech";
      const topCount = chartData[0]?.count || 0;
      return `Most Asked at ${topComp} (${topCount} Questions) across recent interview rounds`;
    } else {
      return "Top Interview Patterns across 3,426 problems (Stacked by Difficulty)";
    }
  }, [mode, selectedCompany, selectedPattern, chartData]);

  return (
    <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-violet-950/30 via-[#101322] to-[#0c0e17] border border-violet-500/30 backdrop-blur-md flex flex-col justify-between space-y-4 sm:space-y-5 transition-all">
      {/* ── Top Header: Title & View Switcher ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-500/15 text-violet-300 text-xs font-semibold border border-violet-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Interview Market Radar
            </span>
            <span className="text-xs text-slate-400 font-mono hidden md:inline">Realtime DSA Insights</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => switchMode("company")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "company"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> By Company
            </button>
            <button
              type="button"
              onClick={() => switchMode("pattern")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "pattern"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" /> By Pattern
            </button>
            <button
              type="button"
              onClick={() => switchMode("global")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "global"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Trends
            </button>
          </div>
        </div>

        {/* ── Context Selector Chips ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {mode === "company" &&
            POPULAR_COMPANIES.map((comp) => {
              const active = selectedCompany === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => switchCompany(comp.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    active
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-200 shadow-sm shadow-violet-500/20"
                      : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  {comp.name}
                </button>
              );
            })}

          {mode === "pattern" &&
            POPULAR_PATTERNS.map((pat) => {
              const active = selectedPattern === pat;
              return (
                <button
                  key={pat}
                  type="button"
                  onClick={() => switchPattern(pat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    active
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-200 shadow-sm shadow-violet-500/20"
                      : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  {shortenLabel(pat)}
                </button>
              );
            })}

          {mode === "global" && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400 py-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Easy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Hard
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Insight Subtext */}
        <p className="text-xs text-slate-300 font-medium mt-1 truncate">
          {contextInsight}
        </p>
      </div>

      {/* ── Recharts Interactive Bar Chart ── */}
      <div className="w-full h-[200px] sm:h-[215px] pt-1 relative">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
              className="outline-none focus:outline-none select-none"
              onMouseMove={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  const idx =
                    typeof state.activeTooltipIndex === "number"
                      ? state.activeTooltipIndex
                      : parseInt(String(state.activeTooltipIndex), 10);
                  handleBarInteraction(Number.isNaN(idx) ? null : idx);
                }
              }}
              onClick={(state) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  const idx =
                    typeof state.activeTooltipIndex === "number"
                      ? state.activeTooltipIndex
                      : parseInt(String(state.activeTooltipIndex), 10);
                  handleBarInteraction(Number.isNaN(idx) ? null : idx);
                }
              }}
              onMouseLeave={() => {
                if (!isTouchDevice()) {
                  clearTooltipTimer();
                  setShowTooltip(true);
                  setActiveBarIndex(null);
                }
              }}
            >
              <defs>
                <linearGradient id="primaryBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" stopOpacity={1} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.9} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />

              <Tooltip
                active={showTooltip ? undefined : false}
                cursor={{ fill: "rgba(139, 92, 246, 0.08)", radius: 6, stroke: "none", strokeWidth: 0 }}
                content={({ active, payload }) => {
                  if (!showTooltip) return null;
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div
                        onClick={() => {
                          clearTooltipTimer();
                          setShowTooltip(false);
                          setActiveBarIndex(null);
                        }}
                        className="p-3 rounded-xl bg-[#0e111c]/95 border border-violet-500/30 text-white shadow-2xl backdrop-blur-md space-y-1.5 min-w-[170px] select-none cursor-pointer"
                        title="Click to dismiss"
                      >
                        <div className="font-bold text-xs text-violet-300 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>{data.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Total Questions:</span>
                          <span className="font-bold font-mono text-white">{data.count}</span>
                        </div>
                        {data.pct > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Share of Bank:</span>
                            <span className="font-mono text-violet-300">{data.pct}%</span>
                          </div>
                        )}
                        <div className="pt-1 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-300 font-mono">
                          <span className="text-emerald-400">{data.easy}E</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-amber-400">{data.medium}M</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-rose-400">{data.hard}H</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {mode === "global" ? (
                <>
                  <Bar dataKey="easy" name="Easy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} stroke="none" strokeWidth={0} />
                  <Bar dataKey="medium" name="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} stroke="none" strokeWidth={0} />
                  <Bar dataKey="hard" name="Hard" stackId="a" fill="#f43f5e" radius={[5, 5, 0, 0]} stroke="none" strokeWidth={0} />
                </>
              ) : (
                <Bar dataKey="count" radius={[5, 5, 0, 0]} stroke="none" strokeWidth={0}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={activeBarIndex === index ? "url(#activeBarGradient)" : "url(#primaryBarGradient)"}
                      stroke="none"
                      strokeWidth={0}
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
            Loading analytics radar...
          </div>
        )}
      </div>

      {/* ── Contextual Dynamic Recommendation Footer (Option A) ── */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {recommendedProblem ? (
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Recommended for{" "}
                <strong className="text-violet-300">
                  {mode === "company"
                    ? formatCompanyName(selectedCompany)
                    : mode === "pattern"
                    ? selectedPattern
                    : "Top Patterns"}
                </strong>
                :
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 truncate">
              <DifficultyBadge difficulty={recommendedProblem.difficulty} />
              <Link
                href={`/dsa/questions/${recommendedProblem.slug}`}
                className="text-sm font-bold text-white hover:text-violet-300 transition-colors truncate"
              >
                {recommendedProblem.title}
              </Link>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Select any company or pattern above to view trends</span>
        )}

        {recommendedProblem && (
          <Link href={`/dsa/questions/${recommendedProblem.slug}`} className="shrink-0 self-end sm:self-auto">
            <Button size="sm" className="h-8 text-xs font-semibold px-3.5">
              Solve Question <Play className="w-3 h-3 fill-current ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
