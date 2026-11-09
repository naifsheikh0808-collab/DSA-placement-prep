"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";

export interface AiChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
  proposedPlan?: unknown;
  planApplied?: boolean;
}

interface UseAiChatOptions {
  mode?: "planner" | "question";
  contextPayload?: Record<string, unknown>;
  onMessage?: (message: AiChatMessage) => void;
}

export function useAiChat({ mode = "planner", contextPayload, onMessage }: UseAiChatOptions = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            const { loadPlannerProfile } = await import("@/lib/plan-storage");
            const savedProfile = loadPlannerProfile();

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
          body: JSON.stringify({ message: text, history, context: clientContext }),
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
        };

        setMessages((prev) => [...prev, modelMsg]);
        if (typeof data.remainingRequests === "number") {
          setRemainingRequests(data.remainingRequests);
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
    [input, loading, messages, user, mode, contextPayload, onMessage]
  );

  const clearChat = () => {
    setMessages([]);
    setRemainingRequests(null);
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
    remainingRequests,
    setRemainingRequests,
    sendMessage,
    clearChat,
    handleKeyDown,
    textareaRef,
    user,
  };
}
