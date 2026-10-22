"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURATED_PATTERN_ALIASES = void 0;
exports.normalizePatternKey = normalizePatternKey;
exports.getPatternByNameOrSlug = getPatternByNameOrSlug;
exports.resolveProblemPattern = resolveProblemPattern;
exports.matchesPatternValue = matchesPatternValue;
exports.getPatternProblems = getPatternProblems;
exports.getProblemsForPatternValue = getProblemsForPatternValue;
exports.getDatasetPatternValues = getDatasetPatternValues;
exports.getExtraDatasetPatterns = getExtraDatasetPatterns;
exports.resolveProblemId = resolveProblemId;
exports.getProblemByReference = getProblemByReference;
const seed_1 = require("./data/seed");
/**
 * Dataset `primaryPattern` values owned by each curated pattern.
 * A curated pattern may own several spellings; a curated pattern with no
 * entry falls back to its own display name.
 */
exports.CURATED_PATTERN_ALIASES = {
    "two-pointers": ["Two Pointers"],
    "fast-slow-pointers": ["Fast & Slow Pointers"],
    "sliding-window": ["Sliding Window"],
    "kadanes-algorithm": ["Kadane's Algorithm"],
    "prefix-sum": ["Prefix Sum"],
    "merge-intervals": ["Merge Intervals"],
    "in-place-linked-list-reversal": ["In-place Reversal of Linked List"],
    "stack": ["Stack"],
    "hash-maps": ["Hash Map / Hash Set", "HashMap / HashSet"],
    "binary-search": ["Binary Search"],
    "heap-priority-queue": ["Heap / Priority Queue"],
    "backtracking": ["Backtracking"],
    "tree-pattern": ["Binary Tree / BST"],
    "graphs": ["Graph (DFS/BFS)"],
    "dynamic-programming": ["Dynamic Programming"],
};
/** Lowercase + strip everything that is not alphanumeric, for fuzzy compares. */
function normalizePatternKey(value) {
    if (!value)
        return "";
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
/* ─── Lookups ─────────────────────────────────────────────────────────────── */
const curatedByKey = new Map();
const canonicalByKey = new Map();
const primaryPatternToSlug = new Map();
for (const pattern of seed_1.PATTERNS) {
    curatedByKey.set(normalizePatternKey(pattern.name), pattern);
    curatedByKey.set(normalizePatternKey(pattern.slug), pattern);
    curatedByKey.set(normalizePatternKey(pattern.id), pattern);
    const aliases = exports.CURATED_PATTERN_ALIASES[pattern.slug] ?? [pattern.name];
    for (const alias of aliases) {
        canonicalByKey.set(normalizePatternKey(alias), pattern);
        primaryPatternToSlug.set(normalizePatternKey(alias), pattern.slug);
    }
    canonicalByKey.set(normalizePatternKey(pattern.name), pattern);
    canonicalByKey.set(normalizePatternKey(pattern.slug), pattern);
}
const problemBySlug = new Map();
const problemByExternalId = new Map();
const problemById = new Map();
for (const problem of seed_1.TOP_PROBLEMS) {
    problemBySlug.set(problem.slug, problem);
    problemByExternalId.set(String(problem.externalId), problem);
    problemById.set(problem.id, problem);
}
/** Curated roadmap questions and dataset problems describe the same LeetCode problems. */
function resolveCuratedQuestion(question) {
    return (problemBySlug.get(question.slug) ??
        problemByExternalId.get(String(question.externalId)));
}
/** Dataset problem id -> curated pattern slug, for questions the dataset left "Uncategorized". */
const curatedMembership = new Map();
/** Curated roadmap question id ("tp-1") -> dataset problem id ("167"). */
const curatedIdToProblem = new Map();
for (const pattern of seed_1.PATTERNS) {
    for (const question of pattern.questions) {
        const resolved = resolveCuratedQuestion(question);
        if (!resolved)
            continue;
        curatedMembership.set(resolved.id, pattern.slug);
        curatedIdToProblem.set(question.id, resolved);
    }
}
/* ─── Pattern resolution ──────────────────────────────────────────────────── */
/** Resolve a curated pattern by name, slug or id (case/punctuation insensitive). */
function getPatternByNameOrSlug(value) {
    const key = normalizePatternKey(value);
    if (!key)
        return undefined;
    return curatedByKey.get(key) ?? canonicalByKey.get(key);
}
/** The curated pattern that owns a dataset problem, if any. */
function resolveProblemPattern(problem) {
    const slug = primaryPatternToSlug.get(normalizePatternKey(problem.primaryPattern));
    if (slug)
        return curatedByKey.get(normalizePatternKey(slug));
    const curatedSlug = curatedMembership.get(problem.id);
    return curatedSlug ? curatedByKey.get(normalizePatternKey(curatedSlug)) : undefined;
}
/**
 * Does a problem belong to the given pattern?
 * Accepts a curated pattern name/slug or a raw dataset label.
 */
function matchesPatternValue(problem, value) {
    const key = normalizePatternKey(value);
    if (!key)
        return true;
    if (normalizePatternKey(problem.primaryPattern) === key)
        return true;
    const canonical = canonicalByKey.get(key);
    if (!canonical)
        return false;
    if (resolveProblemPattern(problem)?.slug === canonical.slug)
        return true;
    return curatedMembership.get(problem.id) === canonical.slug;
}
/* ─── Membership ──────────────────────────────────────────────────────────── */
const patternMembers = new Map();
for (const pattern of seed_1.PATTERNS) {
    const members = new Map();
    for (const problem of seed_1.TOP_PROBLEMS) {
        const slug = primaryPatternToSlug.get(normalizePatternKey(problem.primaryPattern));
        if (slug === pattern.slug)
            members.set(problem.id, problem);
    }
    // Curated roadmap questions the dataset left unlabeled still belong here.
    for (const question of pattern.questions) {
        const resolved = resolveCuratedQuestion(question);
        if (resolved)
            members.set(resolved.id, resolved);
    }
    patternMembers.set(pattern.slug, Array.from(members.values()));
}
/** Every dataset problem belonging to a curated pattern. */
function getPatternProblems(pattern) {
    return patternMembers.get(pattern.slug) ?? [];
}
/** Every dataset problem belonging to the pattern identified by name/slug. */
function getProblemsForPatternValue(value) {
    const pattern = getPatternByNameOrSlug(value);
    return pattern ? getPatternProblems(pattern) : [];
}
/* ─── Dataset-only patterns ───────────────────────────────────────────────── */
/** Every distinct `primaryPattern` label present in the dataset. */
function getDatasetPatternValues() {
    const seen = new Map();
    for (const problem of seed_1.TOP_PROBLEMS) {
        const label = problem.primaryPattern;
        if (!label)
            continue;
        seen.set(label, label);
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
/**
 * Dataset labels that no curated pattern owns (Matrix, Sorting, Trie, ...).
 * Exposing them keeps every question reachable from the pattern filter.
 */
function getExtraDatasetPatterns() {
    return getDatasetPatternValues().filter((label) => !primaryPatternToSlug.has(normalizePatternKey(label)));
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
function resolveProblemId(reference) {
    if (!reference)
        return reference;
    const direct = problemById.get(reference);
    if (direct)
        return direct.id;
    const curated = curatedIdToProblem.get(reference);
    if (curated)
        return curated.id;
    const bySlug = problemBySlug.get(reference);
    if (bySlug)
        return bySlug.id;
    const byExternal = problemByExternalId.get(reference);
    if (byExternal)
        return byExternal.id;
    return reference;
}
/** The dataset problem behind a reference, if it is a known problem. */
function getProblemByReference(reference) {
    return (problemById.get(reference) ??
        curatedIdToProblem.get(reference) ??
        problemBySlug.get(reference) ??
        problemByExternalId.get(reference));
}
