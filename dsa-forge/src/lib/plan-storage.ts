// Plan storage layer - reuses existing localStorage + Firestore pattern
import { StudyPlan, StudyTask, DailyPlan } from "@/lib/types";

const PLAN_STORAGE_KEY = "leetprime_study_plan";
const PLAN_UPDATED_EVENT = "leetprime:plan-updated";

export function loadPlan(): StudyPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudyPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: StudyPlan): void {
  if (typeof window === "undefined") return;
  plan.updatedAt = new Date().toISOString();
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
  window.dispatchEvent(new Event(PLAN_UPDATED_EVENT));
}

export function deletePlan(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAN_STORAGE_KEY);
  window.dispatchEvent(new Event(PLAN_UPDATED_EVENT));
}

export function updateTaskStatus(
  plan: StudyPlan,
  taskId: string,
  status: StudyTask["status"],
  notes?: string
): StudyPlan {
  const updated = { ...plan };
  for (const daily of updated.dailyPlans) {
    const task = daily.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === "completed") task.completedAt = new Date().toISOString();
      if (notes) task.notes = notes;
      break;
    }
  }
  // Recompute counts
  const allTasks = updated.dailyPlans.flatMap((d) => d.tasks);
  updated.completedTasks = allTasks.filter((t) => t.status === "completed").length;
  updated.skippedTasks = allTasks.filter((t) => t.status === "skipped").length;
  updated.revisionTasks = allTasks.filter((t) => t.status === "revision_needed").length;
  savePlan(updated);
  return updated;
}

export function rescheduleTask(
  plan: StudyPlan,
  taskId: string,
  newDayNumber: number
): StudyPlan {
  const updated = { ...plan };
  let taskToMove: StudyTask | null = null;
  let oldDayIndex = -1;

  for (let i = 0; i < updated.dailyPlans.length; i++) {
    const idx = updated.dailyPlans[i].tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      taskToMove = updated.dailyPlans[i].tasks[idx];
      oldDayIndex = i;
      break;
    }
  }

  if (!taskToMove || oldDayIndex === -1) return plan;

  // Remove from old day
  updated.dailyPlans[oldDayIndex].tasks = updated.dailyPlans[oldDayIndex].tasks.filter(
    (t) => t.id !== taskId
  );

  // Find or create new day
  const newDayIndex = updated.dailyPlans.findIndex((d) => d.dayNumber === newDayNumber);
  if (newDayIndex !== -1) {
    updated.dailyPlans[newDayIndex].tasks.push({ ...taskToMove, dayNumber: newDayNumber });
    updated.dailyPlans[newDayIndex].totalEstimatedMinutes = updated.dailyPlans[newDayIndex].tasks.reduce(
      (sum, t) => sum + t.estimatedMinutes,
      0
    );
  }

  savePlan(updated);
  return updated;
}

export { PLAN_UPDATED_EVENT };