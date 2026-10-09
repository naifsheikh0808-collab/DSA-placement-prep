"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, Suspense } from "react";
import { ExternalLink, Building2, GitBranch, CheckCircle2, Clock, RefreshCw, Circle, BookOpen, AlertCircle } from "lucide-react";
import { getProblemBySlug } from "@/lib/db";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/hooks/use-progress";
import { formatPct, platformLabel, timeframeLabel, cn } from "@/lib/utils";
import type { ProgressStatus } from "@/lib/types";

const STATUS_CONFIG: Record<ProgressStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
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

  const solveUrl = problem.platform === "leetcode"
    ? problem.canonicalUrl
    : problem.canonicalUrl;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Link href="/" className="hover:text-zinc-400">Home</Link>
        <span>/</span>
        <Link href="/dsa/questions" className="hover:text-zinc-400">Questions</Link>
        <span>/</span>
        <span className="text-zinc-400 truncate">{problem.title}</span>
      </div>

      {/* Problem Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-zinc-600 font-mono text-sm">#{problem.externalId}</span>
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

            <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              <span>Acceptance: <strong className="text-zinc-300">{formatPct(problem.acceptanceRate)}</strong></span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <strong className="text-zinc-300">{problem.companyCount}</strong> companies
              </span>
              <span>Platform: <strong className="text-zinc-300">{platformLabel(problem.platform)}</strong></span>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2">
            <a
              href={solveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Solve on {platformLabel(problem.platform)}
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Progress */}
        <div className="md:col-span-2 space-y-4">
          {/* Status */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-zinc-300">Your Status</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.entries(STATUS_CONFIG) as [ProgressStatus, (typeof STATUS_CONFIG)[ProgressStatus]][]).map(([status, cfg]) => {
                  const Icon = cfg.icon;
                  const active = currentStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => updateStatus(problem.id, status, notes)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all",
                        active
                          ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                          : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
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

          {/* Notes */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-500" />
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
                className="w-full bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none font-mono"
              />
            </CardContent>
          </Card>

          {/* Timeframes */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-zinc-300">Available Timeframes</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {problem.timeframes.map((t) => (
                  <Badge key={t} variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeframeLabel(t)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Companies */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-500" />
                Companies ({problem.companyCount})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {problem.companies.map((c) => (
                  <Link
                    key={c}
                    href={`/dsa/companies/${c}`}
                    className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors capitalize"
                  >
                    {c}
                  </Link>
                ))}
                {problem.companyCount > problem.companies.length && (
                  <span className="text-xs px-2 py-1 rounded bg-zinc-900 text-zinc-600 border border-zinc-800">
                    +{problem.companyCount - problem.companies.length} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pattern note */}
          {!problem.primaryPattern && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-400 mb-1">Uncategorized</p>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      This problem has not been assigned a pattern. High company count still makes it high priority.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority score */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-zinc-300">Priority Score</h2>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(problem.priorityScore * 100)}
                <span className="text-sm text-zinc-600 font-normal">/100</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${problem.priorityScore * 100}%` }} />
              </div>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                Based on company count, frequency, pattern importance, and timeframe relevance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuestionWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <QuestionContent slug={slug} />;
}

export default function QuestionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading question details...</div>}>
      <QuestionWrapper params={params} />
    </Suspense>
  );
}


