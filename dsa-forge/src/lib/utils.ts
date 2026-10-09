import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Difficulty, Timeframe, Platform } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\w\s]/g, "");
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.search = "";
    u.hash = "";
    let href = u.href.replace(/\/$/, "");
    href = href.replace(/^http:/, "https:");
    return href;
  } catch {
    return url.trim().replace(/\/$/, "");
  }
}

export function difficultyColor(d: Difficulty): string {
  switch (d) {
    case "Easy": return "text-emerald-400";
    case "Medium": return "text-amber-400";
    case "Hard": return "text-rose-400";
  }
}

export function difficultyBg(d: Difficulty): string {
  switch (d) {
    case "Easy": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Hard": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  }
}

export function timeframeLabel(t: Timeframe): string {
  switch (t) {
    case "30d": return "30 Days";
    case "3m": return "3 Months";
    case "6m": return "6 Months";
    case "6m+": return "6+ Months";
    case "all": return "All Time";
  }
}

export function platformLabel(p: Platform): string {
  switch (p) {
    case "leetcode": return "LeetCode";
    case "gfg": return "GeeksForGeeks";
    case "other": return "Other";
  }
}

export function formatPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

export function parseTimeframe(raw: string): Timeframe {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("30")) return "30d";
  if (lower.includes("3 month")) return "3m";
  if (lower.includes("6 month")) return "6m";
  if (lower.includes("more than") || lower.includes("6+") || lower.includes("6m+")) return "6m+";
  return "all";
}

export function detectPlatform(url: string): Platform {
  if (url.includes("leetcode.com")) return "leetcode";
  if (url.includes("geeksforgeeks.org")) return "gfg";
  return "other";
}

export function extractLeetCodeId(url: string): string | null {
  const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/);
  return m ? m[1] : null;
}

export function patternSlug(name: string): string {
  return slugify(name
    .replace(/[\/&]/g, "-")
    .replace(/\s+/g, "-")
  );
}
