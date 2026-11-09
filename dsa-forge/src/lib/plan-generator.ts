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
  return { topicIndex: CURRICULUM_TOPICS.length - 1, phase: 4, topicId: "company-recency" };
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
  beginner:     { Easy: 0.45, Medium: 0.45, Hard: 0.10 },
  basics:       { Easy: 0.30, Medium: 0.55, Hard: 0.15 },
  intermediate: { Easy: 0.15, Medium: 0.60, Hard: 0.25 },
  advanced:     { Easy: 0.05, Medium: 0.45, Hard: 0.50 },
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
 *
 * Strategy:
 * 1. Group candidates by topicIndex (preserves curriculum order).
 * 2. For each topic, allocate a proportional budget and split it
 *    across Easy / Medium / Hard according to DIFF_WEIGHTS[level].
 * 3. Within each difficulty bucket, pick the highest-scored problems first.
 * 4. Concatenate all topic clusters in order.
 * 5. Fill any remaining slots (rounding gaps) with the globally highest-scored unused problems.
 *
 * Result: Two Pointers Easy → Two Pointers Medium → Two Pointers Hard →
 *         Sliding Window Easy → Sliding Window Medium → … (difficulty balanced per topic)
 */
function selectBalancedProblems(
  candidates: AnnotatedProblem[],
  phaseCount: number,
  level: PlannerProfile["level"]
): Problem[] {
  if (candidates.length === 0) return [];
  const weights = DIFF_WEIGHTS[level];

  // Group by topicIndex, keeping insertion order (already sorted by topicIndex via partition)
  const byTopic = new Map<number, AnnotatedProblem[]>();
  for (const item of candidates) {
    if (!byTopic.has(item.topicIndex)) byTopic.set(item.topicIndex, []);
    byTopic.get(item.topicIndex)!.push(item);
  }

  const topicIds = Array.from(byTopic.keys()).sort((a, b) => a - b);
  // Each topic gets an equal share; at least 2 problems per topic
  const budgetPerTopic = Math.max(2, Math.ceil(phaseCount / topicIds.length));

  const result: Problem[] = [];
  const usedIds = new Set<string>();

  for (const topicIdx of topicIds) {
    if (result.length >= phaseCount) break;
    const topicItems = byTopic.get(topicIdx)!;

    // Remaining slots for this topic (don't overshoot phaseCount)
    const remaining = Math.min(budgetPerTopic, phaseCount - result.length);

    // Sort each difficulty bucket by relevance score descending
    const easyPool = topicItems.filter(x => x.problem.difficulty === "Easy").sort((a, b) => b.score - a.score);
    const medPool  = topicItems.filter(x => x.problem.difficulty === "Medium").sort((a, b) => b.score - a.score);
    const hardPool = topicItems.filter(x => x.problem.difficulty === "Hard").sort((a, b) => b.score - a.score);

    // Allocate slots by weight, ensuring at least 1 for each non-empty bucket when budget allows
    let easyN = Math.round(remaining * weights.Easy);
    let hardN = Math.round(remaining * weights.Hard);
    let medN  = remaining - easyN - hardN;

    // Clamp to available pool sizes
    easyN = Math.min(easyN, easyPool.length);
    hardN = Math.min(hardN, hardPool.length);
    medN  = Math.min(Math.max(0, medN), medPool.length);

    // If a bucket was capped, redistribute leftover slots to medium (most versatile)
    const taken = easyN + medN + hardN;
    if (taken < remaining) {
      const extra = remaining - taken;
      const medExtra = Math.min(extra, medPool.length - medN);
      medN += medExtra;
      // then to easy
      const easyExtra = Math.min(remaining - easyN - medN - hardN, easyPool.length - easyN);
      easyN += Math.max(0, easyExtra);
    }

    // Pick from each bucket (filter already-used ids)
    const topicSelected: Problem[] = [
      ...easyPool.slice(0, easyN).filter(x => !usedIds.has(x.problem.id)).map(x => x.problem),
      ...medPool .slice(0, medN ).filter(x => !usedIds.has(x.problem.id)).map(x => x.problem),
      ...hardPool.slice(0, hardN).filter(x => !usedIds.has(x.problem.id)).map(x => x.problem),
    ];

    for (const p of topicSelected) usedIds.add(p.id);
    result.push(...topicSelected);
  }

  // Fill any remaining slots (rounding gaps) with highest-scored unused candidates
  if (result.length < phaseCount) {
    const fallback = candidates
      .filter(x => !usedIds.has(x.problem.id))
      .sort((a, b) => {
        // For fallback, still prefer topic order then score
        if (a.topicIndex !== b.topicIndex) return a.topicIndex - b.topicIndex;
        return b.score - a.score;
      });
    for (const item of fallback) {
      if (result.length >= phaseCount) break;
      result.push(item.problem);
      usedIds.add(item.problem.id);
    }
  }

  return result;
}

function calculateRelevanceScore(p: Problem, profile: PlannerProfile, targetCo: string[]): number {
  let score = p.priorityScore || 50;

  if (targetCo.length > 0 && p.companies.some((c) => targetCo.includes(c.toLowerCase()))) {
    score += 35; // Priority boost for company target match
  }
  if (p.timeframes.includes("30d")) score += 25;
  else if (p.timeframes.includes("3m")) score += 15;
  else if (p.timeframes.includes("6m")) score += 5;

  if (profile.role === "quant" && p.difficulty === "Hard") score += 20;
  if (profile.role === "intern" && p.difficulty === "Easy") score += 15;

  return score;
}

/**
 * Generates a fully structured 4-phase roadmap tailored to the user's target companies,
 * timeline, and skill level. Questions within each phase and across the entire plan
 * are sequenced by:
 * 1. Chronological DSA topic progression
 * 2. Difficulty progression (Easy -> Medium -> Hard)
 * 3. Company target relevance & interview recency score
 */
export function generatePersonalizedRoadmap(profile: PlannerProfile): RoadmapPhaseGenerated[] {
  let problemsPerDay = 1.5;
  if (profile.dailyHours <= 1) problemsPerDay = 1;
  else if (profile.dailyHours === 2) problemsPerDay = 2;
  else if (profile.dailyHours === 4) problemsPerDay = 3.5;
  else problemsPerDay = 5;

  const totalBudget = Math.min(
    Math.max(Math.round(profile.durationDays * problemsPerDay * 0.7), 24),
    90
  );

  const targetCo = (profile.targetCompanies || []).map((c) => c.toLowerCase());
  const diffOrder = DIFFICULTY_RANK_MAP[profile.level] || DIFFICULTY_RANK_MAP.basics;

  const annotated = TOP_PROBLEMS.map((p) => {
    const { topicIndex, phase, topicId } = classifyProblemTopic(p);
    const score = calculateRelevanceScore(p, profile, targetCo);
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

  // Target company prioritization
  let candidatePool = annotated;
  if (targetCo.length > 0) {
    const matchingCo = candidatePool.filter((item) =>
      item.problem.companies.some((c) => targetCo.includes(c.toLowerCase()))
    );
    if (matchingCo.length >= 20) {
      candidatePool = [
        ...matchingCo,
        ...candidatePool.filter((item) => !matchingCo.includes(item)),
      ];
    }
  }

  // Partition into phases without duplicates
  const phaseCandidates: Record<1 | 2 | 3 | 4, typeof annotated> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  const usedProblemIds = new Set<string>();

  for (const item of candidatePool) {
    if (usedProblemIds.has(item.problem.id)) continue;
    phaseCandidates[item.phase].push(item);
    usedProblemIds.add(item.problem.id);
  }

  // Budget allocation per phase
  const p1Count = Math.max(Math.round(totalBudget * 0.25), 6);
  const p2Count = Math.max(Math.round(totalBudget * 0.3), 7);
  const p3Count = Math.max(Math.round(totalBudget * 0.3), 7);
  const p4Count = Math.max(totalBudget - (p1Count + p2Count + p3Count), 5);

  // Per-phase: pick a balanced Easy+Medium+Hard mix within each topic cluster
  // (Two Pointers Easy→Medium→Hard, then Sliding Window Easy→Medium→Hard, …)
  const p1Problems = selectBalancedProblems(phaseCandidates[1], p1Count, profile.level);
  const p2Problems = selectBalancedProblems(phaseCandidates[2], p2Count, profile.level);
  const p3Problems = selectBalancedProblems(phaseCandidates[3], p3Count, profile.level);
  const p4Problems = selectBalancedProblems(phaseCandidates[4], p4Count, profile.level);

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
