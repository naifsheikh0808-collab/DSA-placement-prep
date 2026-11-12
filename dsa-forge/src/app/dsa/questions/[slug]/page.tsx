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
import { MarkdownNotesRenderer } from "@/components/notes/MarkdownNotesRenderer";
import { NotesEditorModal } from "@/components/notes/NotesEditorModal";

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
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
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
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-200 border border-white/15 font-mono text-xs font-bold tracking-tight shadow-sm">
                    #{problem.externalId}
                  </span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.primaryPattern && problem.primaryPattern.toLowerCase() !== "uncategorized" && (
                    <Badge variant="pattern">{problem.primaryPattern}</Badge>
                  )}
                  {(!problem.primaryPattern || problem.primaryPattern.toLowerCase() === "uncategorized") && (
                    <Badge variant="muted">General DSA</Badge>
                  )}
                  {problem.secondaryPatterns?.map((p) => (
                    <Badge key={p} variant="outline" className="border-violet-500/30 text-violet-300">
                      + {p}
                    </Badge>
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
                  title={isAiOpen ? "Close AI Panel" : "Open Prime AI"}
                >
                  <img src="/ai-logo.png" alt="Prime AI" className="w-4 h-4 object-contain rounded-sm" />
                  <span>{isAiOpen ? "Close AI Panel" : "Ask Prime AI"}</span>
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
            Responsive Grid:
            - Mobile (< md): 1. Status + Notes, 2. Asked in Companies, 3. Timeframes + Priority Score
            - Desktop (md+): Left 2 cols (Status+Notes above Timeframes+Priority), Right 1 col (Companies)
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[auto_1fr] gap-4 md:gap-5 items-start min-h-0">

            {/* ── 1. Status & Notes Unified Card ── */}
            <Card hover={false} className="order-1 md:order-none md:col-span-2 md:col-start-1 md:row-start-1 p-4 sm:p-5">
              <CardContent className="p-0 space-y-3.5 sm:space-y-4">
                {/* Status Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      Your Status
                    </h2>
                    <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                      Current: <strong className="text-zinc-200">{STATUS_CONFIG[currentStatus].label}</strong>
                    </span>
                  </div>

                  <div
                    className={cn(
                      "grid grid-cols-2 gap-1.5 sm:gap-2",
                      isAiOpen ? "xl:flex xl:flex-wrap" : "sm:flex sm:flex-wrap"
                    )}
                  >
                    {(
                      Object.entries(STATUS_CONFIG) as [
                        ProgressStatus,
                        (typeof STATUS_CONFIG)[ProgressStatus],
                      ][]
                    ).map(([status, cfg]) => {
                      const Icon = cfg.icon;
                      const active = currentStatus === status;

                      // Distinct, well-defined active states
                      let activeStyle = "";
                      if (status === "todo") {
                        activeStyle = "border-zinc-500/60 bg-zinc-800/60 text-zinc-200 shadow-sm shadow-zinc-900/40";
                      } else if (status === "attempted") {
                        activeStyle = "border-amber-500/50 bg-amber-500/15 text-amber-200 shadow-md shadow-amber-950/30";
                      } else if (status === "solved") {
                        activeStyle = "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 shadow-md shadow-emerald-950/30";
                      } else if (status === "revise") {
                        activeStyle = "border-blue-500/50 bg-blue-500/15 text-blue-200 shadow-md shadow-blue-950/30";
                      }

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(problem.id, status, notes)}
                          className={cn(
                            "flex-auto min-w-fit flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] sm:text-xs font-medium sm:font-semibold transition-all cursor-pointer active:scale-98 select-none",
                            active
                              ? activeStyle
                              : "border-zinc-800/80 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/20"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors",
                              active ? cfg.color : "text-zinc-500"
                            )}
                          />
                          <span className="whitespace-nowrap">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean Divider between Status and Notes */}
                <div className="border-t border-zinc-800/80" />

                {/* Notes Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <h2 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wider">
                      Notes
                    </h2>
                  </div>

                  {/* Interactive Notes Card Preview Box */}
                  <div
                    onClick={() => setIsNotesModalOpen(true)}
                    className="group relative w-full bg-zinc-900/40 hover:bg-zinc-900/75 border border-zinc-800 hover:border-violet-500/40 hover:shadow-[0_0_16px_rgba(124,58,237,0.12)] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm transition-all cursor-pointer min-h-[96px] max-h-[155px] overflow-hidden"
                  >
                    {notes.trim().length > 0 ? (
                      <div className="relative">
                        <MarkdownNotesRenderer content={notes} isCompact={true} />
                      </div>
                    ) : (
                      <div className="h-full min-h-[68px] flex items-center justify-center text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        <p className="text-xs sm:text-sm font-medium">add your approach, time complexity or insight</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── 2. Sleek Timeframes & Priority Score Card (Order 3 on Mobile, Row 2 Left on Desktop) ── */}
            <Card hover={false} className="order-3 md:order-none md:col-span-2 md:col-start-1 md:row-start-2 self-start p-3 sm:px-4 sm:py-3">
              <CardContent className="p-0 space-y-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/70 items-center">
                  {/* Available Timeframes Section */}
                  <div className="sm:pr-4">
                    <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Available Timeframes
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.timeframes.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-[10.5px] sm:text-[11px] py-0.5 px-2 bg-zinc-900/50 border-zinc-700/60 text-zinc-200 whitespace-nowrap"
                        >
                          <Clock className="w-2.5 h-2.5 mr-1 text-violet-400 shrink-0" />
                          {timeframeLabel(t)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Priority Score Section */}
                  <div className="pt-2.5 sm:pt-0 sm:pl-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Priority Score
                      </h2>
                      <div className="flex items-baseline font-extrabold text-white tracking-tight shrink-0">
                        <span className="text-base sm:text-lg leading-none">
                          {Math.round(problem.priorityScore * 100)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium ml-0.5">/100</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, problem.priorityScore * 100))}%` }}
                      />
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-zinc-500 mt-1 leading-snug">
                      Weighted by companies, frequency, pattern &amp; recency.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── 3. Asked in Companies Column (Order 2 on Mobile, Right Column on Desktop) ── */}
            <div className="order-2 md:order-none md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 flex flex-col gap-4">
              {!problem.primaryPattern && (
                <Card className="shrink-0">
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
                - Placed above Priority+Timeframes on mobile for faster scanning
                - Clean internal scroll
              */}
              <Card className="overflow-hidden" hover={false}>
                <CardHeader className="shrink-0 p-3.5 sm:p-5 pb-2 sm:pb-3">
                  <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Asked in Companies ({problem.companyCount})</span>
                  </h2>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0">
                  <div className="overflow-y-auto overscroll-contain [scrollbar-width:thin] pr-1 max-h-[11.5rem] md:max-h-[17rem]">
                    <div className="flex flex-wrap gap-1.5 pb-1">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ── Docked AI Side Panel (In-Flow on Desktop when Open) ── */}
        {isAiOpen && (
          <div className="hidden lg:flex w-[390px] xl:w-[440px] shrink-0 sticky top-4 self-start h-[610px] xl:h-[630px] max-h-[calc(100vh-3rem)]">
            <AiSidePanel
              className="h-full max-h-full"
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
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full p-3 sm:p-4 flex flex-col">
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
              className="h-full max-h-full w-full"
            />
          </div>
        </div>
      )}

      {/* ── Floating AI Circular Button (visible when panel is closed) ── */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          title="Open Prime AI"
          aria-label="Open Prime AI Assistant"
          className="fixed bottom-7 right-7 z-40 w-14 h-14 rounded-full bg-gradient-to-b from-violet-500 via-violet-600 to-indigo-800 border-t border-l border-r-2 border-b-[5px] border-t-violet-300/60 border-x-violet-500/50 border-b-violet-950 shadow-[0_10px_20px_-3px_rgba(0,0,0,0.6),0_6px_0_#3b0764,0_0_25px_rgba(139,92,246,0.45),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-white hover:scale-105 hover:shadow-[0_14px_28px_-3px_rgba(0,0,0,0.7),0_8px_0_#3b0764,0_0_35px_rgba(139,92,246,0.6)] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_2px_0_#3b0764,0_4px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all duration-200 ease-out cursor-pointer group p-0.5"
        >
          {/* Glowing online pulse indicator */}
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#090a0f] shadow-sm animate-pulse z-20 pointer-events-none" />
          <img
            src="/ai-logo.png"
            alt="Prime AI"
            className="w-[94%] h-[94%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300 pointer-events-none"
          />
        </button>
      )}

      {/* ── Notes Focus Modal Popup ── */}
      <NotesEditorModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        problemTitle={problem.title}
        problemExternalId={problem.externalId}
        initialNotes={notes}
        onSave={(newNotes) => {
          setNotes(newNotes);
          updateStatus(problem.id, currentStatus, newNotes);
        }}
      />
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
