"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AiAssistantPanel } from "@/components/ai/AiAssistantPanel";
import {
  Compass,
  Sparkles,
  Zap,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronDown,
  CheckCircle2,
  Circle,
  SlidersHorizontal,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Award,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";
import {
  loadPlan,
  savePlan,
  loadPlannerProfile,
  savePlannerProfile,
} from "@/lib/plan-storage";
import {
  generateStudyPlan,
  generatePersonalizedRoadmap,
} from "@/lib/plan-generator";

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
    label: "All Companies",
    desc: "Curated cross-company placement preparation",
    companies: [],
  },
};

const ROLE_LABELS: Record<RoleTarget, string> = {
  intern: "Summer Intern",
  sde1: "SDE-1",
  sde2: "SDE-2",
  quant: "Quant / HFT",
};

const LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  basics: "Basics",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function getCompanyPresetLabel(preset?: string, targetCompanies?: string[]): string {
  if (preset && COMPANY_PRESETS[preset]) {
    return COMPANY_PRESETS[preset].label;
  }
  if (targetCompanies && targetCompanies.length > 0) {
    if (targetCompanies.length <= 3) {
      return targetCompanies.join(", ");
    }
    return `${targetCompanies.slice(0, 2).join(", ")} +${targetCompanies.length - 2}`;
  }
  return "All Companies";
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function SmartPlannerPage() {
  const [profile, setProfile] = useState<PlannerProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});

  // Form states for questionnaire
  const [formRole, setFormRole] = useState<RoleTarget>("sde1");
  const [formStage, setFormStage] = useState<CareerStage>("3rd_4th");
  const [formLevel, setFormLevel] = useState<SkillLevel>("basics");
  const [formCompanyPreset, setFormCompanyPreset] = useState<string>("maang");
  const [formCustomCompanies, setFormCustomCompanies] = useState<string[]>([]);
  const [formDuration, setFormDuration] = useState<DurationOption>(30);
  const [formDailyHours, setFormDailyHours] = useState<DailyHourOption>(2);

  const { progress, markSolved, markAttempted } = useProgressStore();

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseNumber]: !prev[phaseNumber] }));
  };

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
      } catch {
        setProfile(null);
        setIsEditing(true);
      }
    };

    loadSaved();
    window.addEventListener("leetprime:plan-updated", loadSaved);
    window.addEventListener("storage", loadSaved);
    return () => {
      window.removeEventListener("leetprime:plan-updated", loadSaved);
      window.removeEventListener("storage", loadSaved);
    };
  }, []);

  // Auto-open floating Study Coach drawer when navigated via /dsa/planner#ai-coach
  useEffect(() => {
    if (mounted && typeof window !== "undefined" && window.location.hash === "#ai-coach") {
      setIsAiOpen(true);
    }
  }, [mounted]);

  // Save profile, generate roadmap & sync background StudyPlan for My Progress
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
    setExpandedPhases({});
    try {
      savePlannerProfile(newProfile);
      // Sync StudyPlan silently for ActiveRoadmapCard in My Progress
      try {
        const newPlan = generateStudyPlan(newProfile, progress);
        newPlan.userId = "local";
        savePlan(newPlan);
      } catch {
        const existing = loadPlan();
        if (existing) {
          existing.profile = newProfile;
          savePlan(existing);
        } else {
          window.dispatchEvent(new Event("leetprime:plan-updated"));
        }
      }
    } catch {
      // storage quota or disabled
    }
  };

  // Generate phases (chronological 1 -> 4, all start collapsed for instant overview)
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

  /* ─────────────────────────────────────────────────────────────
     RENDER: Questionnaire / Profile Wizard
  ────────────────────────────────────────────────────────────── */
  const wizardView = (
    <div className="flex-1 min-w-0 max-w-4xl mx-auto space-y-6 pb-24">
        {/* Clean Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Plan Setup</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personalize Your Study Roadmap
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Pick your target role, skill level, companies, and daily schedule—we&apos;ll organize your exact prep plan.
          </p>
        </div>

        {/* Sleek Wizard Card */}
        <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#10131f]/85 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Sleek Caution Banner When Updating Existing Plan */}
          {profile && (
            <div className="p-3.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-amber-200">
                  Updating preferences rebuilds your Study Roadmap
                </div>
                <p className="text-[11px] sm:text-xs text-amber-200/75 leading-relaxed">
                  Your solved problems stay safely saved—only your upcoming roadmap questions and My Progress targets refresh to match your new plan.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Target Role & Career Stage */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                1
              </span>
              <span>Target Role &amp; Career Stage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {[
                { id: "intern", label: "Summer Intern", icon: GraduationCap, desc: "Campus or off-campus internships" },
                { id: "sde1", label: "SDE-1 / New Grad", icon: Briefcase, desc: "Entry-level & campus placements" },
                { id: "sde2", label: "SDE-2 / Switch", icon: Zap, desc: "1–4 YOE product switch" },
                { id: "quant", label: "Quant / HFT", icon: Award, desc: "High-difficulty algorithmic rounds" },
              ].map((item) => {
                const active = formRole === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormRole(item.id as RoleTarget)}
                    className={cn(
                      "p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer",
                      active
                        ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40 shadow-md shadow-violet-950/30"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 mb-1.5 sm:mb-2", active ? "text-violet-300" : "text-slate-400")} />
                    <div className="font-bold text-xs sm:text-sm text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">{item.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Current Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "1st_2nd", label: "1st / 2nd Year" },
                  { id: "3rd_4th", label: "3rd / 4th Year" },
                  { id: "recent_grad", label: "Recent Grad" },
                  { id: "working", label: "Working Pro" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormStage(s.id as CareerStage)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer",
                      formStage === s.id
                        ? "bg-violet-500/20 text-violet-200 border-violet-500/50 font-bold"
                        : "bg-white/[0.02] text-slate-400 border-white/5 hover:text-white hover:border-white/15"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08]" />

          {/* Step 2: Skill Level */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                2
              </span>
              <span>Current DSA Level</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[
                {
                  id: "beginner",
                  badge: "Level 1 · Beginner",
                  title: "Starting from scratch",
                  desc: "Focus on core Arrays, Strings & foundational Easy problems.",
                },
                {
                  id: "basics",
                  badge: "Level 2 · Fundamentals",
                  title: "Know the basics",
                  desc: "Ready for Two Pointers, Sliding Window & core Mediums.",
                },
                {
                  id: "intermediate",
                  badge: "Level 3 · Intermediate",
                  title: "Comfortable with mediums",
                  desc: "Strengthen Trees, Graphs, Dynamic Programming & speed.",
                },
                {
                  id: "advanced",
                  badge: "Level 4 · Advanced",
                  title: "Targeting Tier-1 Hard",
                  desc: "Prioritize Hard DP, complex graphs & top company questions.",
                },
              ].map((lvl) => {
                const active = formLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setFormLevel(lvl.id as SkillLevel)}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer",
                      active
                        ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", active ? "text-violet-300" : "text-slate-400")}>
                        {lvl.badge}
                      </span>
                      {active && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-white">{lvl.title}</div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-snug">{lvl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/[0.08]" />

          {/* Step 3: Target Companies */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                3
              </span>
              <span>Target Companies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {Object.entries(COMPANY_PRESETS).map(([key, item]) => {
                const active = formCompanyPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFormCompanyPreset(key);
                      setFormCustomCompanies(item.companies);
                    }}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer",
                      active
                        ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-white">{item.label}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {formCompanyPreset === "custom" && formCustomCompanies.length > 0 && (
              <div className="p-3 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-between text-xs text-violet-200">
                <span>Selected Focus: <strong>{formCustomCompanies.slice(0, 5).join(", ")}{formCustomCompanies.length > 5 ? ` +${formCustomCompanies.length - 5}` : ""}</strong></span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 uppercase">Custom Target</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.08]" />

          {/* Step 4: Duration & Daily Hours */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                4
              </span>
              <span>Timeline &amp; Daily Pace</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Duration */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Target Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { days: 15, label: "15 Days", desc: "Quick interview sprint" },
                    { days: 30, label: "30 Days", desc: "Balanced prep" },
                    { days: 60, label: "60 Days", desc: "Solid pattern depth" },
                    { days: 90, label: "90 Days", desc: "Complete mastery" },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setFormDuration(d.days as DurationOption)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer",
                        formDuration === d.days
                          ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40"
                          : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20"
                      )}
                    >
                      <div className="font-bold text-xs">{d.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Hours */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Daily Study Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { hrs: 1, label: "1 hr / day", desc: "~1 problem daily" },
                    { hrs: 2, label: "2–3 hrs / day", desc: "~2 problems daily" },
                    { hrs: 4, label: "4–5 hrs / day", desc: "~3–4 problems daily" },
                    { hrs: 6, label: "6+ hrs / day", desc: "Full-time sprint" },
                  ].map((h) => (
                    <button
                      key={h.hrs}
                      type="button"
                      onClick={() => setFormDailyHours(h.hrs as DailyHourOption)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer",
                        formDailyHours === h.hrs
                          ? "bg-violet-600/20 border-violet-500 text-white ring-1 ring-violet-500/40"
                          : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20"
                      )}
                    >
                      <div className="font-bold text-xs">{h.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{h.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 border-t border-white/[0.08]">
            {profile && (
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-violet-600/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {profile ? "Update Study Roadmap" : "Build My Study Roadmap"}
            </Button>
          </div>
        </div>
      </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: Unified Layout (Clean Plan HUD + Collapsible Phases + Floating Study Coach)
  ────────────────────────────────────────────────────────────── */
  const mainContent = (!mounted || isEditing || !profile) ? wizardView : (
    <div className="flex-1 min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-24">
      {/* ── Clean, Uncluttered Top Plan Header Card ────────────── */}
      <div className="p-4 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-[#14172b]/95 via-[#0f1222] to-[#0a0c16] border border-violet-500/30 shadow-lg shadow-violet-950/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Desktop Layout: Scannable Single Row */}
        <div className="hidden sm:flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/35 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-white font-extrabold text-base md:text-lg tracking-tight">
                  {ROLE_LABELS[profile.role] || "SDE-1"} Roadmap
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Active Plan
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 mt-0.5">
                <span className="text-slate-200 font-medium">
                  {getCompanyPresetLabel(profile.companyPreset, profile.targetCompanies)}
                </span>
                <span className="text-white/20">·</span>
                <span>{profile.durationDays} Days · {profile.dailyHours}h/day</span>
                <span className="text-white/20">·</span>
                <span className="text-amber-300/90 font-medium">{LEVEL_LABELS[profile.level]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 min-w-[140px]">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                <span className="text-emerald-400">{completionPct}%</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {solvedCount}/{allRoadmapProblems.length} Qs
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl bg-[#1d173d] hover:bg-[#292154] border border-violet-400/50 hover:border-violet-300/70 text-white font-bold text-xs shadow-md shadow-violet-950/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-300" />
              <span>Change Plan</span>
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Layout: Sleek, 3 Clean Rows, Zero Clutter */}
        <div className="flex flex-col sm:hidden gap-3 relative z-10">
          {/* Row 1: Role Title + High-Contrast Change Plan Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/35 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <h1 className="text-white font-extrabold text-base tracking-tight truncate">
                {ROLE_LABELS[profile.role] || "SDE-1"} Roadmap
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-500 border border-violet-400/40 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Change Plan</span>
            </button>
          </div>

          {/* Row 2: Scannable 1-Line Summary Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 font-medium text-white">
              {getCompanyPresetLabel(profile.companyPreset, profile.targetCompanies)}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/25 text-violet-300 font-semibold">
              {profile.durationDays}D · {profile.dailyHours}h/d
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-300 font-semibold">
              {LEVEL_LABELS[profile.level]}
            </span>
          </div>

          {/* Row 3: Full-Width Progress Bar */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-400">{completionPct}% Completed</span>
              <span className="text-slate-400 font-mono">
                {solvedCount} / {allRoadmapProblems.length} Qs
              </span>
            </div>
            <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Collapsible 4-Phase Study Roadmap ────────────────────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400 shrink-0" />
            <span>Your Study Roadmap</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            4 guided stages tailored for your{" "}
            <span className="text-violet-300 font-semibold">{ROLE_LABELS[profile.role] || "SDE-1"}</span>{" "}
            prep{" "}
            {getCompanyPresetLabel(profile.companyPreset, profile.targetCompanies) === "All Companies"
              ? "across"
              : "at"}{" "}
            <span className="text-slate-200 font-semibold">
              {getCompanyPresetLabel(profile.companyPreset, profile.targetCompanies)}
            </span>
            . Tap any phase to view questions.
          </p>
        </div>

        <div className="space-y-3">
          {generatedPhases.map((phase) => {
            const phaseSolved = phase.problems.filter((p) => progress[p.id]?.status === "solved").length;
            const phasePct = phase.problems.length > 0 ? Math.round((phaseSolved / phase.problems.length) * 100) : 0;
            const isExpanded = !!expandedPhases[phase.phaseNumber];
            const nextUpId = phase.problems.find((p) => progress[p.id]?.status !== "solved")?.id;

            return (
              <div
                key={phase.phaseNumber}
                className={cn(
                  "rounded-2xl bg-[#10131f]/80 border backdrop-blur-md transition-all overflow-hidden",
                  isExpanded
                    ? "border-violet-500/40 shadow-lg shadow-violet-950/20"
                    : "border-white/10 hover:border-violet-500/30"
                )}
              >
                {/* Collapsible Phase Card Header — Sleek Single Bar */}
                <button
                  type="button"
                  onClick={() => togglePhase(phase.phaseNumber)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 sm:px-5 sm:py-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] cursor-pointer group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-600/25 text-violet-300 text-[11px] font-bold font-mono border border-violet-500/30 shrink-0">
                        Phase {phase.phaseNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {phase.dayRange} · {phase.problems.length} Qs
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-200 transition-colors truncate sm:whitespace-normal">
                      {phase.title}
                    </h3>
                  </div>

                  {/* Progress + Chevron */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-slate-300 font-mono">
                        {phaseSolved}/{phase.problems.length}
                      </span>
                      <div className="w-14 sm:w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${phasePct}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center transition-all",
                        isExpanded
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-200"
                          : "bg-white/[0.04] border-white/10 text-slate-400 group-hover:text-white group-hover:border-white/20"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Content: Short Tagline + Focus Pills + Sleek Horizontal Table */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-white/10 space-y-3.5 animate-in fade-in duration-200">
                    {/* Phase Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <p className="text-xs text-slate-400 leading-relaxed">{phase.tagline}</p>
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        {phase.focusPatterns.slice(0, 4).map((pat) => (
                          <span
                            key={pat}
                            className="text-[10px] text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5"
                          >
                            {pat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Subtle mobile swipe cue */}
                    <div className="flex sm:hidden items-center justify-end gap-1 text-[10px] text-slate-500">
                      <span>Swipe table for pattern &amp; companies</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>

                    {/* Unified Sleek Horizontal-Scrollable Table (Clean on both Mobile & Desktop) */}
                    <div className="overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.01]">
                      <table className="w-full min-w-[680px] text-left text-xs">
                        <thead className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold bg-white/[0.02] border-b border-white/[0.06]">
                          <tr>
                            <th className="py-2.5 px-3 w-10">Done</th>
                            <th className="py-2.5 px-3 min-w-[200px]">Problem</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Difficulty</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Pattern</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Companies</th>
                            <th className="py-2.5 px-3 text-right whitespace-nowrap">Score</th>
                            <th className="py-2.5 px-3 text-right whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {phase.problems.map((prob) => {
                            const userProg = progress[prob.id]?.status || "todo";
                            const isNext = prob.id === nextUpId;
                            const topCos = prob.companies.slice(0, 2);
                            const extraCos = prob.companies.length - topCos.length;

                            return (
                              <tr
                                key={prob.id}
                                className={cn(
                                  "hover:bg-white/[0.03] transition-colors group",
                                  isNext && "bg-violet-500/[0.05]"
                                )}
                              >
                                <td className="py-3 px-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      userProg === "solved" ? markAttempted(prob.id) : markSolved(prob.id)
                                    }
                                    className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer block"
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
                                  <div className="flex items-center gap-2">
                                    <Link href={`/dsa/questions/${prob.slug}`} className="hover:underline">
                                      {prob.title}
                                    </Link>
                                    {isNext && (
                                      <span className="px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-400/40 text-violet-200 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                        Next
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap">
                                  <DifficultyBadge difficulty={prob.difficulty} />
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className="text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
                                    {prob.primaryPattern || "General"}
                                  </span>
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    {topCos.map((c) => (
                                      <span
                                        key={c}
                                        className="text-[10px] text-slate-300 bg-slate-800/70 px-1.5 py-0.5 rounded capitalize"
                                      >
                                        {c}
                                      </span>
                                    ))}
                                    {extraCos > 0 && (
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        +{extraCos}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-3 text-right font-mono font-bold text-violet-400 whitespace-nowrap">
                                  {prob.priorityScore}
                                </td>

                                <td className="py-3 px-3 text-right whitespace-nowrap">
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
                                        className="p-1 text-slate-500 hover:text-white transition-colors"
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 items-start max-w-[1600px] mx-auto transition-all duration-300">
      {/* Main scrollable content */}
      {mainContent}

      {/* Docked Prime AI Study Coach on desktop (pushes content smoothly left) */}
      {mounted && isAiOpen && (
        <div className="hidden lg:flex w-[380px] xl:w-[420px] shrink-0 sticky top-4 self-start h-[640px] xl:h-[660px] max-h-[calc(100vh-3rem)]">
          <AiAssistantPanel
            docked
            onClose={() => setIsAiOpen(false)}
          />
        </div>
      )}

      {/* Mobile overlay drawer */}
      {mounted && isAiOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full p-3 sm:p-4 flex flex-col">
            <AiAssistantPanel
              docked
              onClose={() => setIsAiOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Floating pop button (same UX as Homepage AI button) */}
      {mounted && !isAiOpen && (
        <AiAssistantPanel onOpen={() => setIsAiOpen(true)} />
      )}
    </div>
  );
}
