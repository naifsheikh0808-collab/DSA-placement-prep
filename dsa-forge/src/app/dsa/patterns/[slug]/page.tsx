"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { use, Suspense } from "react";
import { ExternalLink, GitBranch, Building2, CheckCircle2, Circle, Clock, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import { getPatternBySlug, isSolvedStatus } from "@/lib/db";
import { getPatternProblems, resolveProblemId, getProblemByReference } from "@/lib/pattern-map";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProgressStore } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

const LEVEL_COLORS = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  core: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  advanced: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  challenge: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

function PatternContent({ slug }: { slug: string }) {
  const pattern = getPatternBySlug(slug);
  if (!pattern) notFound();

  const { progress, updateStatus } = useProgressStore();

  // Curated roadmap questions and dataset problems are the same LeetCode
  // problems, so progress must be read/written under the canonical dataset id.
  const canonicalId = (qId: string) => resolveProblemId(qId);
  const statusOf = (qId: string) => progress[canonicalId(qId)]?.status;

  const memberIds = new Set(getPatternProblems(pattern).map((p) => p.id));

  const solvedCount = pattern.questions.filter((q) =>
    isSolvedStatus(statusOf(q.id))
  ).length;
  const progressPct = pattern.questions.length
    ? Math.round((solvedCount / pattern.questions.length) * 100)
    : 0;

  const groups = {
    beginner: pattern.questions.filter((q) => q.levelTag === "beginner"),
    core: pattern.questions.filter((q) => q.levelTag === "core"),
    advanced: pattern.questions.filter((q) => q.levelTag === "advanced"),
    challenge: pattern.questions.filter((q) => q.levelTag === "challenge"),
  };

  const statusIcon = (qId: string) => {
    const s = statusOf(qId);
    if (s === "solved") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === "attempted") return <Clock className="w-4 h-4 text-amber-400" />;
    if (s === "revise") return <RefreshCw className="w-4 h-4 text-blue-400" />;
    return <Circle className="w-4 h-4 text-zinc-700" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Link href="/" className="hover:text-zinc-400">Home</Link>
        <span>/</span>
        <Link href="/dsa/patterns" className="hover:text-zinc-400">Patterns</Link>
        <span>/</span>
        <span className="text-zinc-400">{pattern.name}</span>
      </div>

      {/* Header card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8"
        style={{ boxShadow: `0 0 60px ${pattern.color}10` }}
      >
        <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: pattern.color }} />
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: pattern.color }}
        />

        <div className="relative flex flex-col md:flex-row md:items-start gap-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${pattern.color}20` }}
          >
            <GitBranch className="w-7 h-7" style={{ color: pattern.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-2">{pattern.name}</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-2xl">
              {pattern.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <span
                className={cn(
                  "inline-flex items-center font-bold uppercase tracking-wider rounded-full border px-2.5 py-0.5 text-[11px]",
                  pattern.tier === "advanced"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-violet-500/15 text-violet-300 border-violet-500/30"
                )}
              >
                #{String(pattern.orderIndex).padStart(2, "0")} · {pattern.tier === "advanced" ? "Tier 2: Advanced" : "Tier 1: Core"}
              </span>
              <Badge variant="default">{pattern.questions.length} curated questions</Badge>
              <Badge variant="outline">{memberIds.size} in question bank</Badge>
              <Badge variant="default">
                <Building2 className="w-3 h-3 mr-1" />
                {pattern.companyCoverage} companies
              </Badge>
              <span
                className={cn("inline-flex items-center font-medium rounded-full border px-2 py-0.5 text-xs", LEVEL_COLORS[pattern.difficulty as keyof typeof LEVEL_COLORS])}
              >
                {pattern.difficulty}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="md:text-right flex-shrink-0">
            <div className="text-3xl font-bold text-white">{solvedCount}/{pattern.questions.length}</div>
            <div className="text-xs text-zinc-500 mb-2">questions solved</div>
            <div className="w-32 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, backgroundColor: pattern.color }}
              />
            </div>
            <div className="text-xs text-zinc-600 mt-1">{progressPct}% complete</div>
          </div>
        </div>
      </div>

      {/* Question Groups */}
      {(Object.entries(groups) as [keyof typeof groups, typeof groups.beginner][]).map(([level, questions]) => {
        if (!questions.length) return null;
        return (
          <section key={level}>
            <h2 className={cn("text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2", LEVEL_COLORS[level])}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {level === "beginner" && "Beginner"}
              {level === "core" && "Core / Interview Frequent"}
              {level === "advanced" && "Advanced"}
              {level === "challenge" && "Challenge"}
              <span className="text-zinc-700 font-normal normal-case tracking-normal">
                — {questions.length} questions
              </span>
            </h2>

            <div className="space-y-2">
              {questions.map((q, i) => {
                const status = statusOf(q.id);
                const linkedProblem =
                  getProblemByReference(q.slug) ||
                  getProblemByReference(q.id) ||
                  getProblemByReference(q.externalId);

                return (
                  <div
                    key={q.id}
                    onClick={(e) => {
                      if (
                        (e.target as HTMLElement).closest("button") ||
                        (e.target as HTMLElement).closest("a")
                      )
                        return;
                      if (linkedProblem) {
                        window.location.href = `/dsa/questions/${linkedProblem.slug}`;
                      } else {
                        window.open(q.canonicalUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group cursor-pointer",
                      linkedProblem && "hover:border-violet-500/40 hover:bg-zinc-900/70",
                      status === "solved"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    )}
                  >
                    {/* Status toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(
                          q.id,
                          status === "solved"
                            ? "todo"
                            : status === "attempted"
                            ? "solved"
                            : status === "todo"
                            ? "attempted"
                            : "todo"
                        );
                      }}
                      className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                      title="Toggle status"
                    >
                      {statusIcon(q.id)}
                    </button>

                    {/* Number */}
                    <span className="text-xs text-zinc-700 font-mono w-5 flex-shrink-0">{i + 1}</span>

                    {/* Title & Link to Question Bank */}
                    <div className="flex-1 min-w-0">
                      {linkedProblem ? (
                        <Link
                          href={`/dsa/questions/${linkedProblem.slug}`}
                          className={cn(
                            "text-sm font-medium hover:underline hover:text-violet-300 transition-colors block truncate",
                            status === "solved" ? "text-zinc-500 line-through" : "text-zinc-200 group-hover:text-white"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {q.title}
                        </Link>
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium block truncate",
                            status === "solved" ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-white"
                          )}
                        >
                          {q.title}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <DifficultyBadge difficulty={q.difficulty} />
                      {q.companyCount > 0 && (
                        <span className="text-xs text-zinc-600 hidden sm:block">{q.companyCount} co</span>
                      )}
                      <a
                        href={q.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors cursor-pointer"
                        title={q.platform === "gfg" ? "Open on GeeksforGeeks" : "Open on LeetCode"}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {/* ── Explore More in Question Bank CTA ── */}
      <div className="pt-2">
        <div className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#131128]/70 to-indigo-950/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_4px_24px_rgba(124,58,237,0.1)]">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-violet-300 font-bold text-base">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Want more practice on {pattern.name}?</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Explore hundreds of additional company-tagged, recency-filtered {pattern.name} problems directly in the Question Bank.
            </p>
          </div>
          <Link
            href={`/dsa/questions?pattern=${encodeURIComponent(pattern.name)}`}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:scale-[1.03] active:scale-95 transition-all flex-shrink-0 cursor-pointer border border-violet-400/30"
          >
            <span>Explore More {pattern.name} Questions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PatternWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <PatternContent slug={slug} />;
}

export default function PatternDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading pattern details...</div>}>
      <PatternWrapper params={params} />
    </Suspense>
  );
}


