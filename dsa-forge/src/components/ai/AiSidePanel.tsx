"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePrimeAi } from "@/hooks/use-prime-ai";
import { useAuth } from "@/context/auth-context";
import { PrimeAiLogo } from "@/components/ai/PrimeAiLogo";
import { PrimeAiSettingsModal } from "@/components/ai/PrimeAiSettingsModal";
import { PrimeAiMessageRenderer } from "@/components/ai/PrimeAiMessageRenderer";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Clock,
  Code,
  AlertTriangle,
  X,
  Send,
  Trash2,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface AiSidePanelProps {
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    primaryPattern: string | null;
    secondaryPatterns: string[];
    companies: string[];
    acceptanceRate: number;
    platform: string;
    priorityScore: number;
    canonicalUrl: string;
  };
  status: string;
  notes: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

const QUICK_ACTIONS = [
  { label: "Give me a subtle hint", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20" },
  { label: "Explain time & space complexity", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20" },
  { label: "Identify edge cases", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20" },
  { label: "Review my approach in notes", icon: Code, color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20" },
];

const MODEL_INFO = {
  gemini: {
    id: "gemini",
    name: "Gemini 2.5 Flash",
    shortName: "Gemini 2.5",
    badge: "⚡",
    color: "text-blue-400",
  },
  groq: {
    id: "groq",
    name: "Llama 3.3 70B",
    shortName: "Llama 3.3",
    badge: "🚀",
    color: "text-orange-400",
  },
};

export function AiSidePanel({
  problem,
  status,
  notes,
  className,
  isOpen = true,
  onClose,
  isMobileDrawer = false,
}: AiSidePanelProps) {
  const { user, isConfigured, signInWithGoogle } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
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
    isByok,
  } = usePrimeAi({
    mode: "question",
    contextPayload: {
      problemId: problem.id,
      problemTitle: problem.title,
      problemSlug: problem.slug,
      difficulty: problem.difficulty,
      pattern: problem.primaryPattern,
      secondaryPatterns: problem.secondaryPatterns,
      companies: problem.companies,
      acceptanceRate: problem.acceptanceRate,
      platform: problem.platform,
      priorityScore: problem.priorityScore,
      canonicalUrl: problem.canonicalUrl,
      currentStatus: status,
      currentNotes: notes,
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const model = MODEL_INFO[activeModel];
  const toggleModel = () => setActiveModel(activeModel === "gemini" ? "groq" : "gemini");

  const remThisModel = activeModel === "gemini" ? remainingGemini : remainingGroq;
  const tierBadgeLabel = isByok
    ? "💎 BYOK Unlimited"
    : `⚡ Free: ${remThisModel !== undefined && remThisModel !== null ? remThisModel : 10}/10`;

  if (!isOpen && !isMobileDrawer) return null;

  return (
    <>
      {/* Settings Modal */}
      <PrimeAiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeModel={activeModel}
        onModelChange={setActiveModel}
        remainingGemini={remainingGemini}
        remainingGroq={remainingGroq}
      />

      {/* Side Panel */}
      <aside
        className={cn(
          "flex flex-col bg-[#0e0c1a] border border-white/[0.08] rounded-2xl overflow-hidden",
          "shadow-2xl shadow-violet-900/20",
          isMobileDrawer
            ? "h-full max-h-full w-full"
            : "w-[390px] xl:w-[440px] h-[610px] xl:h-[630px] max-h-[calc(100vh-3rem)] flex-shrink-0",
          className
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07] bg-gradient-to-r from-violet-950/40 via-[#120f26] to-indigo-950/30 flex-shrink-0">
          <PrimeAiLogo size="xs" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-sm tracking-tight">Prime AI</span>
              <span className="text-white/20 text-xs">|</span>
              <span className="text-violet-300 text-xs font-medium">Solver</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Prime AI Settings & API Keys"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Close AI panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {!user || !isConfigured ? (
            /* Not signed in */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <PrimeAiLogo size="lg" animated />
              <div>
                <h3 className="text-white font-semibold text-sm">Sign in to use Prime AI</h3>
                <p className="text-white/40 text-xs mt-1">Get progressive hints, complexity analysis, and approach reviews.</p>
              </div>
              <Button
                onClick={signInWithGoogle}
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 rounded-xl px-5 shadow-lg shadow-violet-900/30"
              >
                Sign in with Google
              </Button>
            </div>
          ) : messages.length === 0 ? (
            /* Empty state */
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4 p-4 sm:p-5">
              <div className="text-center">
                <PrimeAiLogo size="md" className="mx-auto mb-2.5" />
                <h3 className="text-white font-bold text-sm">Ask about this problem</h3>
                <p className="text-white/40 text-xs mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Context-aware hints & guidance for{" "}
                  <span className="text-violet-400 font-semibold">{problem.title}</span>
                </p>
              </div>

              {/* Quick Actions */}
              <div className="w-full space-y-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.label)}
                      disabled={loading}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all",
                        "text-white/70 hover:text-white",
                        action.bg
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", action.color)} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Messages Feed */
            <div
              ref={chatScrollRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 scroll-smooth overscroll-contain"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5",
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
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm shadow-md shadow-violet-900/30"
                        : msg.error
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                        : "bg-white/[0.06] border border-white/[0.07] text-white/90 rounded-tl-sm backdrop-blur-sm"
                    )}
                  >
                    <div className="space-y-0.5">
                      {msg.role === "model" && !msg.error ? (
                        <PrimeAiMessageRenderer content={msg.content} />
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>

                    {/* Attribution */}
                    {msg.role === "model" && !msg.error && (
                      <div className="mt-1.5 flex items-center gap-1 opacity-35 text-[9px]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>
                          {msg.model === "groq" ? "Llama 3.3 · Groq" : "Gemini 2.5 Flash"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking animation */}
              {loading && (
                <div className="flex gap-2.5">
                  <PrimeAiLogo size="xs" animated />
                  <div className="bg-white/[0.06] border border-white/[0.07] rounded-2xl rounded-tl-sm px-3.5 py-2 flex items-center gap-1.5">
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
          <div className="p-3 pt-0 flex-shrink-0">
            <div className="rounded-2xl border border-white/[0.1] bg-[#141126]/90 backdrop-blur-md p-2.5 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for hint, edge cases, complexity..."
                rows={1}
                className="w-full bg-transparent text-white text-xs placeholder:text-white/25 outline-none resize-none px-1 py-0.5 leading-relaxed max-h-24"
                style={{ scrollbarWidth: "none" }}
              />

              {/* INTEGRATED BOTTOM TOOLBAR INSIDE THE CHAT BOX */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1 px-0.5">
                {/* Left: Model Switch Dropdown & Noticeable Quota Badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Model Toggle Button */}
                  <button
                    onClick={toggleModel}
                    type="button"
                    title="Click to switch AI model"
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-white transition-all shadow-sm group"
                  >
                    <span>{model.badge}</span>
                    <span className={model.color}>{model.shortName}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-white/50 group-hover:text-white transition-transform" />
                  </button>

                  {/* Noticeable Free Tier / BYOK Indicator */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    type="button"
                    title="View API quota & settings"
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all",
                      isByok
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : (remThisModel !== null && remThisModel <= 3)
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1 h-1 rounded-full",
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

                {/* Right: Send Button */}
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-violet-900/30 transition-all"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
