/**
 * Static seed data extracted and normalized from:
 *   - DSA_patterns_Cheat_Sheet (EDITED).xlsx  (Workbook B — curated patterns)
 *   - (Pattern wise) leetcode_company_questions.xlsx  (Workbook A — company questions)
 *
 * This file is the canonical in-memory dataset for the MVP.
 * Production: replace with PostgreSQL / Supabase queries.
 *
 * Pattern Authority Order:
 *   1. Curated cheat-sheet  ← highest authority
 *   2. Company workbook specific classification
 *   3. Company workbook generic classification
 *   4. Inferred
 *   5. Uncategorized  ← NEVER means low priority
 */

import type { Pattern, Problem, Company, PlatformStats } from "@/lib/types";
import { slugify } from "@/lib/utils";

// ─── PATTERNS ─────────────────────────────────────────────────────────────────
// Sourced from DSA_patterns_Cheat_Sheet (EDITED).xlsx + Pattern Breakdown sheet
// Merged and deduplicated. Colors chosen for visual distinction.

export const PATTERNS: Pattern[] = [
  {
    id: "two-pointers",
    name: "Two Pointers",
    slug: "two-pointers",
    description:
      "Use two indices moving toward each other or in the same direction to reduce O(n²) solutions to O(n). Ideal for sorted arrays, pair problems, and partitioning.",
    orderIndex: 1,
    color: "#6366f1",
    questionCount: 14,
    companyCoverage: 53,
    difficulty: "core",
    questions: [
      { id: "tp-1", externalId: "167", title: "Pair with Target Sum", slug: "pair-with-target-sum", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/two-sum-ii-input-array-is-sorted"], companyCount: 18, frequency: 0.72, orderIndex: 1, levelTag: "beginner" },
      { id: "tp-2", externalId: "283", title: "Move Zeroes", slug: "move-zeroes", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/move-zeroes", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/move-zeroes"], companyCount: 22, frequency: 0.78, orderIndex: 2, levelTag: "beginner" },
      { id: "tp-3", externalId: "26", title: "Remove Duplicates from Sorted Array", slug: "remove-duplicates-from-sorted-array", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/remove-duplicates-from-sorted-array"], companyCount: 28, frequency: 0.81, orderIndex: 3, levelTag: "beginner" },
      { id: "tp-4", externalId: "977", title: "Squares of a Sorted Array", slug: "squares-of-a-sorted-array", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/squares-of-a-sorted-array", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/squares-of-a-sorted-array"], companyCount: 14, frequency: 0.65, orderIndex: 4, levelTag: "beginner" },
      { id: "tp-5", externalId: "15", title: "3Sum", slug: "3sum", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/3sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/3sum"], companyCount: 87, frequency: 0.92, orderIndex: 5, levelTag: "core" },
      { id: "tp-6", externalId: "16", title: "3Sum Closest", slug: "3sum-closest", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/3sum-closest", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/3sum-closest"], companyCount: 34, frequency: 0.74, orderIndex: 6, levelTag: "core" },
      { id: "tp-7", externalId: "713", title: "Subarray Product Less Than K", slug: "subarray-product-less-than-k", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/subarray-product-less-than-k", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/subarray-product-less-than-k"], companyCount: 19, frequency: 0.67, orderIndex: 7, levelTag: "core" },
      { id: "tp-8", externalId: "75", title: "Sort Colors (Dutch National Flag)", slug: "sort-colors", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/sort-colors", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/sort-colors"], companyCount: 41, frequency: 0.79, orderIndex: 8, levelTag: "core" },
      { id: "tp-9", externalId: "18", title: "4Sum", slug: "4sum", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/4sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/4sum"], companyCount: 22, frequency: 0.68, orderIndex: 9, levelTag: "advanced" },
      { id: "tp-10", externalId: "844", title: "Backspace String Compare", slug: "backspace-string-compare", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/backspace-string-compare", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/backspace-string-compare"], companyCount: 27, frequency: 0.71, orderIndex: 10, levelTag: "core" },
      { id: "tp-11", externalId: "581", title: "Shortest Unsorted Continuous Subarray", slug: "shortest-unsorted-continuous-subarray", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/shortest-unsorted-continuous-subarray", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/shortest-unsorted-continuous-subarray"], companyCount: 18, frequency: 0.64, orderIndex: 11, levelTag: "core" },
      { id: "tp-12", externalId: "11", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/container-with-most-water", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/container-with-most-water"], companyCount: 72, frequency: 0.88, orderIndex: 12, levelTag: "core" },
      { id: "tp-13", externalId: "42", title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/trapping-rain-water", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/trapping-rain-water"], companyCount: 85, frequency: 0.91, orderIndex: 13, levelTag: "advanced" },
      { id: "tp-14", externalId: "80", title: "Remove Duplicates from Sorted Array II", slug: "remove-duplicates-from-sorted-array-ii", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii"], companyCount: 15, frequency: 0.62, orderIndex: 14, levelTag: "beginner" },
    ],
  },
  {
    id: "fast-slow-pointers",
    name: "Fast & Slow Pointers",
    slug: "fast-slow-pointers",
    description:
      "Use two pointers at different speeds (Floyd's algorithm) to detect cycles, find midpoints, and solve linked-list problems efficiently.",
    orderIndex: 2,
    color: "#8b5cf6",
    questionCount: 8,
    companyCoverage: 8,
    difficulty: "core",
    questions: [
      { id: "fsp-1", externalId: "141", title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/linked-list-cycle", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/linked-list-cycle"], companyCount: 54, frequency: 0.87, orderIndex: 1, levelTag: "beginner" },
      { id: "fsp-2", externalId: "142", title: "Linked List Cycle II", slug: "linked-list-cycle-ii", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/linked-list-cycle-ii", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/linked-list-cycle-ii"], companyCount: 31, frequency: 0.74, orderIndex: 2, levelTag: "core" },
      { id: "fsp-3", externalId: "202", title: "Happy Number", slug: "happy-number", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/happy-number", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/happy-number"], companyCount: 27, frequency: 0.71, orderIndex: 3, levelTag: "core" },
      { id: "fsp-4", externalId: "287", title: "Find the Duplicate Number", slug: "find-the-duplicate-number", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/find-the-duplicate-number", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/find-the-duplicate-number"], companyCount: 42, frequency: 0.82, orderIndex: 4, levelTag: "core" },
      { id: "fsp-5", externalId: "876", title: "Middle of the Linked List", slug: "middle-of-the-linked-list", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/middle-of-the-linked-list", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/middle-of-the-linked-list"], companyCount: 23, frequency: 0.69, orderIndex: 5, levelTag: "beginner" },
      { id: "fsp-6", externalId: "234", title: "Palindrome Linked List", slug: "palindrome-linked-list", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/palindrome-linked-list", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/palindrome-linked-list"], companyCount: 35, frequency: 0.76, orderIndex: 6, levelTag: "core" },
      { id: "fsp-7", externalId: "143", title: "Reorder List", slug: "reorder-list", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/reorder-list", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/reorder-list"], companyCount: 28, frequency: 0.72, orderIndex: 7, levelTag: "advanced" },
      { id: "fsp-8", externalId: "457", title: "Circular Array Loop", slug: "circular-array-loop", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/circular-array-loop", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/circular-array-loop"], companyCount: 8, frequency: 0.52, orderIndex: 8, levelTag: "challenge" },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    slug: "sliding-window",
    description:
      "Maintain a window of elements that shrinks or expands based on conditions. Optimal for contiguous subarray/substring problems.",
    orderIndex: 3,
    color: "#0ea5e9",
    questionCount: 12,
    companyCoverage: 74,
    difficulty: "core",
    questions: [
      { id: "sw-1", externalId: "643", title: "Maximum Sum Subarray of Size K", slug: "maximum-sum-subarray-of-size-k", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k"], companyCount: 21, frequency: 0.68, orderIndex: 1, levelTag: "beginner" },
      { id: "sw-2", externalId: "209", title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/minimum-size-subarray-sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/minimum-size-subarray-sum"], companyCount: 32, frequency: 0.74, orderIndex: 2, levelTag: "beginner" },
      { id: "sw-3", externalId: "340", title: "Longest Substring with K Distinct Characters", slug: "longest-substring-with-k-distinct-characters", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters"], companyCount: 28, frequency: 0.71, orderIndex: 3, levelTag: "core" },
      { id: "sw-4", externalId: "3", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/longest-substring-without-repeating-characters"], companyCount: 112, frequency: 0.96, orderIndex: 4, levelTag: "core" },
      { id: "sw-5", externalId: "567", title: "Permutation in String", slug: "permutation-in-string", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/permutation-in-string", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/permutation-in-string"], companyCount: 37, frequency: 0.78, orderIndex: 5, levelTag: "core" },
      { id: "sw-6", externalId: "438", title: "Find All Anagrams in a String", slug: "find-all-anagrams-in-a-string", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/find-all-anagrams-in-a-string", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/find-all-anagrams-in-a-string"], companyCount: 29, frequency: 0.73, orderIndex: 6, levelTag: "core" },
      { id: "sw-7", externalId: "76", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/minimum-window-substring", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/minimum-window-substring"], companyCount: 68, frequency: 0.89, orderIndex: 7, levelTag: "advanced" },
      { id: "sw-8", externalId: "239", title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/sliding-window-maximum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/sliding-window-maximum"], companyCount: 54, frequency: 0.86, orderIndex: 8, levelTag: "advanced" },
      { id: "sw-9", externalId: "424", title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/longest-repeating-character-replacement", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/longest-repeating-character-replacement"], companyCount: 33, frequency: 0.76, orderIndex: 9, levelTag: "core" },
      { id: "sw-10", externalId: "1004", title: "Max Consecutive Ones III", slug: "max-consecutive-ones-iii", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/max-consecutive-ones-iii", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/max-consecutive-ones-iii"], companyCount: 25, frequency: 0.70, orderIndex: 10, levelTag: "core" },
      { id: "sw-11", externalId: "930", title: "Binary Subarrays With Sum", slug: "binary-subarrays-with-sum", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/binary-subarrays-with-sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/binary-subarrays-with-sum"], companyCount: 14, frequency: 0.62, orderIndex: 11, levelTag: "advanced" },
      { id: "sw-12", externalId: "992", title: "Subarrays with K Different Integers", slug: "subarrays-with-k-different-integers", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/subarrays-with-k-different-integers", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/subarrays-with-k-different-integers"], companyCount: 19, frequency: 0.65, orderIndex: 12, levelTag: "challenge" },
    ],
  },
  {
    id: "kadanes-algorithm",
    name: "Kadane's Algorithm",
    slug: "kadanes-algorithm",
    description:
      "Dynamic programming for maximum subarray sum. Works in O(n) time by tracking local and global maximums.",
    orderIndex: 4,
    color: "#f59e0b",
    questionCount: 12,
    companyCoverage: 12,
    difficulty: "core",
    questions: [
      { id: "ka-1", externalId: "53", title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/maximum-subarray", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/maximum-subarray"], companyCount: 97, frequency: 0.94, orderIndex: 1, levelTag: "core" },
      { id: "ka-2", externalId: "152", title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/maximum-product-subarray", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/maximum-product-subarray"], companyCount: 62, frequency: 0.87, orderIndex: 2, levelTag: "core" },
      { id: "ka-3", externalId: "918", title: "Maximum Sum Circular Subarray", slug: "maximum-sum-circular-subarray", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/maximum-sum-circular-subarray", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/maximum-sum-circular-subarray"], companyCount: 24, frequency: 0.69, orderIndex: 3, levelTag: "advanced" },
      { id: "ka-4", externalId: "1749", title: "Maximum Absolute Sum of Any Subarray", slug: "maximum-absolute-sum-of-any-subarray", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray"], companyCount: 12, frequency: 0.58, orderIndex: 4, levelTag: "advanced" },
    ],
  },
  {
    id: "prefix-sum",
    name: "Prefix Sum",
    slug: "prefix-sum",
    description:
      "Precompute cumulative sums to answer range-sum queries in O(1). Essential for subarray sum problems.",
    orderIndex: 5,
    color: "#10b981",
    questionCount: 7,
    companyCoverage: 20,
    difficulty: "beginner",
    questions: [
      { id: "ps-1", externalId: "303", title: "Range Sum Query - Immutable", slug: "range-sum-query-immutable", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/range-sum-query-immutable", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/range-sum-query-immutable"], companyCount: 18, frequency: 0.65, orderIndex: 1, levelTag: "beginner" },
      { id: "ps-2", externalId: "560", title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/subarray-sum-equals-k", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/subarray-sum-equals-k"], companyCount: 58, frequency: 0.88, orderIndex: 2, levelTag: "core" },
      { id: "ps-3", externalId: "1480", title: "Running Sum of 1d Array", slug: "running-sum-of-1d-array", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/running-sum-of-1d-array", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/running-sum-of-1d-array"], companyCount: 12, frequency: 0.60, orderIndex: 3, levelTag: "beginner" },
      { id: "ps-4", externalId: "724", title: "Find Pivot Index", slug: "find-pivot-index", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/find-pivot-index", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/find-pivot-index"], companyCount: 19, frequency: 0.67, orderIndex: 4, levelTag: "beginner" },
      { id: "ps-5", externalId: "974", title: "Subarray Sums Divisible by K", slug: "subarray-sums-divisible-by-k", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/subarray-sums-divisible-by-k", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/subarray-sums-divisible-by-k"], companyCount: 26, frequency: 0.71, orderIndex: 5, levelTag: "core" },
    ],
  },
  {
    id: "merge-intervals",
    name: "Merge Intervals",
    slug: "merge-intervals",
    description:
      "Sort and merge overlapping intervals. Used in scheduling, calendar overlap, and range-based problems.",
    orderIndex: 6,
    color: "#ef4444",
    questionCount: 7,
    companyCoverage: 27,
    difficulty: "core",
    questions: [
      { id: "mi-1", externalId: "56", title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/merge-intervals", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/merge-intervals"], companyCount: 111, frequency: 0.96, orderIndex: 1, levelTag: "core" },
      { id: "mi-2", externalId: "57", title: "Insert Interval", slug: "insert-interval", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/insert-interval", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/insert-interval"], companyCount: 52, frequency: 0.84, orderIndex: 2, levelTag: "core" },
      { id: "mi-3", externalId: "452", title: "Minimum Number of Arrows to Burst Balloons", slug: "minimum-number-of-arrows-to-burst-balloons", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons"], companyCount: 23, frequency: 0.68, orderIndex: 3, levelTag: "core" },
      { id: "mi-4", externalId: "435", title: "Non-overlapping Intervals", slug: "non-overlapping-intervals", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/non-overlapping-intervals", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/non-overlapping-intervals"], companyCount: 31, frequency: 0.74, orderIndex: 4, levelTag: "core" },
      { id: "mi-5", externalId: "252", title: "Meeting Rooms", slug: "meeting-rooms", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/meeting-rooms", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/meeting-rooms"], companyCount: 28, frequency: 0.72, orderIndex: 5, levelTag: "beginner" },
      { id: "mi-6", externalId: "253", title: "Meeting Rooms II", slug: "meeting-rooms-ii", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/meeting-rooms-ii", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/meeting-rooms-ii"], companyCount: 47, frequency: 0.83, orderIndex: 6, levelTag: "advanced" },
      { id: "mi-7", externalId: "1288", title: "Remove Covered Intervals", slug: "remove-covered-intervals", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/remove-covered-intervals", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/remove-covered-intervals"], companyCount: 15, frequency: 0.60, orderIndex: 7, levelTag: "advanced" },
    ],
  },
  {
    id: "in-place-linked-list-reversal",
    name: "In-place Linked List Reversal",
    slug: "in-place-linked-list-reversal",
    description:
      "Reverse linked lists or parts of them in-place without extra space. Fundamental for linked-list manipulation.",
    orderIndex: 7,
    color: "#ec4899",
    questionCount: 6,
    companyCoverage: 8,
    difficulty: "core",
    questions: [
      { id: "ll-1", externalId: "206", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/reverse-linked-list", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/reverse-linked-list"], companyCount: 82, frequency: 0.92, orderIndex: 1, levelTag: "beginner" },
      { id: "ll-2", externalId: "92", title: "Reverse Linked List II", slug: "reverse-linked-list-ii", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/reverse-linked-list-ii", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/reverse-linked-list-ii"], companyCount: 38, frequency: 0.78, orderIndex: 2, levelTag: "core" },
      { id: "ll-3", externalId: "25", title: "Reverse Nodes in k-Group", slug: "reverse-nodes-in-k-group", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/reverse-nodes-in-k-group", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/reverse-nodes-in-k-group"], companyCount: 51, frequency: 0.85, orderIndex: 3, levelTag: "advanced" },
      { id: "ll-4", externalId: "24", title: "Swap Nodes in Pairs", slug: "swap-nodes-in-pairs", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/swap-nodes-in-pairs", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/swap-nodes-in-pairs"], companyCount: 28, frequency: 0.71, orderIndex: 4, levelTag: "core" },
    ],
  },
  {
    id: "stack",
    name: "Stack",
    slug: "stack",
    description:
      "LIFO data structure for matching brackets, expression evaluation, monotonic sequences, and backtracking problems.",
    orderIndex: 8,
    color: "#f97316",
    questionCount: 9,
    companyCoverage: 37,
    difficulty: "core",
    questions: [
      { id: "st-1", externalId: "20", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/valid-parentheses", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/valid-parentheses"], companyCount: 113, frequency: 0.97, orderIndex: 1, levelTag: "beginner" },
      { id: "st-2", externalId: "155", title: "Min Stack", slug: "min-stack", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/min-stack", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/min-stack"], companyCount: 71, frequency: 0.89, orderIndex: 2, levelTag: "beginner" },
      { id: "st-3", externalId: "232", title: "Implement Queue using Stacks", slug: "implement-queue-using-stacks", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/implement-queue-using-stacks", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/implement-queue-using-stacks"], companyCount: 32, frequency: 0.74, orderIndex: 3, levelTag: "beginner" },
      { id: "st-4", externalId: "739", title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/daily-temperatures", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/daily-temperatures"], companyCount: 55, frequency: 0.86, orderIndex: 4, levelTag: "core" },
      { id: "st-5", externalId: "84", title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/largest-rectangle-in-histogram"], companyCount: 47, frequency: 0.83, orderIndex: 5, levelTag: "advanced" },
      { id: "st-6", externalId: "394", title: "Decode String", slug: "decode-string", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/decode-string", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/decode-string"], companyCount: 42, frequency: 0.81, orderIndex: 6, levelTag: "core" },
      { id: "st-7", externalId: "150", title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/evaluate-reverse-polish-notation", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/evaluate-reverse-polish-notation"], companyCount: 29, frequency: 0.73, orderIndex: 7, levelTag: "core" },
      { id: "st-8", externalId: "901", title: "Online Stock Span", slug: "online-stock-span", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/online-stock-span", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/online-stock-span"], companyCount: 22, frequency: 0.68, orderIndex: 8, levelTag: "advanced" },
    ],
  },
  {
    id: "hash-maps",
    name: "Hash Maps / Hash Sets",
    slug: "hash-maps",
    description:
      "Use hash maps for O(1) lookups, counting, grouping, and complement searches. Foundation of most array and string problems.",
    orderIndex: 9,
    color: "#14b8a6",
    questionCount: 27,
    companyCoverage: 126,
    difficulty: "beginner",
    questions: [
      { id: "hm-1", externalId: "1", title: "Two Sum", slug: "two-sum", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/two-sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/two-sum"], companyCount: 126, frequency: 0.99, orderIndex: 1, levelTag: "beginner" },
      { id: "hm-2", externalId: "49", title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/group-anagrams", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/group-anagrams"], companyCount: 83, frequency: 0.91, orderIndex: 2, levelTag: "core" },
      { id: "hm-3", externalId: "128", title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/longest-consecutive-sequence", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/longest-consecutive-sequence"], companyCount: 74, frequency: 0.89, orderIndex: 3, levelTag: "core" },
      { id: "hm-4", externalId: "217", title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/contains-duplicate", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/contains-duplicate"], companyCount: 61, frequency: 0.87, orderIndex: 4, levelTag: "beginner" },
      { id: "hm-5", externalId: "242", title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/valid-anagram", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/valid-anagram"], companyCount: 54, frequency: 0.85, orderIndex: 5, levelTag: "beginner" },
      { id: "hm-6", externalId: "347", title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/top-k-frequent-elements", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/top-k-frequent-elements"], companyCount: 68, frequency: 0.88, orderIndex: 6, levelTag: "core" },
      { id: "hm-7", externalId: "146", title: "LRU Cache", slug: "lru-cache", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/lru-cache", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/lru-cache"], companyCount: 119, frequency: 0.97, orderIndex: 7, levelTag: "advanced" },
    ],
  },
  {
    id: "binary-search",
    name: "Binary Search",
    slug: "binary-search",
    description:
      "Divide the search space in half each step. Works on sorted arrays and monotonic functions. O(log n) time.",
    orderIndex: 10,
    color: "#3b82f6",
    questionCount: 22,
    companyCoverage: 22,
    difficulty: "core",
    questions: [
      { id: "bs-1", externalId: "704", title: "Binary Search", slug: "binary-search", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/binary-search", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/binary-search"], companyCount: 34, frequency: 0.75, orderIndex: 1, levelTag: "beginner" },
      { id: "bs-2", externalId: "33", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/search-in-rotated-sorted-array"], companyCount: 88, frequency: 0.92, orderIndex: 2, levelTag: "core" },
      { id: "bs-3", externalId: "153", title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/find-minimum-in-rotated-sorted-array"], companyCount: 61, frequency: 0.86, orderIndex: 3, levelTag: "core" },
      { id: "bs-4", externalId: "74", title: "Search a 2D Matrix", slug: "search-a-2d-matrix", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/search-a-2d-matrix", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/search-a-2d-matrix"], companyCount: 44, frequency: 0.81, orderIndex: 4, levelTag: "core" },
      { id: "bs-5", externalId: "4", title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/median-of-two-sorted-arrays"], companyCount: 71, frequency: 0.89, orderIndex: 5, levelTag: "challenge" },
    ],
  },
  {
    id: "heap-priority-queue",
    name: "Heap / Priority Queue",
    slug: "heap-priority-queue",
    description:
      "Use min/max heaps for top-K problems, scheduling, and streaming data. O(log n) insertion and extraction.",
    orderIndex: 11,
    color: "#a855f7",
    questionCount: 30,
    companyCoverage: 30,
    difficulty: "core",
    questions: [
      { id: "hp-1", externalId: "215", title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/kth-largest-element-in-an-array"], companyCount: 89, frequency: 0.93, orderIndex: 1, levelTag: "core" },
      { id: "hp-2", externalId: "23", title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/merge-k-sorted-lists", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/merge-k-sorted-lists"], companyCount: 76, frequency: 0.90, orderIndex: 2, levelTag: "advanced" },
      { id: "hp-3", externalId: "295", title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/find-median-from-data-stream", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/find-median-from-data-stream"], companyCount: 63, frequency: 0.87, orderIndex: 3, levelTag: "challenge" },
      { id: "hp-4", externalId: "621", title: "Task Scheduler", slug: "task-scheduler", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/task-scheduler", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/task-scheduler"], companyCount: 47, frequency: 0.82, orderIndex: 4, levelTag: "advanced" },
    ],
  },
  {
    id: "backtracking",
    name: "Backtracking",
    slug: "backtracking",
    description:
      "Explore all possibilities recursively and prune invalid paths. Used for permutations, combinations, subsets, and constraint-satisfaction problems.",
    orderIndex: 12,
    color: "#84cc16",
    questionCount: 61,
    companyCoverage: 61,
    difficulty: "advanced",
    questions: [
      { id: "bt-1", externalId: "78", title: "Subsets", slug: "subsets", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/subsets", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/subsets"], companyCount: 62, frequency: 0.87, orderIndex: 1, levelTag: "core" },
      { id: "bt-2", externalId: "46", title: "Permutations", slug: "permutations", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/permutations", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/permutations"], companyCount: 71, frequency: 0.89, orderIndex: 2, levelTag: "core" },
      { id: "bt-3", externalId: "77", title: "Combinations", slug: "combinations", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/combinations", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/combinations"], companyCount: 34, frequency: 0.76, orderIndex: 3, levelTag: "core" },
      { id: "bt-4", externalId: "39", title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/combination-sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/combination-sum"], companyCount: 58, frequency: 0.86, orderIndex: 4, levelTag: "core" },
      { id: "bt-5", externalId: "51", title: "N-Queens", slug: "n-queens", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/n-queens", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/n-queens"], companyCount: 42, frequency: 0.80, orderIndex: 5, levelTag: "advanced" },
      { id: "bt-6", externalId: "37", title: "Sudoku Solver", slug: "sudoku-solver", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/sudoku-solver", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/sudoku-solver"], companyCount: 28, frequency: 0.72, orderIndex: 6, levelTag: "challenge" },
    ],
  },
  {
    id: "tree-pattern",
    name: "Trees",
    slug: "tree-pattern",
    description:
      "Binary trees, BST operations, DFS/BFS traversals, LCA, and path problems. One of the most common interview topics.",
    orderIndex: 13,
    color: "#22c55e",
    questionCount: 184,
    companyCoverage: 184,
    difficulty: "mixed",
    questions: [
      { id: "tr-1", externalId: "104", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/maximum-depth-of-binary-tree"], companyCount: 78, frequency: 0.90, orderIndex: 1, levelTag: "beginner" },
      { id: "tr-2", externalId: "226", title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/invert-binary-tree", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/invert-binary-tree"], companyCount: 65, frequency: 0.87, orderIndex: 2, levelTag: "beginner" },
      { id: "tr-3", externalId: "102", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/binary-tree-level-order-traversal"], companyCount: 91, frequency: 0.93, orderIndex: 3, levelTag: "core" },
      { id: "tr-4", externalId: "236", title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree"], companyCount: 87, frequency: 0.92, orderIndex: 4, levelTag: "core" },
      { id: "tr-5", externalId: "124", title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/binary-tree-maximum-path-sum"], companyCount: 72, frequency: 0.89, orderIndex: 5, levelTag: "advanced" },
      { id: "tr-6", externalId: "297", title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/serialize-and-deserialize-binary-tree"], companyCount: 58, frequency: 0.86, orderIndex: 6, levelTag: "challenge" },
    ],
  },
  {
    id: "graphs",
    name: "Graph DFS/BFS",
    slug: "graphs",
    description:
      "Traverse graphs depth-first or breadth-first for connectivity, shortest path, islands, and component problems.",
    orderIndex: 14,
    color: "#64748b",
    questionCount: 59,
    companyCoverage: 59,
    difficulty: "advanced",
    questions: [
      { id: "gr-1", externalId: "200", title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/number-of-islands", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/number-of-islands"], companyCount: 98, frequency: 0.95, orderIndex: 1, levelTag: "core" },
      { id: "gr-2", externalId: "133", title: "Clone Graph", slug: "clone-graph", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/clone-graph", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/clone-graph"], companyCount: 61, frequency: 0.86, orderIndex: 2, levelTag: "core" },
      { id: "gr-3", externalId: "207", title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/course-schedule", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/course-schedule"], companyCount: 74, frequency: 0.89, orderIndex: 3, levelTag: "core" },
      { id: "gr-4", externalId: "994", title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/rotting-oranges", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/rotting-oranges"], companyCount: 52, frequency: 0.84, orderIndex: 4, levelTag: "core" },
      { id: "gr-5", externalId: "127", title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/word-ladder", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/word-ladder"], companyCount: 48, frequency: 0.82, orderIndex: 5, levelTag: "advanced" },
    ],
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    slug: "dynamic-programming",
    description:
      "Break problems into overlapping subproblems and cache results. Covers 1D DP, 2D DP, knapsack, LCS, and interval DP.",
    orderIndex: 15,
    color: "#dc2626",
    questionCount: 100,
    companyCoverage: 100,
    difficulty: "advanced",
    questions: [
      { id: "dp-1", externalId: "70", title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", canonicalUrl: "https://leetcode.com/problems/climbing-stairs", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/climbing-stairs"], companyCount: 67, frequency: 0.88, orderIndex: 1, levelTag: "beginner" },
      { id: "dp-2", externalId: "322", title: "Coin Change", slug: "coin-change", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/coin-change", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/coin-change"], companyCount: 82, frequency: 0.91, orderIndex: 2, levelTag: "core" },
      { id: "dp-3", externalId: "1143", title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/longest-common-subsequence", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/longest-common-subsequence"], companyCount: 64, frequency: 0.87, orderIndex: 3, levelTag: "core" },
      { id: "dp-4", externalId: "416", title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/partition-equal-subset-sum", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/partition-equal-subset-sum"], companyCount: 51, frequency: 0.84, orderIndex: 4, levelTag: "core" },
      { id: "dp-5", externalId: "72", title: "Edit Distance", slug: "edit-distance", difficulty: "Medium", canonicalUrl: "https://leetcode.com/problems/edit-distance", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/edit-distance"], companyCount: 58, frequency: 0.85, orderIndex: 5, levelTag: "advanced" },
      { id: "dp-6", externalId: "312", title: "Burst Balloons", slug: "burst-balloons", difficulty: "Hard", canonicalUrl: "https://leetcode.com/problems/burst-balloons", platform: "leetcode", solved: false, links: ["https://leetcode.com/problems/burst-balloons"], companyCount: 33, frequency: 0.76, orderIndex: 6, levelTag: "challenge" },
    ],
  },
];

import generatedData from "./generated_dataset.json";

// ─── TOP COMPANIES (from Problem Summary sheet) ────────────────────────────────

export const TOP_COMPANIES: Company[] = generatedData.companies as Company[];

// ─── TOP PROBLEMS (by company count, from Problem Summary sheet) ───────────────

export const TOP_PROBLEMS: Problem[] = generatedData.problems as Problem[];

// ─── STATS ─────────────────────────────────────────────────────────────────────

export const PLATFORM_STATS: PlatformStats = {
  totalProblems: TOP_PROBLEMS.length,
  totalCompanies: TOP_COMPANIES.length,
  totalPatterns: PATTERNS.length,
  curatedPatternProblems: PATTERNS.reduce((acc, p) => acc + p.questions.length, 0),
};

