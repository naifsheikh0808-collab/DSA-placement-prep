// BYOK key store with disk persistence + in-memory globalThis caching.
// Keys survive dev server restarts (npm run dev) and Next.js HMR reloads.
// The backing file (.byok-keystore.json) is git-ignored and never committed.

import fs from "fs";
import path from "path";

export interface KeyRecord {
  geminiKey?: string;
  groqKey?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __prime_ai_keystore: Map<string, KeyRecord> | undefined;
}

const KEYSTORE_FILE = path.join(process.cwd(), ".byok-keystore.json");

function loadFromDisk(): Map<string, KeyRecord> {
  try {
    if (fs.existsSync(KEYSTORE_FILE)) {
      const data = fs.readFileSync(KEYSTORE_FILE, "utf-8");
      const parsed = JSON.parse(data) as Record<string, KeyRecord>;
      return new Map(Object.entries(parsed));
    }
  } catch (err) {
    console.warn("[ai-keystore] Could not load from disk:", err);
  }
  return new Map<string, KeyRecord>();
}

function saveToDisk(store: Map<string, KeyRecord>) {
  try {
    const obj = Object.fromEntries(store.entries());
    fs.writeFileSync(KEYSTORE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ai-keystore] Could not persist to disk:", err);
  }
}

const keyStore: Map<string, KeyRecord> =
  globalThis.__prime_ai_keystore ?? loadFromDisk();

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
  saveToDisk(keyStore);
}

export function setGroqApiKey(uid: string, key: string): void {
  const existing = keyStore.get(uid) ?? {};
  keyStore.set(uid, { ...existing, groqKey: key });
  saveToDisk(keyStore);
}

export function deleteUserKey(uid: string, provider?: "gemini" | "groq"): void {
  if (!provider) {
    keyStore.delete(uid);
  } else {
    const existing = keyStore.get(uid);
    if (!existing) return;
    if (provider === "gemini") {
      keyStore.set(uid, { ...existing, geminiKey: undefined });
    } else if (provider === "groq") {
      keyStore.set(uid, { ...existing, groqKey: undefined });
    }
  }
  saveToDisk(keyStore);
}

export function hasUserKey(uid: string, provider: "gemini" | "groq"): boolean {
  const existing = keyStore.get(uid);
  if (!existing) return false;
  return provider === "gemini" ? !!existing.geminiKey : !!existing.groqKey;
}
