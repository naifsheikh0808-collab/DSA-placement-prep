/**
 * Data access layer for the DSA module.
 * MVP: uses in-memory seed data.
 * Production: replace with database queries.
 */

import { PATTERNS, TOP_COMPANIES, TOP_PROBLEMS, PLATFORM_STATS } from "./data/seed";
import { TIMEFRAME_LABELS } from "./constants";
import type { Pattern, PatternQuestion, Company, Problem, UserProgress, Timeframe, Difficulty, ProgressStatus } from "./types";
import { slugify } from "./utils";
import {
  getPatternProblems,
  matchesPatternValue,
  resolveProblemId,
} from "./pattern-map";

export { PATTERNS, TOP_COMPANIES, TOP_PROBLEMS, PLATFORM_STATS, TIMEFRAME_LABELS };
export { getPatternProblems, matchesPatternValue, resolveProblemId };
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
    problems = problems.filter((p) => matchesPatternValue(p, opts.pattern!));
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

/** Fired whenever persisted progress changes so every store can re-render. */
export const PROGRESS_UPDATED_EVENT = "dsaforge:progress-updated";

const STATUS_RANK: Record<ProgressStatus, number> = {
  todo: 0,
  attempted: 1,
  revise: 2,
  solved: 3,
};

export function isSolvedStatus(status?: string): boolean {
  return status === "solved" || status === "mastered";
}

/**
 * Rewrite legacy progress keys to the canonical dataset problem id.
 *
 * The pattern pages used to store progress under curated roadmap ids
 * ("tp-1", "sw-1") while the question pages used dataset ids ("167"), so the
 * same problem lived under two keys and the mastery breakdown never updated.
 */
function canonicalizeProgress(
  progress: Record<string, UserProgress>
): Record<string, UserProgress> {
  const out: Record<string, UserProgress> = {};

  for (const [key, entry] of Object.entries(progress)) {
    if (!entry || typeof entry !== "object") continue;

    const canonicalKey = resolveProblemId(key);
    const status = (entry.status ?? "todo") as ProgressStatus;
    const normalized: UserProgress = {
      ...entry,
      problemId: canonicalKey,
      status,
      revisionCount: entry.revisionCount ?? 0,
    };

    const existing = out[canonicalKey];
    if (!existing) {
      out[canonicalKey] = normalized;
      continue;
    }

    // Two keys collapsed into one — keep the strongest status and the latest data.
    const keepNew =
      STATUS_RANK[status] >= STATUS_RANK[existing.status ?? "todo"];
    const winner = keepNew ? normalized : existing;
    const loser = keepNew ? existing : normalized;

    out[canonicalKey] = {
      ...loser,
      ...winner,
      status:
        STATUS_RANK[status] > STATUS_RANK[existing.status ?? "todo"]
          ? status
          : existing.status ?? "todo",
      revisionCount: Math.max(
        existing.revisionCount ?? 0,
        normalized.revisionCount ?? 0
      ),
      notes: winner.notes ?? loser.notes,
      solvedAt: winner.solvedAt ?? loser.solvedAt,
      lastAttemptedAt:
        winner.lastAttemptedAt && loser.lastAttemptedAt
          ? winner.lastAttemptedAt > loser.lastAttemptedAt
            ? winner.lastAttemptedAt
            : loser.lastAttemptedAt
          : winner.lastAttemptedAt ?? loser.lastAttemptedAt,
    };
  }

  return out;
}

export function loadProgress(): Record<string, UserProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, UserProgress>;
    const canonical = canonicalizeProgress(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(canonical)) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(canonical));
    }
    return canonical;
  } catch {
    return {};
  }
}

export const getLocalProgress = loadProgress;

/**
 * Cached snapshot for `useSyncExternalStore`.
 * The reference must stay stable between reads, otherwise React re-renders forever.
 */
let progressCache: Record<string, UserProgress> | null = null;

export const EMPTY_PROGRESS: Record<string, UserProgress> = {};

export function getProgressSnapshot(): Record<string, UserProgress> {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  if (!progressCache) progressCache = loadProgress();
  return progressCache;
}

/** Drop the cached snapshot so the next read comes from storage. */
export function invalidateProgressCache(): void {
  progressCache = null;
}

export function saveProgress(progress: Record<string, UserProgress>): void {
  if (typeof window === "undefined") return;
  const canonical = canonicalizeProgress(progress);
  progressCache = canonical;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(canonical));
  // Notify every mounted progress store so counts update without a reload.
  window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  progressCache = {};
  localStorage.removeItem(PROGRESS_KEY);
  window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
}

export function updateProblemStatus(
  problemId: string,
  status: UserProgress["status"],
  notes?: string
): UserProgress {
  const all = loadProgress();
  const canonicalId = resolveProblemId(problemId);
  const existing = all[canonicalId];
  const updated: UserProgress = {
    problemId: canonicalId,
    status,
    revisionCount: existing?.revisionCount ?? 0,
    notes: notes ?? existing?.notes,
    lastAttemptedAt: new Date().toISOString(),
    solvedAt: status === "solved" ? (existing?.solvedAt ?? new Date().toISOString()) : existing?.solvedAt,
  };
  if (status === "revise") updated.revisionCount = (existing?.revisionCount ?? 0) + 1;
  all[canonicalId] = updated;
  saveProgress(all);
  return updated;
}

export function getProgressStats(progress: Record<string, UserProgress>) {
  const statuses = Object.values(progress);
  return {
    solved: statuses.filter((s) => isSolvedStatus(s.status)).length,
    attempted: statuses.filter((s) => s.status === "attempted").length,
    revise: statuses.filter((s) => s.status === "revise").length,
    todo: statuses.filter((s) => s.status === "todo").length,
  };
}

/* ─── Solved problem helpers ──────────────────────────────────────────────── */

/** Every problem the user has marked solved, in dataset order. */
export function getSolvedProblems(
  progress: Record<string, UserProgress>
): Problem[] {
  return TOP_PROBLEMS.filter((p) => isSolvedStatus(progress[p.id]?.status));
}

/** Solved problems for one difficulty ("Easy" | "Medium" | "Hard"). */
export function getSolvedProblemsByDifficulty(
  progress: Record<string, UserProgress>,
  difficulty: Difficulty
): Problem[] {
  return getSolvedProblems(progress).filter((p) => p.difficulty === difficulty);
}

export interface PatternMastery {
  pattern: Pattern;
  solved: number;
  total: number;
  pct: number;
}

/** Per-pattern solved/total, used by the mastery breakdown on the progress page. */
export function getPatternMastery(
  progress: Record<string, UserProgress>
): PatternMastery[] {
  return PATTERNS.map((pattern) => {
    const problems = getPatternProblems(pattern);
    const solved = problems.filter((p) =>
      isSolvedStatus(progress[p.id]?.status)
    ).length;
    const pct = problems.length ? Math.round((solved / problems.length) * 100) : 0;
    return { pattern, solved, total: problems.length, pct };
  });
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


