"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import {
  Bot,
  Send,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  User,
  Clock,
  Building2,
  Layers,
  Check,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { loadProgress, getPatternMastery, isSolvedStatus } from "@/lib/db";
import type { ProposedPlannerConfig } from "@/lib/question-search";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
  isByok?: boolean;
  proposedPlan?: ProposedPlannerConfig;
  planApplied?: boolean;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Markdown renderer (bold, code, links, bullets) ────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bullet points
    const bulletMatch = line.match(/^(\s*[-*])\s+(.*)/);
    if (bulletMatch) {
      return (
        <li key={i} className="ml-4 list-disc text-slate-300">
          {inlineFormat(bulletMatch[2])}
        </li>
      );
    }
    // Headings ##
    if (line.startsWith("## ")) {
      return (
        <p key={i} className="font-bold text-white mt-2.5 text-sm">
          {line.slice(3)}
        </p>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <p key={i} className="font-extrabold text-white mt-3 text-base">
          {line.slice(2)}
        </p>
      );
    }
    // Empty line = spacing
    if (line.trim() === "") return <div key={i} className="h-2" />;

    return (
      <p key={i} className="text-slate-300 leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
  });
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 underline font-semibold transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-violet-950/70 border border-violet-500/30 text-violet-200 text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ── Proposed Plan Card Component ─────────────────────────────────────────────
function ProposedPlanCard({
  plan,
  applied,
  onApply,
}: {
  plan: ProposedPlannerConfig;
  applied?: boolean;
  onApply: () => void;
}) {
  return (
    <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-violet-950/60 via-[#13162b]/80 to-[#0e101d] border border-violet-500/40 text-xs space-y-3 shadow-xl shadow-violet-950/40 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-200 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Proposed Study Plan
        </div>
        <span className="text-[11px] text-slate-400 font-mono font-medium">
          {plan.durationDays} Days • {plan.dailyHours}h/day
        </span>
      </div>

      <div className="text-slate-100 font-semibold leading-relaxed">
        {plan.planSummary}
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-[11px] pt-1">
        <div className="flex items-center gap-2 text-slate-300 bg-white/[0.03] p-2 rounded-xl border border-white/5">
          <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span>Role: <strong className="text-white capitalize">{plan.role}</strong> ({plan.level})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 bg-white/[0.03] p-2 rounded-xl border border-white/5">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Daily Commitment: <strong className="text-white">{plan.dailyHours}h</strong></span>
        </div>
        {plan.targetCompanies.length > 0 && (
          <div className="col-span-2 flex items-center gap-2 text-slate-300 bg-white/[0.03] p-2 rounded-xl border border-white/5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Target Companies: <strong className="text-white">{plan.targetCompanies.join(", ")}</strong></span>
          </div>
        )}
        {plan.focusAreas.length > 0 && (
          <div className="col-span-2 flex items-center gap-2 text-slate-300 bg-white/[0.03] p-2 rounded-xl border border-white/5">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Core Focus: <strong className="text-white">{plan.focusAreas.join(", ")}</strong></span>
          </div>
        )}
      </div>

      <div className="pt-2.5 border-t border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {applied ? (
          <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Plan Applied! Your active roadmap has been updated below.</span>
          </div>
        ) : (
          <>
            <span className="text-[11px] text-slate-400">
              Apply this personalized plan directly to your Mission Control
            </span>
            <Button
              size="sm"
              onClick={onApply}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs px-4 py-1.5 h-8 font-bold shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Apply to Smart Planner
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AiAssistantPanel() {
  const { user, isConfigured, signInWithGoogle } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  // BYOK States
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<"none" | "configured" | "saving" | "error">("none");
  const [apiKeyErrorMsg, setApiKeyErrorMsg] = useState<string | null>(null);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [isByokActive, setIsByokActive] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll the chat container internally only when new messages are added
  useEffect(() => {
    if (messages.length > 0 && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Check key status on mount & auth change
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const idToken = await getIdToken(user, true);
        const res = await fetch("/api/ai/config", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        if (data.configured) {
          setApiKeyStatus("configured");
          setIsByokActive(true);
        } else {
          setApiKeyStatus("none");
          setIsByokActive(false);
        }
      } catch {
        // network or auth issue
      }
    })();
  }, [user]);

  const sendMessage = useCallback(
    async (retryContent?: string) => {
      const content = (retryContent ?? input).trim();
      if (!content || loading) return;
      if (!auth || !user) return;

      const userMsg: Message = { id: genId(), role: "user", content };

      setMessages((prev) => {
        if (retryContent) {
          const filtered = prev.filter((m) => !m.error);
          return [...filtered, userMsg];
        }
        return [...prev, userMsg];
      });
      setInput("");
      setLoading(true);

      try {
        const idToken = await getIdToken(user, true);

        // Build history (exclude errored messages)
        const history = messages
          .filter((m) => !m.error)
          .map((m) => ({ role: m.role, content: m.content }));

        // Harvest comprehensive user profile & progress context
        let clientContext: Record<string, unknown> | undefined;
        try {
          const STORAGE_KEY = "leetprime_smart_plan_profile";
          let savedProfile: unknown;
          const rawProfile = localStorage.getItem(STORAGE_KEY);
          if (rawProfile) {
            try {
              savedProfile = JSON.parse(rawProfile);
            } catch {}
          }

          const progress = loadProgress();
          const mastery = getPatternMastery(progress);
          const solvedIds = Object.keys(progress).filter((id) =>
            isSolvedStatus(progress[id]?.status)
          );
          const attemptedIds = Object.keys(progress).filter(
            (id) => progress[id]?.status === "attempted"
          );
          const revisionIds = Object.keys(progress).filter(
            (id) =>
              progress[id]?.status === "revise" ||
              (progress[id]?.revisionCount ?? 0) > 0
          );

          const weak = mastery
            .filter((m) => m.pct < 50 && m.total > 0)
            .sort((a, b) => a.pct - b.pct)
            .slice(0, 4)
            .map((m) => `${m.pattern.name} (${m.pct}%)`);

          const strong = mastery
            .filter((m) => m.pct >= 50 && m.total > 0)
            .sort((a, b) => b.pct - a.pct)
            .slice(0, 4)
            .map((m) => `${m.pattern.name} (${m.pct}%)`);

          clientContext = {
            profile: savedProfile,
            progress: {
              stats: {
                solved: solvedIds.length,
                attempted: attemptedIds.length,
                revise: revisionIds.length,
                todo: Math.max(0, Object.keys(progress).length - solvedIds.length),
              },
              solvedProblemIds: solvedIds,
              attemptedProblemIds: attemptedIds,
              revisionProblemIds: revisionIds,
              weakPatterns: weak,
              strongPatterns: strong,
            },
          };
        } catch {
          // ignore localStorage issues
        }

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ message: content, history, context: clientContext }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }

        const byokFlag = data.isByok === true || isByokActive;
        if (data.isByok !== undefined) {
          setIsByokActive(data.isByok);
        }

        const modelMsg: Message = {
          id: genId(),
          role: "model",
          content: data.reply as string,
          isByok: byokFlag,
          proposedPlan: data.proposedPlan,
        };

        setMessages((prev) => [...prev, modelMsg]);
        if (typeof data.remainingRequests === "number") {
          setRemainingRequests(data.remainingRequests);
        } else if (data.isByok) {
          setRemainingRequests(null); // Unlimited
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: "model",
            content: errMsg,
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, user, isByokActive]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const saveApiKey = async () => {
    if (!auth || !user || !apiKeyInput.trim()) return;
    setApiKeyStatus("saving");
    setApiKeyErrorMsg(null);
    try {
      const idToken = await getIdToken(user, true);
      const res = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ apiKey: apiKeyInput.trim(), validate: true }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setApiKeyStatus("configured");
        setIsByokActive(true);
        setApiKeyInput("");
        setRemainingRequests(null); // Unlimited on BYOK
      } else {
        setApiKeyStatus("error");
        setApiKeyErrorMsg(data.error || "Failed to validate API key. Please check Google AI Studio.");
      }
    } catch {
      setApiKeyStatus("error");
      setApiKeyErrorMsg("Network error while validating key. Please check your internet connection.");
    }
  };

  const removeApiKey = async () => {
    if (!auth || !user) return;
    try {
      const idToken = await getIdToken(user, true);
      await fetch("/api/ai/config", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setApiKeyStatus("none");
      setIsByokActive(false);
      setApiKeyInput("");
      setRemainingRequests(20);
    } catch {}
  };

  const handleApplyPlan = (msgId: string, plan: ProposedPlannerConfig) => {
    try {
      const STORAGE_KEY = "leetprime_smart_plan_profile";
      const updatedProfile = {
        role: plan.role,
        stage: plan.stage || "3rd_4th",
        level: plan.level,
        companyPreset: plan.companyPreset || "custom",
        targetCompanies: plan.targetCompanies,
        durationDays: plan.durationDays,
        dailyHours: plan.dailyHours,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event("leetprime:plan-updated"));

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, planApplied: true } : m))
      );
    } catch (e) {
      console.error("Failed to apply plan:", e);
    }
  };

  // ── Unauthenticated State ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#121528] via-[#0d0f1e] to-[#080912] border border-violet-500/20 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center justify-center py-6 gap-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Lock className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-xl tracking-tight">Sign in to Access AI Study Coach</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Google authentication is required to access Gemini-powered placement planning, pattern weakness analysis, and roadmap adjustments.
            </p>
          </div>
          {isConfigured ? (
            <Button
              onClick={signInWithGoogle}
              className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            >
              Sign in with Google
            </Button>
          ) : (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mt-2">
              Firebase is not yet configured. Add your credentials to .env.local to enable sign-in.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Chat Panel ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#121528]/95 via-[#0d0f1e] to-[#080912] border border-violet-500/25 backdrop-blur-2xl shadow-2xl shadow-violet-950/30 overflow-hidden transition-all">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-gradient-to-r from-violet-950/40 via-indigo-950/20 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Active Model Info */}
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none"
            onClick={() => setIsCollapsed((c) => !c)}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-600/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#121528] animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-white font-extrabold text-base tracking-tight">AI Placement & Study Coach</span>
                <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isByokActive ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Personal API Key Active · Unlimited Coaching Requests
                  </span>
                ) : (
                  <span>
                    Free Platform Tier ·{" "}
                    <strong className="text-violet-300">
                      {remainingRequests !== null ? `${remainingRequests}/20 requests remaining` : "20 requests / hour"}
                    </strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Model & BYOK Status Control Bar */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {/* Clear Tier Distinction Switcher Button */}
            <button
              onClick={() => {
                setShowKeySettings(!showKeySettings);
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer group",
                isByokActive
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400"
                  : "bg-violet-950/40 border-violet-500/40 text-violet-200 hover:bg-violet-900/50 hover:border-violet-400 shadow-md shadow-violet-950/40"
              )}
              title="Click to view or change AI Provider settings"
            >
              {isByokActive ? (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom Key Active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free Tier (20/hr)</span>
                  <span className="text-[10px] bg-violet-600/40 px-1.5 py-0.5 rounded text-violet-200 group-hover:bg-violet-500/50">
                    Add BYOK 🔑
                  </span>
                </>
              )}
            </button>

            {/* Clear Chat */}
            {messages.length > 0 && !isCollapsed && (
              <button
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-rose-300 hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed((c) => !c)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Quota Progress Meter (only for Free Tier) ────────── */}
        {!isByokActive && !isCollapsed && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>Platform Free Tier Quota:</span>
              <strong className="text-white">
                {remainingRequests !== null ? `${remainingRequests} of 20 left` : "20 requests left"}
              </strong>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 sm:w-44 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-300"
                  style={{ width: `${((remainingRequests ?? 20) / 20) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setShowKeySettings(true)}
                className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold underline cursor-pointer"
              >
                Need unlimited? Add your key →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── BYOK Configuration Drawer / Settings Card ──────────── */}
      {showKeySettings && !isCollapsed && (
        <div className="p-5 bg-[#0a0c16]/90 border-b border-violet-500/20 backdrop-blur-xl transition-all">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Header of Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                <span>AI Model & API Key Configuration (BYOK)</span>
              </div>
              <button
                onClick={() => setShowKeySettings(false)}
                className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side-by-side Tier Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Free Tier Card */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl border transition-all",
                  !isByokActive
                    ? "bg-violet-950/30 border-violet-500/50 ring-1 ring-violet-500/40"
                    : "bg-white/[0.02] border-white/5 opacity-70"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Default Free Tier
                  </span>
                  {!isByokActive && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[10px]">
                      Currently Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  20 requests / hour limit. Shared platform quota powered by Google Gemini 2.5 Flash. No credit card or setup required.
                </p>
              </div>

              {/* BYOK Card */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl border transition-all",
                  isByokActive
                    ? "bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/40"
                    : "bg-white/[0.02] border-white/5"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    Custom API Key (BYOK)
                  </span>
                  {isByokActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 font-bold text-[10px]">
                      Currently Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Unlimited requests. Uses your personal Google Gemini API key. Full speed, zero platform rate limits.
                </p>
              </div>
            </div>

            {/* Input or Manage Form */}
            {isByokActive ? (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-white font-bold text-xs">Your Gemini API Key is Connected</div>
                    <div className="text-[11px] text-slate-400">
                      All placement coaching chats are running on your personal Gemini quota.
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removeApiKey}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500 text-xs h-8 shrink-0 cursor-pointer"
                >
                  Disconnect & Revert to Free Tier
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white">
                    Enter your Google Gemini API Key:
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 font-semibold underline"
                  >
                    <span>Get a free key from Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setApiKeyErrorMsg(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveApiKey();
                      }}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#121528] border border-white/15 rounded-xl px-3.5 py-2 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      title={showApiKey ? "Hide key" : "Show key"}
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <Button
                    onClick={saveApiKey}
                    disabled={!apiKeyInput.trim() || apiKeyStatus === "saving"}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-4 h-9 font-bold rounded-xl shadow-md shadow-violet-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {apiKeyStatus === "saving" ? "Validating..." : "Validate & Save"}
                  </Button>
                </div>

                {apiKeyErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{apiKeyErrorMsg}</span>
                  </div>
                )}

                {/* Trust and Privacy Guarantee */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Privacy Guarantee:</strong> Keys are verified and stored securely in memory for your session only. They are never logged or stored in browser storage.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Chat Messages Body ─────────────────────────────────── */}
      {!isCollapsed && (
        <>
          <div
            ref={chatScrollRef}
            className="h-[290px] sm:h-[310px] overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700/60 scrollbar-track-transparent"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3.5 py-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/25 to-indigo-600/15 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-600/20">
                  <Sparkles className="w-7 h-7 text-violet-300" />
                </div>
                <div>
                  <h3 className="text-white text-base font-bold tracking-tight">Your Gemini DSA Strategist</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto leading-relaxed">
                    Ask me to refine your study plan, suggest problems for your target companies, or help diagnose weak patterns.
                  </p>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
                  {[
                    "Create a custom study plan for my level",
                    "I have 2 hours daily. What should I prioritize?",
                    "What questions does Amazon ask most in 30 days?",
                    "Analyze my progress and recommend 3 next problems",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        textareaRef.current?.focus();
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl border border-violet-500/25 text-violet-200 bg-violet-600/10 hover:bg-violet-600/25 hover:border-violet-500/50 hover:text-white transition-all cursor-pointer text-left active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages List */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 text-xs",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-400/40 text-white shadow-md shadow-violet-600/30"
                      : "bg-[#161a2e] border border-white/10 text-violet-300"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl p-4 space-y-1.5 shadow-sm",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600/40 to-indigo-600/30 border border-violet-500/35 text-violet-100 rounded-tr-sm shadow-violet-950/30"
                      : msg.error
                      ? "bg-rose-950/30 border border-rose-500/40 text-rose-300 rounded-tl-sm"
                      : "bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-tl-sm"
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="leading-relaxed text-sm">{msg.content}</p>
                  ) : msg.error ? (
                    <div className="space-y-2">
                      <p className="leading-relaxed text-rose-300">{msg.content}</p>
                      <button
                        onClick={() => {
                          const lastUser = [...messages]
                            .reverse()
                            .find((m) => m.role === "user" && !m.error);
                          if (lastUser) sendMessage(lastUser.content);
                        }}
                        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Request
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed space-y-1">
                      {renderMarkdown(msg.content)}
                      {msg.proposedPlan && (
                        <ProposedPlanCard
                          plan={msg.proposedPlan}
                          applied={msg.planApplied}
                          onApply={() => handleApplyPlan(msg.id, msg.proposedPlan!)}
                        />
                      )}
                    </div>
                  )}

                  {/* Provider Footnote on Model Messages */}
                  {msg.role === "model" && !msg.error && (
                    <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5">
                      <span>LeetPrime Placement Coach</span>
                      <span className={cn(msg.isByok ? "text-emerald-400/80" : "text-violet-400/80")}>
                        {msg.isByok ? "💎 Gemini 2.5 (Custom API Key)" : "⚡ Gemini 2.5 (Free Tier)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Animation */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#161a2e] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-violet-300">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span>Analyzing roadmap & generating advice…</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Input Box ────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/20">
            <div className="flex gap-2.5 items-end bg-white/[0.04] border border-white/[0.12] rounded-2xl px-4 py-3 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your study plan, next problem, or interview strategies…"
                rows={1}
                maxLength={1000}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none min-h-[24px] max-h-[140px] leading-relaxed"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={cn(
                  "p-2.5 rounded-xl transition-all shrink-0 cursor-pointer",
                  input.trim() && !loading
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/30 active:scale-95"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                )}
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 mt-2 px-1 gap-1">
              <span>Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for newline</span>
              <span>
                {isByokActive ? (
                  <span className="text-emerald-400 font-medium">💎 Unlimited requests (BYOK Active)</span>
                ) : (
                  <span>
                    {remainingRequests !== null
                      ? `${20 - remainingRequests}/20 requests used this hour`
                      : "Free tier · 20 requests/hour"}
                  </span>
                )}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
