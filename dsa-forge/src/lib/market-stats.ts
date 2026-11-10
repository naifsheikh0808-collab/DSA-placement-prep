import { TOP_PROBLEMS, TOP_COMPANIES, PATTERNS } from "@/lib/data/seed";
import { Problem, Company, Difficulty } from "@/lib/types";

export interface PatternFrequencyStat {
  pattern: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
  pctOfTotal: number;
}

export interface CompanyFrequencyStat {
  companyId: string;
  companyName: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface ContextRecommendation {
  problem: Problem;
  contextLabel: string;
  reason: string;
}

/** Formats company normalized slug to readable brand name */
export function formatCompanyName(slug: string): string {
  const brandMap: Record<string, string> = {
    google: "Google",
    meta: "Meta",
    amazon: "Amazon",
    microsoft: "Microsoft",
    apple: "Apple",
    netflix: "Netflix",
    uber: "Uber",
    tiktok: "TikTok",
    bloomberg: "Bloomberg",
    "goldman-sachs": "Goldman Sachs",
    adobe: "Adobe",
    salesforce: "Salesforce",
    linkedin: "LinkedIn",
    oracle: "Oracle",
    stripe: "Stripe",
    airbnb: "Airbnb",
    bytedance: "ByteDance",
    nvidia: "NVIDIA",
    palantir: "Palantir",
    cisco: "Cisco",
    walmart: "Walmart",
    morgan_stanley: "Morgan Stanley",
    "morgan-stanley": "Morgan Stanley",
    jpmorgan: "JPMorgan",
    snapchat: "Snap",
    snap: "Snap",
    spotify: "Spotify",
    twitter: "Twitter / X",
  };

  if (brandMap[slug.toLowerCase()]) {
    return brandMap[slug.toLowerCase()];
  }

  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Precomputed cache for company pattern statistics */
const companyPatternCache = new Map<string, PatternFrequencyStat[]>();

export function getCompanyPatternStats(companySlug: string, limit = 6): PatternFrequencyStat[] {
  const key = `${companySlug.toLowerCase()}_${limit}`;
  if (companyPatternCache.has(key)) {
    return companyPatternCache.get(key)!;
  }

  const slug = companySlug.toLowerCase();
  const compProbs = TOP_PROBLEMS.filter(
    (p) => p.companies && (p.companies.includes(slug) || p.companies.some((c) => c.toLowerCase() === slug))
  );

  const totalMatched = compProbs.length || 1;
  const patMap: Record<string, { pattern: string; count: number; easy: number; medium: number; hard: number }> = {};

  compProbs.forEach((p) => {
    if (!p.primaryPattern) return;
    if (!patMap[p.primaryPattern]) {
      patMap[p.primaryPattern] = { pattern: p.primaryPattern, count: 0, easy: 0, medium: 0, hard: 0 };
    }
    patMap[p.primaryPattern].count++;
    if (p.difficulty === "Easy") patMap[p.primaryPattern].easy++;
    else if (p.difficulty === "Medium") patMap[p.primaryPattern].medium++;
    else if (p.difficulty === "Hard") patMap[p.primaryPattern].hard++;
  });

  const stats: PatternFrequencyStat[] = Object.values(patMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      pctOfTotal: Math.round((item.count / totalMatched) * 100),
    }));

  companyPatternCache.set(key, stats);
  return stats;
}

/** Precomputed cache for pattern company statistics */
const patternCompanyCache = new Map<string, CompanyFrequencyStat[]>();

export function getPatternCompanyStats(patternName: string, limit = 6): CompanyFrequencyStat[] {
  const key = `${patternName}_${limit}`;
  if (patternCompanyCache.has(key)) {
    return patternCompanyCache.get(key)!;
  }

  const patProbs = TOP_PROBLEMS.filter((p) => p.primaryPattern === patternName);
  const compMap: Record<
    string,
    { companyId: string; companyName: string; count: number; easy: number; medium: number; hard: number }
  > = {};

  patProbs.forEach((p) => {
    (p.companies || []).forEach((cId) => {
      const lowerId = cId.toLowerCase();
      if (!compMap[lowerId]) {
        compMap[lowerId] = {
          companyId: lowerId,
          companyName: formatCompanyName(lowerId),
          count: 0,
          easy: 0,
          medium: 0,
          hard: 0,
        };
      }
      compMap[lowerId].count++;
      if (p.difficulty === "Easy") compMap[lowerId].easy++;
      else if (p.difficulty === "Medium") compMap[lowerId].medium++;
      else if (p.difficulty === "Hard") compMap[lowerId].hard++;
    });
  });

  const stats = Object.values(compMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  patternCompanyCache.set(key, stats);
  return stats;
}

/** Global Pattern Rankings across all 3,426 problems */
let globalPatternRankingsCache: PatternFrequencyStat[] | null = null;

export function getGlobalPatternRankings(limit = 8): PatternFrequencyStat[] {
  if (globalPatternRankingsCache && globalPatternRankingsCache.length >= limit) {
    return globalPatternRankingsCache.slice(0, limit);
  }

  const patMap: Record<string, { pattern: string; count: number; easy: number; medium: number; hard: number }> = {};
  const totalWithPattern = TOP_PROBLEMS.filter((p) => Boolean(p.primaryPattern)).length || 1;

  TOP_PROBLEMS.forEach((p) => {
    if (!p.primaryPattern) return;
    if (!patMap[p.primaryPattern]) {
      patMap[p.primaryPattern] = { pattern: p.primaryPattern, count: 0, easy: 0, medium: 0, hard: 0 };
    }
    patMap[p.primaryPattern].count++;
    if (p.difficulty === "Easy") patMap[p.primaryPattern].easy++;
    else if (p.difficulty === "Medium") patMap[p.primaryPattern].medium++;
    else if (p.difficulty === "Hard") patMap[p.primaryPattern].hard++;
  });

  const result = Object.values(patMap)
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      pctOfTotal: Math.round((item.count / totalWithPattern) * 100),
    }));

  globalPatternRankingsCache = result;
  return result.slice(0, limit);
}

/** Contextual recommendation engine matching selected company or pattern */
export function getContextRecommendedProblem(companySlug?: string, patternName?: string): Problem {
  let pool = TOP_PROBLEMS;

  if (companySlug) {
    const slug = companySlug.toLowerCase();
    const compFiltered = pool.filter(
      (p) => p.companies && (p.companies.includes(slug) || p.companies.some((c) => c.toLowerCase() === slug))
    );
    if (compFiltered.length > 0) pool = compFiltered;
  }

  if (patternName) {
    const patFiltered = pool.filter((p) => p.primaryPattern === patternName);
    if (patFiltered.length > 0) pool = patFiltered;
  }

  // Sort by priorityScore descending, then frequency descending, preferring Medium/Hard for high-yield impact
  const sorted = [...pool].sort((a, b) => {
    const scoreA = a.priorityScore || 0;
    const scoreB = b.priorityScore || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.frequency || 0) - (a.frequency || 0);
  });

  return sorted[0] || TOP_PROBLEMS[0];
}

/** Top 10 target companies with high interview activity */
export const POPULAR_COMPANIES = [
  { id: "google", name: "Google" },
  { id: "amazon", name: "Amazon" },
  { id: "meta", name: "Meta" },
  { id: "microsoft", name: "Microsoft" },
  { id: "bloomberg", name: "Bloomberg" },
  { id: "uber", name: "Uber" },
  { id: "apple", name: "Apple" },
  { id: "tiktok", name: "TikTok" },
];

/** Popular core patterns for interactive chips */
export const POPULAR_PATTERNS = [
  "Dynamic Programming",
  "Binary Tree & BST",
  "Hash Maps / Hash Sets",
  "Two Pointers",
  "Sliding Window",
  "Graph DFS/BFS",
  "Greedy Algorithms",
  "Binary Search",
];

