"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getIdToken } from "firebase/auth";
import { loadPlannerProfile } from "@/lib/plan-storage";

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
  mode?: "planner" | "question" | "general";
  contextPayload?: Record<string, unknown>;
  onMessage?: (message: AiChatMessage) => void;
}

const LOCAL_STORAGE_MODEL_KEY = "prime_ai_active_model";

// ── Chat persistence helpers ─────────────────────────────────────────────────
// Key is scoped to user UID + channel so Account A and Account B never mix.
function getChatChannel(mode: string, contextPayload?: Record<string, unknown>): string {
  if (mode === "question" && contextPayload?.problemId) {
    return `question_${contextPayload.problemId}`;
  }
  if (mode === "general") {
    return "home";
  }
  return "planner";
}

function getChatStorageKey(channel: string, uid?: string | null): string {
  const prefix = uid ? `user_${uid}_` : "guest_";
  return `prime_ai_chat_${prefix}${channel}`;
}

function loadPersistedMessages(key: string): AiChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AiChatMessage[];
    // Basic validation — only keep well-formed messages
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) =>
        m &&
        typeof m.id === "string" &&
        (m.role === "user" || m.role === "model") &&
        typeof m.content === "string"
    );
  } catch {
    return [];
  }
}

function persistMessages(key: string, messages: AiChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep only the last 60 messages to avoid bloating localStorage
    const toStore = messages.slice(-60);
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

export function usePrimeAi({ mode = "planner", contextPayload, onMessage }: UsePrimeAiOptions = {}) {
  const { user } = useAuth();

  const channel = getChatChannel(mode, contextPayload);
  const storageKey = getChatStorageKey(channel, user?.uid);

  // Load persisted messages on first mount
  const [messages, setMessagesRaw] = useState<AiChatMessage[]>(() =>
    loadPersistedMessages(storageKey)
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModelState] = useState<PrimeAiModel>("gemini");
  const [remainingGemini, setRemainingGemini] = useState<number | null>(null);
  const [remainingGroq, setRemainingGroq] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [byokTick, setByokTick] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Listen for BYOK key changes across tabs and cloud sync
  useEffect(() => {
    const onByok = () => setByokTick((t) => t + 1);
    window.addEventListener("leetprime:byok-updated", onByok);
    window.addEventListener("storage", onByok);
    return () => {
      window.removeEventListener("leetprime:byok-updated", onByok);
      window.removeEventListener("storage", onByok);
    };
  }, []);

  const isByok =
    typeof window !== "undefined" && user?.uid
      ? Boolean(
          localStorage.getItem(`prime_ai_${activeModel}_key_${user.uid}`) ||
          localStorage.getItem(`prime_ai_${activeModel}_key`)
        )
      : false;

  // Synchronize chat when user, channel, or storageKey changes
  useEffect(() => {
    // 1. Instantly load local cache for this user + channel
    const local = loadPersistedMessages(storageKey);
    setMessagesRaw(local);

    // 2. If logged in, fetch cloud history from Firestore so chats sync across laptop/phone
    const currentUid = user?.uid;
    const currentDb = db;
    if (!currentUid || !currentDb || !isFirebaseConfigured) return;
    // Capture as non-null for use inside async closure
    const safeUid: string = currentUid;
    const safeDb = currentDb;
    let isCancelled = false;

    async function loadCloudChat() {
      try {
        const chatDocRef = doc(safeDb, "users", safeUid, "aiChats", channel);
        const snap = await getDoc(chatDocRef);
        if (snap.exists() && !isCancelled) {
          const rawCloud = snap.data()?.messages;
          if (Array.isArray(rawCloud)) {
            const validCloud: AiChatMessage[] = rawCloud
              .filter((m: any) => m && (typeof m.content === "string" || m.content))
              .map((m: any) => ({
                id: String(m.id || genId()),
                role: m.role === "model" ? ("model" as const) : ("user" as const),
                content: typeof m.content === "string" ? m.content : String(m.content ?? ""),
                ...(m.proposedPlan ? { proposedPlan: m.proposedPlan } : {}),
                ...(m.error ? { error: Boolean(m.error) } : {}),
                ...(m.model ? { model: m.model } : {}),
              }));

            if (validCloud.length > 0) {
              setMessagesRaw(validCloud);
              persistMessages(storageKey, validCloud);
            }
          }
        }
      } catch (err) {
        console.warn("[Prime AI] Cloud chat fetch warning:", err);
      }
    }

    loadCloudChat();

    // Listen for logout or external chat update
    const onChatUpdated = () => {
      const updated = loadPersistedMessages(storageKey);
      setMessagesRaw(updated);
    };
    window.addEventListener("leetprime:chat-updated", onChatUpdated);

    return () => {
      isCancelled = true;
      window.removeEventListener("leetprime:chat-updated", onChatUpdated);
    };
  }, [user?.uid, storageKey, channel]);

  // Wrapper: set messages AND persist to localStorage + Firestore
  const setMessages = useCallback(
    (updater: AiChatMessage[] | ((prev: AiChatMessage[]) => AiChatMessage[])) => {
      setMessagesRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persistMessages(storageKey, next);

        // Async cloud sync to Firestore (sanitizing undefined fields which Firestore rejects)
        const currentUid = user?.uid;
        const currentDb = db;
        if (currentUid && currentDb && isFirebaseConfigured) {
          const chatDocRef = doc(currentDb, "users", currentUid, "aiChats", channel);
          const sanitizedMessages = next.slice(-60).map((m) => {
            const clean: Record<string, any> = {
              id: m.id || genId(),
              role: m.role === "model" ? "model" : "user",
              content: typeof m.content === "string" ? m.content : String(m.content ?? ""),
            };
            if (m.proposedPlan) clean.proposedPlan = m.proposedPlan;
            if (m.error) clean.error = m.error;
            if (m.model) clean.model = m.model;
            return clean;
          });

          setDoc(
            chatDocRef,
            {
              channel,
              messages: sanitizedMessages,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.warn("[Prime AI] Cloud chat sync warning:", e));
        }

        return next;
      });
    },
    [storageKey, user?.uid, channel]
  );

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

        // Send only non-error messages in history to avoid confusing the AI
        const history = messages
          .filter((m) => !m.error)
          .map((m) => ({ role: m.role, content: m.content }));

        // Retrieve any local BYOK keys as a persistent fallback across server restarts
        let groqKey: string | null = null;
        let geminiKey: string | null = null;
        if (typeof window !== "undefined" && user) {
          groqKey =
            localStorage.getItem(`prime_ai_groq_key_${user.uid}`) ||
            localStorage.getItem("prime_ai_groq_key");
          geminiKey =
            localStorage.getItem(`prime_ai_gemini_key_${user.uid}`) ||
            localStorage.getItem("prime_ai_gemini_key");
        }

        const reqHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        };
        if (groqKey) reqHeaders["x-byok-groq-key"] = groqKey;
        if (geminiKey) reqHeaders["x-byok-gemini-key"] = geminiKey;

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({
            message: text,
            history,
            context: clientContext,
            model: activeModel,
            groqApiKey: groqKey || undefined,
            geminiApiKey: geminiKey || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }

        const replyContent =
          typeof data.reply === "string"
            ? data.reply
            : data.reply
            ? String(data.reply)
            : "I'm sorry, I couldn't generate a response. Please try again.";

        const modelMsg: AiChatMessage = {
          id: genId(),
          role: "model",
          content: replyContent,
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
    [input, loading, messages, user, mode, contextPayload, onMessage, activeModel, setMessages]
  );

  // Clear chat: wipe state + localStorage + Firestore
  const clearChat = useCallback(() => {
    setMessagesRaw([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    if (user?.uid && db && isFirebaseConfigured) {
      const chatDocRef = doc(db, "users", user.uid, "aiChats", channel);
      setDoc(chatDocRef, {
        channel,
        messages: [],
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    setRemainingGemini(null);
    setRemainingGroq(null);
  }, [storageKey, user?.uid, channel]);

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
    isByok,
  };
}
