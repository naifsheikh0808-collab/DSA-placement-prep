import Link from "next/link";
import {
  GitBranch, Building2, Map, ArrowRight,
  Zap, Target, Clock, Dumbbell, Play, Sparkles, TrendingUp, Compass
} from "lucide-react";
import { getAllPatterns, getAllCompanies, getPlatformStats, getSmartNextProblem, TOP_PROBLEMS } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";

export default function HomePage() {
  const patterns = getAllPatterns();
  const companies = getAllCompanies();
  const stats = getPlatformStats();
  const smartProblem = getSmartNextProblem();

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
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

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#16132b]/80 via-[#101322]/80 to-[#0c0e17]/80 border border-violet-500/20 p-8 sm:p-10 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>LeetPrime · Beyond LeetCode Pro</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            All LeetCode Pro Problems.{" "}
            <span className="gradient-accent-text block mt-1">Company-Wise & Supercharged.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            <strong>LeetPrime</strong> brings together all LeetCode Pro DSA problems mapped company-wise across Tier 1, Tier 2, and Tier 3 tech giants. Packed with extra intelligence you won&apos;t find on LeetCode Pro—including real-time 30-day interview recency filters, 15 pattern-first mastery roadmaps, and priority scoring.
          </p>

          {/* Value comparison pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> 100% LeetCode Pro Bank
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> 30-Day Interview Recency
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> Tier 1, 2 & 3 Company Tiers
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> 15 Pattern Frameworks
            </span>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/dsa/planner">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-violet-600/30">
                <Compass className="w-4 h-4 mr-1.5 text-amber-300" /> AI Smart Planner
              </Button>
            </Link>
            <Link href="/dsa/companies">
              <Button variant="glass" size="lg">
                <Dumbbell className="w-4 h-4 mr-1 text-violet-400" /> Company Wise DSA
              </Button>
            </Link>
            <Link href="/dsa/questions">
              <Button variant="glass" size="lg">
                <Sparkles className="w-4 h-4 text-violet-400 mr-1" /> Question Bank + Recency
              </Button>
            </Link>
            <Link href="/dsa/patterns">
              <Button variant="ghost" size="lg" className="text-slate-300 hover:text-white">
                15 DSA Patterns <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Curated Patterns", val: patterns.length, desc: "High-frequency frameworks", color: "violet" },
          { label: "Target Companies", val: companies.length, desc: "Reporting live questions", color: "indigo" },
          { label: "Target Problems", val: stats.totalProblems, desc: "Prioritized question bank", color: "emerald" },
          { label: "Company Filings", val: stats.totalCompanies, desc: "Recency weighted reports", color: "amber" },
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#10131f]/60 border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{item.val}</div>
            <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Smart Next + Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Next Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-violet-950/30 via-[#101322] to-[#0c0e17] border border-violet-500/30 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-semibold border border-violet-500/30">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Recommended For You
              </span>
              <span className="text-xs text-slate-400 font-mono">Priority Engine</span>
            </div>

            {smartProblem && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={smartProblem.difficulty} />
                  <span className="text-xs text-slate-400 font-mono">Priority Score: {smartProblem.priorityScore}</span>
                </div>
                <h2 className="text-xl font-bold text-white hover:text-violet-300 transition-colors">
                  <Link href={`/dsa/questions/${smartProblem.slug}`}>{smartProblem.title}</Link>
                </h2>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  Frequently asked in live technical rounds with optimal overlap for pattern mastery.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Target companies: <strong className="text-slate-200">{smartProblem?.companies.slice(0, 3).join(", ")}</strong>
            </span>
            {smartProblem && (
              <Link href={`/dsa/questions/${smartProblem.slug}`}>
                <Button size="sm">
                  Solve Question <Play className="w-3 h-3 fill-current ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Company Targets */}
        <div className="p-6 rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-400" /> Top Target Companies
              </h3>
              <Link href="/dsa/companies" className="text-xs text-violet-400 hover:text-violet-300">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {companies.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/dsa/companies/${c.normalizedName}`}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 flex items-center justify-between transition-all group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-violet-300">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded font-mono">
                    {c.problemCount} Qs
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Patterns Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-violet-400" /> Core Pattern Roadmap
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Master questions grouped by core algorithmic framework.
            </p>
          </div>
          <Link href="/dsa/patterns" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
            Explore All 15 Patterns →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patterns.slice(0, 6).map((pattern) => (
            <Link
              key={pattern.id}
              href={`/dsa/patterns/${pattern.slug}`}
              className="p-5 rounded-2xl bg-[#10131f]/70 border border-white/10 hover:border-violet-500/40 backdrop-blur-md transition-all group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                  {pattern.questionCount} Questions
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {pattern.companyCoverage}% Match
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                {pattern.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {pattern.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
