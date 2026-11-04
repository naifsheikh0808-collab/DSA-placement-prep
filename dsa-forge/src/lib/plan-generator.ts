import { StudyPlan, StudyTask, DailyPlan, PlannerProfile } from "@/lib/types";
import { TOP_PROBLEMS, Problem } from "@/lib/db";
import { searchQuestions } from "@/lib/question-search";

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

export function generateStudyPlan(profile: PlannerProfile, progress: Record<string, any> = {}): StudyPlan {
  const startDate = new Date();
  const dailyMinutes = profile.dailyHours * 60;
  const bufferMinutes = Math.round(dailyMinutes * 0.15); // 15% buffer
  const usableMinutes = dailyMinutes - bufferMinutes;

  // Build problem pool based on profile
  const targetCo = profile.targetCompanies.map((c) => c.toLowerCase());
  let candidates = [...TOP_PROBLEMS];

  if (targetCo.length > 0) {
    const matching = candidates.filter((p) =>
      p.companies.some((c) => targetCo.includes(c.toLowerCase()))
    );
    if (matching.length >= 10) {
      candidates = [...matching, ...candidates.filter((p) => !matching.includes(p))];
    }
  }

  // Filter by skill level difficulty
  const diffWeights: Record<string, { Easy: number; Medium: number; Hard: number }> = {
    beginner: { Easy: 0.5, Medium: 0.45, Hard: 0.05 },
    basics: { Easy: 0.25, Medium: 0.65, Hard: 0.1 },
    intermediate: { Easy: 0.1, Medium: 0.7, Hard: 0.2 },
    advanced: { Easy: 0.05, Medium: 0.45, Hard: 0.5 },
  };
  const weights = diffWeights[profile.level] || diffWeights.basics;

  // Score problems
  const scored = candidates.map((p) => {
    let score = p.priorityScore;
    if (p.timeframes.includes("30d")) score += 20;
    else if (p.timeframes.includes("3m")) score += 10;
    if (targetCo.length > 0 && p.companies.some((c) => targetCo.includes(c.toLowerCase()))) score += 15;
    return { problem: p, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Determine daily problem count based on usable time
  const avgMinutes = 35; // average per problem
  const problemsPerDay = Math.max(1, Math.floor(usableMinutes / avgMinutes));

  // Build daily plans
  const dailyPlans: DailyPlan[] = [];
  let problemIndex = 0;
  let totalTasks = 0;

  for (let day = 1; day <= profile.durationDays; day++) {
    const date = addDays(startDate, day - 1);
    const dateStr = formatDate(date);
    const tasks: StudyTask[] = [];
    let dayMinutes = 0;

    // Add 1-2 solving tasks per day
    const numSolving = Math.min(problemsPerDay, scored.length - problemIndex);
    for (let i = 0; i < numSolving && problemIndex < scored.length; i++) {
      const { problem } = scored[problemIndex++];
      const estMin = ESTIMATED_MINUTES[problem.difficulty];
      if (dayMinutes + estMin > usableMinutes) break;

      tasks.push({
        id: generateId(),
        dayNumber: day,
        date: dateStr,
        type: "solving",
        title: `Solve: ${problem.title}`,
        description: `Practice ${problem.primaryPattern || "DSA"} problem. Target companies: ${problem.companies.slice(0, 3).join(", ")}.`,
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

    // Add revision task if there are revision items in progress
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

    // Add learning task on certain days
    if (day % 7 === 1 && dayMinutes + 30 <= usableMinutes) {
      tasks.push({
        id: generateId(),
        dayNumber: day,
        date: dateStr,
        type: "learning",
        title: "Pattern Study & Notes Review",
        description: `Review ${profile.level === "beginner" ? "fundamental" : "advanced"} patterns and update your cheat sheet.`,
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
        title: "Mock Interview Practice",
        description: "Timed practice session simulating interview conditions.",
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
    userId: "", // Will be set by caller
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