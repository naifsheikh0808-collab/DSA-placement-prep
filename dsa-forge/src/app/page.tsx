"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch, Building2, Map, ArrowRight,
  Zap, Target, Clock, Dumbbell, Play, Sparkles, TrendingUp, Compass, Code2
} from "lucide-react";
import { getAllPatterns, getAllCompanies, getPlatformStats, TOP_PROBLEMS } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { HomeAiButton } from "@/components/ai/HomeAiButton";
import { MarketIntelligenceCard } from "@/components/home/market-intelligence-card";
import { formatCompanyName } from "@/lib/market-stats";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  const patterns = getAllPatterns();
  const companies = getAllCompanies();
  const stats = getPlatformStats();

  return (
    // Outer flex row: main content shrinks when AI docks on the right
    <div className="flex gap-6 items-start max-w-[1800px] mx-auto transition-all duration-300">

      {/* ── Main scrollable content ── */}
      <div className="flex-1 min-w-0 space-y-6 sm:space-y-7 pb-12">

        {/* ── Top Bar: account / profile (desktop only) ─────────── */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
            <Compass className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-200">DSA Command Center</strong>
              <span className="hidden sm:inline"> · company-wise prep with live recency signals</span>
            </span>
          </div>
          <UserAvatar size="md" />
        </div>

        {/* Hero Section — Sleek, Compact on Mobile & Large on Desktop */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#16132b]/85 via-[#101322]/85 to-[#0c0e17]/85 border border-violet-500/25 p-4 sm:p-6 md:px-8 md:py-5 backdrop-blur-xl shadow-xl shadow-black/40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-3 sm:space-y-3.5">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>LeetPrime · Beyond LeetCode Pro</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              All LeetCode Pro Problems.{" "}
              <span className="gradient-accent-text block sm:inline">Company-Wise &amp; Supercharged.</span>
            </h1>

            {/* Desktop Description: Comprehensive */}
            <p className="hidden sm:block text-slate-300 text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-2xl font-normal">
              <strong>LeetPrime</strong> unites 3,400+ LeetCode Pro problems mapped company-wise across 659 tech leaders. Stop wasting time grinding random questions—mastering our <strong>24 structured algorithmic patterns</strong> gives you the blueprint to tackle virtually any interview problem, supercharged with live 30-day recency signals and Prime AI coaching.
            </p>

            {/* Mobile Description: Punchy & Compact 2-line Clarity */}
            <p className="block sm:hidden text-slate-300 text-xs leading-relaxed font-normal">
              Stop grinding random questions. Master <strong>Company-wise DSA</strong> through <strong>24 structured patterns</strong> to crack any technical interview across 659 tech giants.
            </p>

            {/* Desktop-only value comparison pills (hidden on mobile to eliminate clutter) */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 text-[11px] sm:text-xs text-slate-300">
              <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-400 font-bold">✓</span> 100% LeetCode Pro Bank
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-400 font-bold">✓</span> 30-Day Interview Recency
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-400 font-bold">✓</span> Tier 1, 2 &amp; 3 Company Tiers
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-400 font-bold">✓</span> 24 Pattern Blueprints
              </span>
            </div>

            {/* Mobile Action Dock — Tactile, obviously clickable cards */}
            <div className="flex sm:hidden flex-col gap-2 pt-1 w-full">
              <Link href="/dsa/planner#ai-coach" className="block w-full">
                <button
                  type="button"
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-violet-700 via-indigo-700 to-violet-700 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-xs shadow-sm border border-violet-400/25 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                      <Compass className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <div className="text-left">
                      <div className="leading-tight font-extrabold text-white">AI Smart Planner</div>
                      <div className="text-[10px] text-violet-200/75 font-normal">Personalized Sprint &amp; Coach</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-violet-200/80 shrink-0" />
                </button>
              </Link>

              <div className="grid grid-cols-2 gap-2 w-full">
                <Link href="/dsa/patterns" className="block">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#18132f] hover:bg-[#221b42] active:scale-[0.97] border border-violet-500/40 text-left transition-all cursor-pointer shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GitBranch className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="font-bold text-white text-xs truncate">24 Patterns</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-violet-400/80 shrink-0" />
                  </button>
                </Link>

                <Link href="/dsa/companies" className="block">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#121832] hover:bg-[#1a2245] active:scale-[0.97] border border-indigo-500/40 text-left transition-all cursor-pointer shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-bold text-white text-xs truncate">Companies</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                  </button>
                </Link>
              </div>

              <Link href="/dsa/questions" className="block w-full">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-xl bg-[#101423] hover:bg-[#161c30] border border-white/10 active:scale-[0.98] flex items-center justify-between text-[11px] text-slate-300 font-medium transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Question Bank + Recency
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    3,426 Qs <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </button>
              </Link>
            </div>

            {/* Desktop Action Buttons — Sleek, tactile, and in a single unified line */}
            <div className="hidden sm:flex pt-1 flex-wrap items-center gap-2 sm:gap-2.5">
              <Link href="/dsa/planner#ai-coach">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-700 via-indigo-700 to-violet-700 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-sm border border-violet-400/25 flex items-center gap-1.5 sm:gap-2 group transition-all cursor-pointer active:scale-[0.98] shrink-0"
                >
                  <Compass className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>AI Smart Planner</span>
                  <ArrowRight className="w-3.5 h-3.5 text-violet-200/80 group-hover:text-violet-100 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/dsa/companies">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-[#121832] hover:bg-[#1a2245] border border-indigo-500/40 hover:border-indigo-400/60 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 sm:gap-2 group transition-all cursor-pointer active:scale-[0.98] shrink-0"
                >
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Company Wise DSA</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400/80 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
              <Link href="/dsa/patterns">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-[#18132f] hover:bg-[#221b42] border border-violet-500/40 hover:border-violet-400/60 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 sm:gap-2 group transition-all cursor-pointer active:scale-[0.98] shrink-0"
                >
                  <GitBranch className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>24 DSA Patterns</span>
                  <ArrowRight className="w-3.5 h-3.5 text-violet-400/80 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
              <Link href="/dsa/questions">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 sm:gap-2 group transition-all cursor-pointer active:scale-[0.98] shrink-0"
                >
                  <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Question Bank</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Ribbon — Compact & Sleek */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "DSA Patterns", val: patterns.length, desc: "High-frequency frameworks", color: "violet" },
            { label: "Target Companies", val: companies.length, desc: "Reporting live questions", color: "indigo" },
            { label: "Target Problems", val: stats.totalProblems, desc: "Prioritized question bank", color: "emerald" },
            { label: "Company Filings", val: stats.totalCompanies, desc: "Recency weighted reports", color: "amber" },
          ].map((item, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-0.5">{item.val}</div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Main Grid: Interactive Market Radar + Top Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 pt-1 sm:pt-2">
          {/* Interactive Market & Pattern Intelligence Card */}
          <MarketIntelligenceCard />

          {/* Quick Company Targets (Compact on Mobile with 4 Qs, Full Height Desktop with 6 Qs) */}
          <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-2.5 sm:space-y-4 h-full">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2">
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" /> Top Target Companies
                </h3>
                <Link href="/dsa/companies" className="text-[11px] sm:text-xs text-violet-400 hover:text-violet-300 font-semibold">
                  View All
                </Link>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {companies.slice(0, 6).map((c, index) => (
                  <Link
                    key={c.id}
                    href={`/dsa/companies/${c.normalizedName}`}
                    className={cn(
                      "p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 flex items-center justify-between transition-all group",
                      index >= 4 && "hidden sm:flex"
                    )}
                  >
                    <span className="text-[11px] sm:text-xs font-bold text-slate-200 group-hover:text-violet-300">
                      {formatCompanyName(c.name)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 bg-slate-800/60 px-1.5 sm:px-2 py-0.5 rounded font-mono">
                      {c.problemCount} Qs
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
              <span className="truncate">659 Companies Tracked</span>
              <Link
                href="/dsa/companies"
                className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 group shrink-0"
              >
                All Targets <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Patterns Preview */}
        <div className="space-y-3.5 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400 shrink-0" /> Core Pattern Roadmap
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Master the 24 core patterns behind every interview question to solve any problem with confidence.
              </p>
            </div>
            <Link
              href="/dsa/patterns"
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 shrink-0 self-start sm:self-auto group"
            >
              <span>Explore All 24 Patterns</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {patterns.slice(0, 6).map((pattern) => (
              <Link
                key={pattern.id}
                href={`/dsa/patterns/${pattern.slug}`}
                className="p-4 sm:p-5 rounded-2xl bg-[#10131f]/70 border border-white/10 hover:border-violet-500/40 backdrop-blur-md transition-all group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20">
                    {pattern.questionCount} Questions
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {pattern.companyCoverage}% Match
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                  {pattern.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {pattern.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>{/* end main content */}

      {/* ── Docked AI Panel on desktop (pushes content left) ── */}
      {isAiOpen && (
        <div className="hidden lg:flex w-[380px] xl:w-[420px] shrink-0 sticky top-4 self-start h-[640px] xl:h-[660px] max-h-[calc(100vh-3rem)]">
          <HomeAiButton
            docked
            onClose={() => setIsAiOpen(false)}
          />
        </div>
      )}

      {/* ── Mobile overlay drawer ── */}
      {isAiOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full p-3 sm:p-4 flex flex-col">
            <HomeAiButton
              docked
              onClose={() => setIsAiOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Floating trigger button (only when panel is closed) ── */}
      {!isAiOpen && (
        <HomeAiButton onOpen={() => setIsAiOpen(true)} />
      )}

    </div>
  );
}
