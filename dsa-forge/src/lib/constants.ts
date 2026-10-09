import type { ModuleDefinition } from "@/lib/types";

export const MODULES: ModuleDefinition[] = [
  {
    id: "dsa",
    label: "DSA",
    icon: "Code2",
    routePrefix: "/dsa",
    description: "Data Structures & Algorithms — patterns, companies, roadmaps",
    isAvailable: true,
  },
  {
    id: "aptitude",
    label: "Aptitude",
    icon: "Brain",
    routePrefix: "/aptitude",
    description: "Quantitative aptitude, logical reasoning & verbal ability",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "dbms",
    label: "DBMS",
    icon: "Database",
    routePrefix: "/dbms",
    description: "Database management systems theory & SQL queries",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "os",
    label: "OS",
    icon: "Cpu",
    routePrefix: "/os",
    description: "Operating systems concepts & interview questions",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "cn",
    label: "CN",
    icon: "Network",
    routePrefix: "/cn",
    description: "Computer networks fundamentals & protocols",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "oops",
    label: "OOP",
    icon: "Layers",
    routePrefix: "/oops",
    description: "Object-oriented programming principles & design patterns",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "sql",
    label: "SQL",
    icon: "Table",
    routePrefix: "/sql",
    description: "SQL practice problems & query optimization",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "notes",
    label: "Notes",
    icon: "BookOpen",
    routePrefix: "/notes",
    description: "Curated study notes, cheatsheets & quick references",
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "hr",
    label: "HR",
    icon: "Users",
    routePrefix: "/hr",
    description: "Behavioral questions, HR rounds & soft skills",
    isAvailable: false,
    comingSoon: true,
  },
];

export const ACTIVE_MODULE = MODULES[0];

export const TIMEFRAME_LABELS: Record<string, string> = {
  "0-30_days": "0-30 Days",
  "1-6_months": "1-6 Months",
  "more_than_6_months": ">6 Months",
};

export const TIMEFRAME_OPTIONS = [
  { value: "30d", label: "30 Days", description: "Focused sprint — most repeated, high-overlap questions" },
  { value: "3m", label: "3 Months", description: "Core patterns + selected hard problems" },
  { value: "6m", label: "6 Months", description: "Full pattern coverage + company targeting" },
  { value: "all", label: "All Time", description: "Complete preparation — no time constraints" },
];

export const SCORING_WEIGHTS = {
  companyFrequency: 0.35,
  companyOverlap: 0.25,
  patternImportance: 0.20,
  timeframeRelevance: 0.15,
  difficultyFit: 0.05,
  solvedPenalty: -0.5,
};

export const ROADMAP_PHASES = [
  { phase: 1, title: "Foundation", description: "Core data structures & easy patterns" },
  { phase: 2, title: "Core Patterns", description: "All major DSA patterns with practice" },
  { phase: 3, title: "High-Frequency Questions", description: "Most asked interview questions" },
  { phase: 4, title: "Company Practice", description: "Company-specific targeted prep" },
  { phase: 5, title: "Revision", description: "Review & solidify problem-solving" },
];
