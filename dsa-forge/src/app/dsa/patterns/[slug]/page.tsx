"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { use, Suspense } from "react";
import { ExternalLink, GitBranch, Building2, CheckCircle2, Circle, Clock, RefreshCw } from "lucide-react";
import { getPatternBySlug } from "@/lib/db";
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


  const solvedCount = pattern.questions.filter((q) => progress[q.id]?.status === "solved").length;
  const progressPct = Math.round((solvedCount / pattern.questions.length) * 100);

  const groups = {
    beginner: pattern.questions.filter((q) => q.levelTag === "beginner"),
    core: pattern.questions.filter((q) => q.levelTag === "core"),
    advanced: pattern.questions.filter((q) => q.levelTag === "advanced"),
    challenge: pattern.questions.filter((q) => q.levelTag === "challenge"),
  };

  const statusIcon = (qId: string) => {
    const s = progress[qId]?.status;
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
              <Badge variant="default">{pattern.questions.length} curated questions</Badge>
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
                const status = progress[q.id]?.status;
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group",
                      status === "solved"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    )}
                  >
                    {/* Status toggle */}
                    <button
                      onClick={() =>
                        updateStatus(
                          q.id,
                          status === "solved" ? "todo" : status === "attempted" ? "solved" : status === "todo" ? "attempted" : "todo"
                        )
                      }
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                      title="Toggle status"
                    >
                      {statusIcon(q.id)}
                    </button>

                    {/* Number */}
                    <span className="text-xs text-zinc-700 font-mono w-5 flex-shrink-0">{i + 1}</span>

                    {/* Title */}
                    <span
                      className={cn(
                        "text-sm font-medium flex-1 min-w-0 truncate",
                        status === "solved" ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-white"
                      )}
                    >
                      {q.title}
                    </span>

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
                        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                        title="Open on LeetCode"
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


