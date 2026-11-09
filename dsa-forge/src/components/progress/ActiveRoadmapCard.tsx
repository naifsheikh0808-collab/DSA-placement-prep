"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { PrimeAiLogo } from "@/components/ai/PrimeAiLogo";
import { loadPlan, loadPlannerProfile, PLAN_UPDATED_EVENT } from "@/lib/plan-storage";
import { generatePersonalizedRoadmap } from "@/lib/plan-generator";
import { useProgressStore } from "@/hooks/use-progress";
import { TOP_PROBLEMS } from "@/lib/db";
import type { StudyPlan, PlannerProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  intern: "Internship",
  sde1: "SDE-1",
  sde2: "SDE-2",
  quant: "Quant / HFT",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  basics: "Foundations",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const STORAGE_KEY = "leetprime_smart_plan_profile";

export function ActiveRoadmapCard() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [profile, setProfile] = useState<PlannerProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  const { progress } = useProgressStore();

  const refreshData = useCallback(() => {
    // 1. Load active study plan (if created)
    const savedPlan = loadPlan();

    // 2. Load active smart plan profile (updated by Adjust Preferences)
    const savedProfile = loadPlannerProfile();
    setProfile(savedProfile);

    if (savedPlan) {
      // Keep profile synced if user adjusted preferences
      if (savedProfile) {
        savedPlan.profile = savedProfile;
      }
      setPlan(savedPlan);
    } else {
      setPlan(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshData();

    const onPlanUpdated = () => refreshData();
    window.addEventListener(PLAN_UPDATED_EVENT, onPlanUpdated);
    window.addEventListener("leetprime:plan-updated", onPlanUpdated);
    window.addEventListener("storage", onPlanUpdated);

    return () => {
      window.removeEventListener(PLAN_UPDATED_EVENT, onPlanUpdated);
      window.removeEventListener("leetprime:plan-updated", onPlanUpdated);
      window.removeEventListener("storage", onPlanUpdated);
    };
  }, [refreshData]);

  // Derived active profile: either from plan or directly from savedProfile
  const activeProfile = profile || plan?.profile;

  // Compute problems in this profile roadmap to accurately track progress
  const roadmapStats = useMemo(() => {
    if (!activeProfile) return null;

    const duration = activeProfile.durationDays || 30;
    const dailyHrs = activeProfile.dailyHours || 2;
    let problemsPerDay = 1.5;
    if (dailyHrs <= 1) problemsPerDay = 1;
    else if (dailyHrs === 2) problemsPerDay = 2;
    else if (dailyHrs === 4) problemsPerDay = 3.5;
    else problemsPerDay = 5;

    // Use unified, curriculum-ordered roadmap phases
    const phases = generatePersonalizedRoadmap(activeProfile);
    const roadmapProblems = phases.flatMap((ph) => ph.problems);
    const solvedCount = roadmapProblems.filter(
      (p) => progress[p.id]?.status === "solved"
    ).length;

    // If a full StudyPlan exists, use its daily task counts, otherwise use roadmap problem counts
    let totalTasksCount = roadmapProblems.length;
    let completedTasksCount = solvedCount;

    if (plan && plan.dailyPlans && plan.dailyPlans.length > 0) {
      const allTasks = plan.dailyPlans.flatMap((d) => d.tasks);
      totalTasksCount = allTasks.length;
      completedTasksCount = allTasks.filter(
        (t) => t.status === "completed" || (t.problemId && progress[t.problemId]?.status === "solved")
      ).length;
    }

    const taskPct = Math.min(100, Math.round((completedTasksCount / Math.max(1, totalTasksCount)) * 100));

    // Day computation
    const startDate = new Date(plan?.startDate || activeProfile.createdAt || Date.now());
    const now = new Date();
    const diffDays = Math.max(
      1,
      Math.min(
        duration,
        Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      )
    );

    // Today's remaining tasks
    let todayRemaining = 0;
    if (plan && plan.dailyPlans) {
      const todayPlan = plan.dailyPlans.find((d) => d.dayNumber === diffDays);
      if (todayPlan) {
        const todayCompleted = todayPlan.tasks.filter(
          (t) => t.status === "completed" || (t.problemId && progress[t.problemId]?.status === "solved")
        ).length;
        todayRemaining = Math.max(0, todayPlan.tasks.length - todayCompleted);
      }
    } else {
      // Heuristic: expected daily target minus today's progress
      todayRemaining = Math.max(0, Math.round(problemsPerDay) - (solvedCount % Math.round(problemsPerDay)));
    }

    // Pace calculation
    const expectedRatio = diffDays / duration;
    const expectedTasks = Math.round(totalTasksCount * expectedRatio);
    let paceStatus = {
      label: "On Track",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      icon: CheckCircle2,
    };
    if (completedTasksCount > expectedTasks + 2) {
      paceStatus = {
        label: `Ahead by ${completedTasksCount - expectedTasks} Tasks`,
        color: "text-amber-300 bg-amber-500/10 border-amber-500/25",
        icon: Flame,
      };
    } else if (completedTasksCount < expectedTasks - 2) {
      paceStatus = {
        label: `${expectedTasks - completedTasksCount} Tasks Behind`,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/25",
        icon: Clock,
      };
    }

    return {
      duration,
      diffDays,
      totalTasksCount,
      completedTasksCount,
      taskPct,
      todayRemaining,
      paceStatus,
    };
  }, [activeProfile, plan, progress]);

  if (!mounted) return null;

  // ── No Active Plan State: Inspiring Teaser ─────────────────────────────────
  if (!activeProfile || !roadmapStats) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-[#14112a]/80 via-[#0e0c1f]/90 to-[#0a0814] p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-violet-950/20">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex-shrink-0">
              <PrimeAiLogo size="sm" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-extrabold text-base tracking-tight">
                  Prime AI Placement Roadmap
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  Ready to Activate
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                Connect your target companies (FAANG, Unicorns, FinTech) and daily study hours to unlock an adaptive, day-by-day practice roadmap tailored to your skill level.
              </p>
            </div>
          </div>

          <Link
            href="/dsa/planner"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-900/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer w-full md:w-auto justify-center"
          >
            <span>Activate AI Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Active Plan Calculations ──────────────────────────────────────────────
  const roleName = ROLE_LABELS[activeProfile.role] ?? activeProfile.role.toUpperCase();
  const levelName = LEVEL_LABELS[activeProfile.level] ?? activeProfile.level;
  const {
    duration,
    diffDays,
    totalTasksCount,
    completedTasksCount,
    taskPct,
    todayRemaining,
    paceStatus,
  } = roadmapStats;

  const PaceIcon = paceStatus.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-500/35 bg-gradient-to-br from-[#161230]/95 via-[#0f0d22] to-[#0a0817] p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-violet-950/25">
      {/* Decorative gradient glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── Top Bar: Brand, Title, and Pace Badge ── */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08] relative z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <PrimeAiLogo size="xs" />
          <span className="text-white font-extrabold text-sm sm:text-base tracking-tight">
            Active Placement Roadmap
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/35 text-violet-300">
            Sprint Mode
          </span>
        </div>

        {/* Pace status badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
            paceStatus.color
          )}
        >
          <PaceIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{paceStatus.label}</span>
        </div>
      </div>

      {/* ── Content Grid: Target Scope | Sprint Progress | Action CTA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
        {/* Left Column: Target Scope (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm sm:text-base">
              {roleName} Target
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-violet-300 font-medium">
              {levelName}
            </span>
            <span className="text-xs text-slate-400">· {duration} Days Plan</span>
          </div>

          {/* Target Companies */}
          {activeProfile.targetCompanies && activeProfile.targetCompanies.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                <Building2 className="w-3 h-3 text-violet-400" /> Focus:
              </span>
              {activeProfile.targetCompanies.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-200 capitalize"
                >
                  {c}
                </span>
              ))}
              {activeProfile.targetCompanies.length > 4 && (
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.04]">
                  +{activeProfile.targetCompanies.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Cross-company top placement patterns · {activeProfile.dailyHours || 2}h daily
            </p>
          )}
        </div>

        {/* Center Column: Sprint Progress Bar & Day Tracker (4 cols) */}
        <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <span>
                Day <strong className="text-violet-300 font-mono">{diffDays}</strong> of {duration}
              </span>
            </div>
            <span className="text-slate-300 font-mono text-[11px]">
              {completedTasksCount} / {totalTasksCount} Tasks ({taskPct}%)
            </span>
          </div>

          {/* Dual-tone Progress Bar */}
          <div className="w-full bg-black/40 border border-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(124,58,237,0.4)]"
              style={{ width: `${Math.max(4, taskPct)}%` }}
            />
          </div>

          {/* Today's sub-tracker */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>
              {todayRemaining === 0 ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Today completed
                </span>
              ) : (
                <span>
                  Today: <strong className="text-white font-medium">{todayRemaining} tasks</strong> due
                </span>
              )}
            </span>
            <span className="text-slate-500 text-[10px]">
              {activeProfile.dailyHours || 2}h target / day
            </span>
          </div>
        </div>

        {/* Right Column: CTA Button (3 cols) */}
        <div className="lg:col-span-3 flex lg:justify-end pt-3 lg:pt-0">
          <Link
            href="/dsa/planner"
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-900/35 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Continue Today&apos;s Sprint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>


    </div>
  );
}
