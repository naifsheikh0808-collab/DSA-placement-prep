import { TOP_PROBLEMS, TOP_COMPANIES } from "./data/seed";
import { matchesPatternValue } from "./pattern-map";
import type { Problem, Difficulty, Timeframe } from "./types";
import { slugify } from "./utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QuestionSearchParams {
  company?: string;
  pattern?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  timeframe?: "30d" | "3m" | "6m" | "6m+" | "all" | string;
  keywords?: string;
  excludeIds?: string[];
  onlyIds?: string[];
  limit?: number;
}

export interface QuestionSearchResultItem {
  id: string;
  title: string;
  difficulty: Difficulty;
  primaryPattern: string;
  canonicalUrl: string;
  frequency: number;
  acceptanceRate: number;
  companyCount: number;
  topCompanies: string[];
  timeframes: Timeframe[];
}

export interface QuestionSearchResponse {
  totalMatches: number;
  returnedCount: number;
  requestedLimit: number;
  filtersApplied: {
    company?: string;
    pattern?: string;
    difficulty?: string;
    timeframe?: string;
    keywords?: string;
  };
  companiesResolved?: string[];
  explanation?: string;
  questions: QuestionSearchResultItem[];
}

// ── Company Aliases & Groupings ────────────────────────────────────────────────

export const FAANG_COMPANIES = ["meta", "apple", "amazon", "netflix", "google"];
export const MAANG_COMPANIES = ["meta", "amazon", "apple", "netflix", "google"];
export const BIGTECH_COMPANIES = [
  "google",
  "amazon",
  "microsoft",
  "meta",
  "apple",
  "netflix",
  "nvidia",
  "uber",
  "linkedin",
];

const COMPANY_ALIASES: Record<string, string[]> = {
  faang: FAANG_COMPANIES,
  maang: MAANG_COMPANIES,
  fang: FAANG_COMPANIES,
  facebook: ["meta"],
  fb: ["meta"],
  meta: ["meta"],
  google: ["google"],
  alphabet: ["google"],
  amazon: ["amazon"],
  amzn: ["amazon"],
  apple: ["apple"],
  aapl: ["apple"],
  netflix: ["netflix"],
  nflx: ["netflix"],
  microsoft: ["microsoft"],
  msft: ["microsoft"],
  uber: ["uber"],
  linkedin: ["linkedin"],
  salesforce: ["salesforce"],
  adobe: ["adobe"],
  twitter: ["twitter"],
  x: ["twitter"],
  bytedance: ["bytedance", "tiktok"],
  tiktok: ["tiktok", "bytedance"],
  "goldman sachs": ["goldman-sachs"],
  goldman: ["goldman-sachs"],
  jpmorgan: ["jpmorgan"],
  "jp morgan": ["jpmorgan"],
  chase: ["jpmorgan"],
  bloomberg: ["bloomberg"],
  flipkart: ["flipkart"],
  swiggy: ["swiggy"],
  zomato: ["zomato"],
  razorpay: ["razorpay"],
  paytm: ["paytm"],
  oracle: ["oracle"],
  cisco: ["cisco"],
  intel: ["intel"],
  nvidia: ["nvidia"],
  atlassian: ["atlassian"],
  stripe: ["stripe"],
  palantir: ["palantir"],
  doordash: ["doordash"],
};

// ── Company Resolver ──────────────────────────────────────────────────────────

export function resolveCompanyQuery(input?: string): {
  slugs: string[];
  explanation?: string;
} {
  if (!input || !input.trim()) return { slugs: [] };

  const raw = input.trim().toLowerCase();

  // 1. Direct alias match
  if (COMPANY_ALIASES[raw]) {
    const slugs = COMPANY_ALIASES[raw];
    let explanation: string | undefined;
    if (raw === "faang" || raw === "fang") {
      explanation =
        "FAANG searches across Meta (formerly Facebook), Apple, Amazon, Netflix, and Google.";
    } else if (raw === "maang") {
      explanation = "MAANG searches across Meta, Amazon, Apple, Netflix, and Google.";
    } else if (raw === "facebook" || raw === "fb") {
      explanation = "Facebook questions are indexed under Meta in the LeetPrime dataset.";
    }
    return { slugs, explanation };
  }

  // 2. Exact match in TOP_COMPANIES
  const exact = TOP_COMPANIES.find(
    (c) => c.normalizedName === raw || c.id === raw || slugify(c.name) === raw
  );
  if (exact) {
    return { slugs: [exact.normalizedName] };
  }

  // 3. Substring match in TOP_COMPANIES
  const partials = TOP_COMPANIES.filter(
    (c) => c.normalizedName.includes(raw) || c.name.toLowerCase().includes(raw)
  );
  if (partials.length > 0) {
    return {
      slugs: partials.slice(0, 5).map((c) => c.normalizedName),
      explanation: `Matched company tags: ${partials
        .slice(0, 5)
        .map((c) => c.name)
        .join(", ")}`,
    };
  }

  // 4. Fallback slugify
  return { slugs: [slugify(raw)] };
}

// ── Search Engine ─────────────────────────────────────────────────────────────

export function searchQuestions(params: QuestionSearchParams): QuestionSearchResponse {
  const requestedLimit = Math.min(Math.max(params.limit ?? 5, 1), 25);
  let candidates = [...TOP_PROBLEMS];
  let baseExplanation: string | undefined;

  // 1. Company filter
  let resolvedSlugs: string[] = [];
  if (params.company && params.company.trim()) {
    const resolution = resolveCompanyQuery(params.company);
    resolvedSlugs = resolution.slugs;
    baseExplanation = resolution.explanation;

    if (resolvedSlugs.length > 0) {
      candidates = candidates.filter((p) =>
        p.companies.some((c) => resolvedSlugs.includes(c))
      );
    }
  }

  // 2. Pattern filter
  if (params.pattern && params.pattern.trim()) {
    const pat = params.pattern.trim();
    const patLower = pat.toLowerCase();

    candidates = candidates.filter((p) => {
      if (matchesPatternValue(p, pat)) return true;
      if (p.primaryPattern && p.primaryPattern.toLowerCase().includes(patLower)) return true;
      if (p.secondaryPatterns?.some((s) => s.toLowerCase().includes(patLower))) return true;
      return false;
    });
  }

  // 3. Difficulty filter
  if (params.difficulty && params.difficulty.trim()) {
    const diffNorm = params.difficulty.trim().toLowerCase();
    const targetDiff =
      diffNorm === "easy" ? "Easy" : diffNorm === "medium" ? "Medium" : diffNorm === "hard" ? "Hard" : null;

    if (targetDiff) {
      candidates = candidates.filter((p) => p.difficulty === targetDiff);
    }
  }

  // 4. Timeframe filter
  if (params.timeframe && params.timeframe.trim()) {
    const tf = params.timeframe.trim().toLowerCase();
    candidates = candidates.filter((p) =>
      p.timeframes.some((t) => t.toLowerCase() === tf)
    );
  }

  // 5. Keyword search (title & slug)
  if (params.keywords && params.keywords.trim()) {
    const kw = params.keywords.trim().toLowerCase();
    candidates = candidates.filter(
      (p) => p.title.toLowerCase().includes(kw) || p.slug.toLowerCase().includes(kw)
    );
  }

  // 6. Exclude specific problem IDs (e.g. already solved)
  if (params.excludeIds && params.excludeIds.length > 0) {
    const excludeSet = new Set(params.excludeIds);
    candidates = candidates.filter(
      (p) => !excludeSet.has(p.id) && !excludeSet.has(p.externalId)
    );
  }

  // 7. Include only specific problem IDs (e.g. revision list)
  if (params.onlyIds && params.onlyIds.length > 0) {
    const onlySet = new Set(params.onlyIds);
    candidates = candidates.filter(
      (p) => onlySet.has(p.id) || onlySet.has(p.externalId)
    );
  }

  // 8. Ranking
  // Sort by priorityScore (which combines company frequency and cross-company overlap)
  candidates.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  const totalMatches = candidates.length;
  const returnedQuestions = candidates.slice(0, requestedLimit);

  // Build explanation / messaging
  let explanation = baseExplanation || "";
  if (totalMatches === 0) {
    const filters: string[] = [];
    if (params.company) filters.push(`Company: ${params.company}`);
    if (params.pattern) filters.push(`Pattern: ${params.pattern}`);
    if (params.difficulty) filters.push(`Difficulty: ${params.difficulty}`);
    if (params.timeframe) filters.push(`Timeframe: ${params.timeframe}`);
    if (params.keywords) filters.push(`Keyword: ${params.keywords}`);
    if (params.excludeIds?.length) filters.push(`Excluded: ${params.excludeIds.length} solved`);
    if (params.onlyIds?.length) filters.push(`Filtered to: ${params.onlyIds.length} specific questions`);

    explanation = `No questions matched the criteria (${filters.join(
      ", "
    )}). Suggest relaxing difficulty or timeframe constraints, or trying related patterns.`;
  } else if (totalMatches < requestedLimit) {
    const countNote = `Found ${totalMatches} matching question${
      totalMatches === 1 ? "" : "s"
    } in the dataset (requested ${requestedLimit}).`;
    explanation = explanation ? `${explanation} ${countNote}` : countNote;
  }

  const results: QuestionSearchResultItem[] = returnedQuestions.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    primaryPattern: p.primaryPattern || "General DSA",
    canonicalUrl: p.canonicalUrl,
    frequency: p.frequency,
    acceptanceRate: p.acceptanceRate,
    companyCount: p.companyCount,
    topCompanies: p.companies.slice(0, 8),
    timeframes: p.timeframes,
  }));

  return {
    totalMatches,
    returnedCount: results.length,
    requestedLimit,
    filtersApplied: {
      company: params.company,
      pattern: params.pattern,
      difficulty: params.difficulty,
      timeframe: params.timeframe,
      keywords: params.keywords,
    },
    companiesResolved: resolvedSlugs.length > 0 ? resolvedSlugs : undefined,
    explanation: explanation || undefined,
    questions: results,
  };
}

// ── Smart Planner Configuration Proposal Types & Validator ───────────────────

export interface ProposedPlannerConfig {
  role: "intern" | "sde1" | "sde2" | "quant";
  level: "beginner" | "basics" | "intermediate" | "advanced";
  stage: "1st_2nd" | "3rd_4th" | "recent_grad" | "working";
  companyPreset: string;
  targetCompanies: string[];
  durationDays: 15 | 30 | 60 | 90;
  dailyHours: 1 | 2 | 4 | 6;
  planSummary: string;
  focusAreas: string[];
}

export function validateProposedPlannerConfig(raw: unknown): ProposedPlannerConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const roleAllowed = ["intern", "sde1", "sde2", "quant"];
  const levelAllowed = ["beginner", "basics", "intermediate", "advanced"];
  const stageAllowed = ["1st_2nd", "3rd_4th", "recent_grad", "working"];
  const durationAllowed = [15, 30, 60, 90];
  const hoursAllowed = [1, 2, 4, 6];

  const role = roleAllowed.includes(String(obj.role))
    ? (obj.role as ProposedPlannerConfig["role"])
    : "sde1";

  const level = levelAllowed.includes(String(obj.level))
    ? (obj.level as ProposedPlannerConfig["level"])
    : "basics";

  const stage = stageAllowed.includes(String(obj.stage))
    ? (obj.stage as ProposedPlannerConfig["stage"])
    : "3rd_4th";

  let durationDays: ProposedPlannerConfig["durationDays"] = 30;
  const numDuration = Number(obj.durationDays);
  if (durationAllowed.includes(numDuration)) {
    durationDays = numDuration as ProposedPlannerConfig["durationDays"];
  } else if (numDuration > 60) {
    durationDays = 90;
  } else if (numDuration > 30) {
    durationDays = 60;
  } else if (numDuration > 15) {
    durationDays = 30;
  } else {
    durationDays = 15;
  }

  let dailyHours: ProposedPlannerConfig["dailyHours"] = 2;
  const numHours = Number(obj.dailyHours);
  if (hoursAllowed.includes(numHours)) {
    dailyHours = numHours as ProposedPlannerConfig["dailyHours"];
  } else if (numHours >= 5) {
    dailyHours = 6;
  } else if (numHours >= 3) {
    dailyHours = 4;
  } else if (numHours >= 2) {
    dailyHours = 2;
  } else {
    dailyHours = 1;
  }

  const targetCompanies = Array.isArray(obj.targetCompanies)
    ? obj.targetCompanies
        .map(String)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  const planSummary =
    typeof obj.planSummary === "string" && obj.planSummary.trim()
      ? obj.planSummary.trim()
      : `${durationDays}-day personalized roadmap for ${role.toUpperCase()} targeting ${
          targetCompanies.join(", ") || "top tech companies"
        }`;

  const focusAreas = Array.isArray(obj.focusAreas)
    ? obj.focusAreas
        .map(String)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  return {
    role,
    level,
    stage,
    companyPreset: typeof obj.companyPreset === "string" ? obj.companyPreset : "custom",
    targetCompanies,
    durationDays,
    dailyHours,
    planSummary,
    focusAreas,
  };
}
