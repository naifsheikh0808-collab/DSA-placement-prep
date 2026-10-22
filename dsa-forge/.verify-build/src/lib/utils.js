"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.slugify = slugify;
exports.normalizeTitle = normalizeTitle;
exports.normalizeUrl = normalizeUrl;
exports.difficultyColor = difficultyColor;
exports.difficultyBg = difficultyBg;
exports.timeframeLabel = timeframeLabel;
exports.platformLabel = platformLabel;
exports.formatPct = formatPct;
exports.parseTimeframe = parseTimeframe;
exports.detectPlatform = detectPlatform;
exports.extractLeetCodeId = extractLeetCodeId;
exports.patternSlug = patternSlug;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function normalizeTitle(title) {
    return title.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\w\s]/g, "");
}
function normalizeUrl(url) {
    try {
        const u = new URL(url.trim());
        u.search = "";
        u.hash = "";
        let href = u.href.replace(/\/$/, "");
        href = href.replace(/^http:/, "https:");
        return href;
    }
    catch {
        return url.trim().replace(/\/$/, "");
    }
}
function difficultyColor(d) {
    switch (d) {
        case "Easy": return "text-emerald-400";
        case "Medium": return "text-amber-400";
        case "Hard": return "text-rose-400";
    }
}
function difficultyBg(d) {
    switch (d) {
        case "Easy": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        case "Hard": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
}
function timeframeLabel(t) {
    switch (t) {
        case "30d": return "30 Days";
        case "3m": return "3 Months";
        case "6m": return "6 Months";
        case "6m+": return "6+ Months";
        case "all": return "All Time";
    }
}
function platformLabel(p) {
    switch (p) {
        case "leetcode": return "LeetCode";
        case "gfg": return "GeeksForGeeks";
        case "other": return "Other";
    }
}
function formatPct(val) {
    return `${(val * 100).toFixed(1)}%`;
}
function parseTimeframe(raw) {
    const lower = raw.toLowerCase().trim();
    if (lower.includes("30"))
        return "30d";
    if (lower.includes("3 month"))
        return "3m";
    if (lower.includes("6 month"))
        return "6m";
    if (lower.includes("more than") || lower.includes("6+") || lower.includes("6m+"))
        return "6m+";
    return "all";
}
function detectPlatform(url) {
    if (url.includes("leetcode.com"))
        return "leetcode";
    if (url.includes("geeksforgeeks.org"))
        return "gfg";
    return "other";
}
function extractLeetCodeId(url) {
    const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/);
    return m ? m[1] : null;
}
function patternSlug(name) {
    return slugify(name
        .replace(/[\/&]/g, "-")
        .replace(/\s+/g, "-"));
}
