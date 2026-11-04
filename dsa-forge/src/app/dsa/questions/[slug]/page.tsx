"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, Suspense } from "react";
import {
  ExternalLink,
  Building2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Circle,
  BookOpen,
  AlertCircle,
  Bot,
  Sparkles,
} from "lucide-react";
import { getProblemBySlug } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProgressStore } from "@/hooks/use-progress";
import { formatPct, platformLabel, timeframeLabel, cn } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";
import { AiSidePanel } from "@/components/ai/AiSidePanel";

const STATUS_CONFIG: Record<
  ProgressStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  todo: { label: "To Do", icon: Circle, color: "text-zinc-500" },
  attempted: { label: "Attempted", icon: Clock, color: "text-amber-400" },
  solved: { label: "Solved", icon: CheckCircle2, color: "text-emerald-400" },
  revise: { label: "Need Revision", icon: RefreshCw, color: "text-blue-400" },
};

function QuestionContent({ slug }: { slug: string }) {
  const problem = getProblemBySlug(slug);
  if (!problem) notFound();

  const { progress, updateStatus } = useProgressStore();
  const currentStatus = (progress[problem.id]?.status ?? "todo") as ProgressStatus;
  const [notes, setNotes] = useState(progress[problem.id]?.notes ?? "");
  const [isAiOpen, setIsAiOpen] = useState(false);

  const solveUrl = problem.canonicalUrl;

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 pb-16 relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-5">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/dsa/questions" className="hover:text-zinc-300 transition-colors">Questions</Link>
        <span>/</span>
        <span className="text-zinc-300 font-medium truncate">{problem.title}</span>
      </div>

      {/*
        Toggle Sidebar Layout:
        - When AI is open: Left side smoothly shrinks/adjusts its width, while AI docks on the right in-flow!
        - When AI is closed: Left side smoothly expands to full width!
        - NO backdrop blocking user clicks: User can type in Notes, change Status, scroll Companies SIMULTANEOUSLY!
      */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main Problem Content (Adjusts space dynamically) ── */}
        <div className="flex-1 min-w-0 w-full space-y-6 transition-all duration-300">

          {/* Problem Header */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-zinc-500 font-mono text-sm">#{problem.externalId}</span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.primaryPattern && (
                    <Badge variant="pattern">{problem.primaryPattern}</Badge>
                  )}
                  {!problem.primaryPattern && (
                    <Badge variant="muted">Uncategorized</Badge>
                  )}
                  {problem.secondaryPatterns.map((p) => (
                    <Badge key={p} variant="outline">{p}</Badge>
                  ))}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{problem.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                  <span>Acceptance: <strong className="text-zinc-200">{formatPct(problem.acceptanceRate)}</strong></span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <strong className="text-zinc-200">{problem.companyCount}</strong> companies
                  </span>
                  <span>Platform: <strong className="text-zinc-200">{platformLabel(problem.platform)}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Toggle AI Side Panel + Solve on LeetCode */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* AI Toggle Button in Header */}
                <button
                  onClick={() => setIsAiOpen((prev) => !prev)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95",
                    isAiOpen
                      ? "bg-violet-600/25 border border-violet-500/50 text-violet-200 hover:bg-violet-600/35"
                      : "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/35 text-violet-200 hover:bg-violet-600/30 hover:border-violet-400"
                  )}
                  title={isAiOpen ? "Close AI Side Panel" : "Open AI Problem Solver"}
                >
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span>{isAiOpen ? "Close AI Panel" : "Ask AI Coach"}</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </button>

                <a
                  href={solveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/25 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  Solve on {platformLabel(problem.platform)}
                </a>
              </div>
            </div>
          </div>

          {/*
            3-Column Inner Grid:
            - Column 1 & 2: Status, Notes, Available Timeframes & Priority Score
            - Column 3: Companies card, stretching to exactly match the bottom of Priority Score
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch min-h-0">

            {/* ── Left 2 columns: Status + Notes + Timeframes & Priority Score ── */}
            <div className="md:col-span-2 flex flex-col gap-4">

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-zinc-200">Your Status</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(
                      Object.entries(STATUS_CONFIG) as [
                        ProgressStatus,
                        (typeof STATUS_CONFIG)[ProgressStatus],
                      ][]
                    ).map(([status, cfg]) => {
                      const Icon = cfg.icon;
                      const active = currentStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(problem.id, status, notes)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                            active
                              ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-md shadow-violet-950/30"
                              : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/30"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", active ? cfg.color : "")} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    Notes
                  </h2>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => updateStatus(problem.id, currentStatus, notes)}
                    placeholder="Add your approach, time complexity, or insights..."
                    rows={4}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none font-mono"
                  />
                </CardContent>
              </Card>

              {/* Timeframes + Priority Score side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Available Timeframes */}
                <Card>
                  <CardHeader>
                    <h2 className="text-sm font-semibold text-zinc-200">Available Timeframes</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {problem.timeframes.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs py-1 px-2.5">
                          <Clock className="w-3 h-3 mr-1 text-zinc-400" />
                          {timeframeLabel(t)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Score */}
                <Card>
                  <CardHeader>
                    <h2 className="text-sm font-semibold text-zinc-200">Priority Score</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-white mb-1.5 tracking-tight">
                      {Math.round(problem.priorityScore * 100)}
                      <span className="text-sm text-zinc-500 font-normal ml-1">/100</span>
                    </div>
                    <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, problem.priorityScore * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">
                      Based on company count, frequency, pattern importance, and timeframe relevance.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Right 1 column: Companies ── */}
            <div className="md:col-span-1 flex flex-col h-full min-h-0">
              {!problem.primaryPattern && (
                <Card className="shrink-0 mb-4">
                  <CardContent className="pt-4">
                    <div className="flex gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-400 mb-1">Uncategorized</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          This problem has not been assigned a pattern. High company count still makes it high priority.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/*
                Companies Card:
                - flex-1 and h-full so it matches the left column height exactly
                - min-h-0 on card & content so overflow-y-auto works reliably
              */}
              <Card className="flex flex-col flex-1 h-full min-h-0 overflow-hidden" hover={false}>
                <CardHeader className="shrink-0 mb-3">
                  <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-400" />
                    Companies ({problem.companyCount})
                  </h2>
                </CardHeader>
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 overscroll-contain [scrollbar-width:thin]">
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {problem.companies.map((c) => (
                      <Link
                        key={c}
                        href={`/dsa/companies/${c}`}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 hover:bg-violet-600/20 hover:border-violet-500/40 hover:text-white transition-all capitalize"
                      >
                        {c}
                      </Link>
                    ))}
                    {problem.companyCount > problem.companies.length && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800">
                        +{problem.companyCount - problem.companies.length} more
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* ── Docked AI Side Panel (In-Flow on Desktop when Open) ── */}
        {isAiOpen && (
          <div className="hidden lg:flex w-[390px] xl:w-[440px] shrink-0 sticky top-4 self-start">
            <AiSidePanel
              problem={{
                id: problem.id,
                title: problem.title,
                slug: problem.slug,
                difficulty: problem.difficulty,
                primaryPattern: problem.primaryPattern,
                secondaryPatterns: problem.secondaryPatterns,
                companies: problem.companies,
                acceptanceRate: problem.acceptanceRate,
                platform: problem.platform,
                priorityScore: problem.priorityScore,
                canonicalUrl: problem.canonicalUrl,
              }}
              status={currentStatus}
              notes={notes}
              isOpen={isAiOpen}
              onClose={() => setIsAiOpen(false)}
            />
          </div>
        )}
      </div>

      {/* ── Mobile Overlay Drawer (when open on smaller screens < 1024px) ── */}
      {isAiOpen && (
        <div className="lg:hidden">
          <AiSidePanel
            problem={{
              id: problem.id,
              title: problem.title,
              slug: problem.slug,
              difficulty: problem.difficulty,
              primaryPattern: problem.primaryPattern,
              secondaryPatterns: problem.secondaryPatterns,
              companies: problem.companies,
              acceptanceRate: problem.acceptanceRate,
              platform: problem.platform,
              priorityScore: problem.priorityScore,
              canonicalUrl: problem.canonicalUrl,
            }}
            status={currentStatus}
            notes={notes}
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
            isMobileDrawer={true}
          />
        </div>
      )}

      {/* ── Floating AI Circular Button (visible when panel is closed) ── */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          title="Open AI Problem Solver"
          aria-label="Open AI Assistant"
          className="fixed bottom-7 right-7 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 border-2 border-violet-400/40 shadow-[0_8px_30px_rgba(124,58,237,0.45)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_12px_40px_rgba(124,58,237,0.65)] hover:border-violet-300/60 active:scale-95 transition-all duration-300 ease-out cursor-pointer group"
        >
          {/* Glowing online pulse indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#090a0f] shadow-sm animate-pulse" />
          <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}

function QuestionWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <QuestionContent slug={slug} />;
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading question details...</div>}>
      <QuestionWrapper params={params} />
    </Suspense>
  );
}
