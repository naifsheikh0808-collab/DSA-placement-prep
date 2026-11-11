/**
 * Canonical pattern registry.
 *
 * The curated roadmap (PATTERNS, from the pattern cheat-sheet) and the
 * generated question bank (TOP_PROBLEMS, from the company workbook) were
 * authored independently, so the same concept is spelled differently in each
 * source:
 *
 *   curated  "Hash Maps / Hash Sets"   vs dataset  "Hash Map / Hash Set"
 *   curated  "Trees"                   vs dataset  "Binary Tree / BST"
 *   curated  "Graph DFS/BFS"           vs dataset  "Graph (DFS/BFS)"
 *   curated  "In-place Linked List ..." vs dataset  "In-place Reversal of ..."
 *
 * Plain substring matching therefore matched nothing for those filters. This
 * module owns the alias table so every consumer (filters, mastery breakdown,
 * pattern pages) resolves patterns identically.
 */

import { PATTERNS, TOP_PROBLEMS } from "./data/seed";
import type { Pattern, PatternQuestion, Problem } from "./types";

/**
 * Dataset `primaryPattern` values owned by each curated pattern.
 * A curated pattern may own several spellings; a curated pattern with no
 * entry falls back to its own display name.
 */
export const CURATED_PATTERN_ALIASES: Record<string, string[]> = {
  // ─── Tier 1: Core Fundamentals (15 Patterns) ──────────────────────────
  "two-pointers": ["Two Pointers", "1. Pattern: Two Pointers"],
  "fast-slow-pointers": ["Fast & Slow Pointers", "Fast and Slow Pointers"],
  "sliding-window": ["Sliding Window", "3. Pattern: Sliding Window"],
  "kadanes-algorithm": ["Kadane's Algorithm", "Pattern: Kadane pattern", "Kadane", "Kadanes Algorithm"],
  "prefix-sum": ["Prefix Sum"],
  "merge-intervals": ["Merge Intervals", "4. Pattern: Merge Intervals", "Intervals"],
  "in-place-linked-list-reversal": [
    "In-place Linked List Reversal",
    "In-place Reversal of Linked List",
    "Linked List Reversal",
    "Linked List",
  ],
  "stack": ["Stack", "7. Pattern: Stack"],
  "hash-maps": [
    "Hash Maps / Hash Sets",
    "Hash Map / Hash Set",
    "HashMap / HashSet",
    "Hash Table",
    "Hash Maps",
    "Hash Sets",
  ],
  "binary-search": ["Binary Search", "10. Pattern : Binary Search"],
  "heap-priority-queue": [
    "Heap / Priority Queue",
    "HEAP PATTERN",
    "Heap",
    "Priority Queue",
  ],
  "backtracking": [
    "Backtracking",
    "Recursion and Backtracking Pattern",
    "Recursion",
  ],
  "tree-pattern": [
    "Binary Tree & BST",
    "Binary Tree / BST",
    "Trees",
    "Tree",
    "BST",
  ],
  "graphs": ["Graph DFS/BFS", "Graph (DFS/BFS)", "GRAPHS", "Graph", "Graphs"],
  "greedy": ["Greedy Algorithms", "Greedy"],

  // ─── Tier 2: Advanced & Specialized Frameworks (9 Patterns) ───────────
  "dynamic-programming": ["Dynamic Programming", "DP"],
  "monotonic-stack-queue": [
    "Monotonic Stack & Queue",
    "Monotonic Stack",
    "Monotonic Queue",
    "Monotonic",
  ],
  "trie": ["Trie (Prefix Tree)", "Trie", "Prefix Tree"],
  "topological-sort": ["Topological Sort", "Topo Sort"],
  "union-find": [
    "Union-Find / Disjoint Set (DSU)",
    "Union Find",
    "DSU",
    "Disjoint Set",
  ],
  "bit-manipulation": [
    "Bit Manipulation & Math",
    "Bit Manipulation",
    "Bitmask",
  ],
  "matrix-traversal": [
    "Matrix Traversal & Simulation",
    "Matrix Traversal",
    "Matrix",
  ],
  "design-hybrid-structures": [
    "Design & Hybrid Structures",
    "Design",
    "Design & Data Structures",
    "Hybrid Data Structures",
  ],
  "segment-tree": [
    "Segment & Fenwick Trees",
    "Segment Tree",
    "Fenwick Tree",
    "Binary Indexed Tree",
  ],
};

/** Lowercase + strip everything that is not alphanumeric, for fuzzy compares. */
export function normalizePatternKey(value: string | null | undefined): string {
  if (!value) return "";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/* ─── Lookups ─────────────────────────────────────────────────────────────── */

const curatedByKey = new Map<string, Pattern>();
const canonicalByKey = new Map<string, Pattern>();
const primaryPatternToSlug = new Map<string, string>();

for (const pattern of PATTERNS) {
  curatedByKey.set(normalizePatternKey(pattern.name), pattern);
  curatedByKey.set(normalizePatternKey(pattern.slug), pattern);
  curatedByKey.set(normalizePatternKey(pattern.id), pattern);

  const aliases = CURATED_PATTERN_ALIASES[pattern.slug] ?? [pattern.name];
  for (const alias of aliases) {
    canonicalByKey.set(normalizePatternKey(alias), pattern);
    primaryPatternToSlug.set(normalizePatternKey(alias), pattern.slug);
  }
  canonicalByKey.set(normalizePatternKey(pattern.name), pattern);
  canonicalByKey.set(normalizePatternKey(pattern.slug), pattern);
}

const problemBySlug = new Map<string, Problem>();
const problemByExternalId = new Map<string, Problem>();
const problemById = new Map<string, Problem>();

for (const problem of TOP_PROBLEMS) {
  problemBySlug.set(problem.slug, problem);
  problemByExternalId.set(String(problem.externalId), problem);
  problemById.set(problem.id, problem);
}

/** Curated roadmap questions and dataset problems describe the same LeetCode problems. */
function resolveCuratedQuestion(question: PatternQuestion): Problem | undefined {
  return (
    problemBySlug.get(question.slug) ??
    problemByExternalId.get(String(question.externalId))
  );
}

/** Dataset problem id -> curated pattern slug, for questions the dataset left "Uncategorized". */
const curatedMembership = new Map<string, string>();

/** Curated roadmap question id ("tp-1") -> dataset problem id ("167"). */
const curatedIdToProblem = new Map<string, Problem>();

for (const pattern of PATTERNS) {
  for (const question of pattern.questions) {
    const resolved = resolveCuratedQuestion(question);
    if (!resolved) continue;
    curatedMembership.set(resolved.id, pattern.slug);
    curatedIdToProblem.set(question.id, resolved);
  }
}

/* ─── Pattern resolution ──────────────────────────────────────────────────── */

/** Resolve a curated pattern by name, slug or id (case/punctuation insensitive). */
export function getPatternByNameOrSlug(value: string): Pattern | undefined {
  const key = normalizePatternKey(value);
  if (!key) return undefined;
  return curatedByKey.get(key) ?? canonicalByKey.get(key);
}

/** The curated pattern that owns a dataset problem, if any. */
export function resolveProblemPattern(problem: Problem): Pattern | undefined {
  if (problem.primaryPattern && normalizePatternKey(problem.primaryPattern) !== "uncategorized") {
    const slug = primaryPatternToSlug.get(normalizePatternKey(problem.primaryPattern));
    if (slug) return curatedByKey.get(normalizePatternKey(slug));
  }
  const curatedSlug = curatedMembership.get(problem.id);
  if (curatedSlug) return curatedByKey.get(normalizePatternKey(curatedSlug));

  // Fallback to primary matching secondary pattern if primary was missing/uncategorized
  if (problem.secondaryPatterns?.length) {
    for (const sec of problem.secondaryPatterns) {
      const secSlug = primaryPatternToSlug.get(normalizePatternKey(sec));
      if (secSlug) return curatedByKey.get(normalizePatternKey(secSlug));
    }
  }

  return undefined;
}

/**
 * Does a problem belong to the given pattern?
 * Accepts a curated pattern name/slug or a raw dataset label.
 * Checks both primary and secondary patterns, plus curated membership.
 */
export function matchesPatternValue(problem: Problem, value: string): boolean {
  const key = normalizePatternKey(value);
  if (!key) return true;

  // 1. Direct match on primary pattern
  if (normalizePatternKey(problem.primaryPattern) === key) return true;

  // 2. Direct match on any secondary pattern
  if (problem.secondaryPatterns?.some((p) => normalizePatternKey(p) === key)) return true;

  const canonical = canonicalByKey.get(key);
  if (!canonical) return false;

  // 3. Canonical resolution on primary or curated membership
  if (resolveProblemPattern(problem)?.slug === canonical.slug) return true;
  if (curatedMembership.get(problem.id) === canonical.slug) return true;

  // 4. Canonical resolution on any secondary pattern
  if (
    problem.secondaryPatterns?.some((p) => {
      const secSlug = primaryPatternToSlug.get(normalizePatternKey(p));
      return secSlug === canonical.slug;
    })
  ) {
    return true;
  }

  return false;
}

/* ─── Membership ──────────────────────────────────────────────────────────── */

const patternMembers = new Map<string, Problem[]>();

for (const pattern of PATTERNS) {
  const members = new Map<string, Problem>();

  for (const problem of TOP_PROBLEMS) {
    const primarySlug = primaryPatternToSlug.get(normalizePatternKey(problem.primaryPattern));
    if (primarySlug === pattern.slug) {
      members.set(problem.id, problem);
      continue;
    }

    if (curatedMembership.get(problem.id) === pattern.slug) {
      members.set(problem.id, problem);
      continue;
    }

    // Also include problems matching via secondary patterns!
    if (
      problem.secondaryPatterns?.some((sec) => {
        const secSlug = primaryPatternToSlug.get(normalizePatternKey(sec));
        return secSlug === pattern.slug;
      })
    ) {
      members.set(problem.id, problem);
    }
  }

  // Curated roadmap questions the dataset left unlabeled still belong here.
  for (const question of pattern.questions) {
    const resolved = resolveCuratedQuestion(question);
    if (resolved) members.set(resolved.id, resolved);
  }

  patternMembers.set(pattern.slug, Array.from(members.values()));
}

/** Every dataset problem belonging to a curated pattern. */
export function getPatternProblems(pattern: Pattern): Problem[] {
  return patternMembers.get(pattern.slug) ?? [];
}

/** Every dataset problem belonging to the pattern identified by name/slug. */
export function getProblemsForPatternValue(value: string): Problem[] {
  const pattern = getPatternByNameOrSlug(value);
  return pattern ? getPatternProblems(pattern) : [];
}

/* ─── Dataset-only patterns ───────────────────────────────────────────────── */

/** Every distinct `primaryPattern` label present in the dataset. */
export function getDatasetPatternValues(): string[] {
  const seen = new Map<string, string>();
  for (const problem of TOP_PROBLEMS) {
    const label = problem.primaryPattern;
    if (!label) continue;
    seen.set(label, label);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

/**
 * Dataset labels that no curated pattern owns (Matrix, Sorting, Trie, ...).
 * Exposing them keeps every question reachable from the pattern filter.
 */
export function getExtraDatasetPatterns(): string[] {
  return getDatasetPatternValues().filter((label) => {
    const key = normalizePatternKey(label);
    if (!key || key === "uncategorized") return false;
    return !primaryPatternToSlug.has(key);
  });
}

/* ─── Progress keys ───────────────────────────────────────────────────────── */

/**
 * Canonical progress key for a problem reference.
 *
 * Progress was previously written under curated roadmap ids ("tp-1") on the
 * pattern pages and under dataset ids ("167") on the question pages, so the
 * same problem had two different keys and mastery never updated. The dataset
 * id is now the single canonical key.
 */
export function resolveProblemId(reference: string): string {
  if (!reference) return reference;
  const direct = problemById.get(reference);
  if (direct) return direct.id;
  const curated = curatedIdToProblem.get(reference);
  if (curated) return curated.id;
  const bySlug = problemBySlug.get(reference);
  if (bySlug) return bySlug.id;
  const byExternal = problemByExternalId.get(reference);
  if (byExternal) return byExternal.id;
  return reference;
}

/** The dataset problem behind a reference, if it is a known problem. */
export function getProblemByReference(reference: string): Problem | undefined {
  return (
    problemById.get(reference) ??
    curatedIdToProblem.get(reference) ??
    problemBySlug.get(reference) ??
    problemByExternalId.get(reference)
  );
}
