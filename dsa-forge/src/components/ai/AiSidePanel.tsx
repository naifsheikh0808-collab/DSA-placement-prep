"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Lightbulb,
  Clock,
  Code,
  AlertTriangle,
  X,
  Send,
  Trash2,
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
  { label: "Give me a subtle hint", icon: Lightbulb, color: "text-amber-400" },
  { label: "Explain time & space complexity", icon: Clock, color: "text-blue-400" },
  { label: "Identify edge cases", icon: AlertTriangle, color: "text-rose-400" },
  { label: "Review my approach in notes", icon: Code, color: "text-violet-400" },
];

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

  const {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
    clearChat,
    handleKeyDown,
    textareaRef,
    remainingRequests,
  } = useAiChat({
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
      currentStatus: status,
      currentNotes: notes,
    },
  });

  const panelBody = (
    <div
      className={cn(
        "rounded-2xl border border-violet-500/25",
        "bg-gradient-to-b from-[#111326] via-[#0d0f1d] to-[#080911]",
        "shadow-2xl shadow-violet-950/40 backdrop-blur-2xl flex flex-col overflow-hidden",
        isMobileDrawer ? "h-full w-full" : "h-[calc(100vh-4.5rem)] max-h-[850px] w-full",
        className
      )}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-violet-900/35 via-indigo-900/25 to-transparent flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-600/35">
              <Bot className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0e101d] animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">AI Problem Solver</span>
              <span className="px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[190px]">{problem.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content: Not signed in vs Signed in ─────────────── */}
      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
            <Bot className="w-7 h-7 text-violet-400" />
          </div>
          <p className="text-sm font-bold text-white mb-1.5">Sign In to Ask AI</p>
          <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed mb-5">
            Sign in with Google to get customized hints, edge case analysis, and complexity breakdowns.
          </p>
          <Button
            onClick={signInWithGoogle}
            disabled={!isConfigured}
            className="w-full max-w-[240px] text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-600/30 cursor-pointer"
          >
            {isConfigured ? "Sign in with Google" : "Firebase not configured"}
          </Button>
        </div>
      ) : (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-700/60 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center h-full py-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/25 flex items-center justify-center mb-3 shadow-lg shadow-violet-600/20">
                  <Sparkles className="w-6 h-6 text-violet-300" />
                </div>
                <p className="text-sm font-bold text-white mb-1">Ask me anything</p>
                <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed mb-5">
                  Get hints, complexity breakdowns, or edge-case analysis for{" "}
                  <span className="text-slate-200 font-semibold">{problem.title}</span>.
                </p>

                {/* Quick Action Buttons */}
                <div className="w-full space-y-2">
                  {QUICK_ACTIONS.map(({ label, icon: Icon, color }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(label)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left text-xs font-medium text-slate-300 hover:bg-violet-500/15 hover:border-violet-500/35 hover:text-white transition-all group active:scale-[0.99] cursor-pointer"
                    >
                      <Icon className={cn("w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform", color)} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "model" && !msg.error && (
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    <Bot className="w-3.5 h-3.5 text-violet-300" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl text-sm leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600/50 to-indigo-600/40 border border-violet-500/35 text-violet-100 shadow-lg shadow-violet-950/30"
                      : msg.error
                      ? "bg-rose-900/30 border border-rose-500/30 text-rose-300"
                      : "bg-white/[0.05] border border-white/[0.08] text-slate-200 shadow-sm"
                  )}
                >
                  {msg.content}
                  {msg.error && (
                    <button
                      onClick={() => {
                        const lastUser = [...messages].reverse().find(
                          (m) => m.role === "user" && !m.error
                        );
                        if (lastUser) sendMessage(lastUser.content);
                      }}
                      className="mt-1.5 block text-[11px] text-rose-400 hover:text-rose-200 underline cursor-pointer"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Animation */}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <div className="rounded-2xl bg-white/[0.05] border border-white/[0.08] px-3.5 py-2.5 flex items-center gap-2 text-sm text-slate-400">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span>Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 px-4 py-3 border-t border-white/[0.08] bg-black/25">
            {remainingRequests !== null && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-500">
                  {remainingRequests} / 20 requests left this hour
                </span>
                <div className="w-20 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-300"
                    style={{ width: `${((20 - (remainingRequests ?? 0)) / 20) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 items-end bg-white/[0.04] border border-white/[0.10] rounded-xl px-3 py-2.5 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for a hint, complexity, or approach…"
                rows={1}
                maxLength={1000}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none min-h-[22px] max-h-[80px] leading-relaxed"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={cn(
                  "p-2 rounded-lg transition-all shrink-0 cursor-pointer",
                  input.trim() && !loading
                    ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white hover:from-violet-500 hover:to-indigo-600 shadow-md shadow-violet-600/30 active:scale-95"
                    : "bg-white/[0.04] text-slate-600 cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-slate-600 mt-2 text-center">
              Powered by Gemini · Context-aware for this problem
            </p>
          </div>
        </>
      )}
    </div>
  );

  // If mobile drawer mode is requested (for smaller screens)
  if (isMobileDrawer) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-10 p-3 flex flex-col">
          {panelBody}
        </div>
      </div>
    );
  }

  // Desktop in-flow mode: rendered directly into the layout without backdrop
  return panelBody;
}
