"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  ChevronDown,
  ChevronUp,
  User,
  LogOut,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  Shield,
  Layers,
  X,
  Cloud,
  Heart,
} from "lucide-react";
import {
  resetProgress,
  getPatternMastery,
  getSolvedProblems,
  TOP_PROBLEMS,
  PATTERNS,
} from "@/lib/db";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useProgressStore } from "@/hooks/use-progress";
import type { Difficulty, Problem } from "@/lib/types";

/* ─── Custom Social Brand Icons ──────────────────────────────── */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function ProgressPage() {
  const [showPatternBreakdown, setShowPatternBreakdown] = useState<boolean>(false);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState<boolean>(false);
  const [solvedPanel, setSolvedPanel] = useState<Difficulty | "ALL" | null>(null);
  const [panelDifficulty, setPanelDifficulty] = useState<Difficulty | "ALL">("ALL");

  const { user, isConfigured, signInWithGoogle, logout } = useAuth();
  const { progress, refresh } = useProgressStore();

  // Close the solved-problems panel with Escape.
  useEffect(() => {
    if (solvedPanel === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSolvedPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [solvedPanel]);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your practice progress? This will reset all solved marks in this browser.")) {
      resetProgress();
      refresh();
    }
  };

  // Solved problems, derived from the canonical progress store.
  const solvedProblems = getSolvedProblems(progress);
  const solvedCount = solvedProblems.length;

  const solvedByDifficulty = (difficulty: Difficulty) =>
    solvedProblems.filter((p) => p.difficulty === difficulty).length;

  const easySolved = solvedByDifficulty("Easy");
  const mediumSolved = solvedByDifficulty("Medium");
  const hardSolved = solvedByDifficulty("Hard");

  const totalEasy = TOP_PROBLEMS.filter((p) => p.difficulty === "Easy").length;
  const totalMedium = TOP_PROBLEMS.filter((p) => p.difficulty === "Medium").length;
  const totalHard = TOP_PROBLEMS.filter((p) => p.difficulty === "Hard").length;

  // Rank / Title based on solved count
  const solverRank =
    solvedCount >= 50
      ? { title: "Master Solver", color: "text-amber-300", badge: "bg-amber-500/20 border-amber-500/40" }
      : solvedCount >= 25
      ? { title: "Knight Solver", color: "text-violet-300", badge: "bg-violet-500/20 border-violet-500/40" }
      : solvedCount >= 10
      ? { title: "Apprentice Solver", color: "text-indigo-300", badge: "bg-indigo-500/20 border-indigo-500/40" }
      : { title: "Novice Solver", color: "text-slate-300", badge: "bg-slate-500/20 border-slate-500/40" };

  // Per-pattern mastery, using the canonical pattern registry.
  const patternMasteryStats = getPatternMastery(progress);

  const patternsInProgress = patternMasteryStats.filter((p) => p.solved > 0).length;
  const patternsMastered = patternMasteryStats.filter((p) => p.pct >= 50).length;

  const openSolvedPanel = (difficulty: Difficulty | "ALL") => {
    setPanelDifficulty(difficulty);
    setSolvedPanel(difficulty);
  };

  const panelProblems: Problem[] =
    solvedPanel === null
      ? []
      : panelDifficulty === "ALL"
      ? solvedProblems
      : solvedProblems.filter((p) => p.difficulty === panelDifficulty);

  const statCards = [
    {
      key: "ALL" as const,
      label: "Total Solved",
      value: solvedCount,
      total: TOP_PROBLEMS.length,
      accent: "from-violet-500 to-indigo-500",
      text: "text-violet-400",
      note: "% of curated benchmark",
    },
    {
      key: "Easy" as const,
      label: "Easy Solved",
      value: easySolved,
      total: totalEasy,
      accent: "from-emerald-500 to-emerald-400",
      text: "text-emerald-400",
      note: "Foundational speed",
    },
    {
      key: "Medium" as const,
      label: "Medium Solved",
      value: mediumSolved,
      total: totalMedium,
      accent: "from-amber-500 to-amber-400",
      text: "text-amber-400",
      note: "Core interview clearing zone",
    },
    {
      key: "Hard" as const,
      label: "Hard Solved",
      value: hardSolved,
      total: totalHard,
      accent: "from-rose-500 to-rose-400",
      text: "text-rose-400",
      note: "Tier-1 & MAANG differentiator",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* ── Page Header & Quick Dev Connect ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" /> Personal Analytics & Cloud Progress
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Progress
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track solved problems, cloud synchronization, and pattern progression.
          </p>
        </div>

        {/* Developer Connect Button */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowDevModal(true)}
            className="text-xs font-semibold border-white/10 hover:border-violet-500/40 text-slate-200 hover:text-white"
          >
            <LinkedInIcon className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Contact Developer
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Progress
          </Button>
        </div>
      </div>

      {/* ── User Profile & Cloud Sync Card ─────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#16132b]/80 via-[#101322] to-[#0c0e17] border border-violet-500/25 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* User Info Left */}
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-16 h-16 rounded-2xl border-2 border-violet-500/40 object-cover shadow-lg shadow-violet-500/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-violet-500/25">
                <User className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  {user ? user.displayName || "Google User" : "Guest Explorer"}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${solverRank.badge} ${solverRank.color}`}>
                  {solverRank.title}
                </span>
              </div>

              <div className="text-xs text-slate-400">
                {user ? user.email : "Local Browser Storage (Guest Mode)"}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 pt-1">
                {user ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Synchronized (Firebase)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Guest Mode · Not Synced to Cloud
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Actions & Sign-in Right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full">
                <Button
                  size="sm"
                  onClick={signInWithGoogle}
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  Sign in with Google to Sync
                </Button>

                {!isConfigured && (
                  <button
                    onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                    className="text-[11px] text-violet-400 hover:text-violet-300 underline font-medium"
                  >
                    Setup Firebase Keys
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Guest Mode Explainer Callout */}
        {!user && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span>
              💡 <strong>Guest Practice Active:</strong> Anyone can explore and practice freely. Sign in with Google to automatically back up your progress to the cloud so you can continue from any device.
            </span>
          </div>
        )}

        {/* Expandable Firebase Setup Guide */}
        {showFirebaseGuide && !isConfigured && (
          <div className="mt-4 p-4 rounded-2xl bg-[#090b14] border border-violet-500/30 text-xs space-y-2 text-slate-300">
            <div className="flex items-center justify-between font-bold text-violet-300">
              <span>Firebase Configuration Setup</span>
              <button onClick={() => setShowFirebaseGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              To connect your own Firebase project for Google Sign-In, add these keys to <code className="text-violet-300 bg-white/5 px-1 py-0.5 rounded">.env.local</code> in the <code className="text-violet-300 bg-white/5 px-1 py-0.5 rounded">dsa-forge</code> directory:
            </p>
            <pre className="p-3 bg-black/60 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-400">
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...`}
            </pre>
          </div>
        )}
      </div>

      {/* ── Summary Problem Metrics (clickable) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const pct = card.total > 0 ? (card.value / card.total) * 100 : 0;
          const isActive = solvedPanel === card.key;
          return (
            <button
              key={card.key}
              type="button"
              id={`stat-card-${card.key.toLowerCase()}`}
              onClick={() => openSolvedPanel(card.key)}
              aria-expanded={isActive}
              className={`text-left p-5 bg-[#10131f]/70 border rounded-2xl backdrop-blur-md transition-all duration-200 group hover:-translate-y-0.5 ${
                isActive
                  ? "border-violet-500/60 bg-violet-500/[0.06] shadow-[0_8px_28px_-6px_rgba(124,58,237,0.35)]"
                  : "border-white/10 hover:border-violet-500/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`text-[11px] ${card.text} uppercase font-bold tracking-wider mb-1`}>
                  {card.label}
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {card.value}{" "}
                <span className="text-sm font-normal text-slate-500">/ {card.total}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${card.accent} h-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {card.key === "ALL"
                  ? `${Math.round(pct)}% ${card.note}`
                  : card.note}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── COLLAPSIBLE Pattern Mastery Breakdown (Hidden by default) ── */}
      <div className="rounded-3xl bg-[#10131f]/70 border border-white/10 backdrop-blur-md overflow-hidden transition-all">
        {/* Accordion Toggle Bar */}
        <button
          onClick={() => setShowPatternBreakdown(!showPatternBreakdown)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Pattern Mastery Breakdown</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/10 font-mono">
                  {PATTERNS.length} Patterns
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {patternsMastered} of {PATTERNS.length} Mastered (50%+ solved) · {patternsInProgress} in progress · Click to {showPatternBreakdown ? "collapse" : "expand"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300">
            <span>{showPatternBreakdown ? "Hide Breakdown" : "View Breakdown"}</span>
            {showPatternBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsed Grid Content */}
        {showPatternBreakdown && (
          <div className="p-5 sm:p-6 pt-0 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {patternMasteryStats.map(({ pattern, solved, total, pct }) => (
              <Link
                key={pattern.id}
                href={`/dsa/patterns/${pattern.slug}`}
                className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-violet-500/30 rounded-2xl space-y-2.5 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200 group-hover:text-violet-300 transition-colors font-bold">
                    {pattern.name}
                  </span>
                  <span className="text-violet-400 font-mono">{pct}%</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{solved} of {total} solved</span>
                  <span className="text-violet-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── SOLVED PROBLEMS PANEL ─────────────────────────────── */}
      {solvedPanel !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSolvedPanel(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-[#10131f] border border-violet-500/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Solved Problems
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  {solvedPanel === "ALL"
                    ? "All Solved Questions"
                    : `${solvedPanel} Questions Solved`}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {panelProblems.length} question
                  {panelProblems.length === 1 ? "" : "s"} shown
                  {panelDifficulty !== "ALL" && ` · filtered by ${panelDifficulty}`}
                </p>
              </div>
              <button
                onClick={() => setSolvedPanel(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Difficulty filter */}
            <div className="px-5 sm:px-6 py-3 border-b border-white/10 flex items-center gap-2 flex-wrap bg-white/[0.02]">
              {(["ALL", "Easy", "Medium", "Hard"] as const).map((d) => {
                const active = panelDifficulty === d;
                return (
                  <button
                    key={d}
                    onClick={() => setPanelDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 border-white/[0.06]"
                    }`}
                  >
                    {d === "ALL" ? "All Difficulty" : d}
                    <span className="ml-1.5 font-mono text-[10px] opacity-70">
                      {d === "ALL"
                        ? solvedCount
                        : solvedByDifficulty(d)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="overflow-y-auto p-3 sm:p-4 space-y-1.5">
              {panelProblems.length === 0 ? (
                <div className="py-14 text-center text-slate-500 text-sm">
                  No solved questions in this bucket yet.
                  <br />
                  <span className="text-xs text-slate-600">
                    Mark a question as solved and it will show up here.
                  </span>
                </div>
              ) : (
                panelProblems.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-colors group"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <Link
                      href={`/dsa/questions/${p.slug}`}
                      className="text-sm font-semibold text-white hover:text-violet-300 transition-colors truncate min-w-0 flex-1"
                    >
                      {p.title}
                    </Link>
                    <span className="hidden sm:block text-[11px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5 truncate max-w-[180px]">
                      {p.primaryPattern || "Uncategorized"}
                    </span>
                    <DifficultyBadge difficulty={p.difficulty} />
                    <a
                      href={p.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
                      title="Open on LeetCode"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DEVELOPER CONTACT MODAL (Only GitHub & LinkedIn) ───── */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#10131f] border border-violet-500/30 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setShowDevModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar & Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-2xl mx-auto bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-violet-500/30">
                NA
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">SK NAIF ALAM</h3>
                <p className="text-xs text-violet-400 font-semibold mt-0.5">Creator of LeetPrime · Full Stack Developer</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
                  Built to empower engineers and college placement candidates to crack top-tier technical interviews with pattern-first intelligence.
                </p>
              </div>
            </div>

            {/* Social Connect Buttons (Only GitHub & LinkedIn as requested) */}
            <div className="space-y-3 pt-2">
              <a
                href="https://www.linkedin.com/in/sk-naif-alam-553901406/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 rounded-2xl bg-[#0077B5]/15 border border-[#0077B5]/30 hover:bg-[#0077B5]/25 text-white text-xs font-bold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0077B5] flex items-center justify-center text-white">
                    <LinkedInIcon className="w-4 h-4" />
                  </div>
                  <span>Connect on LinkedIn</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </a>

              <a
                href="https://github.com/naifsheikh0808-collab"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white text-xs font-bold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                    <GitHubIcon className="w-4 h-4" />
                  </div>
                  <span>Follow on GitHub</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Special Thanks to Contributor */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Special Thanks to Contributor</span>
              </div>
              <a
                href="https://github.com/Mohana1008"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-rose-500/20 hover:border-rose-500/40 text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 font-bold text-xs shrink-0">
                    MC
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                      Mohana Dhar Chowdhury
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      For providing the LeetCode Premium company-wise data
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 group-hover:text-rose-300 font-semibold pl-2 shrink-0">
                  <GitHubIcon className="w-3.5 h-3.5" />
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowDevModal(false)}
              className="w-full text-xs text-slate-300"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
