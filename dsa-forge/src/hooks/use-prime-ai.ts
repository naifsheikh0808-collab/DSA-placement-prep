"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";

export type PrimeAiModel = "gemini" | "groq";

export interface AiChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
  proposedPlan?: unknown;
  planApplied?: boolean;
  model?: PrimeAiModel;
}

interface UsePrimeAiOptions {
  mode?: "planner" | "question";
  contextPayload?: Record<string, unknown>;
  onMessage?: (message: AiChatMessage) => void;
}

const LOCAL_STORAGE_MODEL_KEY = "prime_ai_active_model";

export function usePrimeAi({ mode = "planner", contextPayload, onMessage }: UsePrimeAiOptions = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModelState] = useState<PrimeAiModel>("gemini");
  const [remainingGemini, setRemainingGemini] = useState<number | null>(null);
  const [remainingGroq, setRemainingGroq] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Restore model preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY) as PrimeAiModel | null;
      if (saved === "gemini" || saved === "groq") {
        setActiveModelState(saved);
      }
    }
  }, []);

  const setActiveModel = useCallback((model: PrimeAiModel) => {
    setActiveModelState(model);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, model);
    }
  }, []);

  const sendMessage = useCallback(
    async (content?: string) => {
      const text = (content ?? input).trim();
      if (!text || loading || !user) return;

      const userMsg: AiChatMessage = { id: genId(), role: "user", content: text };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const idToken = await getIdToken(user, true);

        // Build context based on mode
        let clientContext: Record<string, unknown> | undefined;
        if (mode === "question" && contextPayload) {
          clientContext = {
            mode: "question",
            problem: {
              id: contextPayload.problemId as string,
              title: contextPayload.problemTitle as string,
              difficulty: contextPayload.difficulty as string,
              primaryPattern: contextPayload.primaryPattern as string | null,
              secondaryPatterns: (contextPayload.secondaryPatterns as string[]) ?? [],
              companies: (contextPayload.companies as string[]) ?? [],
              acceptanceRate: contextPayload.acceptanceRate as number,
              canonicalUrl: contextPayload.canonicalUrl as string,
              userStatus: contextPayload.currentStatus as string,
              userNotes: contextPayload.currentNotes as string,
            },
          };
        } else {
          // Planner mode: harvest profile & progress context
          try {
            const STORAGE_KEY = "leetprime_smart_plan_profile";
            const rawProfile = localStorage.getItem(STORAGE_KEY);
            let savedProfile: unknown;
            if (rawProfile) {
              try {
                savedProfile = JSON.parse(rawProfile);
              } catch {
                // ignore parse errors
              }
            }

            const { loadProgress, getPatternMastery, isSolvedStatus } = await import("@/lib/db");
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
              mode: "planner",
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
        }

        const history = messages
          .filter((m) => !m.error)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            message: text,
            history,
            context: clientContext,
            model: activeModel,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }

        const modelMsg: AiChatMessage = {
          id: genId(),
          role: "model",
          content: data.reply as string,
          proposedPlan: data.proposedPlan,
          model: (data.activeModel as PrimeAiModel) ?? activeModel,
        };

        setMessages((prev) => [...prev, modelMsg]);

        // Update remaining quotas
        if (typeof data.remainingGemini === "number") {
          setRemainingGemini(data.remainingGemini);
        }
        if (typeof data.remainingGroq === "number") {
          setRemainingGroq(data.remainingGroq);
        }
        // Legacy fallback
        if (typeof data.remainingRequests === "number" && data.activeModel === "gemini") {
          setRemainingGemini(data.remainingRequests);
        }

        onMessage?.(modelMsg);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "model", content: errMsg, error: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, user, mode, contextPayload, onMessage, activeModel]
  );

  const clearChat = () => {
    setMessages([]);
    setRemainingGemini(null);
    setRemainingGroq(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  function genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  return {
    messages,
    setMessages,
    input,
    setInput,
    loading,
    setLoading,
    activeModel,
    setActiveModel,
    remainingGemini,
    remainingGroq,
    setRemainingGemini,
    setRemainingGroq,
    isSettingsOpen,
    setIsSettingsOpen,
    sendMessage,
    clearChat,
    handleKeyDown,
    textareaRef,
    user,
  };
}

