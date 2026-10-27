"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Bot, Send, RefreshCw, X, ChevronDown, Lock, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Simple markdown renderer (bold, inline-code, bullets) ─────────────────────
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
        <p key={i} className="font-bold text-white mt-2">
          {line.slice(3)}
        </p>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <p key={i} className="font-extrabold text-white mt-2 text-sm">
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
  // Split on **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-violet-900/50 text-violet-200 text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ── Loading dots ───────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isCollapsed]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(
    async (retryContent?: string) => {
      const content = (retryContent ?? input).trim();
      if (!content || loading) return;
      if (!auth || !user) return;

      const userMsg: Message = { id: genId(), role: "user", content };

      setMessages((prev) => {
        // If retrying, replace last failed message pair
        if (retryContent) {
          const filtered = prev.filter((m) => !m.error);
          return [...filtered, userMsg];
        }
        return [...prev, userMsg];
      });
      setInput("");
      setLoading(true);

      try {
        // Get a fresh Firebase ID token — never send uid directly
        const idToken = await getIdToken(user, /* forceRefresh */ true);

        // Build history (exclude errored messages)
        const history = messages
          .filter((m) => !m.error)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ message: content, history }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }

        const modelMsg: Message = {
          id: genId(),
          role: "model",
          content: data.reply as string,
        };

        setMessages((prev) => [...prev, modelMsg]);
        if (typeof data.remainingRequests === "number") {
          setRemainingRequests(data.remainingRequests);
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
    [input, loading, messages, user]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setRemainingRequests(null);
  };

  // ── Unauthenticated State ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#10131f]/90 via-[#0e1220] to-[#0c0e17] border border-violet-500/20 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Sign in to Use AI Assistant</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
              Google Sign-In is required to access the Gemini-powered DSA coach.
            </p>
          </div>
          {isConfigured ? (
            <Button onClick={signInWithGoogle} className="mt-2">
              Sign in with Google
            </Button>
          ) : (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
              Firebase is not yet configured. Add your keys to .env.local to enable sign-in.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Chat Panel ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#10131f]/90 via-[#0e1220] to-[#0c0e17] border border-violet-500/20 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-white/10 cursor-pointer select-none"
        onClick={() => setIsCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-violet-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">AI Study Coach</span>
              <span className="px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300 text-[10px] font-bold border border-violet-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {remainingRequests !== null
                ? `${remainingRequests} requests remaining this hour`
                : "Ask about DSA patterns, interview strategy & more"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && !isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearChat();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Clear chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              isCollapsed && "-rotate-90"
            )}
          />
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <>
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Ask me anything about DSA</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Patterns · Interview tips · Time complexity · Study plans
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    "Explain Two Pointers pattern",
                    "How to tackle DP problems?",
                    "Tips for FAANG interviews",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        textareaRef.current?.focus();
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-violet-500/25 text-violet-300 bg-violet-600/10 hover:bg-violet-600/20 hover:border-violet-500/40 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 text-xs",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user"
                      ? "bg-violet-600/30 border border-violet-500/40"
                      : "bg-slate-700/60 border border-white/10"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 text-violet-300" />
                  ) : (
                    <Bot className="w-3 h-3 text-slate-300" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 space-y-1",
                    msg.role === "user"
                      ? "bg-violet-600/20 border border-violet-500/30 rounded-tr-sm"
                      : msg.error
                      ? "bg-rose-900/20 border border-rose-500/30 rounded-tl-sm"
                      : "bg-white/[0.04] border border-white/8 rounded-tl-sm"
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="text-violet-100 leading-relaxed">{msg.content}</p>
                  ) : msg.error ? (
                    <div className="space-y-2">
                      <p className="text-rose-300 leading-relaxed">{msg.content}</p>
                      <button
                        onClick={() => {
                          const lastUser = [...messages]
                            .reverse()
                            .find((m) => m.role === "user" && !m.error);
                          if (lastUser) sendMessage(lastUser.content);
                        }}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-200 text-[11px] transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed space-y-0.5">
                      {renderMarkdown(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-700/60 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-slate-300" />
                </div>
                <div className="bg-white/[0.04] border border-white/8 rounded-2xl rounded-tl-sm px-3.5 py-3">
                  <LoadingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 items-end bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2 focus-within:border-violet-500/40 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about patterns, strategies, time complexity…"
                rows={1}
                maxLength={1000}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 resize-none outline-none min-h-[24px] max-h-[120px] leading-relaxed"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={cn(
                  "p-2 rounded-xl transition-all shrink-0",
                  input.trim() && !loading
                    ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/25"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                )}
                title="Send (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 px-1">
              Press Enter to send · Shift+Enter for new line · {20 - (remainingRequests ?? 20)}/20 used this hour
            </p>
          </div>
        </>
      )}
    </div>
  );
}
