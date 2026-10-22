"use strict";
/**
 * Data access layer for the DSA module.
 * MVP: uses in-memory seed data.
 * Production: replace with database queries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_PROGRESS = exports.getLocalProgress = exports.PROGRESS_UPDATED_EVENT = exports.resolveProblemId = exports.matchesPatternValue = exports.getPatternProblems = exports.TIMEFRAME_LABELS = exports.PLATFORM_STATS = exports.TOP_PROBLEMS = exports.TOP_COMPANIES = exports.PATTERNS = void 0;
exports.getAllPatterns = getAllPatterns;
exports.getPatternBySlug = getPatternBySlug;
exports.getPatternStats = getPatternStats;
exports.getAllCompanies = getAllCompanies;
exports.getCompanyBySlug = getCompanyBySlug;
exports.searchCompanies = searchCompanies;
exports.getAllProblems = getAllProblems;
exports.getProblemBySlug = getProblemBySlug;
exports.getProblemsForPattern = getProblemsForPattern;
exports.filterProblems = filterProblems;
exports.isSolvedStatus = isSolvedStatus;
exports.loadProgress = loadProgress;
exports.getProgressSnapshot = getProgressSnapshot;
exports.invalidateProgressCache = invalidateProgressCache;
exports.saveProgress = saveProgress;
exports.resetProgress = resetProgress;
exports.updateProblemStatus = updateProblemStatus;
exports.getProgressStats = getProgressStats;
exports.getSolvedProblems = getSolvedProblems;
exports.getSolvedProblemsByDifficulty = getSolvedProblemsByDifficulty;
exports.getPatternMastery = getPatternMastery;
exports.getPlatformStats = getPlatformStats;
exports.getCompanyProblems = getCompanyProblems;
exports.getRoadmapProblems = getRoadmapProblems;
exports.generateRoadmap = generateRoadmap;
exports.getSmartNext = getSmartNext;
exports.getSmartNextProblem = getSmartNextProblem;
const seed_1 = require("./data/seed");
Object.defineProperty(exports, "PATTERNS", { enumerable: true, get: function () { return seed_1.PATTERNS; } });
Object.defineProperty(exports, "TOP_COMPANIES", { enumerable: true, get: function () { return seed_1.TOP_COMPANIES; } });
Object.defineProperty(exports, "TOP_PROBLEMS", { enumerable: true, get: function () { return seed_1.TOP_PROBLEMS; } });
Object.defineProperty(exports, "PLATFORM_STATS", { enumerable: true, get: function () { return seed_1.PLATFORM_STATS; } });
const constants_1 = require("./constants");
Object.defineProperty(exports, "TIMEFRAME_LABELS", { enumerable: true, get: function () { return constants_1.TIMEFRAME_LABELS; } });
const utils_1 = require("./utils");
const pattern_map_1 = require("./pattern-map");
Object.defineProperty(exports, "getPatternProblems", { enumerable: true, get: function () { return pattern_map_1.getPatternProblems; } });
Object.defineProperty(exports, "matchesPatternValue", { enumerable: true, get: function () { return pattern_map_1.matchesPatternValue; } });
Object.defineProperty(exports, "resolveProblemId", { enumerable: true, get: function () { return pattern_map_1.resolveProblemId; } });
// ─── Patterns ─────────────────────────────────────────────────────────────────
function getAllPatterns() {
    return seed_1.PATTERNS;
}
function getPatternBySlug(slug) {
    return seed_1.PATTERNS.find((p) => p.slug === slug);
}
function getPatternStats() {
    return {
        total: seed_1.PATTERNS.length,
        totalQuestions: seed_1.PATTERNS.reduce((a, p) => a + p.questionCount, 0),
        totalCurated: seed_1.PATTERNS.reduce((a, p) => a + p.questions.length, 0),
    };
}
// ─── Companies ────────────────────────────────────────────────────────────────
function getAllCompanies() {
    return seed_1.TOP_COMPANIES;
}
function getCompanyBySlug(slug) {
    return seed_1.TOP_COMPANIES.find((c) => c.normalizedName === slug || (0, utils_1.slugify)(c.name) === slug);
}
function searchCompanies(query) {
    const q = query.toLowerCase();
    return seed_1.TOP_COMPANIES.filter((c) => c.name.toLowerCase().includes(q) || c.normalizedName.includes(q));
}
// ─── Problems ─────────────────────────────────────────────────────────────────
function getAllProblems() {
    return seed_1.TOP_PROBLEMS;
}
function getProblemBySlug(slug) {
    return seed_1.TOP_PROBLEMS.find((p) => p.slug === slug);
}
function getProblemsForPattern(patternName) {
    const pattern = seed_1.PATTERNS.find((p) => p.name.toLowerCase() === patternName.toLowerCase() || p.slug === (0, utils_1.slugify)(patternName));
    return pattern?.questions ?? [];
}
function filterProblems(opts) {
    let problems = [...seed_1.TOP_PROBLEMS];
    if (opts.difficulty?.length) {
        problems = problems.filter((p) => opts.difficulty.includes(p.difficulty));
    }
    if (opts.pattern) {
        problems = problems.filter((p) => (0, pattern_map_1.matchesPatternValue)(p, opts.pattern));
    }
    if (opts.companySlug) {
        problems = problems.filter((p) => p.companies.includes(opts.companySlug));
    }
    if (opts.timeframe) {
        problems = problems.filter((p) => p.timeframes.includes(opts.timeframe));
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
exports.PROGRESS_UPDATED_EVENT = "dsaforge:progress-updated";
const STATUS_RANK = {
    todo: 0,
    attempted: 1,
    revise: 2,
    solved: 3,
};
function isSolvedStatus(status) {
    return status === "solved" || status === "mastered";
}
/**
 * Rewrite legacy progress keys to the canonical dataset problem id.
 *
 * The pattern pages used to store progress under curated roadmap ids
 * ("tp-1", "sw-1") while the question pages used dataset ids ("167"), so the
 * same problem lived under two keys and the mastery breakdown never updated.
 */
function canonicalizeProgress(progress) {
    const out = {};
    for (const [key, entry] of Object.entries(progress)) {
        if (!entry || typeof entry !== "object")
            continue;
        const canonicalKey = (0, pattern_map_1.resolveProblemId)(key);
        const status = (entry.status ?? "todo");
        const normalized = {
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
        const keepNew = STATUS_RANK[status] >= STATUS_RANK[existing.status ?? "todo"];
        const winner = keepNew ? normalized : existing;
        const loser = keepNew ? existing : normalized;
        out[canonicalKey] = {
            ...loser,
            ...winner,
            status: STATUS_RANK[status] > STATUS_RANK[existing.status ?? "todo"]
                ? status
                : existing.status ?? "todo",
            revisionCount: Math.max(existing.revisionCount ?? 0, normalized.revisionCount ?? 0),
            notes: winner.notes ?? loser.notes,
            solvedAt: winner.solvedAt ?? loser.solvedAt,
            lastAttemptedAt: winner.lastAttemptedAt && loser.lastAttemptedAt
                ? winner.lastAttemptedAt > loser.lastAttemptedAt
                    ? winner.lastAttemptedAt
                    : loser.lastAttemptedAt
                : winner.lastAttemptedAt ?? loser.lastAttemptedAt,
        };
    }
    return out;
}
function loadProgress() {
    if (typeof window === "undefined")
        return {};
    try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        if (!raw)
            return {};
        const parsed = JSON.parse(raw);
        const canonical = canonicalizeProgress(parsed);
        if (JSON.stringify(parsed) !== JSON.stringify(canonical)) {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(canonical));
        }
        return canonical;
    }
    catch {
        return {};
    }
}
exports.getLocalProgress = loadProgress;
/**
 * Cached snapshot for `useSyncExternalStore`.
 * The reference must stay stable between reads, otherwise React re-renders forever.
 */
let progressCache = null;
exports.EMPTY_PROGRESS = {};
function getProgressSnapshot() {
    if (typeof window === "undefined")
        return exports.EMPTY_PROGRESS;
    if (!progressCache)
        progressCache = loadProgress();
    return progressCache;
}
/** Drop the cached snapshot so the next read comes from storage. */
function invalidateProgressCache() {
    progressCache = null;
}
function saveProgress(progress) {
    if (typeof window === "undefined")
        return;
    const canonical = canonicalizeProgress(progress);
    progressCache = canonical;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(canonical));
    // Notify every mounted progress store so counts update without a reload.
    window.dispatchEvent(new Event(exports.PROGRESS_UPDATED_EVENT));
}
function resetProgress() {
    if (typeof window === "undefined")
        return;
    progressCache = {};
    localStorage.removeItem(PROGRESS_KEY);
    window.dispatchEvent(new Event(exports.PROGRESS_UPDATED_EVENT));
}
function updateProblemStatus(problemId, status, notes) {
    const all = loadProgress();
    const canonicalId = (0, pattern_map_1.resolveProblemId)(problemId);
    const existing = all[canonicalId];
    const updated = {
        problemId: canonicalId,
        status,
        revisionCount: existing?.revisionCount ?? 0,
        notes: notes ?? existing?.notes,
        lastAttemptedAt: new Date().toISOString(),
        solvedAt: status === "solved" ? (existing?.solvedAt ?? new Date().toISOString()) : existing?.solvedAt,
    };
    if (status === "revise")
        updated.revisionCount = (existing?.revisionCount ?? 0) + 1;
    all[canonicalId] = updated;
    saveProgress(all);
    return updated;
}
function getProgressStats(progress) {
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
function getSolvedProblems(progress) {
    return seed_1.TOP_PROBLEMS.filter((p) => isSolvedStatus(progress[p.id]?.status));
}
/** Solved problems for one difficulty ("Easy" | "Medium" | "Hard"). */
function getSolvedProblemsByDifficulty(progress, difficulty) {
    return getSolvedProblems(progress).filter((p) => p.difficulty === difficulty);
}
/** Per-pattern solved/total, used by the mastery breakdown on the progress page. */
function getPatternMastery(progress) {
    return seed_1.PATTERNS.map((pattern) => {
        const problems = (0, pattern_map_1.getPatternProblems)(pattern);
        const solved = problems.filter((p) => isSolvedStatus(progress[p.id]?.status)).length;
        const pct = problems.length ? Math.round((solved / problems.length) * 100) : 0;
        return { pattern, solved, total: problems.length, pct };
    });
}
// ─── Platform Stats ───────────────────────────────────────────────────────────
function getPlatformStats() {
    return seed_1.PLATFORM_STATS;
}
// ─── Company Helpers ─────────────────────────────────────────────────────────
function getCompanyProblems(companyIdOrSlug) {
    const company = seed_1.TOP_COMPANIES.find(c => c.id === companyIdOrSlug || c.normalizedName === companyIdOrSlug || (0, utils_1.slugify)(c.name) === companyIdOrSlug);
    const companySlug = company?.normalizedName || companyIdOrSlug;
    return seed_1.TOP_PROBLEMS.filter(p => p.companies.includes(companySlug) || p.companies.some(c => c.toLowerCase().includes(companySlug.toLowerCase())))
        .map(p => ({
        problem: p,
        companyData: {
            companyId: company?.id || companySlug,
            companyName: company?.name || companySlug,
            timeframe: p.timeframes[0] || "30d",
            frequencyWeight: p.frequency
        }
    }));
}
// ─── Roadmap ──────────────────────────────────────────────────────────────────
function getRoadmapProblems(timeframe, targetCompanies) {
    let problems = seed_1.TOP_PROBLEMS.filter((p) => p.timeframes.includes(timeframe));
    if (targetCompanies?.length) {
        problems = problems.filter((p) => p.companies.some((c) => targetCompanies.includes(c)));
    }
    return problems.sort((a, b) => b.priorityScore - a.priorityScore);
}
function generateRoadmap({ targetDays, targetCompanyTier }) {
    const phases = [
        {
            phase: 1,
            days: `1 - ${Math.round(targetDays * 0.3)}`,
            title: "Core Foundation & High-Frequency Patterns",
            patterns: ["two-pointers", "sliding-window", "hash-map-set"],
            problemCount: Math.round(seed_1.TOP_PROBLEMS.length * 0.3),
        },
        {
            phase: 2,
            days: `${Math.round(targetDays * 0.3) + 1} - ${Math.round(targetDays * 0.7)}`,
            title: "Advanced Data Structures & Traversal",
            patterns: ["binary-tree-traversal", "graph-bfs-dfs", "binary-search"],
            problemCount: Math.round(seed_1.TOP_PROBLEMS.length * 0.4),
        },
        {
            phase: 3,
            days: `${Math.round(targetDays * 0.7) + 1} - ${targetDays}`,
            title: "Dynamic Programming & Optimization Sprint",
            patterns: ["dynamic-programming", "monotonic-stack", "heap-priority-queue"],
            problemCount: Math.round(seed_1.TOP_PROBLEMS.length * 0.3),
        },
    ];
    return phases;
}
// ─── Smart Next ────────────────────────────────────────────────────────────────
function getSmartNext(progress, targetCompanies, timeframe) {
    const unsolved = seed_1.TOP_PROBLEMS.filter((p) => !progress[p.id] || progress[p.id].status === "todo");
    const scored = unsolved.map((p) => ({
        problem: p,
        score: p.priorityScore +
            (p.companies.filter((c) => targetCompanies.includes(c)).length * 0.1) +
            (p.timeframes.includes(timeframe) ? 0.2 : 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.problem ?? seed_1.TOP_PROBLEMS[0] ?? null;
}
function getSmartNextProblem() {
    return getSmartNext(loadProgress(), [], "30d");
}
