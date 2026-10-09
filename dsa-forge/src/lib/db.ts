/**
 * Data access layer for the DSA module.
 * MVP: uses in-memory seed data.
 * Production: replace with database queries.
 */

import { PATTERNS, TOP_COMPANIES, TOP_PROBLEMS, PLATFORM_STATS } from "./data/seed";
import { TIMEFRAME_LABELS } from "./constants";
import type { Pattern, PatternQuestion, Company, Problem, UserProgress, Timeframe, Difficulty } from "./types";
import { slugify } from "./utils";

export { PATTERNS, TOP_COMPANIES, TOP_PROBLEMS, PLATFORM_STATS, TIMEFRAME_LABELS };
export type { UserProgress, Pattern, Company, Problem, Timeframe, Difficulty };

// ─── Patterns ─────────────────────────────────────────────────────────────────

export function getAllPatterns(): Pattern[] {
  return PATTERNS;
}

export function getPatternBySlug(slug: string): Pattern | undefined {
  return PATTERNS.find((p) => p.slug === slug);
}

export function getPatternStats() {
  return {
    total: PATTERNS.length,
    totalQuestions: PATTERNS.reduce((a, p) => a + p.questionCount, 0),
    totalCurated: PATTERNS.reduce((a, p) => a + p.questions.length, 0),
  };
}

// ─── Companies ────────────────────────────────────────────────────────────────

export function getAllCompanies(): Company[] {
  return TOP_COMPANIES;
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return TOP_COMPANIES.find((c) => c.normalizedName === slug || slugify(c.name) === slug);
}

export function searchCompanies(query: string): Company[] {
  const q = query.toLowerCase();
  return TOP_COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.normalizedName.includes(q)
  );
}

// ─── Problems ─────────────────────────────────────────────────────────────────

export function getAllProblems(): Problem[] {
  return TOP_PROBLEMS;
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return TOP_PROBLEMS.find((p) => p.slug === slug);
}

export function getProblemsForPattern(patternName: string): PatternQuestion[] {
  const pattern = PATTERNS.find(
    (p) => p.name.toLowerCase() === patternName.toLowerCase() || p.slug === slugify(patternName)
  );
  return pattern?.questions ?? [];
}

export function filterProblems(opts: {
  difficulty?: Difficulty[];
  pattern?: string;
  companySlug?: string;
  timeframe?: Timeframe;
  search?: string;
  platform?: string;
}): Problem[] {
  let problems = [...TOP_PROBLEMS];

  if (opts.difficulty?.length) {
    problems = problems.filter((p) => opts.difficulty!.includes(p.difficulty));
  }
  if (opts.pattern) {
    problems = problems.filter(
      (p) =>
        p.primaryPattern?.toLowerCase().includes(opts.pattern!.toLowerCase()) ||
        p.secondaryPatterns.some((s) => s.toLowerCase().includes(opts.pattern!.toLowerCase()))
    );
  }
  if (opts.companySlug) {
    problems = problems.filter((p) =>
      p.companies.includes(opts.companySlug!)
    );
  }
  if (opts.timeframe) {
    problems = problems.filter((p) => p.timeframes.includes(opts.timeframe!));
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    problems = problems.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (opts.platform) {
    problems = problems.filter((p) => p.platform === opts.platform);
  }

  return problems;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

const PROGRESS_KEY = "dsaforge_progress";

export function loadProgress(): Record<string, UserProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const getLocalProgress = loadProgress;

export function saveProgress(progress: Record<string, UserProgress>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROGRESS_KEY);
}

export function updateProblemStatus(
  problemId: string,
  status: UserProgress["status"],
  notes?: string
): UserProgress {
  const all = loadProgress();
  const existing = all[problemId];
  const updated: UserProgress = {
    problemId,
    status,
    revisionCount: existing?.revisionCount ?? 0,
    notes: notes ?? existing?.notes,
    lastAttemptedAt: new Date().toISOString(),
    solvedAt: status === "solved" ? (existing?.solvedAt ?? new Date().toISOString()) : existing?.solvedAt,
  };
  if (status === "revise") updated.revisionCount = (existing?.revisionCount ?? 0) + 1;
  all[problemId] = updated;
  saveProgress(all);
  return updated;
}

export function getProgressStats(progress: Record<string, UserProgress>) {
  const statuses = Object.values(progress);
  return {
    solved: statuses.filter((s) => s.status === "solved").length,
    attempted: statuses.filter((s) => s.status === "attempted").length,
    revise: statuses.filter((s) => s.status === "revise").length,
    todo: statuses.filter((s) => s.status === "todo").length,
  };
}

// ─── Platform Stats ───────────────────────────────────────────────────────────

export function getPlatformStats() {
  return PLATFORM_STATS;
}

// ─── Company Helpers ─────────────────────────────────────────────────────────

export function getCompanyProblems(companyIdOrSlug: string) {
  const company = TOP_COMPANIES.find(c => c.id === companyIdOrSlug || c.normalizedName === companyIdOrSlug || slugify(c.name) === companyIdOrSlug);
  const companySlug = company?.normalizedName || companyIdOrSlug;

  return TOP_PROBLEMS.filter(p => p.companies.includes(companySlug) || p.companies.some(c => c.toLowerCase().includes(companySlug.toLowerCase())))
    .map(p => ({
      problem: p,
      companyData: {
        companyId: company?.id || companySlug,
        companyName: company?.name || companySlug,
        timeframe: p.timeframes[0] || ("30d" as Timeframe),
        frequencyWeight: p.frequency
      }
    }));
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export function getRoadmapProblems(timeframe: Timeframe, targetCompanies?: string[]) {
  let problems = TOP_PROBLEMS.filter((p) => p.timeframes.includes(timeframe));
  if (targetCompanies?.length) {
    problems = problems.filter((p) =>
      p.companies.some((c) => targetCompanies.includes(c))
    );
  }
  return problems.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function generateRoadmap({ targetDays, targetCompanyTier }: { targetDays: number; targetCompanyTier?: string }) {
  const phases = [
    {
      phase: 1,
      days: `1 - ${Math.round(targetDays * 0.3)}`,
      title: "Core Foundation & High-Frequency Patterns",
      patterns: ["two-pointers", "sliding-window", "hash-map-set"],
      problemCount: Math.round(TOP_PROBLEMS.length * 0.3),
    },
    {
      phase: 2,
      days: `${Math.round(targetDays * 0.3) + 1} - ${Math.round(targetDays * 0.7)}`,
      title: "Advanced Data Structures & Traversal",
      patterns: ["binary-tree-traversal", "graph-bfs-dfs", "binary-search"],
      problemCount: Math.round(TOP_PROBLEMS.length * 0.4),
    },
    {
      phase: 3,
      days: `${Math.round(targetDays * 0.7) + 1} - ${targetDays}`,
      title: "Dynamic Programming & Optimization Sprint",
      patterns: ["dynamic-programming", "monotonic-stack", "heap-priority-queue"],
      problemCount: Math.round(TOP_PROBLEMS.length * 0.3),
    },
  ];

  return phases;
}

// ─── Smart Next ────────────────────────────────────────────────────────────────

export function getSmartNext(
  progress: Record<string, UserProgress>,
  targetCompanies: string[],
  timeframe: Timeframe
): Problem | null {
  const unsolved = TOP_PROBLEMS.filter(
    (p) => !progress[p.id] || progress[p.id].status === "todo"
  );

  const scored = unsolved.map((p) => ({
    problem: p,
    score:
      p.priorityScore +
      (p.companies.filter((c) => targetCompanies.includes(c)).length * 0.1) +
      (p.timeframes.includes(timeframe) ? 0.2 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.problem ?? TOP_PROBLEMS[0] ?? null;
}

export function getSmartNextProblem(): Problem | null {
  return getSmartNext(loadProgress(), [], "30d");
}


