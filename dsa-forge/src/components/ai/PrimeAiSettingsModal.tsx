"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Key, Zap, ExternalLink, CheckCircle2, AlertCircle, Loader2, Trash2, ChevronRight, ShieldCheck, Sparkles, Cpu } from "lucide-react";
import { PrimeAiLogo } from "@/components/ai/PrimeAiLogo";
import { useAuth } from "@/context/auth-context";
import { getIdToken } from "firebase/auth";
import type { PrimeAiModel } from "@/hooks/use-prime-ai";

interface PrimeAiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: PrimeAiModel;
  onModelChange: (model: PrimeAiModel) => void;
  remainingGemini: number | null;
  remainingGroq: number | null;
}

type KeyStatus = "idle" | "loading" | "valid" | "invalid";

const MODEL_INFO = {
  gemini: {
    id: "gemini" as PrimeAiModel,
    name: "Gemini 2.5 Flash",
    provider: "Google AI",
    badge: "⚡",
    description: "Multimodal reasoning & structured DSA guidance",
    color: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    docsUrl: "https://aistudio.google.com/app/apikey",
    docsLabel: "Get Free Key at Google AI Studio",
    keyPrefix: "AIza",
    maxFree: 10,
  },
  groq: {
    id: "groq" as PrimeAiModel,
    name: "Llama 3.3 70B",
    provider: "Groq Cloud",
    badge: "🚀",
    description: "Ultra-fast open-weight model with high-speed generation",
    color: "from-orange-500 to-amber-500",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/40",
    bgColor: "bg-orange-500/10",
    docsUrl: "https://console.groq.com/keys",
    docsLabel: "Get Free Key at Groq Console",
    keyPrefix: "gsk_",
    maxFree: 10,
  },
};

export function PrimeAiSettingsModal({
  isOpen,
  onClose,
  activeModel,
  onModelChange,
  remainingGemini,
  remainingGroq,
}: PrimeAiSettingsModalProps) {
  const { user } = useAuth();

  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<KeyStatus>("idle");
  const [groqKeyStatus, setGroqKeyStatus] = useState<KeyStatus>("idle");
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [groqConfigured, setGroqConfigured] = useState(false);
  const [geminiMsg, setGeminiMsg] = useState("");
  const [groqMsg, setGroqMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"models" | "keys">("models");

  const fetchConfigStatus = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await getIdToken(user, true);
      const res = await fetch("/api/ai/config", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGeminiConfigured(!!data.geminiConfigured);
        setGroqConfigured(!!data.groqConfigured);
      }
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchConfigStatus();
    }
  }, [isOpen, fetchConfigStatus]);

  const handleSaveKey = async (provider: PrimeAiModel) => {
    if (!user) return;
    const key = provider === "gemini" ? geminiKey : groqKey;
    const setStatus = provider === "gemini" ? setGeminiKeyStatus : setGroqKeyStatus;
    const setMsg = provider === "gemini" ? setGeminiMsg : setGroqMsg;
    const setConfigured = provider === "gemini" ? setGeminiConfigured : setGroqConfigured;

    if (!key.trim()) {
      setMsg("Please enter an API key.");
      return;
    }

    setStatus("loading");
    setMsg("");

    try {
      const idToken = await getIdToken(user, true);
      const res = await fetch("/api/ai/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ apiKey: key.trim(), provider, validate: true }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setStatus("valid");
        setConfigured(true);
        setMsg("✓ API key verified & saved! Unlimited queries enabled.");
        if (provider === "gemini") setGeminiKey("");
        else setGroqKey("");
      } else {
        setStatus("invalid");
        setMsg(data.error || "Validation failed. Check your key.");
      }
    } catch {
      setStatus("invalid");
      setMsg("Connection error. Please try again.");
    }
  };

  const handleRemoveKey = async (provider: PrimeAiModel) => {
    if (!user) return;
    const setConfigured = provider === "gemini" ? setGeminiConfigured : setGroqConfigured;
    const setStatus = provider === "gemini" ? setGeminiKeyStatus : setGroqKeyStatus;
    const setMsg = provider === "gemini" ? setGeminiMsg : setGroqMsg;

    try {
      const idToken = await getIdToken(user, true);
      await fetch("/api/ai/config", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ provider }),
      });
      setConfigured(false);
      setStatus("idle");
      setMsg("API key removed. Switched back to Free Tier.");
    } catch {
      // silent
    }
  };

  if (!isOpen) return null;

  const isCurrentModelByok = activeModel === "gemini" ? geminiConfigured : groqConfigured;
  const isAnyByok = geminiConfigured || groqConfigured;

  const remGemini = remainingGemini !== null ? remainingGemini : 10;
  const remGroq = remainingGroq !== null ? remainingGroq : 10;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={onClose}>
      {/* Dimmed Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-lg bg-[#0e0c1a] border border-violet-500/20 rounded-3xl shadow-2xl shadow-violet-950/50 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-gradient-to-r from-violet-950/40 via-[#131127] to-indigo-950/30">
          <div className="flex items-center gap-3">
            <PrimeAiLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-base tracking-tight">Prime AI Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Multi-Model v2
                </span>
              </div>
              <p className="text-white/40 text-xs">Switch models & manage your API quota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── HIGHLY NOTICEABLE ACTIVE TIER STATUS BANNER ── */}
        <div className="p-5 pb-2">
          {isCurrentModelByok ? (
            /* BYOK UNLIMITED STATUS */
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0d231a] to-teal-950/30 border border-emerald-500/30 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Active Plan
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        Personal API Key (BYOK)
                      </span>
                    </div>
                    <p className="text-white text-xs font-semibold mt-0.5">
                      Unlimited Requests Enabled for {MODEL_INFO[activeModel].name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FREE TIER NOTICEABLE STATUS */
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#21160a] to-violet-950/30 border border-amber-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                      Current Active Plan
                    </span>
                    <span className="text-white text-xs font-bold">
                      Standard Free Tier · 20 Requests / Hour
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("keys")}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] border border-white/15 transition-all flex items-center gap-1"
                >
                  <Key className="w-3 h-3 text-amber-300" />
                  Unlock Unlimited
                </button>
              </div>

              {/* Real-time Model Meters */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                {/* Gemini Meter */}
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                  <div className="flex justify-between items-center text-[11px] mb-1.5">
                    <span className="text-blue-300 font-semibold flex items-center gap-1">
                      ⚡ Gemini 2.5
                    </span>
                    {geminiConfigured ? (
                      <span className="text-emerald-400 text-[10px] font-bold">BYOK Unlimited</span>
                    ) : (
                      <span className={`font-bold text-[10px] ${remGemini === 0 ? "text-rose-400" : "text-amber-300"}`}>
                        {remGemini}/10 left
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all rounded-full"
                      style={{ width: geminiConfigured ? "100%" : `${Math.max(5, (remGemini / 10) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Groq Meter */}
                <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                  <div className="flex justify-between items-center text-[11px] mb-1.5">
                    <span className="text-orange-300 font-semibold flex items-center gap-1">
                      🚀 Groq Llama
                    </span>
                    {groqConfigured ? (
                      <span className="text-emerald-400 text-[10px] font-bold">BYOK Unlimited</span>
                    ) : (
                      <span className={`font-bold text-[10px] ${remGroq === 0 ? "text-rose-400" : "text-amber-300"}`}>
                        {remGroq}/10 left
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all rounded-full"
                      style={{ width: groqConfigured ? "100%" : `${Math.max(5, (remGroq / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex px-5 border-b border-white/[0.08] mt-2">
          <button
            onClick={() => setActiveTab("models")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === "models"
                ? "text-violet-400 border-violet-500 bg-violet-500/5"
                : "text-white/40 border-transparent hover:text-white/70"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Switch Active Model
          </button>
          <button
            onClick={() => setActiveTab("keys")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === "keys"
                ? "text-violet-400 border-violet-500 bg-violet-500/5"
                : "text-white/40 border-transparent hover:text-white/70"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            BYOK API Keys {isAnyByok && "•"}
          </button>
        </div>

        {/* ── Tab Content Area ── */}
        <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
          {activeTab === "models" && (
            <div className="space-y-3">
              <p className="text-white/40 text-xs">
                Select your preferred AI engine. You can also toggle this instantly inside the chat box toolbar.
              </p>

              {(["gemini", "groq"] as PrimeAiModel[]).map((model) => {
                const info = MODEL_INFO[model];
                const isActive = activeModel === model;
                const isByok = model === "gemini" ? geminiConfigured : groqConfigured;
                const rem = model === "gemini" ? remGemini : remGroq;

                return (
                  <button
                    key={model}
                    onClick={() => onModelChange(model)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative group ${
                      isActive
                        ? `${info.borderColor} ${info.bgColor} shadow-xl ring-1 ring-white/10`
                        : "border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-base shadow-md flex-shrink-0`}
                      >
                        {info.badge}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-bold">{info.name}</span>
                          <span className="text-white/40 text-[11px]">({info.provider})</span>
                          {isActive && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-violet-500/25 border border-violet-400/40 text-violet-300 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-white/50 text-xs mt-1 leading-relaxed">{info.description}</p>

                        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                          <span className="text-white/40">Access tier:</span>
                          {isByok ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> BYOK Personal Key (Unlimited)
                            </span>
                          ) : (
                            <span className={`font-semibold ${rem === 0 ? "text-rose-400" : "text-amber-300"}`}>
                              Free Tier · {rem}/10 req remaining this hour
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "keys" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-violet-400" />
                <span>
                  <strong>Bring Your Own Key (BYOK):</strong> Paste your personal API key from Google AI Studio or Groq Console to bypass all hourly free limits forever. Keys stay in secure session memory.
                </span>
              </div>

              {(["gemini", "groq"] as PrimeAiModel[]).map((provider) => {
                const info = MODEL_INFO[provider];
                const isConfigured = provider === "gemini" ? geminiConfigured : groqConfigured;
                const keyVal = provider === "gemini" ? geminiKey : groqKey;
                const setKey = provider === "gemini" ? setGeminiKey : setGroqKey;
                const status = provider === "gemini" ? geminiKeyStatus : groqKeyStatus;
                const msg = provider === "gemini" ? geminiMsg : groqMsg;

                return (
                  <div key={provider} className={`rounded-2xl border p-4 space-y-3 ${info.borderColor} ${info.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.badge}</span>
                        <div>
                          <div className="text-white text-xs font-bold">{info.provider} — {info.name}</div>
                          <a
                            href={info.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[10px] ${info.textColor} hover:underline flex items-center gap-1`}
                          >
                            {info.docsLabel} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {isConfigured && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 text-[10px] font-bold">Active BYOK</span>
                        </div>
                      )}
                    </div>

                    {isConfigured ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/40 text-xs font-mono">
                          {info.keyPrefix}••••••••••••••••••••
                        </div>
                        <button
                          onClick={() => handleRemoveKey(provider)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors text-xs font-medium flex items-center gap-1.5"
                          title="Remove key"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={keyVal}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder={`Paste your ${info.provider} API key (${info.keyPrefix}...)...`}
                            className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-colors font-mono"
                          />
                          <button
                            onClick={() => handleSaveKey(provider)}
                            disabled={status === "loading" || !keyVal.trim()}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r ${info.color} text-white disabled:opacity-40 hover:opacity-90 flex items-center gap-1.5 flex-shrink-0 shadow-lg`}
                          >
                            {status === "loading" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            Save
                          </button>
                        </div>

                        {msg && (
                          <div className={`flex items-start gap-1.5 text-xs ${status === "valid" ? "text-emerald-400" : "text-rose-400"}`}>
                            {status === "valid" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            )}
                            {msg}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
