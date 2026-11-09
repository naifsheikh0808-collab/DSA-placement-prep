"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Send,
  Sparkles,
  Trash2,
  Settings,
  ChevronDown,
  Zap,
  BookOpen,
  TrendingUp,
  Target,
  Map,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PrimeAiLogo } from "@/components/ai/PrimeAiLogo";
import { PrimeAiSettingsModal } from "@/components/ai/PrimeAiSettingsModal";
import { PrimeAiMessageRenderer } from "@/components/ai/PrimeAiMessageRenderer";
import { usePrimeAi } from "@/hooks/use-prime-ai";
import { savePlannerProfile } from "@/lib/plan-storage";
import type { ProposedPlannerConfig } from "@/lib/question-search";

// ── Proposed Plan Card ────────────────────────────────────────────────────────
interface PlanCardProps {
  plan: ProposedPlannerConfig;
  applied: boolean;
  onApply: () => void;
}

function ProposedPlanCard({ plan, applied, onApply }: PlanCardProps) {
  return (
    <div className="mt-3 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-violet-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-violet-200 text-xs font-bold">Proposed Roadmap Preview</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-semibold">
          {plan.durationDays} Days · {plan.dailyHours}h/day
        </span>
      </div>

      <p className="text-white/80 text-xs leading-relaxed">{plan.planSummary}</p>

      {plan.targetCompanies && plan.targetCompanies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {plan.targetCompanies.slice(0, 5).map((c) => (
            <span key={c} className="px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 text-[10px]">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-violet-500/15 flex items-center justify-between">
        <span className="text-white/40 text-[11px]">Role: {plan.role.toUpperCase()} ({plan.level})</span>
        {applied ? (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Applied to Roadmap!
          </div>
        ) : (
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-900/30 transition-all"
          >
            <span>Apply to Smart Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Quick Prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "What should I solve next based on progress?", icon: Target, badge: "Personalized" },
  { label: "Build a 30-day FAANG preparation plan", icon: Map, badge: "Roadmap" },
  { label: "Diagnose my weak patterns & struggle areas", icon: TrendingUp, badge: "Mastery" },
  { label: "Explain Sliding Window invariant deeply", icon: BookOpen, badge: "Concept" },
];

const MODEL_INFO = {
  gemini: {
    id: "gemini",
    name: "Gemini 2.5 Flash",
    shortName: "Gemini 2.5",
    badge: "⚡",
    provider: "Google",
    color: "text-blue-400",
  },
  groq: {
    id: "groq",
    name: "Llama 3.3 70B",
    shortName: "Llama 3.3",
    badge: "🚀",
    provider: "Groq",
    color: "text-orange-400",
  },
};

// ── Main Component ────────────────────────────────────────────────────────────
export function AiAssistantPanel() {
  const { user, isConfigured, signInWithGoogle } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    setMessages,
    input,
    setInput,
    loading,
    sendMessage,
    clearChat,
    handleKeyDown,
    textareaRef,
    activeModel,
    setActiveModel,
    remainingGemini,
    remainingGroq,
    isSettingsOpen,
    setIsSettingsOpen,
  } = usePrimeAi({ mode: "planner" });

  // Auto-scroll on new message
  useEffect(() => {
    if (messages.length > 0 && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleApplyPlan = useCallback(
    async (msgId: string, plan: ProposedPlannerConfig) => {
      try {
        const newProfile = {
          role: plan.role,
          level: plan.level,
          durationDays: plan.durationDays,
          dailyHours: plan.dailyHours,
          targetCompanies: plan.targetCompanies ?? [],
          companyPreset: "custom",
          stage: "Placement Prep" as const,
          createdAt: new Date().toISOString(),
        };
        savePlannerProfile(newProfile as any);

        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, planApplied: true } : m))
        );
      } catch (err) {
        console.error("Failed to apply plan:", err);
      }
    },
    [setMessages]
  );

  const model = MODEL_INFO[activeModel];
  const toggleModel = () => setActiveModel(activeModel === "gemini" ? "groq" : "gemini");

  const remThisModel = activeModel === "gemini" ? remainingGemini : remainingGroq;
  const isByok = remThisModel === null;
  const tierBadgeLabel = isByok
    ? "💎 BYOK Unlimited"
    : `⚡ Free: ${remThisModel !== undefined && remThisModel !== null ? remThisModel : 10}/10 left`;

  return (
    <>
      <PrimeAiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeModel={activeModel}
        onModelChange={setActiveModel}
        remainingGemini={remainingGemini}
        remainingGroq={remainingGroq}
      />

      {/* Sleek, Lean Container */}
      <div className="flex flex-col rounded-3xl bg-gradient-to-b from-[#131024] via-[#0e0c1a] to-[#090812] border border-violet-500/25 shadow-2xl shadow-violet-950/40 overflow-hidden h-[500px]">
        {/* ── Compact Top Bar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <PrimeAiLogo size="sm" />
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-sm tracking-tight">Prime AI</span>
              <span className="text-white/20 text-xs">|</span>
              <span className="text-violet-300 text-xs font-semibold">Study Coach</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Settings Gear Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Prime AI Settings & API Keys"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {!user || !isConfigured ? (
            /* Not signed in */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
              <PrimeAiLogo size="lg" animated />
              <div>
                <h3 className="text-white font-bold text-sm">Sign in to unlock Prime AI</h3>
                <p className="text-white/40 text-xs mt-1 max-w-xs">
                  Generate adaptive DSA study roadmaps and get personalized guidance.
                </p>
              </div>
              <Button
                onClick={signInWithGoogle}
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-violet-900/30"
              >
                Sign in with Google
              </Button>
            </div>
          ) : messages.length === 0 ? (
            /* Sleek Empty State with Compact Quick Prompts */
            <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-white font-extrabold text-base tracking-tight flex items-center justify-center gap-2">
                    <span>What would you like to prepare today?</span>
                  </h3>
                  <p className="text-white/40 text-xs">
                    Context-aware recommendations using your target companies and tracker history.
                  </p>
                </div>

                {/* 2x2 Clean Grid of Quick Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {QUICK_PROMPTS.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.label}
                        onClick={() => sendMessage(prompt.label)}
                        disabled={loading}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-violet-500/10 border border-white/[0.06] hover:border-violet-500/30 text-left transition-all group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-violet-500/15 group-hover:bg-violet-500/25 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 group-hover:text-white text-xs font-medium leading-snug line-clamp-2">
                            {prompt.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === "model" && (
                    <div className="flex-shrink-0 mt-0.5">
                      <PrimeAiLogo size="xs" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm shadow-md shadow-violet-900/30"
                        : msg.error
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                        : "bg-white/[0.05] border border-white/[0.08] text-white/90 rounded-tl-sm backdrop-blur-sm"
                    )}
                  >
                    <div className="space-y-0.5">
                      {msg.role === "model" && !msg.error ? (
                        <PrimeAiMessageRenderer content={msg.content} />
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>

                    {!!msg.proposedPlan && (
                      <ProposedPlanCard
                        plan={msg.proposedPlan as ProposedPlannerConfig}
                        applied={!!msg.planApplied}
                        onApply={() => handleApplyPlan(msg.id, msg.proposedPlan as ProposedPlannerConfig)}
                      />
                    )}

                    {/* Attribution */}
                    {msg.role === "model" && !msg.error && (
                      <div className="mt-2 flex items-center gap-1.5 opacity-40 text-[10px]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>
                          {msg.model === "groq" ? "Llama 3.3 70B · Groq" : "Gemini 2.5 Flash · Google"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking animation */}
              {loading && (
                <div className="flex gap-3">
                  <PrimeAiLogo size="xs" animated />
                  <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Chat Input Container with Toolbar INSIDE the box ── */}
        {user && isConfigured && (
          <div className="p-3.5 pt-0 flex-shrink-0">
            <div className="rounded-2xl border border-white/[0.1] bg-[#141126]/90 backdrop-blur-md p-2.5 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all shadow-inner">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about study plan, next problem, or interview strategies..."
                rows={1}
                className="w-full bg-transparent text-white text-xs sm:text-sm placeholder:text-white/25 outline-none resize-none px-2 py-1 leading-relaxed max-h-24"
                style={{ scrollbarWidth: "none" }}
              />

              {/* INTEGRATED BOTTOM TOOLBAR INSIDE THE CHAT BOX */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1 px-1">
                {/* Left: Model Switch Toggle Pill + Noticeable Tier Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Model Toggle Pill Button */}
                  <button
                    onClick={toggleModel}
                    type="button"
                    title="Click to switch AI model"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-white transition-all shadow-sm group"
                  >
                    <span>{model.badge}</span>
                    <span className={model.color}>{model.shortName}</span>
                    <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-white transition-transform" />
                  </button>

                  {/* Noticeable Free Tier / BYOK Indicator */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    type="button"
                    title="Click to manage API keys & quotas"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all",
                      isByok
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                        : (remThisModel !== null && remThisModel <= 3)
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25 animate-pulse"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isByok
                          ? "bg-emerald-400"
                          : (remThisModel !== null && remThisModel <= 3)
                          ? "bg-rose-400"
                          : "bg-amber-400"
                      )}
                    />
                    <span>{tierBadgeLabel}</span>
                  </button>
                </div>

                {/* Right: Settings Button & Send Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    type="button"
                    title="Prime AI Settings & API Keys"
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition-all"
                  >
                    <span>Send</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
