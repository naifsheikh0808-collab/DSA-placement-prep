"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AiAssistantPanel } from "@/components/ai/AiAssistantPanel";
import {
  Compass,
  Sparkles,
  Zap,
  Target,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  SlidersHorizontal,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Building2,
  Filter,
} from "lucide-react";
import { TOP_PROBLEMS, getAllCompanies, getAllPatterns } from "@/lib/db";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/hooks/use-progress";
import type { Difficulty, Problem, Timeframe } from "@/lib/types";
import {
  loadPlan,
  savePlan,
  updateTaskStatus,
  rescheduleTask,
  deletePlan,
  loadPlannerProfile,
  savePlannerProfile,
  deletePlannerProfile,
} from "@/lib/plan-storage";
import {
  generateStudyPlan,
  validateStudyPlan,
  generatePersonalizedRoadmap,
  RoadmapPhaseGenerated,
} from "@/lib/plan-generator";
import type { StudyPlan, StudyTask } from "@/lib/types";

/* ─── Profile Types ─────────────────────────────────────────── */
export type RoleTarget = "intern" | "sde1" | "sde2" | "quant";
export type CareerStage = "1st_2nd" | "3rd_4th" | "recent_grad" | "working";
export type SkillLevel = "beginner" | "basics" | "intermediate" | "advanced";
export type DurationOption = 15 | 30 | 60 | 90;
export type DailyHourOption = 1 | 2 | 4 | 6;

export interface PlannerProfile {
  role: RoleTarget;
  stage: CareerStage;
  level: SkillLevel;
  companyPreset: string;
  targetCompanies: string[];
  durationDays: DurationOption;
  dailyHours: DailyHourOption;
  createdAt: string;
}

const STORAGE_KEY = "leetprime_smart_plan_profile";

/* ─── Company Presets ───────────────────────────────────────── */
const COMPANY_PRESETS: Record<string, { label: string; desc: string; companies: string[] }> = {
  maang: {
    label: "FAANG / MAANG",
    desc: "Google, Meta, Amazon, Apple, Microsoft, Netflix",
    companies: ["Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix"],
  },
  unicorns: {
    label: "Indian Unicorns",
    desc: "Flipkart, Swiggy, Zomato, Razorpay, PhonePe, CRED",
    companies: ["Flipkart", "Swiggy", "Zomato", "Razorpay", "PhonePe", "CRED", "Meesho", "Blinkit"],
  },
  fintech_hft: {
    label: "FinTech & Quant/HFT",
    desc: "Goldman Sachs, JPMorgan, Morgan Stanley, Citadel, Jane Street",
    companies: ["Goldman Sachs", "JPMorgan", "Morgan Stanley", "Citadel", "Jane Street", "Tower Research", "BlackRock"],
  },
  tier1_product: {
    label: "Elite Global Product",
    desc: "Uber, Stripe, Airbnb, Atlassian, Adobe, Salesforce, ByteDance",
    companies: ["Uber", "Stripe", "Airbnb", "Atlassian", "Adobe", "Salesforce", "ByteDance", "NVIDIA"],
  },
  enterprise: {
    label: "Enterprise Tech & Tier 2",
    desc: "Oracle, Cisco, Intel, IBM, Dell, VMware, Visa, Amex",
    companies: ["Oracle", "Cisco", "Intel", "IBM", "Dell", "Visa", "American Express", "Mastercard"],
  },
  all: {
    label: "All Top Tech Companies",
    desc: "Curated cross-company placement preparation",
    companies: [],
  },
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function SmartPlannerPage() {
  const [profile, setProfile] = useState<PlannerProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [planPreview, setPlanPreview] = useState<StudyPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Form states for questionnaire
  const [formRole, setFormRole] = useState<RoleTarget>("sde1");
  const [formStage, setFormStage] = useState<CareerStage>("3rd_4th");
  const [formLevel, setFormLevel] = useState<SkillLevel>("basics");
  const [formCompanyPreset, setFormCompanyPreset] = useState<string>("maang");
  const [formCustomCompanies, setFormCustomCompanies] = useState<string[]>([]);
  const [formDuration, setFormDuration] = useState<DurationOption>(30);
  const [formDailyHours, setFormDailyHours] = useState<DailyHourOption>(2);
  const [stepIndex, setStepIndex] = useState<number>(1);

  const { progress, markSolved, markAttempted, markRevise } = useProgressStore();

  // Load profile from storage & listen for AI Coach applied plans or auth changes
  useEffect(() => {
    setMounted(true);
    const loadSaved = () => {
      try {
        const saved = loadPlannerProfile();
        if (saved) {
          setProfile(saved);
          setIsEditing(false);
          // Pre-fill form
          setFormRole(saved.role);
          setFormStage(saved.stage);
          setFormLevel(saved.level);
          setFormCompanyPreset(saved.companyPreset || "maang");
          setFormCustomCompanies(saved.targetCompanies || []);
          setFormDuration(saved.durationDays);
          setFormDailyHours(saved.dailyHours);
        } else {
          setProfile(null);
          setIsEditing(true);
        }
      } catch (e) {
        setProfile(null);
        setIsEditing(true);
      }
      const savedPlan = loadPlan();
      setStudyPlan(savedPlan);
    };

    loadSaved();
    window.addEventListener("leetprime:plan-updated", loadSaved);
    window.addEventListener("storage", loadSaved);
    return () => {
      window.removeEventListener("leetprime:plan-updated", loadSaved);
      window.removeEventListener("storage", loadSaved);
    };
  }, []);

  // Smooth scroll to AI coach if navigated with #ai-coach
  useEffect(() => {
    if (mounted && typeof window !== "undefined" && window.location.hash === "#ai-coach") {
      const el = document.getElementById("ai-coach");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [mounted, profile]);

  // Generate plan preview
  const handleGeneratePlan = () => {
    if (!profile) return;
    setPlanLoading(true);
    setPlanError(null);
    try {
      const plan = generateStudyPlan(profile, progress);
      plan.userId = "local"; // Will be set by auth context
      const validation = validateStudyPlan(plan);
      if (!validation.valid) {
        setPlanError(validation.errors.join("; "));
        return;
      }
      setPlanPreview(plan);
      setShowPreview(true);
    } catch (e) {
      setPlanError("Failed to generate plan. Please try again.");
    } finally {
      setPlanLoading(false);
    }
  };

  // Confirm and save plan
  const handleConfirmPlan = () => {
    if (!planPreview) return;
    savePlan(planPreview);
    setStudyPlan(planPreview);
    setPlanPreview(null);
    setShowPreview(false);
  };

  // Cancel plan preview
  const handleCancelPreview = () => {
    setPlanPreview(null);
    setShowPreview(false);
  };

  // Task actions
  const handleTaskComplete = (taskId: string) => {
    if (!studyPlan) return;
    const updated = updateTaskStatus(studyPlan, taskId, "completed");
    setStudyPlan(updated);
  };

  const handleTaskSkip = (taskId: string) => {
    if (!studyPlan) return;
    const updated = updateTaskStatus(studyPlan, taskId, "skipped");
    setStudyPlan(updated);
  };

  const handleTaskRevise = (taskId: string) => {
    if (!studyPlan) return;
    const updated = updateTaskStatus(studyPlan, taskId, "revision_needed");
    setStudyPlan(updated);
  };

  const handleTaskReschedule = (taskId: string, newDay: number) => {
    if (!studyPlan) return;
    const updated = rescheduleTask(studyPlan, taskId, newDay);
    setStudyPlan(updated);
  };

  // Get today's tasks
  const todaysPlan = useMemo(() => {
    if (!studyPlan) return null;
    const today = new Date().toISOString().split("T")[0];
    return studyPlan.dailyPlans.find((d) => d.date === today) || studyPlan.dailyPlans[0];
  }, [studyPlan]);

  // Save profile and generate roadmap
  const handleSaveProfile = () => {
    const selectedCompanies =
      formCompanyPreset === "custom"
        ? formCustomCompanies
        : COMPANY_PRESETS[formCompanyPreset]?.companies || [];

    const newProfile: PlannerProfile = {
      role: formRole,
      stage: formStage,
      level: formLevel,
      companyPreset: formCompanyPreset,
      targetCompanies: selectedCompanies,
      durationDays: formDuration,
      dailyHours: formDailyHours,
      createdAt: new Date().toISOString(),
    };

    setProfile(newProfile);
    setIsEditing(false);
    try {
      savePlannerProfile(newProfile);
      // ── Sync Study Plan & Notify all tabs & Active Roadmap ──
      try {
        const newPlan = generateStudyPlan(newProfile, progress);
        newPlan.userId = "local";
        savePlan(newPlan);
        setStudyPlan(newPlan);
      } catch {
        const existing = loadPlan();
        if (existing) {
          existing.profile = newProfile;
          savePlan(existing);
        } else {
          window.dispatchEvent(new Event("leetprime:plan-updated"));
        }
      }
    } catch (e) {
      // storage quota or disabled
    }
  };

  // Generate phases
  const generatedPhases = useMemo(() => {
    if (!profile) return [];
    return generatePersonalizedRoadmap(profile);
  }, [profile]);

  // Flatten all problems in roadmap
  const allRoadmapProblems = useMemo(() => {
    return generatedPhases.flatMap((p) => p.problems);
  }, [generatedPhases]);

  // Solved count in roadmap
  const solvedCount = useMemo(() => {
    return allRoadmapProblems.filter((p) => progress[p.id]?.status === "solved").length;
  }, [allRoadmapProblems, progress]);

  const completionPct = allRoadmapProblems.length > 0
    ? Math.round((solvedCount / allRoadmapProblems.length) * 100)
    : 0;

  // "Today's Smart Practice Focus" (top 2-3 unsolved problems from the earliest incomplete phase)
  const todaysFocusProblems = useMemo(() => {
    const unsolved = allRoadmapProblems.filter((p) => progress[p.id]?.status !== "solved");
    return unsolved.slice(0, 3);
  }, [allRoadmapProblems, progress]);

  /* ─────────────────────────────────────────────────────────────
     RENDER: Questionnaire / Profile Wizard
  ────────────────────────────────────────────────────────────── */
  if (!mounted || isEditing || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Driven Smart Prep Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personalize Your Placement Roadmap
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Tell us your target companies, remaining time, and current skill level. We'll generate a day-by-day roadmap with smart problem recommendations.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#10131f]/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-8">
          {/* ── Caution Notice Banner When Adjusting Preferences ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/35 flex items-start gap-3.5 shadow-lg shadow-amber-950/20">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2">
                <span>Caution: Updating Preferences Will Recalibrate Your Roadmap</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold uppercase tracking-wider">
                  Notice
                </span>
              </div>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Modifying your target role, timeline, or target companies will generate a new preparation roadmap and update or reset your <strong>Active Placement Roadmap</strong> in &quot;My Progress&quot; to match your new target goals.
              </p>
            </div>
          </div>

          {/* Step 1: Target Role & Year */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold">
                1
              </span>
              <span>Target Role & Current Stage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "intern", label: "Summer Intern", icon: GraduationCap, desc: "On-campus / Off-campus internship" },
                { id: "sde1", label: "SDE-1 / New Grad", icon: Briefcase, desc: "Final year campus placements" },
                { id: "sde2", label: "SDE-2 / Switch", icon: Zap, desc: "1-4 YOE product company switch" },
                { id: "quant", label: "Quant / HFT", icon: Award, desc: "Elite trading & ultra-hard rounds" },
              ].map((item) => {
                const active = formRole === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormRole(item.id as RoleTarget)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/50 shadow-[0_4px_20px_rgba(124,58,237,0.2)]"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${active ? "text-violet-300" : "text-slate-400"}`} />
                    <div className="font-bold text-xs sm:text-sm">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-400 block mb-2">Current Career Stage:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "1st_2nd", label: "1st / 2nd Year" },
                  { id: "3rd_4th", label: "3rd / 4th Year (Placements)" },
                  { id: "recent_grad", label: "Recent Graduate" },
                  { id: "working", label: "Working Professional" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormStage(s.id as CareerStage)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      formStage === s.id
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/50 font-bold"
                        : "bg-white/[0.02] text-slate-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Step 2: Skill Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold">
                2
              </span>
              <span>Current DSA Foundation Level</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "beginner",
                  badge: "Level 1: Absolute Beginner",
                  title: "Starting from scratch",
                  desc: "Need practice on basic syntax, Arrays, Strings, Loops & basic math recursion.",
                },
                {
                  id: "basics",
                  badge: "Level 2: Know Fundamentals",
                  title: "Comfortable with basics",
                  desc: "Familiar with Two Pointers, Stacks, Linked Lists & Binary Search. Need pattern mastery.",
                },
                {
                  id: "intermediate",
                  badge: "Level 3: Intermediate",
                  title: "Can solve Trees & Graphs",
                  desc: "Comfortable with medium problems; struggle with Dynamic Programming & tricky graphs.",
                },
                {
                  id: "advanced",
                  badge: "Level 4: Advanced",
                  title: "Ready for Tier 1 Hard",
                  desc: "Targeting Hard DP, complex graphs, segment trees, speed optimization & mock interviews.",
                },
              ].map((lvl) => {
                const active = formLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setFormLevel(lvl.id as SkillLevel)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/50"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? "text-violet-300" : "text-slate-400"}`}>
                        {lvl.badge}
                      </span>
                      {active && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                    </div>
                    <div className="font-bold text-sm text-white">{lvl.title}</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lvl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Step 3: Target Companies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold">
                3
              </span>
              <span>Target Companies & Tiers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(COMPANY_PRESETS).map(([key, item]) => {
                const active = formCompanyPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormCompanyPreset(key)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/50"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-white">{item.label}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Step 4: Duration & Daily Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold">
                4
              </span>
              <span>Timeframe & Daily Commitment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Duration */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Total Preparation Window:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { days: 15, label: "15-Day Sprint", desc: "Urgent interview round" },
                    { days: 30, label: "30-Day Crash Course", desc: "Recommended balance" },
                    { days: 60, label: "60-Day Comprehensive", desc: "Solid depth & speed" },
                    { days: 90, label: "90-Day Mastery", desc: "Deep multi-tier prep" },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setFormDuration(d.days as DurationOption)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formDuration === d.days
                          ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40"
                          : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <div className="font-bold text-xs">{d.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Hours */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Daily Study Commitment:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { hrs: 1, label: "1 hr / day", desc: "~1 problem daily" },
                    { hrs: 2, label: "2-3 hrs / day", desc: "~2 problems daily" },
                    { hrs: 4, label: "4-5 hrs / day", desc: "~3-4 problems daily" },
                    { hrs: 6, label: "6+ hrs / day (Full-time)", desc: "~5+ problems daily" },
                  ].map((h) => (
                    <button
                      key={h.hrs}
                      type="button"
                      onClick={() => setFormDailyHours(h.hrs as DailyHourOption)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formDailyHours === h.hrs
                          ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40"
                          : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <div className="font-bold text-xs">{h.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{h.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            {profile && (
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-violet-600/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Smart Roadmap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER: Active Roadmap & Smart Practice Mission Control
  ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 sm:space-y-7 max-w-7xl mx-auto pb-20">
      {/* ── Sleek & Lean Mission Control HUD Bar ─────────────────── */}
      <div className="p-4 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#14172b]/95 via-[#0f1222] to-[#0a0c16] border border-violet-500/30 shadow-lg shadow-violet-950/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Left: Active Mission HUD Pill & Target Role */}
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-white font-extrabold text-sm sm:text-base tracking-tight">
                  Mission Control: <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-indigo-200">{profile.role.toUpperCase().replace("_", "-")} Roadmap</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                  {profile.durationDays}D Plan · {profile.dailyHours}h/day
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold capitalize">
                  {profile.level} Level
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
                Targeting <strong className="text-slate-200 font-semibold">{COMPANY_PRESETS[profile.companyPreset]?.label || "Top Tech Companies"}</strong> · Sequenced by foundation & company recency
              </p>
            </div>
          </div>

          {/* Right: Live Interactive Stats & Quick Edit Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
            {/* Compact Progress Badge with Bar */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-extrabold">{completionPct}%</span>
                  <span className="text-[10px] text-slate-400 font-normal">({solvedCount}/{allRoadmapProblems.length} Qs)</span>
                </div>
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Adjust Preferences Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold border-violet-500/30 hover:border-violet-500/60 bg-violet-600/10 hover:bg-violet-600/20 text-violet-200 hover:text-white px-3 py-1.5 h-8 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
              Adjust Preferences
            </Button>
          </div>
        </div>
      </div>

      {/* ── Prime AI Study Coach (Directly Visible) ────────────── */}
      <div id="ai-coach" className="space-y-3 scroll-mt-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Model Adaptive Strategist</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Prime AI Study Coach
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Adaptive multi-model mentor powered by Gemini & Groq for roadmap tuning, weak patterns & company prep.
          </p>
        </div>
        <AiAssistantPanel />
      </div>

      {/* ── Today's Smart Practice Focus (UPGRADED SMART PRACTICE) ──── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-950/40 via-[#101322] to-[#0c0e17] border border-violet-500/30 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Today's Smart Practice Focus</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Highest-Signal Questions for Today
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dynamically selected to push your roadmap forward based on your target companies and recency trends.
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-semibold font-mono">
            {todaysFocusProblems.length} Target Tasks
          </span>
        </div>

        {todaysFocusProblems.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <Award className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">All Current Tasks Completed!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You've cleared all recommended problems in your roadmap. Feel free to revise attempted problems or adjust your schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todaysFocusProblems.map((prob, idx) => {
              const userProg = progress[prob.id]?.status || "todo";
              const is30d = prob.timeframes.includes("30d");

              return (
                <div
                  key={prob.id}
                  className="p-5 rounded-2xl bg-[#141829]/90 border border-violet-500/25 hover:border-violet-500/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <DifficultyBadge difficulty={prob.difficulty} />
                      {is30d && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-rose-400" /> 30d Hot
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-violet-300 transition-colors">
                      <Link href={`/dsa/questions/${prob.slug}`}>{prob.title}</Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                      <span className="text-slate-300 font-medium bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                        {prob.primaryPattern || "General"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      Companies: <span className="text-slate-300">{prob.companies.slice(0, 3).join(", ")}</span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => markSolved(prob.id)}
                        className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                          userProg === "solved"
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-emerald-300 hover:border-emerald-500/40"
                        }`}
                        title="Mark as Solved"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markRevise(prob.id)}
                        className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                          userProg === "revise"
                            ? "bg-amber-500 text-white border-amber-400"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-amber-300"
                        }`}
                        title="Flag for Revision"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link href={`/dsa/questions/${prob.slug}`}>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-3">
                          Solve <Play className="w-3 h-3 ml-1 fill-current" />
                        </Button>
                      </Link>
                      {prob.canonicalUrl && (
                        <a
                          href={prob.canonicalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          title="Open LeetCode"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Adaptive Study Plan Tasks ─────────────────────────────── */}
      {studyPlan && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#10131f]/80 border border-white/10 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Today's Adaptive Tasks</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {studyPlan.completedTasks}/{studyPlan.totalTasks} completed
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGeneratePlan} disabled={planLoading}>
                {planLoading ? "Generating..." : "Regenerate Plan"}
              </Button>
            </div>
          </div>

          {planError && (
            <div className="p-3 rounded-xl bg-rose-900/20 border border-rose-500/30 text-rose-300 text-xs">
              {planError}
            </div>
          )}

          {todaysPlan && todaysPlan.tasks.length > 0 ? (
            <div className="space-y-3">
              {todaysPlan.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    task.status === "completed"
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : task.status === "skipped"
                      ? "bg-slate-800/30 border-slate-600/30 opacity-60"
                      : task.status === "revision_needed"
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-white/[0.02] border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          task.type === "solving" ? "bg-violet-500/20 text-violet-300" :
                          task.type === "revision" ? "bg-amber-500/20 text-amber-300" :
                          task.type === "mock" ? "bg-rose-500/20 text-rose-300" :
                          "bg-cyan-500/20 text-cyan-300"
                        }`}>
                          {task.type}
                        </span>
                        <span className="text-xs text-slate-400">{task.estimatedMinutes}min</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{task.title}</h3>
                      <p className="text-xs text-slate-400">{task.description}</p>
                      {task.problemUrl && (
                        <a href={task.problemUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline">
                          Open Problem →
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className={`p-2 rounded-lg text-xs border transition-all ${
                          task.status === "completed"
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-emerald-300"
                        }`}
                        title="Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTaskSkip(task.id)}
                        className={`p-2 rounded-lg text-xs border transition-all ${
                          task.status === "skipped"
                            ? "bg-slate-500 text-white border-slate-400"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-slate-300"
                        }`}
                        title="Skip"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTaskRevise(task.id)}
                        className={`p-2 rounded-lg text-xs border transition-all ${
                          task.status === "revision_needed"
                            ? "bg-amber-500 text-white border-amber-400"
                            : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-amber-300"
                        }`}
                        title="Needs Revision"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No tasks for today. Generate a new plan to get started.
            </div>
          )}
        </div>
      )}

      {/* Plan Preview Modal */}
      {showPreview && planPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 rounded-3xl bg-[#10131f] border border-violet-500/30 space-y-4">
            <h2 className="text-xl font-extrabold text-white">Preview New Plan</h2>
            <p className="text-xs text-slate-400">
              {planPreview.totalTasks} tasks over {planPreview.dailyPlans.length} days.
              Replacing will preserve completed tasks only if you choose to merge.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={handleCancelPreview}>Cancel</Button>
              <Button onClick={handleConfirmPlan} className="bg-violet-600 hover:bg-violet-500">
                Confirm & Save Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Plan Button (when no plan exists) */}
      {!studyPlan && !isEditing && profile && (
        <div className="p-6 rounded-3xl bg-[#10131f]/80 border border-white/10 text-center space-y-4">
          <p className="text-slate-400 text-sm">No study plan yet. Generate one based on your profile.</p>
          <Button onClick={handleGeneratePlan} disabled={planLoading} className="bg-violet-600 hover:bg-violet-500">
            {planLoading ? "Generating..." : "Generate Adaptive Study Plan"}
          </Button>
          {planError && <p className="text-rose-400 text-xs">{planError}</p>}
        </div>
      )}

      {/* ── 4-Phase Structured Roadmap ───────────────────────────── */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Complete Curriculum Breakdown</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Phase-by-Phase Roadmap Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Carefully curated problem clusters sequenced from core algorithmic mechanics to high-frequency company rounds.
          </p>
        </div>

        <div className="space-y-6">
          {generatedPhases.map((phase) => {
            const phaseSolved = phase.problems.filter((p) => progress[p.id]?.status === "solved").length;
            const phasePct = phase.problems.length > 0 ? Math.round((phaseSolved / phase.problems.length) * 100) : 0;

            return (
              <div
                key={phase.phaseNumber}
                className="p-6 rounded-3xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md space-y-5"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-600/30 text-violet-300 text-xs font-bold font-mono border border-violet-500/30">
                        Phase {phase.phaseNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{phase.dayRange}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                    <p className="text-xs text-slate-400">{phase.tagline}</p>
                  </div>

                  {/* Progress & Focus Pills */}
                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                    <div className="text-xs font-bold text-slate-300">
                      {phaseSolved} / {phase.problems.length} Solved ({phasePct}%)
                    </div>
                    <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-400 h-full rounded-full transition-all"
                        style={{ width: `${phasePct}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {phase.focusPatterns.map((pat) => (
                        <span key={pat} className="text-[10px] text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                          {pat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Problems Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                      <tr>
                        <th className="py-2.5 px-3 w-8">Status</th>
                        <th className="py-2.5 px-3">Problem Title</th>
                        <th className="py-2.5 px-3">Difficulty</th>
                        <th className="py-2.5 px-3">Primary Pattern</th>
                        <th className="py-2.5 px-3">Target Companies</th>
                        <th className="py-2.5 px-3 text-right">Priority</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {phase.problems.map((prob) => {
                        const userProg = progress[prob.id]?.status || "todo";
                        return (
                          <tr key={prob.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-3 px-3">
                              <button
                                onClick={() => (userProg === "solved" ? markAttempted(prob.id) : markSolved(prob.id))}
                                className="text-slate-500 hover:text-emerald-400 transition-colors"
                                title="Toggle Status"
                              >
                                {userProg === "solved" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-3 font-semibold text-white group-hover:text-violet-300 transition-colors">
                              <Link href={`/dsa/questions/${prob.slug}`}>{prob.title}</Link>
                            </td>

                            <td className="py-3 px-3">
                              <DifficultyBadge difficulty={prob.difficulty} />
                            </td>

                            <td className="py-3 px-3">
                              <span className="text-slate-300 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5 text-[11px]">
                                {prob.primaryPattern || "General"}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {prob.companies.slice(0, 3).map((c) => (
                                  <span key={c} className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-bold text-violet-400">
                              {prob.priorityScore}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link href={`/dsa/questions/${prob.slug}`}>
                                  <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5">
                                    Solve
                                  </Button>
                                </Link>
                                {prob.canonicalUrl && (
                                  <a
                                    href={prob.canonicalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-slate-500 hover:text-white"
                                    title="Open on LeetCode"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
