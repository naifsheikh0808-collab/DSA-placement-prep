"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ArrowLeft, ExternalLink, Calendar, Target, Search, ArrowUpDown, Filter } from "lucide-react";
import { getCompanyBySlug, getCompanyProblems, getAllPatterns } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import type { Difficulty, Timeframe } from "@/lib/types";

type SortOption = "most_asked" | "priority" | "difficulty" | "title";

function CompanyContent({ slug }: { slug: string }) {
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const rawProblems = getCompanyProblems(company.id);
  const patterns = getAllPatterns();

  const [search, setSearch] = useState("");
  const [selectedPattern, setSelectedPattern] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("most_asked");

  // Filter problems
  let filtered = rawProblems.filter(({ problem, companyData }) => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());

    const matchesPattern =
      !selectedPattern ||
      problem.primaryPattern?.toLowerCase().includes(selectedPattern.toLowerCase()) ||
      problem.secondaryPatterns.some((s) => s.toLowerCase().includes(selectedPattern.toLowerCase()));

    const matchesDiff =
      selectedDifficulty === "ALL" || problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesTimeframe =
      selectedTimeframe === "ALL" || problem.timeframes.includes(selectedTimeframe as Timeframe);

    return matchesSearch && matchesPattern && matchesDiff && matchesTimeframe;
  });

  // Sort problems
  if (sortBy === "most_asked") {
    filtered.sort((a, b) => b.problem.companyCount - a.problem.companyCount);
  } else if (sortBy === "priority") {
    filtered.sort((a, b) => b.problem.priorityScore - a.problem.priorityScore);
  } else if (sortBy === "difficulty") {
    const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
    filtered.sort((a, b) => diffOrder[a.problem.difficulty] - diffOrder[b.problem.difficulty]);
  } else if (sortBy === "title") {
    filtered.sort((a, b) => a.problem.title.localeCompare(b.problem.title));
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <Link
          href="/dsa/companies"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Target Companies
        </Link>

        {/* Company Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{company.name}</h1>
                <Badge variant="violet">Target Company</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                {company.easyCount} Easy · {company.mediumCount} Medium · {company.hardCount} Hard
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-400">{rawProblems.length}</div>
            <div className="text-xs text-slate-400 font-medium">Interview Questions</div>
          </div>
        </div>
      </div>

      {/* Requirement 3: Top Bar Sort & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Filter className="w-4 h-4 text-violet-400" /> Sort & Filter {company.name} Questions
          </span>
          <span className="text-xs text-slate-400">
            Showing <strong className="text-white">{filtered.length}</strong> of {rawProblems.length} questions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0c0e17] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Sort Control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 font-medium"
          >
            <option value="most_asked">Sort: Most Asked / Frequency</option>
            <option value="priority">Sort: Priority Score</option>
            <option value="difficulty">Sort: Difficulty (Easy → Hard)</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>

          {/* Pattern Filter */}
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 font-medium"
          >
            <option value="">Pattern: All Patterns</option>
            {patterns.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 font-medium"
          >
            <option value="ALL">Difficulty: All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-[#0c0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 font-medium"
          >
            <option value="ALL">Timeframe: All</option>
            <option value="30d">0–30 Days</option>
            <option value="3m">1–3 Months</option>
            <option value="6m">3–6 Months</option>
            <option value="6m+">&gt; 6 Months</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c0e17]/80 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-5">Problem Title</th>
                <th className="py-3.5 px-5">Difficulty</th>
                <th className="py-3.5 px-5">Pattern</th>
                <th className="py-3.5 px-5">Recency</th>
                <th className="py-3.5 px-5 text-right">Priority</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(({ problem, companyData }) => (
                <tr key={problem.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-4 px-5 font-semibold text-white group-hover:text-violet-300 transition-colors">
                    <Link href={`/dsa/questions/${problem.slug}`}>
                      {problem.title}
                    </Link>
                  </td>
                  <td className="py-4 px-5">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/5 font-medium">
                      {problem.primaryPattern || "General"}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/60 font-medium">
                      <Calendar className="w-3 h-3 text-violet-400" />
                      {companyData.timeframe}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-violet-400">
                    {problem.priorityScore}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dsa/questions/${problem.slug}`}
                        className="px-3 py-1.5 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-600/40 transition-colors font-semibold"
                      >
                        Solve
                      </Link>
                      {problem.canonicalUrl && (
                        <a
                          href={problem.canonicalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          title="Open Problem"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompanyWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <CompanyContent slug={slug} />;
}

export default function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading company details...</div>}>
      <CompanyWrapper params={params} />
    </Suspense>
  );
}
