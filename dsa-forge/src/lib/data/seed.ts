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
    "id": "two-pointers",
    "name": "Two Pointers",
    "slug": "two-pointers",
    "tier": "core",
    "description": "Solve pair, palindrome, and sorting problems twice as fast by searching from both ends instead of nested loops.",
    "orderIndex": 1,
    "color": "#6366f1",
    "questionCount": 16,
    "companyCoverage": 53,
    "difficulty": "core",
    "questions": [
      {
        "id": "tp-17",
        "externalId": "125",
        "title": "Valid Palindrome",
        "slug": "valid-palindrome",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/valid-palindrome",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/valid-palindrome"
        ],
        "companyCount": 39,
        "frequency": 97.5,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Opposite Ends"
      },
      {
        "id": "tp-1",
        "externalId": "167",
        "title": "Pair with Target Sum",
        "slug": "pair-with-target-sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted"
        ],
        "companyCount": 18,
        "frequency": 0.72,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Opposite Ends"
      },
      {
        "id": "tp-2",
        "externalId": "283",
        "title": "Move Zeroes",
        "slug": "move-zeroes",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/move-zeroes",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/move-zeroes"
        ],
        "companyCount": 22,
        "frequency": 0.78,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Partitioning"
      },
      {
        "id": "tp-3",
        "externalId": "26",
        "title": "Remove Duplicates from Sorted Array",
        "slug": "remove-duplicates-from-sorted-array",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/remove-duplicates-from-sorted-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-duplicates-from-sorted-array"
        ],
        "companyCount": 28,
        "frequency": 0.81,
        "orderIndex": 4,
        "levelTag": "beginner",
        "subPattern": "Same Direction"
      },
      {
        "id": "tp-15",
        "externalId": "83",
        "title": "Remove Duplicates from Sorted List",
        "slug": "remove-duplicates-from-sorted-list",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/remove-duplicates-from-sorted-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
          "https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/",
          "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 5,
        "levelTag": "beginner",
        "subPattern": "Linked List Pointer"
      },
      {
        "id": "tp-4",
        "externalId": "977",
        "title": "Squares of a Sorted Array",
        "slug": "squares-of-a-sorted-array",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/squares-of-a-sorted-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/squares-of-a-sorted-array"
        ],
        "companyCount": 14,
        "frequency": 0.65,
        "orderIndex": 6,
        "levelTag": "beginner",
        "subPattern": "Opposite Ends"
      },
      {
        "id": "tp-14",
        "externalId": "80",
        "title": "Remove Duplicates from Sorted Array II",
        "slug": "remove-duplicates-from-sorted-array-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii"
        ],
        "companyCount": 15,
        "frequency": 0.62,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Same Direction"
      },
      {
        "id": "tp-8",
        "externalId": "75",
        "title": "Sort Colors (Dutch National Flag)",
        "slug": "sort-colors",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/sort-colors",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sort-colors"
        ],
        "companyCount": 41,
        "frequency": 0.79,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "3-Way Partition"
      },
      {
        "id": "tp-5",
        "externalId": "15",
        "title": "3Sum",
        "slug": "3sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/3sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/3sum"
        ],
        "companyCount": 87,
        "frequency": 0.92,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "K-Sum Family"
      },
      {
        "id": "tp-6",
        "externalId": "16",
        "title": "3Sum Closest",
        "slug": "3sum-closest",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/3sum-closest",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/3sum-closest"
        ],
        "companyCount": 34,
        "frequency": 0.74,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "K-Sum Family"
      },
      {
        "id": "tp-16",
        "externalId": "3977",
        "title": "Triplets with Smaller Sum",
        "slug": "count-triplets-with-sum-smaller-than-x5549",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 11,
        "levelTag": "core",
        "subPattern": "K-Sum Family"
      },
      {
        "id": "tp-12",
        "externalId": "11",
        "title": "Container With Most Water",
        "slug": "container-with-most-water",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/container-with-most-water",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/container-with-most-water"
        ],
        "companyCount": 72,
        "frequency": 0.88,
        "orderIndex": 12,
        "levelTag": "core",
        "subPattern": "Opposite Ends"
      },
      {
        "id": "tp-9",
        "externalId": "18",
        "title": "4Sum",
        "slug": "4sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/4sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/4sum"
        ],
        "companyCount": 22,
        "frequency": 0.68,
        "orderIndex": 13,
        "levelTag": "advanced",
        "subPattern": "K-Sum Family"
      },
      {
        "id": "tp-10",
        "externalId": "844",
        "title": "Backspace String Compare",
        "slug": "backspace-string-compare",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/backspace-string-compare",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/backspace-string-compare"
        ],
        "companyCount": 27,
        "frequency": 0.71,
        "orderIndex": 14,
        "levelTag": "advanced",
        "subPattern": "Reverse Scan / Stack"
      },
      {
        "id": "tp-11",
        "externalId": "581",
        "title": "Shortest Unsorted Continuous Subarray",
        "slug": "shortest-unsorted-continuous-subarray",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/shortest-unsorted-continuous-subarray",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/shortest-unsorted-continuous-subarray"
        ],
        "companyCount": 18,
        "frequency": 0.64,
        "orderIndex": 15,
        "levelTag": "advanced",
        "subPattern": "Boundary Shrink"
      },
      {
        "id": "tp-13",
        "externalId": "42",
        "title": "Trapping Rain Water",
        "slug": "trapping-rain-water",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/trapping-rain-water",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/trapping-rain-water"
        ],
        "companyCount": 85,
        "frequency": 0.91,
        "orderIndex": 16,
        "levelTag": "challenge",
        "subPattern": "Two-Pointer Invariant"
      }
    ]
  },
{
    "id": "fast-slow-pointers",
    "name": "Fast & Slow Pointers",
    "slug": "fast-slow-pointers",
    "tier": "core",
    "description": "The famous 'tortoise and hare' trick to spot infinite loops and find middle elements in linked lists with zero extra memory.",
    "orderIndex": 2,
    "color": "#8b5cf6",
    "questionCount": 8,
    "companyCoverage": 8,
    "difficulty": "core",
    "questions": [
      {
        "id": "fsp-5",
        "externalId": "876",
        "title": "Middle of the Linked List",
        "slug": "middle-of-the-linked-list",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/middle-of-the-linked-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/middle-of-the-linked-list"
        ],
        "companyCount": 23,
        "frequency": 0.69,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Tortoise & Hare"
      },
      {
        "id": "fsp-1",
        "externalId": "141",
        "title": "Linked List Cycle",
        "slug": "linked-list-cycle",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/linked-list-cycle",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/linked-list-cycle"
        ],
        "companyCount": 54,
        "frequency": 0.87,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Cycle Detection"
      },
      {
        "id": "fsp-3",
        "externalId": "202",
        "title": "Happy Number",
        "slug": "happy-number",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/happy-number",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/happy-number"
        ],
        "companyCount": 27,
        "frequency": 0.71,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Implicit Cycle"
      },
      {
        "id": "fsp-2",
        "externalId": "142",
        "title": "Linked List Cycle II",
        "slug": "linked-list-cycle-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/linked-list-cycle-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/linked-list-cycle-ii"
        ],
        "companyCount": 31,
        "frequency": 0.74,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Cycle Entry"
      },
      {
        "id": "fsp-4",
        "externalId": "287",
        "title": "Find the Duplicate Number",
        "slug": "find-the-duplicate-number",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-the-duplicate-number",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-the-duplicate-number"
        ],
        "companyCount": 42,
        "frequency": 0.82,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Array Floyd II"
      },
      {
        "id": "fsp-6",
        "externalId": "234",
        "title": "Palindrome Linked List",
        "slug": "palindrome-linked-list",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/palindrome-linked-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/palindrome-linked-list"
        ],
        "companyCount": 35,
        "frequency": 0.76,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Middle + Reverse"
      },
      {
        "id": "fsp-7",
        "externalId": "143",
        "title": "Reorder List",
        "slug": "reorder-list",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/reorder-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/reorder-list"
        ],
        "companyCount": 28,
        "frequency": 0.72,
        "orderIndex": 7,
        "levelTag": "advanced",
        "subPattern": "Middle + Merge"
      },
      {
        "id": "fsp-8",
        "externalId": "457",
        "title": "Circular Array Loop",
        "slug": "circular-array-loop",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/circular-array-loop",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/circular-array-loop"
        ],
        "companyCount": 8,
        "frequency": 0.52,
        "orderIndex": 8,
        "levelTag": "challenge",
        "subPattern": "Multi-Cycle Check"
      }
    ]
  },
{
    "id": "sliding-window",
    "name": "Sliding Window",
    "slug": "sliding-window",
    "tier": "core",
    "description": "Track sub-arrays and strings with an expanding and shrinking window — perfect for finding longest, shortest, or target sums effortlessly.",
    "orderIndex": 3,
    "color": "#0ea5e9",
    "questionCount": 15,
    "companyCoverage": 74,
    "difficulty": "core",
    "questions": [
      {
        "id": "sw-1",
        "externalId": "643",
        "title": "Maximum Sum Subarray of Size K",
        "slug": "maximum-sum-subarray-of-size-k",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k"
        ],
        "companyCount": 21,
        "frequency": 0.68,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Fixed Window"
      },
      {
        "id": "sw-2",
        "externalId": "209",
        "title": "Minimum Size Subarray Sum",
        "slug": "minimum-size-subarray-sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/minimum-size-subarray-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-size-subarray-sum"
        ],
        "companyCount": 32,
        "frequency": 0.74,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Variable Window"
      },
      {
        "id": "sw-13",
        "externalId": "904",
        "title": "Fruit Into Baskets",
        "slug": "fruit-into-baskets",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/fruit-into-baskets",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/fruit-into-baskets/"
        ],
        "companyCount": 11,
        "frequency": 27.5,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "At Most K Distinct"
      },
      {
        "id": "sw-3",
        "externalId": "340",
        "title": "Longest Substring with K Distinct Characters",
        "slug": "longest-substring-with-k-distinct-characters",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters"
        ],
        "companyCount": 28,
        "frequency": 0.71,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "At Most K Distinct"
      },
      {
        "id": "sw-4",
        "externalId": "3",
        "title": "Longest Substring Without Repeating Characters",
        "slug": "longest-substring-without-repeating-characters",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-substring-without-repeating-characters",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-substring-without-repeating-characters"
        ],
        "companyCount": 112,
        "frequency": 0.96,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Unique Window"
      },
      {
        "id": "sw-10",
        "externalId": "1004",
        "title": "Max Consecutive Ones III",
        "slug": "max-consecutive-ones-iii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/max-consecutive-ones-iii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/max-consecutive-ones-iii"
        ],
        "companyCount": 25,
        "frequency": 0.7,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Flip Budget"
      },
      {
        "id": "sw-9",
        "externalId": "424",
        "title": "Longest Repeating Character Replacement",
        "slug": "longest-repeating-character-replacement",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-repeating-character-replacement",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-repeating-character-replacement"
        ],
        "companyCount": 33,
        "frequency": 0.76,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Flip Budget"
      },
      {
        "id": "sw-15",
        "externalId": "713",
        "title": "Subarray Product Less Than K",
        "slug": "subarray-product-less-than-k",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/subarray-product-less-than-k",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subarray-product-less-than-k"
        ],
        "companyCount": 19,
        "frequency": 0.67,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Counting Window"
      },
      {
        "id": "sw-5",
        "externalId": "567",
        "title": "Permutation in String",
        "slug": "permutation-in-string",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/permutation-in-string",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/permutation-in-string"
        ],
        "companyCount": 37,
        "frequency": 0.78,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "Fixed Freq Match"
      },
      {
        "id": "sw-6",
        "externalId": "438",
        "title": "Find All Anagrams in a String",
        "slug": "find-all-anagrams-in-a-string",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-all-anagrams-in-a-string",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-all-anagrams-in-a-string"
        ],
        "companyCount": 29,
        "frequency": 0.73,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Fixed Freq Match"
      },
      {
        "id": "sw-11",
        "externalId": "930",
        "title": "Binary Subarrays With Sum",
        "slug": "binary-subarrays-with-sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/binary-subarrays-with-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-subarrays-with-sum"
        ],
        "companyCount": 14,
        "frequency": 0.62,
        "orderIndex": 11,
        "levelTag": "advanced",
        "subPattern": "AtMost(K) Trick"
      },
      {
        "id": "sw-12",
        "externalId": "992",
        "title": "Subarrays with K Different Integers",
        "slug": "subarrays-with-k-different-integers",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/subarrays-with-k-different-integers",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subarrays-with-k-different-integers"
        ],
        "companyCount": 19,
        "frequency": 0.65,
        "orderIndex": 12,
        "levelTag": "advanced",
        "subPattern": "AtMost(K) Trick"
      },
      {
        "id": "sw-7",
        "externalId": "76",
        "title": "Minimum Window Substring",
        "slug": "minimum-window-substring",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/minimum-window-substring",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-window-substring"
        ],
        "companyCount": 68,
        "frequency": 0.89,
        "orderIndex": 13,
        "levelTag": "advanced",
        "subPattern": "Min Coverage Window"
      },
      {
        "id": "sw-8",
        "externalId": "239",
        "title": "Sliding Window Maximum",
        "slug": "sliding-window-maximum",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/sliding-window-maximum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sliding-window-maximum"
        ],
        "companyCount": 54,
        "frequency": 0.86,
        "orderIndex": 14,
        "levelTag": "advanced",
        "subPattern": "Monotonic Deque"
      },
      {
        "id": "sw-14",
        "externalId": "30",
        "title": "Substring with Concatenation of All Words",
        "slug": "substring-with-concatenation-of-all-words",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/substring-with-concatenation-of-all-words",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/substring-with-concatenation-of-all-words/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 15,
        "levelTag": "challenge",
        "subPattern": "Word-Stride Window"
      }
    ]
  },
{
    "id": "kadanes-algorithm",
    "name": "Kadane's Algorithm",
    "slug": "kadanes-algorithm",
    "tier": "core",
    "description": "The clever one-pass trick to find the maximum sub-array sum without overcomplicating things.",
    "orderIndex": 4,
    "color": "#f59e0b",
    "questionCount": 6,
    "companyCoverage": 12,
    "difficulty": "core",
    "questions": [
      {
        "id": "ka-1",
        "externalId": "53",
        "title": "Maximum Subarray",
        "slug": "maximum-subarray",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-subarray",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-subarray"
        ],
        "companyCount": 97,
        "frequency": 0.94,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Core Kadane"
      },
      {
        "id": "ka-5",
        "externalId": "3979",
        "title": "Minimum Subarray Sum",
        "slug": "smallest-sum-contiguous-subarray",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Inverted Kadane"
      },
      {
        "id": "ka-4",
        "externalId": "1749",
        "title": "Maximum Absolute Sum of Any Subarray",
        "slug": "maximum-absolute-sum-of-any-subarray",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray"
        ],
        "companyCount": 12,
        "frequency": 0.58,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Dual Kadane"
      },
      {
        "id": "ka-2",
        "externalId": "152",
        "title": "Maximum Product Subarray",
        "slug": "maximum-product-subarray",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-product-subarray",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-product-subarray"
        ],
        "companyCount": 62,
        "frequency": 0.87,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Sign Tracking"
      },
      {
        "id": "ka-6",
        "externalId": "1186",
        "title": "Maximum Subarray Sum with One Deletion",
        "slug": "maximum-subarray-sum-with-one-deletion",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/description/"
        ],
        "companyCount": 4,
        "frequency": 10,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "State-Space Kadane"
      },
      {
        "id": "ka-3",
        "externalId": "918",
        "title": "Maximum Sum Circular Subarray",
        "slug": "maximum-sum-circular-subarray",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-sum-circular-subarray",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-sum-circular-subarray"
        ],
        "companyCount": 24,
        "frequency": 0.69,
        "orderIndex": 6,
        "levelTag": "advanced",
        "subPattern": "Circular Wrap"
      }
    ]
  },
{
    "id": "prefix-sum",
    "name": "Prefix Sum",
    "slug": "prefix-sum",
    "tier": "core",
    "description": "Pre-calculate running totals once, then answer any range sum query instantly in a single step.",
    "orderIndex": 5,
    "color": "#10b981",
    "questionCount": 8,
    "companyCoverage": 20,
    "difficulty": "beginner",
    "questions": [
      {
        "id": "ps-3",
        "externalId": "1480",
        "title": "Running Sum of 1d Array",
        "slug": "running-sum-of-1d-array",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/running-sum-of-1d-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/running-sum-of-1d-array"
        ],
        "companyCount": 12,
        "frequency": 0.6,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Basic Prefix"
      },
      {
        "id": "ps-1",
        "externalId": "303",
        "title": "Range Sum Query - Immutable",
        "slug": "range-sum-query-immutable",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/range-sum-query-immutable",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/range-sum-query-immutable"
        ],
        "companyCount": 18,
        "frequency": 0.65,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Range Query"
      },
      {
        "id": "ps-4",
        "externalId": "724",
        "title": "Find Pivot Index",
        "slug": "find-pivot-index",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/find-pivot-index",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-pivot-index"
        ],
        "companyCount": 19,
        "frequency": 0.67,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Equilibrium Index"
      },
      {
        "id": "ps-2",
        "externalId": "560",
        "title": "Subarray Sum Equals K",
        "slug": "subarray-sum-equals-k",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/subarray-sum-equals-k",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subarray-sum-equals-k"
        ],
        "companyCount": 58,
        "frequency": 0.88,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Prefix + HashMap"
      },
      {
        "id": "ps-6",
        "externalId": "525",
        "title": "Contiguous Array",
        "slug": "contiguous-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/contiguous-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/contiguous-array/description/"
        ],
        "companyCount": 16,
        "frequency": 40,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Prefix + HashMap"
      },
      {
        "id": "ps-5",
        "externalId": "974",
        "title": "Subarray Sums Divisible by K",
        "slug": "subarray-sums-divisible-by-k",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/subarray-sums-divisible-by-k",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subarray-sums-divisible-by-k"
        ],
        "companyCount": 26,
        "frequency": 0.71,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Modulo Prefix"
      },
      {
        "id": "ps-7",
        "externalId": "862",
        "title": "Shortest Subarray with Sum at Least K",
        "slug": "shortest-subarray-with-sum-at-least-k",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/"
        ],
        "companyCount": 7,
        "frequency": 17.5,
        "orderIndex": 7,
        "levelTag": "challenge",
        "subPattern": "Prefix + Deque"
      },
      {
        "id": "ps-8",
        "externalId": "327",
        "title": "Count of Range Sum",
        "slug": "count-of-range-sum",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/count-of-range-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/count-of-range-sum/description/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 8,
        "levelTag": "challenge",
        "subPattern": "Prefix + Divide/BIT"
      }
    ]
  },
{
    "id": "merge-intervals",
    "name": "Merge Intervals",
    "slug": "merge-intervals",
    "tier": "core",
    "description": "Sort and combine overlapping time blocks — the go-to technique for scheduling, calendar meetings, and range problems.",
    "orderIndex": 6,
    "color": "#ef4444",
    "questionCount": 12,
    "companyCoverage": 27,
    "difficulty": "core",
    "questions": [
      {
        "id": "mi-5",
        "externalId": "252",
        "title": "Meeting Rooms",
        "slug": "meeting-rooms",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/meeting-rooms",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/meeting-rooms"
        ],
        "companyCount": 28,
        "frequency": 0.72,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Overlap Check"
      },
      {
        "id": "mi-9",
        "externalId": "3980",
        "title": "Overlapping Intervals",
        "slug": "check-if-any-two-intervals-overlap-among-a-given-set-of-intervals",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Overlap Check"
      },
      {
        "id": "mi-1",
        "externalId": "56",
        "title": "Merge Intervals",
        "slug": "merge-intervals",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/merge-intervals",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/merge-intervals"
        ],
        "companyCount": 111,
        "frequency": 0.96,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Merge & Insert"
      },
      {
        "id": "mi-2",
        "externalId": "57",
        "title": "Insert Interval",
        "slug": "insert-interval",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/insert-interval",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/insert-interval"
        ],
        "companyCount": 52,
        "frequency": 0.84,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Merge & Insert"
      },
      {
        "id": "mi-8",
        "externalId": "986",
        "title": "Interval List Intersections",
        "slug": "interval-list-intersections",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/interval-list-intersections",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/interval-list-intersections/description/"
        ],
        "companyCount": 12,
        "frequency": 30,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Interval Two Pointers"
      },
      {
        "id": "mi-7",
        "externalId": "1288",
        "title": "Remove Covered Intervals",
        "slug": "remove-covered-intervals",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/remove-covered-intervals",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-covered-intervals"
        ],
        "companyCount": 15,
        "frequency": 0.6,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Interval Sorting"
      },
      {
        "id": "mi-4",
        "externalId": "435",
        "title": "Non-overlapping Intervals",
        "slug": "non-overlapping-intervals",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/non-overlapping-intervals",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/non-overlapping-intervals"
        ],
        "companyCount": 31,
        "frequency": 0.74,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Greedy End-Sort"
      },
      {
        "id": "mi-3",
        "externalId": "452",
        "title": "Minimum Number of Arrows to Burst Balloons",
        "slug": "minimum-number-of-arrows-to-burst-balloons",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons"
        ],
        "companyCount": 23,
        "frequency": 0.68,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Greedy End-Sort"
      },
      {
        "id": "mi-6",
        "externalId": "253",
        "title": "Meeting Rooms II",
        "slug": "meeting-rooms-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/meeting-rooms-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/meeting-rooms-ii"
        ],
        "companyCount": 47,
        "frequency": 0.83,
        "orderIndex": 9,
        "levelTag": "advanced",
        "subPattern": "Sweep Line / Heap"
      },
      {
        "id": "mi-10",
        "externalId": "3981",
        "title": "Minimum Meeting Rooms",
        "slug": "attend-all-meetings-ii",
        "difficulty": "Hard",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 10,
        "levelTag": "challenge",
        "subPattern": "Sweep Line / Heap"
      },
      {
        "id": "mi-11",
        "externalId": "3982",
        "title": "Maximum CPU Load",
        "slug": "maximum-cpu-load-from-the-given-list-of-jobs",
        "difficulty": "Hard",
        "canonicalUrl": "https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 11,
        "levelTag": "challenge",
        "subPattern": "Sweep Line / Heap"
      },
      {
        "id": "mi-12",
        "externalId": "3983",
        "title": "Employee Free Time",
        "slug": "problem-challenge-3-employee-free-time-hard",
        "difficulty": "Hard",
        "canonicalUrl": "https://www.codertrain.co/employee-free-time",
        "platform": "other",
        "solved": false,
        "links": [
          "https://www.codertrain.co/employee-free-time"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 12,
        "levelTag": "challenge",
        "subPattern": "Merged Schedule Gap"
      }
    ]
  },
{
    "id": "in-place-linked-list-reversal",
    "name": "In-place Linked List Reversal",
    "slug": "in-place-linked-list-reversal",
    "tier": "core",
    "description": "Flip linked lists or reorder nodes neatly in-place without wasting any additional memory.",
    "orderIndex": 7,
    "color": "#ec4899",
    "questionCount": 6,
    "companyCoverage": 8,
    "difficulty": "core",
    "questions": [
      {
        "id": "ll-1",
        "externalId": "206",
        "title": "Reverse Linked List",
        "slug": "reverse-linked-list",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/reverse-linked-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/reverse-linked-list"
        ],
        "companyCount": 82,
        "frequency": 0.92,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Full Reversal"
      },
      {
        "id": "ll-2",
        "externalId": "92",
        "title": "Reverse Linked List II",
        "slug": "reverse-linked-list-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/reverse-linked-list-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/reverse-linked-list-ii"
        ],
        "companyCount": 38,
        "frequency": 0.78,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "Sub-list Reversal"
      },
      {
        "id": "ipll-6",
        "externalId": "61",
        "title": "Rotate List",
        "slug": "rotate-list",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/rotate-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/rotate-list/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Cyclic Link Split"
      },
      {
        "id": "ll-4",
        "externalId": "24",
        "title": "Swap Nodes in Pairs",
        "slug": "swap-nodes-in-pairs",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/swap-nodes-in-pairs",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/swap-nodes-in-pairs"
        ],
        "companyCount": 28,
        "frequency": 0.71,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "K=2 Group Reversal"
      },
      {
        "id": "ll-3",
        "externalId": "25",
        "title": "Reverse Nodes in k-Group",
        "slug": "reverse-nodes-in-k-group",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/reverse-nodes-in-k-group",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/reverse-nodes-in-k-group"
        ],
        "companyCount": 51,
        "frequency": 0.85,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "Fixed K-Group"
      },
      {
        "id": "ipll-5",
        "externalId": "2074",
        "title": "Reverse Nodes in Even Length Groups",
        "slug": "reverse-nodes-in-even-length-groups",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/reverse-nodes-in-even-length-groups",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/description/"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 6,
        "levelTag": "challenge",
        "subPattern": "Variable Length Group"
      }
    ]
  },
{
    "id": "stack",
    "name": "Stack",
    "slug": "stack",
    "tier": "core",
    "description": "Use simple Last-In-First-Out ordering to match parentheses, evaluate expressions, and find next-greater elements effortlessly.",
    "orderIndex": 8,
    "color": "#f97316",
    "questionCount": 15,
    "companyCoverage": 37,
    "difficulty": "core",
    "questions": [
      {
        "id": "stk-10",
        "externalId": "3984",
        "title": "Reverse a String",
        "slug": "reverse-a-string",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/reverse-a-string/",
        "platform": "other",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/reverse-a-string/"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Stack Basics"
      },
      {
        "id": "st-1",
        "externalId": "20",
        "title": "Valid Parentheses",
        "slug": "valid-parentheses",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/valid-parentheses",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/valid-parentheses"
        ],
        "companyCount": 113,
        "frequency": 0.97,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Bracket Matching"
      },
      {
        "id": "stk-9",
        "externalId": "1047",
        "title": "Remove All Adjacent Duplicates In String",
        "slug": "remove-all-adjacent-duplicates-in-string",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/"
        ],
        "companyCount": 15,
        "frequency": 37.5,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Adjacent Cancel"
      },
      {
        "id": "st-3",
        "externalId": "232",
        "title": "Implement Queue using Stacks",
        "slug": "implement-queue-using-stacks",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/implement-queue-using-stacks",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/implement-queue-using-stacks"
        ],
        "companyCount": 32,
        "frequency": 0.74,
        "orderIndex": 4,
        "levelTag": "beginner",
        "subPattern": "Stack Design"
      },
      {
        "id": "st-2",
        "externalId": "155",
        "title": "Min Stack",
        "slug": "min-stack",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/min-stack",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/min-stack"
        ],
        "companyCount": 71,
        "frequency": 0.89,
        "orderIndex": 5,
        "levelTag": "beginner",
        "subPattern": "Aux State Stack"
      },
      {
        "id": "stk-14",
        "externalId": "71",
        "title": "Simplify Path",
        "slug": "simplify-path",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/simplify-path",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/simplify-path/"
        ],
        "companyCount": 24,
        "frequency": 60,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Path Simulation"
      },
      {
        "id": "stk-13",
        "externalId": "1209",
        "title": "Remove All Adjacent Duplicates in String II",
        "slug": "remove-all-adjacent-duplicates-in-string-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/"
        ],
        "companyCount": 18,
        "frequency": 45,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Adjacent Cancel"
      },
      {
        "id": "st-7",
        "externalId": "150",
        "title": "Evaluate Reverse Polish Notation",
        "slug": "evaluate-reverse-polish-notation",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/evaluate-reverse-polish-notation",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/evaluate-reverse-polish-notation"
        ],
        "companyCount": 29,
        "frequency": 0.73,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Expression Eval"
      },
      {
        "id": "st-6",
        "externalId": "394",
        "title": "Decode String",
        "slug": "decode-string",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/decode-string",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/decode-string"
        ],
        "companyCount": 42,
        "frequency": 0.81,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "Nested Decoding"
      },
      {
        "id": "st-4",
        "externalId": "739",
        "title": "Daily Temperatures",
        "slug": "daily-temperatures",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/daily-temperatures",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/daily-temperatures"
        ],
        "companyCount": 55,
        "frequency": 0.86,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Monotonic Stack"
      },
      {
        "id": "stk-11",
        "externalId": "503",
        "title": "Next Greater Element II",
        "slug": "next-greater-element-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/next-greater-element-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/next-greater-element-ii/description/"
        ],
        "companyCount": 16,
        "frequency": 40,
        "orderIndex": 11,
        "levelTag": "core",
        "subPattern": "Monotonic Stack"
      },
      {
        "id": "stk-12",
        "externalId": "2487",
        "title": "Remove Nodes From Linked List",
        "slug": "remove-nodes-from-linked-list",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/remove-nodes-from-linked-list",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-nodes-from-linked-list/"
        ],
        "companyCount": 4,
        "frequency": 10,
        "orderIndex": 12,
        "levelTag": "core",
        "subPattern": "Monotonic Stack"
      },
      {
        "id": "st-8",
        "externalId": "901",
        "title": "Online Stock Span",
        "slug": "online-stock-span",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/online-stock-span",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/online-stock-span"
        ],
        "companyCount": 22,
        "frequency": 0.68,
        "orderIndex": 13,
        "levelTag": "advanced",
        "subPattern": "Monotonic Stack"
      },
      {
        "id": "stk-15",
        "externalId": "402",
        "title": "Remove K Digits",
        "slug": "remove-k-digits",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/remove-k-digits",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/remove-k-digits/"
        ],
        "companyCount": 21,
        "frequency": 52.5,
        "orderIndex": 14,
        "levelTag": "advanced",
        "subPattern": "Monotonic Greedy"
      },
      {
        "id": "st-5",
        "externalId": "84",
        "title": "Largest Rectangle in Histogram",
        "slug": "largest-rectangle-in-histogram",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/largest-rectangle-in-histogram",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/largest-rectangle-in-histogram"
        ],
        "companyCount": 47,
        "frequency": 0.83,
        "orderIndex": 15,
        "levelTag": "challenge",
        "subPattern": "Dual Monotonic Bounds"
      }
    ]
  },
{
    "id": "hash-maps",
    "name": "Hash Maps / Hash Sets",
    "slug": "hash-maps",
    "tier": "core",
    "description": "Store and find anything instantly. The everyday secret behind two-sum, counting frequencies, and grouping anagrams.",
    "orderIndex": 9,
    "color": "#14b8a6",
    "questionCount": 11,
    "companyCoverage": 126,
    "difficulty": "beginner",
    "questions": [
      {
        "id": "hm-4",
        "externalId": "217",
        "title": "Contains Duplicate",
        "slug": "contains-duplicate",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/contains-duplicate",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/contains-duplicate"
        ],
        "companyCount": 61,
        "frequency": 0.87,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "HashSet Lookup"
      },
      {
        "id": "hm-1",
        "externalId": "1",
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/two-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/two-sum"
        ],
        "companyCount": 126,
        "frequency": 0.99,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Complement Map"
      },
      {
        "id": "hm-8",
        "externalId": "387",
        "title": "First Unique Character in a String",
        "slug": "first-unique-character-in-a-string",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/first-unique-character-in-a-string",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/first-unique-character-in-a-string/"
        ],
        "companyCount": 25,
        "frequency": 62.5,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Frequency Map"
      },
      {
        "id": "hm-11",
        "externalId": "383",
        "title": "Ransom Note",
        "slug": "ransom-note",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/ransom-note",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/ransom-note/"
        ],
        "companyCount": 14,
        "frequency": 35,
        "orderIndex": 4,
        "levelTag": "beginner",
        "subPattern": "Frequency Map"
      },
      {
        "id": "hm-9",
        "externalId": "1189",
        "title": "Maximum Number of Balloons",
        "slug": "maximum-number-of-balloons",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/maximum-number-of-balloons",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-number-of-balloons/"
        ],
        "companyCount": 6,
        "frequency": 15,
        "orderIndex": 5,
        "levelTag": "beginner",
        "subPattern": "Frequency Quota"
      },
      {
        "id": "hm-10",
        "externalId": "409",
        "title": "Longest Palindrome",
        "slug": "longest-palindrome",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/longest-palindrome",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-palindrome/"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 6,
        "levelTag": "beginner",
        "subPattern": "Parity Counting"
      },
      {
        "id": "hm-5",
        "externalId": "242",
        "title": "Valid Anagram",
        "slug": "valid-anagram",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/valid-anagram",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/valid-anagram"
        ],
        "companyCount": 54,
        "frequency": 0.85,
        "orderIndex": 7,
        "levelTag": "beginner",
        "subPattern": "Signature Equality"
      },
      {
        "id": "hm-2",
        "externalId": "49",
        "title": "Group Anagrams",
        "slug": "group-anagrams",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/group-anagrams",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/group-anagrams"
        ],
        "companyCount": 83,
        "frequency": 0.91,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Canonical Key Buckets"
      },
      {
        "id": "hm-3",
        "externalId": "128",
        "title": "Longest Consecutive Sequence",
        "slug": "longest-consecutive-sequence",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-consecutive-sequence",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-consecutive-sequence"
        ],
        "companyCount": 74,
        "frequency": 0.89,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "HashSet Streak"
      },
      {
        "id": "hm-6",
        "externalId": "347",
        "title": "Top K Frequent Elements",
        "slug": "top-k-frequent-elements",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/top-k-frequent-elements",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/top-k-frequent-elements"
        ],
        "companyCount": 68,
        "frequency": 0.88,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Bucket Frequency"
      },
      {
        "id": "hm-7",
        "externalId": "146",
        "title": "LRU Cache",
        "slug": "lru-cache",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/lru-cache",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lru-cache"
        ],
        "companyCount": 119,
        "frequency": 0.97,
        "orderIndex": 11,
        "levelTag": "advanced",
        "subPattern": "HashMap + List"
      }
    ]
  },
{
    "id": "binary-search",
    "name": "Binary Search",
    "slug": "binary-search",
    "tier": "core",
    "description": "Cut your search space in half with every guess. Rapidly pinpoint targets or find optimal answers in sorted data.",
    "orderIndex": 10,
    "color": "#3b82f6",
    "questionCount": 23,
    "companyCoverage": 22,
    "difficulty": "core",
    "questions": [
      {
        "id": "bs-1",
        "externalId": "704",
        "title": "Binary Search",
        "slug": "binary-search",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/binary-search",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-search"
        ],
        "companyCount": 34,
        "frequency": 0.75,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Basics"
      },
      {
        "id": "bs-6",
        "externalId": "3985",
        "title": "Ceiling / Upper Bound in Sorted Array",
        "slug": "ceil-in-a-sorted-array",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Lower/Upper Bound"
      },
      {
        "id": "bs-7",
        "externalId": "34",
        "title": "Find First and Last Position of Element in Sorted Array",
        "slug": "find-first-and-last-position-of-element-in-sorted-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/"
        ],
        "companyCount": 29,
        "frequency": 72.5,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Lower/Upper Bound"
      },
      {
        "id": "bs-8",
        "externalId": "3986",
        "title": "Count Number of Occurrences",
        "slug": "number-of-occurrence2259",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Lower/Upper Bound"
      },
      {
        "id": "bs-9",
        "externalId": "3987",
        "title": "Search in Infinite Sorted Array",
        "slug": "find-position-element-sorted-array-infinite-numbers",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Unbounded Search"
      },
      {
        "id": "bs-10",
        "externalId": "852",
        "title": "Peak Index in a Mountain Array",
        "slug": "peak-index-in-a-mountain-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/peak-index-in-a-mountain-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/peak-index-in-a-mountain-array/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Mountain Array"
      },
      {
        "id": "bs-11",
        "externalId": "162",
        "title": "Find Peak Element",
        "slug": "find-peak-element",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-peak-element",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-peak-element/"
        ],
        "companyCount": 30,
        "frequency": 75,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Mountain Array"
      },
      {
        "id": "bs-3",
        "externalId": "153",
        "title": "Find Minimum in Rotated Sorted Array",
        "slug": "find-minimum-in-rotated-sorted-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array"
        ],
        "companyCount": 61,
        "frequency": 0.86,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Rotated Array"
      },
      {
        "id": "bs-12",
        "externalId": "3988",
        "title": "Find Number of Rotations in Sorted Array",
        "slug": "rotation4723",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/rotation4723/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/rotation4723/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "Rotated Array"
      },
      {
        "id": "bs-2",
        "externalId": "33",
        "title": "Search in Rotated Sorted Array",
        "slug": "search-in-rotated-sorted-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/search-in-rotated-sorted-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/search-in-rotated-sorted-array"
        ],
        "companyCount": 88,
        "frequency": 0.92,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Rotated Array"
      },
      {
        "id": "bs-16",
        "externalId": "275",
        "title": "H-Index II",
        "slug": "h-index-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/h-index-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/h-index-ii/description/"
        ],
        "companyCount": 1,
        "frequency": 2.5,
        "orderIndex": 11,
        "levelTag": "core",
        "subPattern": "Index Predicate"
      },
      {
        "id": "bs-4",
        "externalId": "74",
        "title": "Search a 2D Matrix",
        "slug": "search-a-2d-matrix",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/search-a-2d-matrix",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/search-a-2d-matrix"
        ],
        "companyCount": 44,
        "frequency": 0.81,
        "orderIndex": 12,
        "levelTag": "core",
        "subPattern": "2D Matrix"
      },
      {
        "id": "bs-21",
        "externalId": "240",
        "title": "Search a 2D Matrix II",
        "slug": "search-a-2d-matrix-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/search-a-2d-matrix-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/search-a-2d-matrix-ii/description/"
        ],
        "companyCount": 16,
        "frequency": 40,
        "orderIndex": 13,
        "levelTag": "core",
        "subPattern": "2D Matrix"
      },
      {
        "id": "bs-22",
        "externalId": "378",
        "title": "Kth Smallest Element in a Sorted Matrix",
        "slug": "kth-smallest-element-in-a-sorted-matrix",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 14,
        "levelTag": "core",
        "subPattern": "Value-Space 2D"
      },
      {
        "id": "bs-13",
        "externalId": "875",
        "title": "Koko Eating Bananas",
        "slug": "koko-eating-bananas",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/koko-eating-bananas",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/koko-eating-bananas/"
        ],
        "companyCount": 47,
        "frequency": 117.5,
        "orderIndex": 15,
        "levelTag": "core",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-14",
        "externalId": "1482",
        "title": "Minimum Number of Days to Make m Bouquets",
        "slug": "minimum-number-of-days-to-make-m-bouquets",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 16,
        "levelTag": "core",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-17",
        "externalId": "2226",
        "title": "Maximum Candies Allocated to K Children",
        "slug": "maximum-candies-allocated-to-k-children",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-candies-allocated-to-k-children",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-candies-allocated-to-k-children/description/"
        ],
        "companyCount": 6,
        "frequency": 15,
        "orderIndex": 17,
        "levelTag": "core",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-18",
        "externalId": "1011",
        "title": "Capacity To Ship Packages Within D Days",
        "slug": "capacity-to-ship-packages-within-d-days",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/"
        ],
        "companyCount": 20,
        "frequency": 50,
        "orderIndex": 18,
        "levelTag": "core",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-15",
        "externalId": "3989",
        "title": "Aggressive Cows",
        "slug": "aggressive-cows",
        "difficulty": "Hard",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/aggressive-cows/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/aggressive-cows/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 19,
        "levelTag": "advanced",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-19",
        "externalId": "3990",
        "title": "Book Allocation Problem",
        "slug": "allocate-minimum-number-of-pages0937",
        "difficulty": "Hard",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 20,
        "levelTag": "advanced",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-20",
        "externalId": "410",
        "title": "Split Array Largest Sum",
        "slug": "split-array-largest-sum",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/split-array-largest-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/split-array-largest-sum/description/"
        ],
        "companyCount": 20,
        "frequency": 50,
        "orderIndex": 21,
        "levelTag": "advanced",
        "subPattern": "BS on Answer"
      },
      {
        "id": "bs-23",
        "externalId": "668",
        "title": "Kth Smallest Number in Multiplication Table",
        "slug": "kth-smallest-number-in-multiplication-table",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/description/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 22,
        "levelTag": "advanced",
        "subPattern": "Value-Space"
      },
      {
        "id": "bs-5",
        "externalId": "4",
        "title": "Median of Two Sorted Arrays",
        "slug": "median-of-two-sorted-arrays",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/median-of-two-sorted-arrays",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/median-of-two-sorted-arrays"
        ],
        "companyCount": 71,
        "frequency": 0.89,
        "orderIndex": 23,
        "levelTag": "challenge",
        "subPattern": "Partition Cut"
      }
    ]
  },
{
    "id": "heap-priority-queue",
    "name": "Heap / Priority Queue",
    "slug": "heap-priority-queue",
    "tier": "core",
    "description": "Always keep the smallest or largest item ready at the top — ideal for Top-K rankings and live data streams.",
    "orderIndex": 11,
    "color": "#a855f7",
    "questionCount": 18,
    "companyCoverage": 30,
    "difficulty": "core",
    "questions": [
      {
        "id": "hp-13",
        "externalId": "1046",
        "title": "Last Stone Weight",
        "slug": "last-stone-weight",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/last-stone-weight",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/last-stone-weight/description/"
        ],
        "companyCount": 13,
        "frequency": 32.5,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Heap Basics"
      },
      {
        "id": "hp-10",
        "externalId": "1337",
        "title": "The K Weakest Rows in a Matrix",
        "slug": "the-k-weakest-rows-in-a-matrix",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Top-K Comparator"
      },
      {
        "id": "hp-1",
        "externalId": "215",
        "title": "Kth Largest Element in an Array",
        "slug": "kth-largest-element-in-an-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/kth-largest-element-in-an-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/kth-largest-element-in-an-array"
        ],
        "companyCount": 89,
        "frequency": 0.93,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Kth Element"
      },
      {
        "id": "hp-5",
        "externalId": "3991",
        "title": "Kth Smallest Element",
        "slug": "kth-smallest-element5635",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Kth Element"
      },
      {
        "id": "hp-6",
        "externalId": "347",
        "title": "Top K Frequent Elements",
        "slug": "top-k-frequent-elements",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/top-k-frequent-elements",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/top-k-frequent-elements/description/"
        ],
        "companyCount": 53,
        "frequency": 132.5,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Top-K Frequency"
      },
      {
        "id": "hp-7",
        "externalId": "692",
        "title": "Top K Frequent Words",
        "slug": "top-k-frequent-words",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/top-k-frequent-words",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/top-k-frequent-words/description/"
        ],
        "companyCount": 23,
        "frequency": 57.5,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Top-K Frequency"
      },
      {
        "id": "hp-8",
        "externalId": "973",
        "title": "K Closest Points to Origin",
        "slug": "k-closest-points-to-origin",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/k-closest-points-to-origin",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/k-closest-points-to-origin/description/"
        ],
        "companyCount": 17,
        "frequency": 42.5,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "K Closest"
      },
      {
        "id": "hp-9",
        "externalId": "658",
        "title": "Find K Closest Elements",
        "slug": "find-k-closest-elements",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-k-closest-elements",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-k-closest-elements/description/"
        ],
        "companyCount": 18,
        "frequency": 45,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "K Closest"
      },
      {
        "id": "hp-14",
        "externalId": "767",
        "title": "Reorganize String",
        "slug": "reorganize-string",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/reorganize-string",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/reorganize-string/"
        ],
        "companyCount": 20,
        "frequency": 50,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "Greedy + Heap"
      },
      {
        "id": "hp-4",
        "externalId": "621",
        "title": "Task Scheduler",
        "slug": "task-scheduler",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/task-scheduler",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/task-scheduler"
        ],
        "companyCount": 47,
        "frequency": 0.82,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Greedy + Heap"
      },
      {
        "id": "hp-2",
        "externalId": "23",
        "title": "Merge k Sorted Lists",
        "slug": "merge-k-sorted-lists",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/merge-k-sorted-lists",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/merge-k-sorted-lists"
        ],
        "companyCount": 76,
        "frequency": 0.9,
        "orderIndex": 11,
        "levelTag": "advanced",
        "subPattern": "K-Way Merge"
      },
      {
        "id": "hp-11",
        "externalId": "3992",
        "title": "Merge K Sorted Arrays",
        "slug": "merge-k-sorted-arrays",
        "difficulty": "Hard",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 12,
        "levelTag": "advanced",
        "subPattern": "K-Way Merge"
      },
      {
        "id": "hp-12",
        "externalId": "378",
        "title": "Kth Smallest Element in a Sorted Matrix",
        "slug": "kth-smallest-element-in-a-sorted-matrix",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 13,
        "levelTag": "advanced",
        "subPattern": "K-Way Merge"
      },
      {
        "id": "hp-15",
        "externalId": "871",
        "title": "Minimum Number of Refueling Stops",
        "slug": "minimum-number-of-refueling-stops",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/minimum-number-of-refueling-stops",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-number-of-refueling-stops/description/"
        ],
        "companyCount": 7,
        "frequency": 17.5,
        "orderIndex": 14,
        "levelTag": "advanced",
        "subPattern": "Greedy + Heap"
      },
      {
        "id": "hp-16",
        "externalId": "502",
        "title": "IPO",
        "slug": "ipo",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/ipo",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/ipo/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 15,
        "levelTag": "advanced",
        "subPattern": "Dual Priority Queue"
      },
      {
        "id": "hp-17",
        "externalId": "630",
        "title": "Course Schedule III",
        "slug": "course-schedule-iii",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/course-schedule-iii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/course-schedule-iii/description/"
        ],
        "companyCount": 4,
        "frequency": 10,
        "orderIndex": 16,
        "levelTag": "advanced",
        "subPattern": "Greedy + Heap"
      },
      {
        "id": "hp-3",
        "externalId": "295",
        "title": "Find Median from Data Stream",
        "slug": "find-median-from-data-stream",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/find-median-from-data-stream",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-median-from-data-stream"
        ],
        "companyCount": 63,
        "frequency": 0.87,
        "orderIndex": 17,
        "levelTag": "challenge",
        "subPattern": "Two Heaps"
      },
      {
        "id": "hp-18",
        "externalId": "480",
        "title": "Sliding Window Median",
        "slug": "sliding-window-median",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/sliding-window-median",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sliding-window-median/description/"
        ],
        "companyCount": 11,
        "frequency": 27.5,
        "orderIndex": 18,
        "levelTag": "challenge",
        "subPattern": "Two Heaps"
      }
    ]
  },
{
    "id": "backtracking",
    "name": "Backtracking",
    "slug": "backtracking",
    "tier": "core",
    "description": "Smart trial-and-error that explores all possibilities and quickly walks back when a path doesn't work out.",
    "orderIndex": 12,
    "color": "#84cc16",
    "questionCount": 15,
    "companyCoverage": 61,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "bt-7",
        "externalId": "509",
        "title": "Fibonacci Number",
        "slug": "fibonacci-number",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/fibonacci-number",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/fibonacci-number/description/",
          "https://www.youtube.com/watch?v=j4wjZqzhMqc&t"
        ],
        "companyCount": 16,
        "frequency": 40,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Recursion Basics"
      },
      {
        "id": "bt-10",
        "externalId": "3995",
        "title": "Sum of Digits of a Number",
        "slug": "sum-of-digits1742",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/sum-of-digits1742/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/sum-of-digits1742/1",
          "https://www.youtube.com/watch?v=-gC-QEdpvO4"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Recursion Basics"
      },
      {
        "id": "bt-9",
        "externalId": "3994",
        "title": "Check if Array is Sorted",
        "slug": "check-if-an-array-is-sorted0701",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1",
          "https://www.youtube.com/watch?v=-gC-QEdpvO4"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Recursion Basics"
      },
      {
        "id": "bt-8",
        "externalId": "3993",
        "title": "Check if String is Palindrome",
        "slug": "palindrome-string0817",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/palindrome-string0817/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/palindrome-string0817/1",
          "https://www.youtube.com/watch?v=j4wjZqzhMqc&t"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 4,
        "levelTag": "beginner",
        "subPattern": "Recursion Basics"
      },
      {
        "id": "bt-11",
        "externalId": "3996",
        "title": "Remove All Occurrences of Character",
        "slug": "remove-all-occurrences-of-a-character-in-a-string",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1",
          "https://www.youtube.com/watch?v=-gC-QEdpvO4"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 5,
        "levelTag": "beginner",
        "subPattern": "Recursion Basics"
      },
      {
        "id": "bt-1",
        "externalId": "78",
        "title": "Subsets",
        "slug": "subsets",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/subsets",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subsets"
        ],
        "companyCount": 62,
        "frequency": 0.87,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Subsets & Pick/Skip"
      },
      {
        "id": "bt-3",
        "externalId": "77",
        "title": "Combinations",
        "slug": "combinations",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/combinations",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/combinations"
        ],
        "companyCount": 34,
        "frequency": 0.76,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Subsets & Pick/Skip"
      },
      {
        "id": "bt-4",
        "externalId": "39",
        "title": "Combination Sum",
        "slug": "combination-sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/combination-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/combination-sum"
        ],
        "companyCount": 58,
        "frequency": 0.86,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Subsets & Pick/Skip"
      },
      {
        "id": "bt-12",
        "externalId": "22",
        "title": "Generate Parentheses",
        "slug": "generate-parentheses",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/generate-parentheses",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/generate-parentheses/description/"
        ],
        "companyCount": 40,
        "frequency": 100,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "Branch & Prune"
      },
      {
        "id": "bt-13",
        "externalId": "17",
        "title": "Letter Combinations of a Phone Number",
        "slug": "letter-combinations-of-a-phone-number",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/letter-combinations-of-a-phone-number",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/",
          "https://www.youtube.com/watch?v=IKfIT6uFOcs"
        ],
        "companyCount": 34,
        "frequency": 85,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Cartesian DFS"
      },
      {
        "id": "bt-2",
        "externalId": "46",
        "title": "Permutations",
        "slug": "permutations",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/permutations",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/permutations"
        ],
        "companyCount": 71,
        "frequency": 0.89,
        "orderIndex": 11,
        "levelTag": "core",
        "subPattern": "Permutations"
      },
      {
        "id": "bt-14",
        "externalId": "131",
        "title": "Palindrome Partitioning",
        "slug": "palindrome-partitioning",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/palindrome-partitioning",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/palindrome-partitioning/description/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 12,
        "levelTag": "core",
        "subPattern": "String Partition"
      },
      {
        "id": "bt-15",
        "externalId": "79",
        "title": "Word Search",
        "slug": "word-search",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/word-search",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/word-search"
        ],
        "companyCount": 61,
        "frequency": 0.89,
        "orderIndex": 13,
        "levelTag": "core",
        "subPattern": "Grid Backtracking"
      },
      {
        "id": "bt-5",
        "externalId": "51",
        "title": "N-Queens",
        "slug": "n-queens",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/n-queens",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/n-queens"
        ],
        "companyCount": 42,
        "frequency": 0.8,
        "orderIndex": 14,
        "levelTag": "advanced",
        "subPattern": "Constraint CSP"
      },
      {
        "id": "bt-6",
        "externalId": "37",
        "title": "Sudoku Solver",
        "slug": "sudoku-solver",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/sudoku-solver",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sudoku-solver"
        ],
        "companyCount": 28,
        "frequency": 0.72,
        "orderIndex": 15,
        "levelTag": "challenge",
        "subPattern": "Constraint CSP"
      }
    ]
  },
{
    "id": "tree-pattern",
    "name": "Trees",
    "slug": "tree-pattern",
    "tier": "core",
    "description": "Master binary trees and BSTs with intuitive recursive traversals — the bread and butter of technical interviews.",
    "orderIndex": 13,
    "color": "#22c55e",
    "questionCount": 32,
    "companyCoverage": 184,
    "difficulty": "mixed",
    "questions": [
      {
        "id": "tree-8",
        "externalId": "144",
        "title": "Binary Tree Preorder Traversal",
        "slug": "binary-tree-preorder-traversal",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-preorder-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-preorder-traversal/description/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Traversal"
      },
      {
        "id": "tree-7",
        "externalId": "94",
        "title": "Binary Tree Inorder Traversal",
        "slug": "binary-tree-inorder-traversal",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-inorder-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-inorder-traversal/description/"
        ],
        "companyCount": 7,
        "frequency": 17.5,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Traversal"
      },
      {
        "id": "tree-9",
        "externalId": "145",
        "title": "Binary Tree Postorder Traversal",
        "slug": "binary-tree-postorder-traversal",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-postorder-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-postorder-traversal/description/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Traversal"
      },
      {
        "id": "tr-1",
        "externalId": "104",
        "title": "Maximum Depth of Binary Tree",
        "slug": "maximum-depth-of-binary-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/maximum-depth-of-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-depth-of-binary-tree"
        ],
        "companyCount": 78,
        "frequency": 0.9,
        "orderIndex": 4,
        "levelTag": "beginner",
        "subPattern": "Depth & Properties"
      },
      {
        "id": "tree-21",
        "externalId": "111",
        "title": "Minimum Depth of Binary Tree",
        "slug": "minimum-depth-of-binary-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/minimum-depth-of-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-depth-of-binary-tree/description/"
        ],
        "companyCount": 7,
        "frequency": 17.5,
        "orderIndex": 5,
        "levelTag": "beginner",
        "subPattern": "Depth & Properties"
      },
      {
        "id": "tr-2",
        "externalId": "226",
        "title": "Invert Binary Tree",
        "slug": "invert-binary-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/invert-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/invert-binary-tree"
        ],
        "companyCount": 65,
        "frequency": 0.87,
        "orderIndex": 6,
        "levelTag": "beginner",
        "subPattern": "Mirror & Symmetry"
      },
      {
        "id": "tree-13",
        "externalId": "100",
        "title": "Same Tree",
        "slug": "same-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/same-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/same-tree/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 7,
        "levelTag": "beginner",
        "subPattern": "Mirror & Symmetry"
      },
      {
        "id": "tree-12",
        "externalId": "101",
        "title": "Symmetric Tree",
        "slug": "symmetric-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/symmetric-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/symmetric-tree/description/"
        ],
        "companyCount": 11,
        "frequency": 27.5,
        "orderIndex": 8,
        "levelTag": "beginner",
        "subPattern": "Mirror & Symmetry"
      },
      {
        "id": "tree-14",
        "externalId": "572",
        "title": "Subtree of Another Tree",
        "slug": "subtree-of-another-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/subtree-of-another-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subtree-of-another-tree/description/"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 9,
        "levelTag": "beginner",
        "subPattern": "Mirror & Symmetry"
      },
      {
        "id": "tree-22",
        "externalId": "110",
        "title": "Balanced Binary Tree",
        "slug": "balanced-binary-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/balanced-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/balanced-binary-tree/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 10,
        "levelTag": "beginner",
        "subPattern": "Depth & Properties"
      },
      {
        "id": "tree-23",
        "externalId": "543",
        "title": "Diameter of Binary Tree",
        "slug": "diameter-of-binary-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/diameter-of-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/diameter-of-binary-tree/description/"
        ],
        "companyCount": 20,
        "frequency": 50,
        "orderIndex": 11,
        "levelTag": "beginner",
        "subPattern": "Depth & Properties"
      },
      {
        "id": "tree-27",
        "externalId": "112",
        "title": "Path Sum",
        "slug": "path-sum",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/path-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/path-sum/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 12,
        "levelTag": "beginner",
        "subPattern": "Path Sum"
      },
      {
        "id": "tree-16",
        "externalId": "700",
        "title": "Search in a Binary Search Tree",
        "slug": "search-in-a-binary-search-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/search-in-a-binary-search-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/search-in-a-binary-search-tree/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 13,
        "levelTag": "beginner",
        "subPattern": "BST Search"
      },
      {
        "id": "tree-19",
        "externalId": "653",
        "title": "Two Sum IV - Input is a BST",
        "slug": "two-sum-iv-input-is-a-bst",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/two-sum-iv-input-is-a-bst",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/description/"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 14,
        "levelTag": "beginner",
        "subPattern": "BST Search"
      },
      {
        "id": "tree-32",
        "externalId": "108",
        "title": "Convert Sorted Array to Binary Search Tree",
        "slug": "convert-sorted-array-to-binary-search-tree",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 15,
        "levelTag": "beginner",
        "subPattern": "Construction"
      },
      {
        "id": "tr-3",
        "externalId": "102",
        "title": "Binary Tree Level Order Traversal",
        "slug": "binary-tree-level-order-traversal",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-level-order-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-level-order-traversal"
        ],
        "companyCount": 91,
        "frequency": 0.93,
        "orderIndex": 16,
        "levelTag": "core",
        "subPattern": "BFS Traversal"
      },
      {
        "id": "tree-10",
        "externalId": "103",
        "title": "Binary Tree Zigzag Level Order Traversal",
        "slug": "binary-tree-zigzag-level-order-traversal",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/"
        ],
        "companyCount": 19,
        "frequency": 47.5,
        "orderIndex": 17,
        "levelTag": "core",
        "subPattern": "BFS Traversal"
      },
      {
        "id": "tree-11",
        "externalId": "107",
        "title": "Binary Tree Level Order Traversal II",
        "slug": "binary-tree-level-order-traversal-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/description/"
        ],
        "companyCount": 6,
        "frequency": 15,
        "orderIndex": 18,
        "levelTag": "core",
        "subPattern": "BFS Traversal"
      },
      {
        "id": "tree-24",
        "externalId": "958",
        "title": "Check Completeness of a Binary Tree",
        "slug": "check-completeness-of-a-binary-tree",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/check-completeness-of-a-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/check-completeness-of-a-binary-tree/description/"
        ],
        "companyCount": 5,
        "frequency": 12.5,
        "orderIndex": 19,
        "levelTag": "core",
        "subPattern": "BFS Validation"
      },
      {
        "id": "tree-15",
        "externalId": "951",
        "title": "Flip Equivalent Binary Trees",
        "slug": "flip-equivalent-binary-trees",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/flip-equivalent-binary-trees",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/flip-equivalent-binary-trees/description/"
        ],
        "companyCount": 4,
        "frequency": 10,
        "orderIndex": 20,
        "levelTag": "core",
        "subPattern": "Mirror & Symmetry"
      },
      {
        "id": "tree-28",
        "externalId": "113",
        "title": "Path Sum II",
        "slug": "path-sum-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/path-sum-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/path-sum-ii/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 21,
        "levelTag": "core",
        "subPattern": "Path Sum"
      },
      {
        "id": "tree-29",
        "externalId": "129",
        "title": "Sum Root to Leaf Numbers",
        "slug": "sum-root-to-leaf-numbers",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/sum-root-to-leaf-numbers",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sum-root-to-leaf-numbers/description/"
        ],
        "companyCount": 7,
        "frequency": 17.5,
        "orderIndex": 22,
        "levelTag": "core",
        "subPattern": "Path Sum"
      },
      {
        "id": "tree-25",
        "externalId": "98",
        "title": "Validate Binary Search Tree",
        "slug": "validate-binary-search-tree",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/validate-binary-search-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/validate-binary-search-tree/description/"
        ],
        "companyCount": 18,
        "frequency": 45,
        "orderIndex": 23,
        "levelTag": "core",
        "subPattern": "BST Validation"
      },
      {
        "id": "tree-20",
        "externalId": "230",
        "title": "Kth Smallest Element in a BST",
        "slug": "kth-smallest-element-in-a-bst",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/kth-smallest-element-in-a-bst",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/"
        ],
        "companyCount": 12,
        "frequency": 30,
        "orderIndex": 24,
        "levelTag": "core",
        "subPattern": "BST Inorder"
      },
      {
        "id": "tree-26",
        "externalId": "99",
        "title": "Recover Binary Search Tree",
        "slug": "recover-binary-search-tree",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/recover-binary-search-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/recover-binary-search-tree/description/"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 25,
        "levelTag": "core",
        "subPattern": "BST Validation"
      },
      {
        "id": "tree-17",
        "externalId": "235",
        "title": "Lowest Common Ancestor of a Binary Search Tree",
        "slug": "lowest-common-ancestor-of-a-binary-search-tree",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/"
        ],
        "companyCount": 10,
        "frequency": 25,
        "orderIndex": 26,
        "levelTag": "core",
        "subPattern": "LCA"
      },
      {
        "id": "tr-4",
        "externalId": "236",
        "title": "Lowest Common Ancestor of a Binary Tree",
        "slug": "lowest-common-ancestor-of-a-binary-tree",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree"
        ],
        "companyCount": 87,
        "frequency": 0.92,
        "orderIndex": 27,
        "levelTag": "core",
        "subPattern": "LCA"
      },
      {
        "id": "tree-18",
        "externalId": "1123",
        "title": "Lowest Common Ancestor of Deepest Leaves",
        "slug": "lowest-common-ancestor-of-deepest-leaves",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/description/"
        ],
        "companyCount": 4,
        "frequency": 10,
        "orderIndex": 28,
        "levelTag": "core",
        "subPattern": "LCA"
      },
      {
        "id": "tree-30",
        "externalId": "105",
        "title": "Construct Binary Tree from Preorder and Inorder Traversal",
        "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 29,
        "levelTag": "core",
        "subPattern": "Construction"
      },
      {
        "id": "tree-31",
        "externalId": "106",
        "title": "Construct Binary Tree from Inorder and Postorder Traversal",
        "slug": "construct-binary-tree-from-inorder-and-postorder-traversal",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/"
        ],
        "companyCount": 7,
        "frequency": 17.5,
        "orderIndex": 30,
        "levelTag": "core",
        "subPattern": "Construction"
      },
      {
        "id": "tr-5",
        "externalId": "124",
        "title": "Binary Tree Maximum Path Sum",
        "slug": "binary-tree-maximum-path-sum",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/binary-tree-maximum-path-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/binary-tree-maximum-path-sum"
        ],
        "companyCount": 72,
        "frequency": 0.89,
        "orderIndex": 31,
        "levelTag": "advanced",
        "subPattern": "Tree DP / Path Sum"
      },
      {
        "id": "tr-6",
        "externalId": "297",
        "title": "Serialize and Deserialize Binary Tree",
        "slug": "serialize-and-deserialize-binary-tree",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/serialize-and-deserialize-binary-tree"
        ],
        "companyCount": 58,
        "frequency": 0.86,
        "orderIndex": 32,
        "levelTag": "challenge",
        "subPattern": "Serialization"
      }
    ]
  },
{
    "id": "graphs",
    "name": "Graph DFS/BFS",
    "slug": "graphs",
    "tier": "core",
    "description": "Explore networks, maps, and grids step-by-step to find connected islands, shortest routes, and dependencies.",
    "orderIndex": 14,
    "color": "#64748b",
    "questionCount": 19,
    "companyCoverage": 59,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "graph-6",
        "externalId": "3997",
        "title": "Print Adjacency List for Graph",
        "slug": "print-adjacency-list-1587115620",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Representation"
      },
      {
        "id": "graph-7",
        "externalId": "3998",
        "title": "Depth First Traversal (DFS) of Graph",
        "slug": "depth-first-traversal-for-a-graph",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Traversal"
      },
      {
        "id": "graph-8",
        "externalId": "3999",
        "title": "Breadth First Traversal (BFS) of Graph",
        "slug": "bfs-traversal-of-graph",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 3,
        "levelTag": "beginner",
        "subPattern": "Traversal"
      },
      {
        "id": "graph-15",
        "externalId": "4003",
        "title": "Shortest Path in Undirected Graph",
        "slug": "shortest-path-in-undirected-graph-having-unit-distance",
        "difficulty": "Easy",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 4,
        "levelTag": "beginner",
        "subPattern": "Unweighted Shortest Path"
      },
      {
        "id": "graph-9",
        "externalId": "547",
        "title": "Number of Provinces",
        "slug": "number-of-provinces",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/number-of-provinces",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/number-of-provinces/description/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Connected Components"
      },
      {
        "id": "gr-1",
        "externalId": "200",
        "title": "Number of Islands",
        "slug": "number-of-islands",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/number-of-islands",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/number-of-islands"
        ],
        "companyCount": 98,
        "frequency": 0.95,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Grid DFS/BFS"
      },
      {
        "id": "graph-14",
        "externalId": "130",
        "title": "Surrounded Regions",
        "slug": "surrounded-regions",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/surrounded-regions",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/surrounded-regions/"
        ],
        "companyCount": 12,
        "frequency": 30,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Grid DFS/BFS"
      },
      {
        "id": "gr-4",
        "externalId": "994",
        "title": "Rotting Oranges",
        "slug": "rotting-oranges",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/rotting-oranges",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/rotting-oranges"
        ],
        "companyCount": 52,
        "frequency": 0.84,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "Multi-Source BFS"
      },
      {
        "id": "gr-2",
        "externalId": "133",
        "title": "Clone Graph",
        "slug": "clone-graph",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/clone-graph",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/clone-graph"
        ],
        "companyCount": 61,
        "frequency": 0.86,
        "orderIndex": 9,
        "levelTag": "core",
        "subPattern": "Graph Copy"
      },
      {
        "id": "graph-13",
        "externalId": "785",
        "title": "Is Graph Bipartite?",
        "slug": "is-graph-bipartite",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/is-graph-bipartite",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/is-graph-bipartite/"
        ],
        "companyCount": 11,
        "frequency": 27.5,
        "orderIndex": 10,
        "levelTag": "core",
        "subPattern": "Graph Coloring"
      },
      {
        "id": "graph-10",
        "externalId": "4000",
        "title": "Detect Cycle in Undirected Graph",
        "slug": "detect-cycle-in-an-undirected-graph",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 11,
        "levelTag": "core",
        "subPattern": "Cycle Detection"
      },
      {
        "id": "graph-11",
        "externalId": "4001",
        "title": "Detect Cycle in Directed Graph",
        "slug": "detect-cycle-in-a-directed-graph",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 12,
        "levelTag": "core",
        "subPattern": "Cycle Detection"
      },
      {
        "id": "graph-12",
        "externalId": "4002",
        "title": "Topological Sort",
        "slug": "topological-sort",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/topological-sort/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/topological-sort/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 13,
        "levelTag": "core",
        "subPattern": "DAG Ordering"
      },
      {
        "id": "gr-3",
        "externalId": "207",
        "title": "Course Schedule",
        "slug": "course-schedule",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/course-schedule",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/course-schedule"
        ],
        "companyCount": 74,
        "frequency": 0.89,
        "orderIndex": 14,
        "levelTag": "core",
        "subPattern": "DAG Ordering"
      },
      {
        "id": "graph-16",
        "externalId": "4004",
        "title": "Dijkstra's Shortest Path Algorithm",
        "slug": "implementing-dijkstra-set-1-adjacency-matrix",
        "difficulty": "Medium",
        "canonicalUrl": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
        "platform": "gfg",
        "solved": false,
        "links": [
          "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1"
        ],
        "companyCount": 15,
        "frequency": 120,
        "orderIndex": 15,
        "levelTag": "core",
        "subPattern": "Weighted Shortest Path"
      },
      {
        "id": "graph-17",
        "externalId": "743",
        "title": "Network Delay Time",
        "slug": "network-delay-time",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/network-delay-time",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/network-delay-time/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 16,
        "levelTag": "core",
        "subPattern": "Weighted Shortest Path"
      },
      {
        "id": "graph-18",
        "externalId": "1631",
        "title": "Path With Minimum Effort",
        "slug": "path-with-minimum-effort",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/path-with-minimum-effort",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/path-with-minimum-effort/"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 17,
        "levelTag": "core",
        "subPattern": "Grid Dijkstra"
      },
      {
        "id": "gr-5",
        "externalId": "127",
        "title": "Word Ladder",
        "slug": "word-ladder",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/word-ladder",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/word-ladder"
        ],
        "companyCount": 48,
        "frequency": 0.82,
        "orderIndex": 18,
        "levelTag": "advanced",
        "subPattern": "State-Space BFS"
      },
      {
        "id": "graph-19",
        "externalId": "778",
        "title": "Swim in Rising Water",
        "slug": "swim-in-rising-water",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/swim-in-rising-water",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/swim-in-rising-water/"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 19,
        "levelTag": "challenge",
        "subPattern": "Minimax Dijkstra"
      }
    ]
  },
{
    "id": "greedy",
    "name": "Greedy Algorithms",
    "slug": "greedy",
    "tier": "core",
    "description": "Make locally optimal choices at each step to reach a global optimum. Common in activity selection, gas stations, jump games, and task schedulers.",
    "orderIndex": 15,
    "color": "#eab308",
    "questionCount": 8,
    "companyCoverage": 50,
    "difficulty": "core",
    "questions": [
      {
        "id": "grd-7",
        "externalId": "455",
        "title": "Assign Cookies",
        "slug": "assign-cookies",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/assign-cookies",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/assign-cookies"
        ],
        "companyCount": 9,
        "frequency": 22.5,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Greedy Matching"
      },
      {
        "id": "grd-8",
        "externalId": "860",
        "title": "Lemonade Change",
        "slug": "lemonade-change",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/lemonade-change",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lemonade-change"
        ],
        "companyCount": 8,
        "frequency": 20,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Greedy Simulation"
      },
      {
        "id": "grd-1",
        "externalId": "55",
        "title": "Jump Game",
        "slug": "jump-game",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/jump-game",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/jump-game"
        ],
        "companyCount": 82,
        "frequency": 0.92,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Reachability"
      },
      {
        "id": "grd-2",
        "externalId": "45",
        "title": "Jump Game II",
        "slug": "jump-game-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/jump-game-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/jump-game-ii"
        ],
        "companyCount": 60,
        "frequency": 0.84,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Min Jumps BFS-Greedy"
      },
      {
        "id": "grd-4",
        "externalId": "763",
        "title": "Partition Labels",
        "slug": "partition-labels",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/partition-labels",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/partition-labels"
        ],
        "companyCount": 42,
        "frequency": 0.72,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Last-Index Interval"
      },
      {
        "id": "grd-5",
        "externalId": "435",
        "title": "Non-overlapping Intervals",
        "slug": "non-overlapping-intervals",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/non-overlapping-intervals",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/non-overlapping-intervals"
        ],
        "companyCount": 48,
        "frequency": 0.76,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "Interval Scheduling"
      },
      {
        "id": "grd-3",
        "externalId": "134",
        "title": "Gas Station",
        "slug": "gas-station",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/gas-station",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/gas-station"
        ],
        "companyCount": 55,
        "frequency": 0.8,
        "orderIndex": 7,
        "levelTag": "advanced",
        "subPattern": "Circular Deficit Reset"
      },
      {
        "id": "grd-6",
        "externalId": "621",
        "title": "Task Scheduler",
        "slug": "task-scheduler",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/task-scheduler",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/task-scheduler"
        ],
        "companyCount": 68,
        "frequency": 0.86,
        "orderIndex": 8,
        "levelTag": "challenge",
        "subPattern": "Frequency Scheduling"
      }
    ]
  },
{
    "id": "dynamic-programming",
    "name": "Dynamic Programming",
    "slug": "dynamic-programming",
    "tier": "advanced",
    "description": "Stop re-calculating the same work. Break big problems into smaller steps and save your answers to solve them effortlessly.",
    "orderIndex": 16,
    "color": "#dc2626",
    "questionCount": 10,
    "companyCoverage": 100,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "dp-1",
        "externalId": "70",
        "title": "Climbing Stairs",
        "slug": "climbing-stairs",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/climbing-stairs",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/climbing-stairs"
        ],
        "companyCount": 67,
        "frequency": 0.88,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "1D DP"
      },
      {
        "id": "dp-7",
        "externalId": "198",
        "title": "House Robber",
        "slug": "house-robber",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/house-robber",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/house-robber"
        ],
        "companyCount": 40,
        "frequency": 100,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "1D DP"
      },
      {
        "id": "dp-8",
        "externalId": "62",
        "title": "Unique Paths",
        "slug": "unique-paths",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/unique-paths",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/unique-paths"
        ],
        "companyCount": 21,
        "frequency": 52.5,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "2D Grid DP"
      },
      {
        "id": "dp-4",
        "externalId": "416",
        "title": "Partition Equal Subset Sum",
        "slug": "partition-equal-subset-sum",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/partition-equal-subset-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/partition-equal-subset-sum"
        ],
        "companyCount": 51,
        "frequency": 0.84,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "0/1 Knapsack"
      },
      {
        "id": "dp-2",
        "externalId": "322",
        "title": "Coin Change",
        "slug": "coin-change",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/coin-change",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/coin-change"
        ],
        "companyCount": 82,
        "frequency": 0.91,
        "orderIndex": 5,
        "levelTag": "core",
        "subPattern": "Unbounded Knapsack"
      },
      {
        "id": "dp-10",
        "externalId": "139",
        "title": "Word Break",
        "slug": "word-break",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/word-break",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/word-break"
        ],
        "companyCount": 32,
        "frequency": 80,
        "orderIndex": 6,
        "levelTag": "core",
        "subPattern": "String Partition DP"
      },
      {
        "id": "dp-9",
        "externalId": "300",
        "title": "Longest Increasing Subsequence",
        "slug": "longest-increasing-subsequence",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-increasing-subsequence",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-increasing-subsequence"
        ],
        "companyCount": 30,
        "frequency": 75,
        "orderIndex": 7,
        "levelTag": "core",
        "subPattern": "Subsequence DP"
      },
      {
        "id": "dp-3",
        "externalId": "1143",
        "title": "Longest Common Subsequence",
        "slug": "longest-common-subsequence",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-common-subsequence",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-common-subsequence"
        ],
        "companyCount": 64,
        "frequency": 0.87,
        "orderIndex": 8,
        "levelTag": "core",
        "subPattern": "2D String DP"
      },
      {
        "id": "dp-5",
        "externalId": "72",
        "title": "Edit Distance",
        "slug": "edit-distance",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/edit-distance",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/edit-distance"
        ],
        "companyCount": 58,
        "frequency": 0.85,
        "orderIndex": 9,
        "levelTag": "advanced",
        "subPattern": "2D String DP"
      },
      {
        "id": "dp-6",
        "externalId": "312",
        "title": "Burst Balloons",
        "slug": "burst-balloons",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/burst-balloons",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/burst-balloons"
        ],
        "companyCount": 33,
        "frequency": 0.76,
        "orderIndex": 10,
        "levelTag": "challenge",
        "subPattern": "Interval DP"
      }
    ]
  },
{
    "id": "monotonic-stack-queue",
    "name": "Monotonic Stack & Queue",
    "slug": "monotonic-stack-queue",
    "tier": "advanced",
    "description": "Maintain elements in strictly increasing or decreasing order to solve next greater element, stock spans, and sliding window extrema in O(n).",
    "orderIndex": 17,
    "color": "#f97316",
    "questionCount": 6,
    "companyCoverage": 48,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "ms-2",
        "externalId": "496",
        "title": "Next Greater Element I",
        "slug": "next-greater-element-i",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/next-greater-element-i",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/next-greater-element-i"
        ],
        "companyCount": 38,
        "frequency": 0.72,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Monotonic Stack"
      },
      {
        "id": "ms-1",
        "externalId": "739",
        "title": "Daily Temperatures",
        "slug": "daily-temperatures",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/daily-temperatures",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/daily-temperatures"
        ],
        "companyCount": 52,
        "frequency": 0.88,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "Monotonic Stack"
      },
      {
        "id": "ms-3",
        "externalId": "901",
        "title": "Online Stock Span",
        "slug": "online-stock-span",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/online-stock-span",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/online-stock-span"
        ],
        "companyCount": 30,
        "frequency": 0.65,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Streaming Span"
      },
      {
        "id": "ms-4",
        "externalId": "84",
        "title": "Largest Rectangle in Histogram",
        "slug": "largest-rectangle-in-histogram",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/largest-rectangle-in-histogram",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/largest-rectangle-in-histogram"
        ],
        "companyCount": 65,
        "frequency": 0.85,
        "orderIndex": 4,
        "levelTag": "advanced",
        "subPattern": "Dual Boundaries"
      },
      {
        "id": "ms-5",
        "externalId": "239",
        "title": "Sliding Window Maximum",
        "slug": "sliding-window-maximum",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/sliding-window-maximum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sliding-window-maximum"
        ],
        "companyCount": 72,
        "frequency": 0.9,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "Monotonic Deque"
      },
      {
        "id": "ms-6",
        "externalId": "42",
        "title": "Trapping Rain Water",
        "slug": "trapping-rain-water",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/trapping-rain-water",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/trapping-rain-water"
        ],
        "companyCount": 110,
        "frequency": 0.98,
        "orderIndex": 6,
        "levelTag": "challenge",
        "subPattern": "Water Trapping Stack"
      }
    ]
  },
{
    "id": "trie",
    "name": "Trie (Prefix Tree)",
    "slug": "trie",
    "tier": "advanced",
    "description": "Tree-based data structure optimized for fast prefix lookup, dictionary search, autocomplete, and bitwise XOR queries in O(length).",
    "orderIndex": 18,
    "color": "#06b6d4",
    "questionCount": 6,
    "companyCoverage": 44,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "trie-2",
        "externalId": "14",
        "title": "Longest Common Prefix",
        "slug": "longest-common-prefix",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/longest-common-prefix",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-common-prefix"
        ],
        "companyCount": 85,
        "frequency": 0.92,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Prefix Concept"
      },
      {
        "id": "trie-1",
        "externalId": "208",
        "title": "Implement Trie (Prefix Tree)",
        "slug": "implement-trie-prefix-tree",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/implement-trie-prefix-tree",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/implement-trie-prefix-tree"
        ],
        "companyCount": 68,
        "frequency": 0.86,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "Core Trie"
      },
      {
        "id": "trie-4",
        "externalId": "648",
        "title": "Replace Words",
        "slug": "replace-words",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/replace-words",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/replace-words"
        ],
        "companyCount": 28,
        "frequency": 0.6,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Prefix Query"
      },
      {
        "id": "trie-3",
        "externalId": "211",
        "title": "Design Add and Search Words Data Structure",
        "slug": "design-add-and-search-words-data-structure",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/design-add-and-search-words-data-structure",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/design-add-and-search-words-data-structure"
        ],
        "companyCount": 42,
        "frequency": 0.74,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Wildcard DFS Trie"
      },
      {
        "id": "trie-5",
        "externalId": "421",
        "title": "Maximum XOR of Two Numbers in an Array",
        "slug": "maximum-xor-of-two-numbers-in-an-array",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array"
        ],
        "companyCount": 24,
        "frequency": 0.58,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "Bitwise Trie"
      },
      {
        "id": "trie-6",
        "externalId": "212",
        "title": "Word Search II",
        "slug": "word-search-ii",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/word-search-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/word-search-ii"
        ],
        "companyCount": 56,
        "frequency": 0.84,
        "orderIndex": 6,
        "levelTag": "challenge",
        "subPattern": "Trie + Grid DFS"
      }
    ]
  },
{
    "id": "topological-sort",
    "name": "Topological Sort",
    "slug": "topological-sort",
    "tier": "advanced",
    "description": "Linear ordering of vertices in a Directed Acyclic Graph (DAG) using Kahn's BFS in-degree algorithm or DFS post-order traversal.",
    "orderIndex": 19,
    "color": "#8b5cf6",
    "questionCount": 5,
    "companyCoverage": 46,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "ts-1",
        "externalId": "207",
        "title": "Course Schedule",
        "slug": "course-schedule",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/course-schedule",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/course-schedule"
        ],
        "companyCount": 88,
        "frequency": 0.94,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Cycle Check"
      },
      {
        "id": "ts-2",
        "externalId": "210",
        "title": "Course Schedule II",
        "slug": "course-schedule-ii",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/course-schedule-ii",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/course-schedule-ii"
        ],
        "companyCount": 65,
        "frequency": 0.86,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "Linear Ordering"
      },
      {
        "id": "ts-4",
        "externalId": "802",
        "title": "Find Eventual Safe States",
        "slug": "find-eventual-safe-states",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/find-eventual-safe-states",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-eventual-safe-states"
        ],
        "companyCount": 22,
        "frequency": 0.55,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Reverse DAG"
      },
      {
        "id": "ts-3",
        "externalId": "310",
        "title": "Minimum Height Trees",
        "slug": "minimum-height-trees",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/minimum-height-trees",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/minimum-height-trees"
        ],
        "companyCount": 32,
        "frequency": 0.68,
        "orderIndex": 4,
        "levelTag": "advanced",
        "subPattern": "Centroid Peeling"
      },
      {
        "id": "ts-5",
        "externalId": "269",
        "title": "Alien Dictionary",
        "slug": "alien-dictionary",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/alien-dictionary",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/alien-dictionary"
        ],
        "companyCount": 45,
        "frequency": 0.82,
        "orderIndex": 5,
        "levelTag": "challenge",
        "subPattern": "DAG Construction"
      }
    ]
  },
{
    "id": "union-find",
    "name": "Union-Find / Disjoint Set (DSU)",
    "slug": "union-find",
    "tier": "advanced",
    "description": "Near O(1) dynamic connectivity queries using path compression and union by rank. Key for connected components, Kruskal's MST, and cycle detection.",
    "orderIndex": 20,
    "color": "#10b981",
    "questionCount": 5,
    "companyCoverage": 42,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "uf-2",
        "externalId": "547",
        "title": "Number of Provinces",
        "slug": "number-of-provinces",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/number-of-provinces",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/number-of-provinces"
        ],
        "companyCount": 48,
        "frequency": 0.78,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Connected Components"
      },
      {
        "id": "uf-1",
        "externalId": "684",
        "title": "Redundant Connection",
        "slug": "redundant-connection",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/redundant-connection",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/redundant-connection"
        ],
        "companyCount": 36,
        "frequency": 0.7,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "Cycle Detection"
      },
      {
        "id": "uf-5",
        "externalId": "200",
        "title": "Number of Islands",
        "slug": "number-of-islands",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/number-of-islands",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/number-of-islands"
        ],
        "companyCount": 130,
        "frequency": 0.99,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "2D Grid DSU"
      },
      {
        "id": "uf-3",
        "externalId": "721",
        "title": "Accounts Merge",
        "slug": "accounts-merge",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/accounts-merge",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/accounts-merge"
        ],
        "companyCount": 54,
        "frequency": 0.8,
        "orderIndex": 4,
        "levelTag": "advanced",
        "subPattern": "Equivalence Merging"
      },
      {
        "id": "uf-4",
        "externalId": "128",
        "title": "Longest Consecutive Sequence",
        "slug": "longest-consecutive-sequence",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/longest-consecutive-sequence",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/longest-consecutive-sequence"
        ],
        "companyCount": 76,
        "frequency": 0.9,
        "orderIndex": 5,
        "levelTag": "challenge",
        "subPattern": "Implicit Sequence DSU"
      }
    ]
  },
{
    "id": "bit-manipulation",
    "name": "Bit Manipulation & Math",
    "slug": "bit-manipulation",
    "tier": "advanced",
    "description": "Constant-time bitwise operations (AND, OR, XOR, shifts) for subset generation, parity checking, arithmetic without operators, and bitmask DP.",
    "orderIndex": 21,
    "color": "#ec4899",
    "questionCount": 6,
    "companyCoverage": 38,
    "difficulty": "core",
    "questions": [
      {
        "id": "bm-1",
        "externalId": "136",
        "title": "Single Number",
        "slug": "single-number",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/single-number",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/single-number"
        ],
        "companyCount": 62,
        "frequency": 0.85,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "XOR Cancellation"
      },
      {
        "id": "bm-4",
        "externalId": "268",
        "title": "Missing Number",
        "slug": "missing-number",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/missing-number",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/missing-number"
        ],
        "companyCount": 50,
        "frequency": 0.76,
        "orderIndex": 2,
        "levelTag": "beginner",
        "subPattern": "XOR Pairing"
      },
      {
        "id": "bm-2",
        "externalId": "191",
        "title": "Number of 1 Bits",
        "slug": "number-of-1-bits",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/number-of-1-bits",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/number-of-1-bits"
        ],
        "companyCount": 45,
        "frequency": 0.72,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Bit Clearing"
      },
      {
        "id": "bm-3",
        "externalId": "338",
        "title": "Counting Bits",
        "slug": "counting-bits",
        "difficulty": "Easy",
        "canonicalUrl": "https://leetcode.com/problems/counting-bits",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/counting-bits"
        ],
        "companyCount": 38,
        "frequency": 0.68,
        "orderIndex": 4,
        "levelTag": "core",
        "subPattern": "Bitwise DP"
      },
      {
        "id": "bm-5",
        "externalId": "78",
        "title": "Subsets",
        "slug": "subsets",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/subsets",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/subsets"
        ],
        "companyCount": 70,
        "frequency": 0.88,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "Bitmask Enumeration"
      },
      {
        "id": "bm-6",
        "externalId": "371",
        "title": "Sum of Two Integers",
        "slug": "sum-of-two-integers",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/sum-of-two-integers",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/sum-of-two-integers"
        ],
        "companyCount": 28,
        "frequency": 0.6,
        "orderIndex": 6,
        "levelTag": "challenge",
        "subPattern": "Binary Adder"
      }
    ]
  },
{
    "id": "matrix-traversal",
    "name": "Matrix Traversal & Simulation",
    "slug": "matrix-traversal",
    "tier": "advanced",
    "description": "Grid-based simulation, boundary walks, 2D in-place rotations, state-machine transitions, and multi-source flood-fill algorithms.",
    "orderIndex": 22,
    "color": "#14b8a6",
    "questionCount": 6,
    "companyCoverage": 46,
    "difficulty": "core",
    "questions": [
      {
        "id": "mx-3",
        "externalId": "48",
        "title": "Rotate Image",
        "slug": "rotate-image",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/rotate-image",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/rotate-image"
        ],
        "companyCount": 72,
        "frequency": 0.88,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "In-Place Transform"
      },
      {
        "id": "mx-1",
        "externalId": "54",
        "title": "Spiral Matrix",
        "slug": "spiral-matrix",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/spiral-matrix",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/spiral-matrix"
        ],
        "companyCount": 78,
        "frequency": 0.91,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "Boundary Simulation"
      },
      {
        "id": "mx-2",
        "externalId": "73",
        "title": "Set Matrix Zeroes",
        "slug": "set-matrix-zeroes",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/set-matrix-zeroes",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/set-matrix-zeroes"
        ],
        "companyCount": 64,
        "frequency": 0.85,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "In-Place Markers"
      },
      {
        "id": "mx-6",
        "externalId": "289",
        "title": "Game of Life",
        "slug": "game-of-life",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/game-of-life",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/game-of-life"
        ],
        "companyCount": 40,
        "frequency": 0.7,
        "orderIndex": 4,
        "levelTag": "advanced",
        "subPattern": "State Encoding"
      },
      {
        "id": "mx-5",
        "externalId": "994",
        "title": "Rotting Oranges",
        "slug": "rotting-oranges",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/rotting-oranges",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/rotting-oranges"
        ],
        "companyCount": 94,
        "frequency": 0.95,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "Multi-Source Grid BFS"
      },
      {
        "id": "mx-4",
        "externalId": "79",
        "title": "Word Search",
        "slug": "word-search",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/word-search",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/word-search"
        ],
        "companyCount": 86,
        "frequency": 0.93,
        "orderIndex": 6,
        "levelTag": "challenge",
        "subPattern": "Grid DFS Backtracking"
      }
    ]
  },
{
    "id": "design-hybrid-structures",
    "name": "Design & Hybrid Structures",
    "slug": "design-hybrid-structures",
    "tier": "advanced",
    "description": "Composite data structures combining Hash Maps, Doubly Linked Lists, Heaps, and Binary Trees to achieve strict O(1) or O(log n) performance.",
    "orderIndex": 23,
    "color": "#3b82f6",
    "questionCount": 6,
    "companyCoverage": 62,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "dh-2",
        "externalId": "155",
        "title": "Min Stack",
        "slug": "min-stack",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/min-stack",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/min-stack"
        ],
        "companyCount": 80,
        "frequency": 0.9,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Aux Stack Design"
      },
      {
        "id": "dh-3",
        "externalId": "380",
        "title": "Insert Delete GetRandom O(1)",
        "slug": "insert-delete-getrandom-o1",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/insert-delete-getrandom-o1",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/insert-delete-getrandom-o1"
        ],
        "companyCount": 65,
        "frequency": 0.85,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "HashMap + Array"
      },
      {
        "id": "dh-4",
        "externalId": "981",
        "title": "Time Based Key-Value Store",
        "slug": "time-based-key-value-store",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/time-based-key-value-store",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/time-based-key-value-store"
        ],
        "companyCount": 58,
        "frequency": 0.82,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "HashMap + Binary Search"
      },
      {
        "id": "dh-1",
        "externalId": "146",
        "title": "LRU Cache",
        "slug": "lru-cache",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/lru-cache",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lru-cache"
        ],
        "companyCount": 120,
        "frequency": 1,
        "orderIndex": 4,
        "levelTag": "advanced",
        "subPattern": "HashMap + Doubly Linked List"
      },
      {
        "id": "dh-5",
        "externalId": "460",
        "title": "LFU Cache",
        "slug": "lfu-cache",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/lfu-cache",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/lfu-cache"
        ],
        "companyCount": 50,
        "frequency": 0.78,
        "orderIndex": 5,
        "levelTag": "advanced",
        "subPattern": "Multi-Map + Freq Lists"
      },
      {
        "id": "dh-6",
        "externalId": "295",
        "title": "Find Median from Data Stream",
        "slug": "find-median-from-data-stream",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/find-median-from-data-stream",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/find-median-from-data-stream"
        ],
        "companyCount": 75,
        "frequency": 0.89,
        "orderIndex": 6,
        "levelTag": "challenge",
        "subPattern": "Two Heaps Stream"
      }
    ]
  },
{
    "id": "segment-tree",
    "name": "Segment & Fenwick Trees",
    "slug": "segment-tree",
    "tier": "advanced",
    "description": "Binary tree and prefix sum trees supporting dynamic range queries (sum, min, max) and point/range updates in O(log n) time.",
    "orderIndex": 24,
    "color": "#d946ef",
    "questionCount": 5,
    "companyCoverage": 25,
    "difficulty": "advanced",
    "questions": [
      {
        "id": "seg-1",
        "externalId": "307",
        "title": "Range Sum Query - Mutable",
        "slug": "range-sum-query-mutable",
        "difficulty": "Medium",
        "canonicalUrl": "https://leetcode.com/problems/range-sum-query-mutable",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/range-sum-query-mutable"
        ],
        "companyCount": 25,
        "frequency": 0.6,
        "orderIndex": 1,
        "levelTag": "beginner",
        "subPattern": "Point Update Range Sum"
      },
      {
        "id": "seg-2",
        "externalId": "315",
        "title": "Count of Smaller Numbers After Self",
        "slug": "count-of-smaller-numbers-after-self",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/count-of-smaller-numbers-after-self",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/count-of-smaller-numbers-after-self"
        ],
        "companyCount": 35,
        "frequency": 0.72,
        "orderIndex": 2,
        "levelTag": "core",
        "subPattern": "Coord Compression + BIT"
      },
      {
        "id": "seg-5",
        "externalId": "327",
        "title": "Count of Range Sum",
        "slug": "count-of-range-sum",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/count-of-range-sum",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/count-of-range-sum"
        ],
        "companyCount": 20,
        "frequency": 0.5,
        "orderIndex": 3,
        "levelTag": "core",
        "subPattern": "Coord Compression + BIT"
      },
      {
        "id": "seg-4",
        "externalId": "699",
        "title": "Falling Squares",
        "slug": "falling-squares",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/falling-squares",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/falling-squares"
        ],
        "companyCount": 15,
        "frequency": 0.45,
        "orderIndex": 4,
        "levelTag": "advanced",
        "subPattern": "Interval Max Segment Tree"
      },
      {
        "id": "seg-3",
        "externalId": "218",
        "title": "The Skyline Problem",
        "slug": "the-skyline-problem",
        "difficulty": "Hard",
        "canonicalUrl": "https://leetcode.com/problems/the-skyline-problem",
        "platform": "leetcode",
        "solved": false,
        "links": [
          "https://leetcode.com/problems/the-skyline-problem"
        ],
        "companyCount": 30,
        "frequency": 0.68,
        "orderIndex": 5,
        "levelTag": "challenge",
        "subPattern": "Sweep Line Height Max"
      }
    ]
  }
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

