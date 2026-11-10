import { StudyPlan, StudyTask, DailyPlan, PlannerProfile, Problem, Difficulty } from "@/lib/types";
import { TOP_PROBLEMS } from "@/lib/db";

export interface RoadmapPhaseGenerated {
  phaseNumber: number;
  title: string;
  tagline: string;
  dayRange: string;
  focusPatterns: string[];
  problems: Problem[];
}

const ESTIMATED_MINUTES = {
  Easy: 20,
  Medium: 40,
  Hard: 60,
} as const;

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/* ─── Pedagogical DSA Curriculum Hierarchy ───────────────────── */
export const CURRICULUM_TOPICS = [
  // ─── Phase 1: Foundations & Sequential Algorithms ───
  { id: "two-pointers", name: "Two Pointers & Arrays", phase: 1 as const, keywords: ["two pointer", "two-pointer", "opposite direction", "two sum", "move zero"] },
  { id: "sliding-window", name: "Sliding Window", phase: 1 as const, keywords: ["sliding window"] },
  { id: "prefix-sum", name: "Prefix Sum & Kadane", phase: 1 as const, keywords: ["prefix sum", "kadane", "subarray sum"] },
  { id: "hash-maps", name: "Hash Maps & Sets", phase: 1 as const, keywords: ["hash map", "hash set", "hashmap", "hashset", "frequency"] },
  { id: "binary-search", name: "Binary Search", phase: 1 as const, keywords: ["binary search"] },

  // ─── Phase 2: Linear & Hierarchical Structures ───
  { id: "linked-list", name: "Linked Lists & Pointers", phase: 2 as const, keywords: ["linked list", "reversal", "fast & slow", "palindrome linked list"] },
  { id: "stack-queue", name: "Stacks & Queues", phase: 2 as const, keywords: ["stack", "queue", "monotonic stack"] },
  { id: "trees", name: "Binary Trees & BST", phase: 2 as const, keywords: ["tree", "binary tree", "bst", "lowest common ancestor"] },
  { id: "tree-traversal", name: "Tree DFS, BFS & Recursion", phase: 2 as const, keywords: ["breadth-first", "depth-first", "level order", "traversal"] },

  // ─── Phase 3: Core Algorithmic Mastery ───
  { id: "heap", name: "Heaps & Priority Queues", phase: 3 as const, keywords: ["heap", "priority queue", "top k"] },
  { id: "backtracking", name: "Recursion & Backtracking", phase: 3 as const, keywords: ["backtracking", "recursion", "subsets", "permutations"] },
  { id: "intervals", name: "Merge Intervals & Greedy", phase: 3 as const, keywords: ["intervals", "interval", "greedy"] },
  { id: "graphs", name: "Graph Algorithms (BFS/DFS, Topo, Cycles)", phase: 3 as const, keywords: ["graph", "topological", "bipartite", "cycle", "provinces", "islands"] },
  { id: "dp-foundations", name: "Dynamic Programming Foundations", phase: 3 as const, keywords: ["dynamic programming", "dp", "coin change", "climbing stairs"] },

  // ─── Phase 4: Advanced Frameworks & Target Company Sprints ───
  { id: "advanced-dp", name: "Advanced DP & Sequences", phase: 4 as const, keywords: ["knapsack", "subsequence", "edit distance", "burst balloons", "longest increasing"] },
  { id: "shortest-paths", name: "Shortest Paths & Disjoint Sets", phase: 4 as const, keywords: ["dijkstra", "network delay", "minimum effort", "union find", "union-find", "dsu", "topological"] },
  { id: "specialized-ds", name: "Specialized Structures (Trie, Monotonic, Design)", phase: 4 as const, keywords: ["trie", "segment tree", "fenwick", "monotonic", "monotonic stack", "design", "lru", "lfu", "bit manipulation"] },
  { id: "company-recency", name: "Target Company High-Yield 30d/3m", phase: 4 as const, keywords: ["30d", "company"] },
];

function classifyProblemTopic(p: Problem): { topicIndex: number; phase: 1 | 2 | 3 | 4; topicId: string } {
  const primary = (p.primaryPattern || "").toLowerCase();
  const title = (p.title || "").toLowerCase();
  const secondaries = (p.secondaryPatterns || []).join(" ").toLowerCase();
  const combined = `${primary} ${title} ${secondaries}`;

  for (let i = 0; i < CURRICULUM_TOPICS.length; i++) {
    const topic = CURRICULUM_TOPICS[i];
    for (const kw of topic.keywords) {
      if (combined.includes(kw)) {
        return { topicIndex: i, phase: topic.phase, topicId: topic.id };
      }
    }
  }

  if (combined.includes("tree") || combined.includes("node")) {
    return { topicIndex: 7, phase: 2, topicId: "trees" };
  }
  if (combined.includes("array") || combined.includes("string")) {
    return { topicIndex: 0, phase: 1, topicId: "two-pointers" };
  }
  return { topicIndex: 12, phase: 3, topicId: "graphs" };
}

function normalizeCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const DIFFICULTY_RANK_MAP: Record<PlannerProfile["level"], Record<Difficulty, number>> = {
  beginner: { Easy: 0, Medium: 1, Hard: 2 },
  basics: { Easy: 0, Medium: 1, Hard: 2 },
  intermediate: { Easy: 0, Medium: 1, Hard: 2 },
  advanced: { Medium: 0, Hard: 1, Easy: 2 },
};

/**
 * Difficulty allocation weights per skill level.
 * Controls what fraction of a topic's budget goes to Easy / Medium / Hard.
 */
const DIFF_WEIGHTS: Record<PlannerProfile["level"], { Easy: number; Medium: number; Hard: number }> = {
  beginner:     { Easy: 0.65, Medium: 0.35, Hard: 0.00 },
  basics:       { Easy: 0.30, Medium: 0.55, Hard: 0.15 },
  intermediate: { Easy: 0.10, Medium: 0.60, Hard: 0.30 },
  advanced:     { Easy: 0.00, Medium: 0.35, Hard: 0.65 },
};

type AnnotatedProblem = {
  problem: Problem;
  topicIndex: number;
  phase: 1 | 2 | 3 | 4;
  topicId: string;
  diffRank: number;
  score: number;
};

/**
 * Selects a balanced set of problems from a phase's candidate pool.
 */
function selectBalancedProblems(
  candidates: AnnotatedProblem[],
  phaseCount: number,
  level: PlannerProfile["level"],
  usedIds: Set<string> = new Set<string>()
): Problem[] {
  if (candidates.length === 0) return [];
  const weights = DIFF_WEIGHTS[level];

  // Group by topicIndex, keeping insertion order (already sorted by topicIndex via partition)
  const byTopic = new Map<number, AnnotatedProblem[]>();
  for (const item of candidates) {
    if (usedIds.has(item.problem.id)) continue;
    if (!byTopic.has(item.topicIndex)) byTopic.set(item.topicIndex, []);
    byTopic.get(item.topicIndex)!.push(item);
  }

  const topicIds = Array.from(byTopic.keys()).sort((a, b) => a - b);
  // Distribute slots across topics; ensure all topics stay represented even in short sprints
  const budgetPerTopic = Math.max(1, Math.ceil(phaseCount / Math.max(1, topicIds.length)));

  const result: Problem[] = [];

  for (const topicIdx of topicIds) {
    if (result.length >= phaseCount) break;
    const topicItems = byTopic.get(topicIdx)!;

    // Remaining slots for this topic (don't overshoot phaseCount)
    const remaining = Math.min(budgetPerTopic, phaseCount - result.length);

    // Sort each difficulty bucket by relevance score descending
    const easyPool = topicItems.filter(x => x.problem.difficulty === "Easy" && !usedIds.has(x.problem.id)).sort((a, b) => b.score - a.score);
    const medPool  = topicItems.filter(x => x.problem.difficulty === "Medium" && !usedIds.has(x.problem.id)).sort((a, b) => b.score - a.score);
    const hardPool = topicItems.filter(x => x.problem.difficulty === "Hard" && !usedIds.has(x.problem.id)).sort((a, b) => b.score - a.score);

    // Allocate slots by weight
    let easyN = Math.round(remaining * weights.Easy);
    let hardN = Math.round(remaining * weights.Hard);
    let medN  = Math.max(0, remaining - easyN - hardN);

    // Clamp to available pool sizes
    easyN = Math.min(easyN, easyPool.length);
    hardN = Math.min(hardN, hardPool.length);
    medN  = Math.min(medN, medPool.length);

    // If a bucket was capped, redistribute leftover slots cleanly
    const taken = easyN + medN + hardN;
    if (taken < remaining) {
      const extra = remaining - taken;
      const medExtra = Math.min(extra, medPool.length - medN);
      medN += medExtra;
      const leftAfterMed = remaining - easyN - medN - hardN;
      if (leftAfterMed > 0) {
        if (level === "advanced" || level === "intermediate") {
          const hardExtra = Math.min(leftAfterMed, hardPool.length - hardN);
          hardN += hardExtra;
          const easyExtra = Math.min(remaining - easyN - medN - hardN, easyPool.length - easyN);
          easyN += Math.max(0, easyExtra);
        } else {
          const easyExtra = Math.min(leftAfterMed, easyPool.length - easyN);
          easyN += easyExtra;
          const hardExtra = Math.min(remaining - easyN - medN - hardN, hardPool.length - hardN);
          hardN += Math.max(0, hardExtra);
        }
      }
    }

    // Pick from each bucket (filter already-used ids)
    const topicSelected: Problem[] = [
      ...easyPool.slice(0, easyN).map(x => x.problem),
      ...medPool .slice(0, medN ).map(x => x.problem),
      ...hardPool.slice(0, hardN).map(x => x.problem),
    ];

    for (const p of topicSelected) usedIds.add(p.id);
    result.push(...topicSelected);
  }

  // Fill any remaining slots (rounding gaps) with highest-scored unused candidates
  if (result.length < phaseCount) {
    const fallback = candidates
      .filter(x => !usedIds.has(x.problem.id))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.topicIndex - b.topicIndex;
      });
    for (const item of fallback) {
      if (result.length >= phaseCount) break;
      result.push(item.problem);
      usedIds.add(item.problem.id);
    }
  }

  return result;
}

function calculateRelevanceScore(
  p: Problem,
  profile: PlannerProfile,
  targetCoSet: Set<string>
): number {
  let score = (p.priorityScore || 50) * 0.5;

  // Target company cohort match with frequency density boost
  if (targetCoSet.size > 0 && p.companies.length > 0) {
    let matchCount = 0;
    for (const c of p.companies) {
      if (targetCoSet.has(normalizeCompanySlug(c))) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      score += 110;
      if (p.timeframes.includes("30d")) score += 70;
      else if (p.timeframes.includes("3m")) score += 40;
      else if (p.timeframes.includes("6m")) score += 20;

      const specificity = 1 - Math.min(1, (p.companies.length - 1) / 45);
      score += Math.round(specificity * 60);
    } else {
      score -= 35;
    }
  } else {
    // All companies / general prep mode
    if (p.timeframes.includes("30d")) score += 45;
    else if (p.timeframes.includes("3m")) score += 25;
    else if (p.timeframes.includes("6m")) score += 10;
  }

  // Strong Role & Career Stage differentiation
  if (profile.role === "quant") {
    if (p.difficulty === "Hard") score += 75;
    else if (p.difficulty === "Medium") score += 15;
    else score -= 55;
  } else if (profile.role === "sde2" || profile.stage === "working") {
    if (p.difficulty === "Hard") score += 40;
    else if (p.difficulty === "Medium") score += 30;
    else score -= 30;
  } else if (profile.role === "intern" || profile.stage === "1st_2nd") {
    if (p.difficulty === "Easy") score += 50;
    else if (p.difficulty === "Medium") score += 20;
    else score -= 60;
  } else {
    // sde1 / campus placements
    if (p.difficulty === "Medium") score += 25;
    else if (p.difficulty === "Easy") score += 15;
  }

  // Skill level secondary tie-breaker
  if (profile.level === "beginner") {
    if (p.difficulty === "Easy") score += 30;
    else if (p.difficulty === "Hard") score -= 40;
  } else if (profile.level === "advanced") {
    if (p.difficulty === "Hard") score += 35;
    else if (p.difficulty === "Easy") score -= 30;
  }

  return score;
}

/**
 * Generates a fully structured 4-phase roadmap tailored to the user's target companies,
 * timeline, and skill level.
 */
export function generatePersonalizedRoadmap(profile: PlannerProfile): RoadmapPhaseGenerated[] {
  let problemsPerDay = 1.5;
  if (profile.dailyHours <= 1) problemsPerDay = 1;
  else if (profile.dailyHours === 2) problemsPerDay = 2;
  else if (profile.dailyHours === 4) problemsPerDay = 3.5;
  else problemsPerDay = 5;

  const totalBudget = Math.min(
    Math.max(Math.round(profile.durationDays * problemsPerDay * 0.7), 16),
    120
  );

  const targetCoSet = new Set((profile.targetCompanies || []).map(normalizeCompanySlug));
  const diffOrder = DIFFICULTY_RANK_MAP[profile.level] || DIFFICULTY_RANK_MAP.basics;

  // Filter out SQL problems from general algorithmic DSA roadmap
  const dsaProblems = TOP_PROBLEMS.filter(
    (p) => p.primaryPattern !== "SQL"
  );

  const annotated = dsaProblems.map((p) => {
    const { topicIndex, phase, topicId } = classifyProblemTopic(p);
    const score = calculateRelevanceScore(p, profile, targetCoSet);
    const diffRank = diffOrder[p.difficulty] ?? 1;

    return {
      problem: p,
      topicIndex,
      phase,
      topicId,
      diffRank,
      score,
    };
  });

  // Budget allocation per phase (responsive to totalBudget)
  const p1Count = Math.max(Math.round(totalBudget * 0.25), 4);
  const p2Count = Math.max(Math.round(totalBudget * 0.30), 4);
  const p3Count = Math.max(Math.round(totalBudget * 0.30), 4);
  const p4Count = Math.max(totalBudget - (p1Count + p2Count + p3Count), 4);

  const usedProblemIds = new Set<string>();

  // Phase 1: Foundations & Sequential Algorithms
  const p1Candidates = annotated.filter((x) => x.phase === 1);
  const p1Problems = selectBalancedProblems(p1Candidates, p1Count, profile.level, usedProblemIds);

  // Phase 2: Hierarchical Structures & Traversal
  const p2Candidates = annotated.filter((x) => x.phase === 2);
  const p2Problems = selectBalancedProblems(p2Candidates, p2Count, profile.level, usedProblemIds);

  // Phase 3: Core Algorithmic Mastery & Optimization
  const p3Candidates = annotated.filter((x) => x.phase === 3);
  const p3Problems = selectBalancedProblems(p3Candidates, p3Count, profile.level, usedProblemIds);

  // Phase 4: Target Company Recency & Mock Sprint (Pure Company Recency & Mock Sprints)
  let p4Pool = annotated.filter((x) => !usedProblemIds.has(x.problem.id));
  if (targetCoSet.size > 0) {
    const matchingTarget = p4Pool.filter((x) =>
      x.problem.companies.some((c) => targetCoSet.has(normalizeCompanySlug(c)))
    );
    if (matchingTarget.length >= p4Count) {
      p4Pool = matchingTarget;
    }
  }

  // Rank Phase 4 questions by live recency (30d > 3m > 6m) and relevance score
  p4Pool.sort((a, b) => {
    const aRec = a.problem.timeframes.includes("30d") ? 3 : a.problem.timeframes.includes("3m") ? 2 : a.problem.timeframes.includes("6m") ? 1 : 0;
    const bRec = b.problem.timeframes.includes("30d") ? 3 : b.problem.timeframes.includes("3m") ? 2 : b.problem.timeframes.includes("6m") ? 1 : 0;
    if (bRec !== aRec) return bRec - aRec;
    return b.score - a.score;
  });

  const p4Problems: Problem[] = [];
  for (const item of p4Pool) {
    if (p4Problems.length >= p4Count) break;
    p4Problems.push(item.problem);
    usedProblemIds.add(item.problem.id);
  }

  const daySplit1 = Math.round(profile.durationDays * 0.25);
  const daySplit2 = Math.round(profile.durationDays * 0.55);
  const daySplit3 = Math.round(profile.durationDays * 0.85);

  return [
    {
      phaseNumber: 1,
      title: "Foundations & High-Frequency Frameworks",
      tagline: "Master Two Pointers, Sliding Window, Prefix Sum & Binary Search to build problem-solving intuition.",
      dayRange: `Day 1 – Day ${daySplit1}`,
      focusPatterns: ["Two Pointers", "Sliding Window", "Prefix Sum", "Hash Maps", "Binary Search"],
      problems: p1Problems,
    },
    {
      phaseNumber: 2,
      title: "Hierarchical Structures & Traversal",
      tagline: "Conquer Linked Lists, Stacks, Binary Trees & BFS/DFS — the bread & butter of technical rounds.",
      dayRange: `Day ${daySplit1 + 1} – Day ${daySplit2}`,
      focusPatterns: ["Linked Lists", "Stacks & Queues", "Binary Trees & BST", "Tree BFS / DFS"],
      problems: p2Problems,
    },
    {
      phaseNumber: 3,
      title: "Core Algorithmic Mastery & Optimization",
      tagline: "Heaps, Backtracking, Graphs & Dynamic Programming — unlock Tier-1 and MAANG clearing questions.",
      dayRange: `Day ${daySplit2 + 1} – Day ${daySplit3}`,
      focusPatterns: ["Heaps / Priority Queue", "Backtracking", "Intervals & Greedy", "Graphs", "Dynamic Programming"],
      problems: p3Problems,
    },
    {
      phaseNumber: 4,
      title: "Target Company Recency & Mock Sprint",
      tagline: "Fresh 30-day interview questions from your target companies + edge-case optimization.",
      dayRange: `Day ${daySplit3 + 1} – Day ${profile.durationDays}`,
      focusPatterns: ["Target Company 30d/3m", "Advanced DP", "Shortest Paths", "Mock Sprints"],
      problems: p4Problems,
    },
  ];
}

/**
 * Generates day-by-day study tasks drawing directly from the pedagogical roadmap.
 * Days start with foundational Easy problems and smoothly scale through Mediums
 * and advanced topics as the timeline progresses.
 */
export function generateStudyPlan(
  profile: PlannerProfile,
  progress: Record<string, any> = {}
): StudyPlan {
  const startDate = new Date();
  const dailyMinutes = profile.dailyHours * 60;
  const bufferMinutes = Math.round(dailyMinutes * 0.15); // 15% buffer
  const usableMinutes = dailyMinutes - bufferMinutes;

  // Retrieve the structured, topic-wise & difficulty-wise sequenced problems
  const roadmapPhases = generatePersonalizedRoadmap(profile);
  const orderedProblems = roadmapPhases.flatMap((p) => p.problems);

  const avgMinutes = 35;
  const problemsPerDay = Math.max(1, Math.floor(usableMinutes / avgMinutes));

  const dailyPlans: DailyPlan[] = [];
  let problemIndex = 0;
  let totalTasks = 0;

  for (let day = 1; day <= profile.durationDays; day++) {
    const date = addDays(startDate, day - 1);
    const dateStr = formatDate(date);
    const tasks: StudyTask[] = [];
    let dayMinutes = 0;

    // Allocate problems in strict curriculum sequence
    const numSolving = Math.min(problemsPerDay, orderedProblems.length - problemIndex);
    for (let i = 0; i < numSolving && problemIndex < orderedProblems.length; i++) {
      const problem = orderedProblems[problemIndex++];
      const estMin = ESTIMATED_MINUTES[problem.difficulty];
      if (dayMinutes + estMin > usableMinutes && tasks.length > 0) {
        problemIndex--;
        break;
      }

      tasks.push({
        id: generateId(),
        dayNumber: day,
        date: dateStr,
        type: "solving",
        title: `Solve: ${problem.title}`,
        description: `Practice ${problem.primaryPattern || "DSA"} (${problem.difficulty}). Target companies: ${problem.companies.slice(0, 3).join(", ") || "Tech Top 50"}.`,
        problemId: problem.id,
        problemTitle: problem.title,
        problemUrl: problem.canonicalUrl,
        difficulty: problem.difficulty,
        pattern: problem.primaryPattern || "General",
        estimatedMinutes: estMin,
        status: "pending",
      });
      dayMinutes += estMin;
      totalTasks++;
    }

    // Add revision task every 3 days if there are revision items in progress
    const revisionIds = Object.keys(progress).filter(
      (id) => progress[id]?.status === "revise"
    );
    if (revisionIds.length > 0 && dayMinutes + 25 <= usableMinutes && day % 3 === 0) {
      const revId = revisionIds[Math.floor(Math.random() * revisionIds.length)];
      const revProblem = TOP_PROBLEMS.find((p) => p.id === revId);
      if (revProblem) {
        tasks.push({
          id: generateId(),
          dayNumber: day,
          date: dateStr,
          type: "revision",
          title: `Revise: ${revProblem.title}`,
          description: `Revisit this problem to reinforce ${revProblem.primaryPattern || "DSA"} concepts.`,
          problemId: revProblem.id,
          problemTitle: revProblem.title,
          problemUrl: revProblem.canonicalUrl,
          difficulty: revProblem.difficulty,
          pattern: revProblem.primaryPattern || "General",
          estimatedMinutes: 25,
          status: "pending",
        });
        dayMinutes += 25;
        totalTasks++;
      }
    }

    // Add pattern review task on day 1 of each week
    if (day % 7 === 1 && dayMinutes + 30 <= usableMinutes) {
      tasks.push({
        id: generateId(),
        dayNumber: day,
        date: dateStr,
        type: "learning",
        title: "Pattern Framework Review",
        description: `Review fundamental templates and key edge cases for this week's topics.`,
        estimatedMinutes: 30,
        status: "pending",
      });
      dayMinutes += 30;
      totalTasks++;
    }

    // Add mock practice weekly
    if (day % 7 === 0 && dayMinutes + 45 <= usableMinutes) {
      tasks.push({
        id: generateId(),
        dayNumber: day,
        date: dateStr,
        type: "mock",
        title: "Timed Interview Simulation",
        description: "Timed practice session simulating realistic technical interview conditions.",
        estimatedMinutes: 45,
        status: "pending",
      });
      dayMinutes += 45;
      totalTasks++;
    }

    dailyPlans.push({
      dayNumber: day,
      date: dateStr,
      tasks,
      totalEstimatedMinutes: dayMinutes,
    });
  }

  const endDate = addDays(startDate, profile.durationDays - 1);

  return {
    id: `plan-${Date.now()}`,
    userId: "",
    profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    dailyPlans,
    totalTasks,
    completedTasks: 0,
    skippedTasks: 0,
    revisionTasks: 0,
  };
}

export function validateStudyPlan(plan: StudyPlan): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!plan.dailyPlans || plan.dailyPlans.length === 0) errors.push("Plan has no daily plans");
  if (!plan.profile) errors.push("Plan missing profile");
  if (plan.startDate && plan.endDate && new Date(plan.startDate) > new Date(plan.endDate)) {
    errors.push("Start date must be before end date");
  }
  for (const daily of plan.dailyPlans) {
    if (daily.totalEstimatedMinutes > (plan.profile.dailyHours * 60)) {
      errors.push(`Day ${daily.dayNumber} exceeds daily time budget`);
    }
    for (const task of daily.tasks) {
      if (!task.title) errors.push(`Task ${task.id} missing title`);
      if (task.estimatedMinutes <= 0) errors.push(`Task ${task.id} has invalid time estimate`);
      if (task.problemId && task.problemUrl) {
        const problem = TOP_PROBLEMS.find((p) => p.id === task.problemId);
        if (!problem) errors.push(`Task ${task.id} references unknown problem ${task.problemId}`);
        else if (problem.canonicalUrl !== task.problemUrl) errors.push(`Task ${task.id} URL mismatch`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
