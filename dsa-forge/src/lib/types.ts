// ─── Platform-wide shared types ──────────────────────────────────────────────

export type Platform = "leetcode" | "gfg" | "other";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProgressStatus = "todo" | "attempted" | "solved" | "revise";
export type Timeframe = "30d" | "3m" | "6m" | "6m+" | "all";
export type PatternSource = "curated" | "company" | "inferred" | "uncategorized";

// ─── Module Registry (expansion architecture) ─────────────────────────────────

export interface ModuleDefinition {
  id: string;
  label: string;
  icon: string;
  routePrefix: string;
  description: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

// ─── Problem ─────────────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  externalId: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  acceptanceRate: number;
  canonicalUrl: string;
  platform: Platform;
  companyCount: number;
  companies: string[];
  timeframes: Timeframe[];
  primaryPattern: string | null;
  secondaryPatterns: string[];
  frequency: number;
  priorityScore: number;
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  normalizedName: string;
  problemCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topPatterns: string[];
  timeframesAvailable: Timeframe[];
}

export interface CompanyProblem {
  companyId: string;
  problemId: string;
  frequency: number;
  matchType: string;
  timeframes: Timeframe[];
}

// ─── Pattern ──────────────────────────────────────────────────────────────────

export interface Pattern {
  id: string;
  name: string;
  slug: string;
  description: string;
  orderIndex: number;
  color: string;
  questionCount: number;
  companyCoverage: number;
  difficulty: "beginner" | "core" | "advanced" | "mixed";
  questions: PatternQuestion[];
}

export interface PatternQuestion {
  id: string;
  externalId: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  canonicalUrl: string;
  platform: Platform;
  solved: boolean;
  links: string[];
  companyCount: number;
  frequency: number;
  orderIndex: number;
  levelTag: "beginner" | "core" | "advanced" | "challenge";
}

// ─── User Progress ────────────────────────────────────────────────────────────

export interface UserProgress {
  problemId: string;
  status: ProgressStatus;
  solvedAt?: string;
  revisionCount: number;
  notes?: string;
  lastAttemptedAt?: string;
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export interface RoadmapPhase {
  phase: number;
  title: string;
  description: string;
  problems: Problem[];
}

export interface Roadmap {
  timeframe: Timeframe;
  label: string;
  totalProblems: number;
  phases: RoadmapPhase[];
  targetCompanies: string[];
}

// ─── Import / Data Pipeline ────────────────────────────────────────────────────

export interface ImportReport {
  sourceRows: number;
  uniqueProblems: number;
  uniqueCompanies: number;
  patternsFound: number;
  curatedMatches: number;
  unresolvedMatches: number;
  duplicatesRemoved: number;
  invalidUrls: number;
  missingFields: number;
  warnings: string[];
}

// ─── Canonical Dataset ─────────────────────────────────────────────────────────

export interface CanonicalDataset {
  problems: Problem[];
  companies: Company[];
  patterns: Pattern[];
  companyProblems: CompanyProblem[];
  importReport: ImportReport;
  generatedAt: string;
  version: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalProblems: number;
  totalCompanies: number;
  totalPatterns: number;
  curatedPatternProblems: number;
}

// ─── Smart Next ────────────────────────────────────────────────────────────────

export interface SmartNextResult {
  problem: Problem;
  reasons: string[];
  score: number;
}
