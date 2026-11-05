// Global in-memory BYOK key store
// Shared across all Next.js API routes (config, chat) using globalThis to prevent
// Webpack module chunk isolation issues in Next.js development and production.

export interface KeyRecord {
  geminiKey?: string;
  groqKey?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __prime_ai_keystore: Map<string, KeyRecord> | undefined;
}

const keyStore: Map<string, KeyRecord> =
  globalThis.__prime_ai_keystore ?? new Map<string, KeyRecord>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prime_ai_keystore = keyStore;
}

export function getUserKeys(uid: string): KeyRecord | undefined {
  return keyStore.get(uid);
}

export function getGeminiApiKey(uid: string): string | undefined {
  return keyStore.get(uid)?.geminiKey;
}

export function getGroqApiKey(uid: string): string | undefined {
  return keyStore.get(uid)?.groqKey;
}

export function setGeminiApiKey(uid: string, key: string): void {
  const existing = keyStore.get(uid) ?? {};
  keyStore.set(uid, { ...existing, geminiKey: key });
}

export function setGroqApiKey(uid: string, key: string): void {
  const existing = keyStore.get(uid) ?? {};
  keyStore.set(uid, { ...existing, groqKey: key });
}

export function deleteUserKey(uid: string, provider?: "gemini" | "groq"): void {
  if (!provider) {
    keyStore.delete(uid);
    return;
  }
  const existing = keyStore.get(uid);
  if (!existing) return;
  if (provider === "gemini") {
    keyStore.set(uid, { ...existing, geminiKey: undefined });
  } else if (provider === "groq") {
    keyStore.set(uid, { ...existing, groqKey: undefined });
  }
}

export function hasUserKey(uid: string, provider: "gemini" | "groq"): boolean {
  const existing = keyStore.get(uid);
  if (!existing) return false;
  return provider === "gemini" ? !!existing.geminiKey : !!existing.groqKey;
}

