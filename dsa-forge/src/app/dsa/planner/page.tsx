"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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

export interface RoadmapPhaseGenerated {
  phaseNumber: number;
  title: string;
  tagline: string;
  dayRange: string;
  focusPatterns: string[];
  problems: Problem[];
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

/* ─── Recommendation Algorithm ──────────────────────────────── */
function generatePersonalizedRoadmap(profile: PlannerProfile): RoadmapPhaseGenerated[] {
  // 1. Calculate problem budget
  let problemsPerDay = 1.5;
  if (profile.dailyHours <= 1) problemsPerDay = 1;
  else if (profile.dailyHours === 2) problemsPerDay = 2;
  else if (profile.dailyHours === 4) problemsPerDay = 3.5;
  else problemsPerDay = 5;

  const totalBudget = Math.min(
    Math.max(Math.round(profile.durationDays * problemsPerDay * 0.7), 24),
    90
  );

  // 2. Filter candidate problems based on company selection
  let candidatePool = [...TOP_PROBLEMS];
  const targetCo = profile.targetCompanies.map((c) => c.toLowerCase());

  if (targetCo.length > 0) {
    const matchingCo = candidatePool.filter((p) =>
      p.companies.some((c) => targetCo.includes(c.toLowerCase()))
    );
    // If we have enough company questions, prefer them heavily
    if (matchingCo.length >= 20) {
      candidatePool = [
        ...matchingCo,
        ...candidatePool.filter((p) => !matchingCo.includes(p)),
      ];
    }
  }

  // 3. Difficulty weighting based on skill level & role
  const diffWeights = {
    beginner: { Easy: 0.45, Medium: 0.5, Hard: 0.05 },
    basics: { Easy: 0.25, Medium: 0.65, Hard: 0.1 },
    intermediate: { Easy: 0.1, Medium: 0.7, Hard: 0.2 },
    advanced: { Easy: 0.0, Medium: 0.5, Hard: 0.5 },
  }[profile.level];

  // 4. Score each candidate problem
  const scoredProblems = candidatePool.map((p) => {
    let score = p.priorityScore;

    // Recency boost (30d and 3m questions get priority)
    if (p.timeframes.includes("30d")) score += 25;
    else if (p.timeframes.includes("3m")) score += 15;
    else if (p.timeframes.includes("6m")) score += 5;

    // Company match boost
    if (targetCo.length > 0 && p.companies.some((c) => targetCo.includes(c.toLowerCase()))) {
      score += 20;
    }

    // Role-based tailoring
    if (profile.role === "quant" && p.difficulty === "Hard") score += 20;
    if (profile.role === "intern" && p.difficulty === "Easy") score += 10;

    return { problem: p, score };
  });

  // Sort by calculated score
  scoredProblems.sort((a, b) => b.score - a.score);

  // 5. Partition into 4 structured phases according to pattern progression
  const phase1Patterns = ["two pointers", "sliding window", "hash map", "array", "binary search", "string"];
  const phase2Patterns = ["tree", "binary tree", "linked list", "breadth-first", "depth-first", "stack", "queue"];
  const phase3Patterns = ["dynamic programming", "graph", "heap", "priority queue", "backtracking", "greedy", "intervals"];
  const phase4Patterns = ["trie", "monotonic stack", "segment tree", "union find", "bit manipulation", "design"];

  function matchesPatterns(p: Problem, patterns: string[]) {
    const primary = (p.primaryPattern || "").toLowerCase();
    const secondaries = p.secondaryPatterns.map((s) => s.toLowerCase());
    return patterns.some((pat) => primary.includes(pat) || secondaries.some((s) => s.includes(pat)));
  }

  const p1Candidates: Problem[] = [];
  const p2Candidates: Problem[] = [];
  const p3Candidates: Problem[] = [];
  const p4Candidates: Problem[] = [];

  const usedIds = new Set<string>();

  for (const item of scoredProblems) {
    const p = item.problem;
    if (usedIds.has(p.id)) continue;

    if (matchesPatterns(p, phase1Patterns)) {
      p1Candidates.push(p);
      usedIds.add(p.id);
    } else if (matchesPatterns(p, phase2Patterns)) {
      p2Candidates.push(p);
      usedIds.add(p.id);
    } else if (matchesPatterns(p, phase3Patterns)) {
      p3Candidates.push(p);
      usedIds.add(p.id);
    } else {
      p4Candidates.push(p);
      usedIds.add(p.id);
    }
  }

  // Budget per phase
  const p1Count = Math.max(Math.round(totalBudget * 0.25), 6);
  const p2Count = Math.max(Math.round(totalBudget * 0.3), 7);
  const p3Count = Math.max(Math.round(totalBudget * 0.3), 7);
  const p4Count = Math.max(totalBudget - (p1Count + p2Count + p3Count), 5);

  const daySplit1 = Math.round(profile.durationDays * 0.25);
  const daySplit2 = Math.round(profile.durationDays * 0.55);
  const daySplit3 = Math.round(profile.durationDays * 0.85);

  return [
    {
      phaseNumber: 1,
      title: "Foundations & High-Frequency Frameworks",
      tagline: "Master Two Pointers, Sliding Window & Hash Maps to build problem-solving velocity.",
      dayRange: `Day 1 – Day ${daySplit1}`,
      focusPatterns: ["Two Pointers", "Sliding Window", "Binary Search", "Hash Map"],
      problems: p1Candidates.slice(0, p1Count),
    },
    {
      phaseNumber: 2,
      title: "Hierarchical Structures & Traversal",
      tagline: "Conquer Trees, BFS/DFS, Recursion & Linked Lists — the bread & butter of rounds.",
      dayRange: `Day ${daySplit1 + 1} – Day ${daySplit2}`,
      focusPatterns: ["Binary Trees", "BFS & DFS", "Linked Lists", "Stacks & Queues"],
      problems: p2Candidates.slice(0, p2Count),
    },
    {
      phaseNumber: 3,
      title: "Core Algorithmic Mastery & Optimization",
      tagline: "Dynamic Programming, Graphs & Heaps — unlock Tier-1 and MAANG clearing questions.",
      dayRange: `Day ${daySplit2 + 1} – Day ${daySplit3}`,
      focusPatterns: ["Dynamic Programming", "Graphs", "Heap / Priority Queue", "Intervals"],
      problems: p3Candidates.slice(0, p3Count),
    },
    {
      phaseNumber: 4,
      title: "Target Company Recency & Mock Sprint",
      tagline: "Fresh 30-day interview questions from your target companies + edge-case mastery.",
      dayRange: `Day ${daySplit3 + 1} – Day ${profile.durationDays}`,
      focusPatterns: ["Company Recency 30d", "Monotonic Stack", "Trie & Advanced", "Speed Mocks"],
      problems: p4Candidates.slice(0, p4Count),
    },
  ];
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function SmartPlannerPage() {
  const [profile, setProfile] = useState<PlannerProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

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

  // Load profile from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerProfile;
        setProfile(parsed);
        // Pre-fill form
        setFormRole(parsed.role);
        setFormStage(parsed.stage);
        setFormLevel(parsed.level);
        setFormCompanyPreset(parsed.companyPreset || "maang");
        setFormCustomCompanies(parsed.targetCompanies || []);
        setFormDuration(parsed.durationDays);
        setFormDailyHours(parsed.dailyHours);
      } else {
        setIsEditing(true);
      }
    } catch (e) {
      setIsEditing(true);
    }
  }, []);

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
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
          <div className="pt-4 flex items-center justify-end gap-3">
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
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* ── Top Header & Profile Banner ─────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#16132b]/90 via-[#101322] to-[#0c0e17] border border-violet-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Personalized Mission Control
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {profile.durationDays}-Day Plan · {profile.dailyHours} hrs/day
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your Customized Placement Roadmap
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Targeting <strong className="text-white capitalize">{profile.role.replace("_", "-")}</strong> with focus on{" "}
              <strong className="text-violet-300 font-semibold">
                {COMPANY_PRESETS[profile.companyPreset]?.label || "Top Tech Companies"}
              </strong>
              . Sequenced dynamically based on your <strong className="text-slate-200 capitalize">{profile.level}</strong> foundation.
            </p>
          </div>

          {/* Action & Stats Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Adjust Preferences
            </Button>
          </div>
        </div>

        {/* Progress Metric Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Progress</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {solvedCount} <span className="text-sm font-normal text-slate-400">/ {allRoadmapProblems.length} Qs</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{completionPct}%</div>
            <div className="text-[11px] text-slate-400 mt-1">On schedule</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roadmap Window</div>
            <div className="text-2xl font-extrabold text-violet-300 mt-1">{profile.durationDays} Days</div>
            <div className="text-[11px] text-slate-400 mt-1">4 Progressive phases</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skill Baseline</div>
            <div className="text-lg font-bold text-amber-300 mt-1.5 capitalize">{profile.level}</div>
            <div className="text-[11px] text-slate-400 mt-1">Auto-balanced difficulty</div>
          </div>
        </div>
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
