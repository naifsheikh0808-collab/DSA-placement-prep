/**
 * Automated Dataset Enrichment & Pattern Normalizer Pipeline
 * Implements the 4-Tier Zero-Mistake Classification Architecture:
 *   Level 1: Curated Roadmap Priority (seed.ts)
 *   Level 2: Top 250 FAANG Classics Master Dictionary
 *   Level 3: LeetCode Official Tags + Specificity Matrix (from local cache of 4,109 problems)
 *   Level 4: Compound Hybrid Rules Engine
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.resolve(__dirname, '../src/lib/data/generated_dataset.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const leetcodeCachePath = path.resolve(__dirname, 'data/leetcode_tags_cache.json');
let leetcodeCache = {};
if (fs.existsSync(leetcodeCachePath)) {
  leetcodeCache = JSON.parse(fs.readFileSync(leetcodeCachePath, 'utf8'));
  console.log(`[Level 3] Loaded official LeetCode topic tags cache with ${Object.keys(leetcodeCache).length} problems.`);
} else {
  console.warn('[Level 3] Warning: leetcode_tags_cache.json not found!');
}

// ─── RAW TAG NORMALIZATION MAP ────────────────────────────────────────────────
const RAW_TAG_MAP = {
  '1 pattern two pointers': 'Two Pointers',
  'two pointers': 'Two Pointers',
  '3 pattern sliding window': 'Sliding Window',
  'sliding window': 'Sliding Window',
  'pattern kadane pattern': "Kadane's Algorithm",
  'kadane s algorithm': "Kadane's Algorithm",
  'kadanes algorithm': "Kadane's Algorithm",
  'kadane': "Kadane's Algorithm",
  'prefix sum': 'Prefix Sum',
  '4 pattern merge intervals': 'Merge Intervals',
  'merge intervals': 'Merge Intervals',
  'in place reversal of linked list': 'In-place Linked List Reversal',
  'in place linked list reversal': 'In-place Linked List Reversal',
  'linked list': 'In-place Linked List Reversal',
  'fast slow pointers': 'Fast & Slow Pointers',
  '7 pattern stack': 'Stack',
  'stack': 'Stack',
  'hashmap hashset': 'Hash Maps / Hash Sets',
  'hash map hash set': 'Hash Maps / Hash Sets',
  'hash maps hash sets': 'Hash Maps / Hash Sets',
  'hash table': 'Hash Maps / Hash Sets',
  '10 pattern binary search': 'Binary Search',
  'binary search': 'Binary Search',
  'heap pattern': 'Heap / Priority Queue',
  'heap priority queue': 'Heap / Priority Queue',
  'binary tree bst': 'Binary Tree & BST',
  'recursion and backtracking pattern': 'Backtracking',
  'backtracking': 'Backtracking',
  'graphs': 'Graph DFS/BFS',
  'graph dfs bfs': 'Graph DFS/BFS',
  'dynamic programming': 'Dynamic Programming',
  'monotonic queue': 'Monotonic Stack & Queue',
  'trie': 'Trie (Prefix Tree)',
  'union find': 'Union-Find / Disjoint Set (DSU)',
  'topological sort': 'Topological Sort',
  'bit manipulation': 'Bit Manipulation & Math',
  'greedy': 'Greedy Algorithms',
  'matrix': 'Matrix Traversal & Simulation',
  'sorting': 'Sorting & Search',
  'sorting search': 'Sorting & Search',
  'cyclic sort': 'Cyclic Sort'
};

function normalizeKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// ─── LEVEL 2: TOP 250 FAANG CLASSICS MASTER DICTIONARY ────────────────────────
const FAANG_CLASSICS = {
  // Top Design & Hybrid Classics
  '146': { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'In-place Linked List Reversal'] }, // LRU Cache
  '460': { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'In-place Linked List Reversal', 'Heap / Priority Queue'] }, // LFU Cache
  '380': { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets'] }, // Insert Delete GetRandom O(1)
  '155': { primary: 'Design & Hybrid Structures', secondary: ['Stack'] }, // Min Stack
  '981': { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'Binary Search'] }, // Time Based Key-Value Store
  '295': { primary: 'Design & Hybrid Structures', secondary: ['Heap / Priority Queue'] }, // Find Median from Data Stream
  '208': { primary: 'Trie (Prefix Tree)', secondary: ['Design & Hybrid Structures'] }, // Implement Trie
  '211': { primary: 'Trie (Prefix Tree)', secondary: ['Design & Hybrid Structures', 'Backtracking'] }, // Design Add and Search Words
  '362': { primary: 'Design & Hybrid Structures', secondary: ['Queue', 'Hash Maps / Hash Sets'] }, // Design Hit Counter
  '359': { primary: 'Hash Maps / Hash Sets', secondary: ['Design & Hybrid Structures'] }, // Logger Rate Limiter
  '622': { primary: 'Design & Hybrid Structures', secondary: ['In-place Linked List Reversal'] }, // Design Circular Queue
  '1146': { primary: 'Binary Search', secondary: ['Design & Hybrid Structures', 'Hash Maps / Hash Sets'] }, // Snapshot Array
  '2043': { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets'] }, // Simple Bank System
  '341': { primary: 'Stack', secondary: ['Design & Hybrid Structures', 'In-place Linked List Reversal'] }, // Flatten Nested List Iterator

  // Top Sliding Window Classics
  '3': { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] }, // Longest Substring Without Repeating Characters
  '76': { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] }, // Minimum Window Substring
  '424': { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] }, // Longest Repeating Character Replacement
  '438': { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] }, // Find All Anagrams in a String
  '567': { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] }, // Permutation in String
  '713': { primary: 'Sliding Window', secondary: ['Two Pointers'] }, // Subarray Product Less Than K
  '209': { primary: 'Sliding Window', secondary: ['Two Pointers', 'Binary Search'] }, // Minimum Size Subarray Sum
  '1004': { primary: 'Sliding Window', secondary: ['Two Pointers', 'Prefix Sum'] }, // Max Consecutive Ones III

  // Top Two Pointers & Monotonic Classics
  '42': { primary: 'Two Pointers', secondary: ['Monotonic Stack & Queue', 'Dynamic Programming'] }, // Trapping Rain Water
  '11': { primary: 'Two Pointers', secondary: ['Greedy Algorithms'] }, // Container With Most Water
  '15': { primary: 'Two Pointers', secondary: ['Sorting & Search'] }, // 3Sum
  '16': { primary: 'Two Pointers', secondary: ['Sorting & Search'] }, // 3Sum Closest
  '18': { primary: 'Two Pointers', secondary: ['Sorting & Search'] }, // 4Sum
  '167': { primary: 'Two Pointers', secondary: ['Binary Search'] }, // Two Sum II
  '84': { primary: 'Monotonic Stack & Queue', secondary: ['Stack'] }, // Largest Rectangle in Histogram
  '739': { primary: 'Monotonic Stack & Queue', secondary: ['Stack'] }, // Daily Temperatures
  '496': { primary: 'Monotonic Stack & Queue', secondary: ['Stack', 'Hash Maps / Hash Sets'] }, // Next Greater Element I
  '503': { primary: 'Monotonic Stack & Queue', secondary: ['Stack'] }, // Next Greater Element II
  '239': { primary: 'Monotonic Stack & Queue', secondary: ['Sliding Window'] }, // Sliding Window Maximum
  '901': { primary: 'Monotonic Stack & Queue', secondary: ['Stack', 'Design & Hybrid Structures'] }, // Online Stock Span
  '443': { primary: 'Two Pointers', secondary: ['String Manipulation'] }, // String Compression
  '151': { primary: 'Two Pointers', secondary: ['String Manipulation'] }, // Reverse Words in a String
  '189': { primary: 'Two Pointers', secondary: ['Math & Bit Manipulation'] }, // Rotate Array
  '8': { primary: 'Two Pointers', secondary: ['String Manipulation'] }, // String to Integer (atoi)
  '68': { primary: 'Greedy Algorithms', secondary: ['Two Pointers', 'String Manipulation'] }, // Text Justification

  // Top Graph & Topological Sort Classics
  '200': { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)', 'Matrix Traversal & Simulation'] }, // Number of Islands
  '207': { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] }, // Course Schedule
  '210': { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] }, // Course Schedule II
  '269': { primary: 'Topological Sort', secondary: ['Graph DFS/BFS', 'Trie (Prefix Tree)'] }, // Alien Dictionary
  '310': { primary: 'Topological Sort', secondary: ['Graph DFS/BFS', 'Binary Tree & BST'] }, // Minimum Height Trees
  '802': { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] }, // Find Eventual Safe States
  '127': { primary: 'Graph DFS/BFS', secondary: ['Hash Maps / Hash Sets', 'Shortest Path'] }, // Word Ladder
  '133': { primary: 'Graph DFS/BFS', secondary: ['Hash Maps / Hash Sets'] }, // Clone Graph
  '785': { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)'] }, // Is Graph Bipartite?
  '815': { primary: 'Graph DFS/BFS', secondary: ['Hash Maps / Hash Sets'] }, // Bus Routes
  '332': { primary: 'Graph DFS/BFS', secondary: ['Backtracking', 'Eulerian Path'] }, // Reconstruct Itinerary

  // Top Union-Find Classics
  '547': { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] }, // Number of Provinces
  '684': { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] }, // Redundant Connection
  '721': { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Hash Maps / Hash Sets', 'Graph DFS/BFS'] }, // Accounts Merge
  '128': { primary: 'Hash Maps / Hash Sets', secondary: ['Union-Find / Disjoint Set (DSU)'] }, // Longest Consecutive Sequence
  '323': { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] }, // Connected Components

  // Top Trie Classics
  '14': { primary: 'Trie (Prefix Tree)', secondary: ['Two Pointers', 'String Manipulation'] }, // Longest Common Prefix
  '212': { primary: 'Trie (Prefix Tree)', secondary: ['Backtracking', 'Matrix Traversal & Simulation'] }, // Word Search II
  '648': { primary: 'Trie (Prefix Tree)', secondary: ['Hash Maps / Hash Sets'] }, // Replace Words
  '421': { primary: 'Trie (Prefix Tree)', secondary: ['Bit Manipulation & Math'] }, // Maximum XOR
  '1268': { primary: 'Trie (Prefix Tree)', secondary: ['Binary Search', 'Two Pointers'] }, // Search Suggestions System

  // Top Matrix & Simulation Classics
  '54': { primary: 'Matrix Traversal & Simulation', secondary: ['Two Pointers'] }, // Spiral Matrix
  '59': { primary: 'Matrix Traversal & Simulation', secondary: ['Two Pointers'] }, // Spiral Matrix II
  '73': { primary: 'Matrix Traversal & Simulation', secondary: ['Hash Maps / Hash Sets'] }, // Set Matrix Zeroes
  '48': { primary: 'Matrix Traversal & Simulation', secondary: ['Math & Bit Manipulation'] }, // Rotate Image
  '79': { primary: 'Backtracking', secondary: ['Matrix Traversal & Simulation', 'Graph DFS/BFS'] }, // Word Search
  '994': { primary: 'Graph DFS/BFS', secondary: ['Matrix Traversal & Simulation'] }, // Rotting Oranges
  '289': { primary: 'Matrix Traversal & Simulation', secondary: ['Bit Manipulation & Math'] }, // Game of Life
  '36': { primary: 'Hash Maps / Hash Sets', secondary: ['Matrix Traversal & Simulation'] }, // Valid Sudoku
  '6': { primary: 'Matrix Traversal & Simulation', secondary: ['String Manipulation'] }, // Zigzag Conversion

  // Top Greedy & Math Classics
  '55': { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] }, // Jump Game
  '45': { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] }, // Jump Game II
  '134': { primary: 'Greedy Algorithms', secondary: ['Two Pointers'] }, // Gas Station
  '763': { primary: 'Greedy Algorithms', secondary: ['Two Pointers', 'Hash Maps / Hash Sets'] }, // Partition Labels
  '621': { primary: 'Greedy Algorithms', secondary: ['Heap / Priority Queue', 'Hash Maps / Hash Sets'] }, // Task Scheduler
  '435': { primary: 'Greedy Algorithms', secondary: ['Merge Intervals', 'Sorting & Search'] }, // Non-overlapping Intervals
  '12': { primary: 'Greedy Algorithms', secondary: ['Hash Maps / Hash Sets'] }, // Integer to Roman
  '13': { primary: 'Hash Maps / Hash Sets', secondary: ['Greedy Algorithms'] }, // Roman to Integer
  '179': { primary: 'Greedy Algorithms', secondary: ['Sorting & Search'] }, // Largest Number
  '169': { primary: 'Hash Maps / Hash Sets', secondary: ['Boyer-Moore Voting'] }, // Majority Element
  '50': { primary: 'Binary Search', secondary: ['Recursion', 'Math & Bit Manipulation'] }, // Pow(x, n)
  '7': { primary: 'Bit Manipulation & Math', secondary: ['Math'] }, // Reverse Integer

  // Top Bit Manipulation Classics
  '136': { primary: 'Bit Manipulation & Math', secondary: ['Hash Maps / Hash Sets'] }, // Single Number
  '137': { primary: 'Bit Manipulation & Math', secondary: ['Hash Maps / Hash Sets'] }, // Single Number II
  '260': { primary: 'Bit Manipulation & Math', secondary: ['Hash Maps / Hash Sets'] }, // Single Number III
  '191': { primary: 'Bit Manipulation & Math', secondary: ['Math'] }, // Number of 1 Bits
  '338': { primary: 'Bit Manipulation & Math', secondary: ['Dynamic Programming'] }, // Counting Bits
  '268': { primary: 'Bit Manipulation & Math', secondary: ['Hash Maps / Hash Sets', 'Binary Search'] }, // Missing Number
  '78': { primary: 'Backtracking', secondary: ['Bit Manipulation & Math'] }, // Subsets
  '371': { primary: 'Bit Manipulation & Math', secondary: ['Math'] }, // Sum of Two Integers

  // Top Dynamic Programming & Kadane Classics
  '53': { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming', 'Divide and Conquer'] }, // Maximum Subarray
  '121': { primary: 'Dynamic Programming', secondary: ["Kadane's Algorithm", 'Two Pointers'] }, // Best Time to Buy and Sell Stock
  '122': { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] }, // Best Time to Buy and Sell Stock II
  '70': { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] }, // Climbing Stairs
  '198': { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] }, // House Robber
  '213': { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] }, // House Robber II
  '322': { primary: 'Dynamic Programming', secondary: ['Breadth-First Search'] }, // Coin Change
  '300': { primary: 'Dynamic Programming', secondary: ['Binary Search'] }, // Longest Increasing Subsequence
  '1143': { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] }, // Longest Common Subsequence
  '72': { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] }, // Edit Distance

  // Top Heap & Intervals Classics
  '215': { primary: 'Heap / Priority Queue', secondary: ['Quickselect', 'Divide and Conquer'] }, // Kth Largest Element
  '347': { primary: 'Heap / Priority Queue', secondary: ['Hash Maps / Hash Sets', 'Bucket Sort'] }, // Top K Frequent Elements
  '23': { primary: 'Heap / Priority Queue', secondary: ['Divide and Conquer', 'In-place Linked List Reversal'] }, // Merge k Sorted Lists
  '56': { primary: 'Merge Intervals', secondary: ['Sorting & Search'] }, // Merge Intervals
  '57': { primary: 'Merge Intervals', secondary: ['Binary Search'] }, // Insert Interval
  '252': { primary: 'Merge Intervals', secondary: ['Sorting & Search'] }, // Meeting Rooms
  '253': { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue', 'Two Pointers'] }, // Meeting Rooms II
};

// ─── LEVEL 1: EXTRACT SEED.TS CURATED QUESTIONS ───────────────────────────────
const seedPath = path.resolve(__dirname, '../src/lib/data/seed.ts');
const seedContent = fs.readFileSync(seedPath, 'utf8');

const CURATED_SEED_MAP = {};
const patternRegex = /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",[\s\S]*?questions:\s*\[([\s\S]*?)\]\s*\},/g;
let pMatch;
while ((pMatch = patternRegex.exec(seedContent)) !== null) {
  const pName = pMatch[2];
  const qBlock = pMatch[3];
  const qExtRegex = /externalId:\s*"([^"]+)"/g;
  let qMatch;
  while ((qMatch = qExtRegex.exec(qBlock)) !== null) {
    const extId = qMatch[1];
    if (extId) {
      CURATED_SEED_MAP[extId] = pName;
    }
  }
}
console.log(`[Level 1] Extracted ${Object.keys(CURATED_SEED_MAP).length} curated questions from seed.ts`);

// ─── LEVEL 3: SPECIFICITY MATRIX CLASSIFIER ──────────────────────────────────
// Defines hierarchy: Algorithmic Patterns > Data Structures > Containers
const TIER_1_ALGORITHMIC = {
  'Sliding Window': 'Sliding Window',
  'Two Pointers': 'Two Pointers',
  'Binary Search': 'Binary Search',
  'Topological Sort': 'Topological Sort',
  'Union Find': 'Union-Find / Disjoint Set (DSU)',
  'Trie': 'Trie (Prefix Tree)',
  'Monotonic Stack': 'Monotonic Stack & Queue',
  'Monotonic Queue': 'Monotonic Stack & Queue',
  'Bit Manipulation': 'Bit Manipulation & Math',
  'Prefix Sum': 'Prefix Sum',
  'Backtracking': 'Backtracking',
  'Dynamic Programming': 'Dynamic Programming',
  'Greedy': 'Greedy Algorithms',
  'Segment Tree': 'Segment & Fenwick Trees',
  'Binary Indexed Tree': 'Segment & Fenwick Trees',
  'Divide and Conquer': 'Dynamic Programming',
  'Sorting': 'Sorting & Search',
  'Counting Sort': 'Sorting & Search',
  'Bucket Sort': 'Sorting & Search',
  'Radix Sort': 'Sorting & Search'
};

const TIER_2_STRUCTURES = {
  'Tree': 'Binary Tree & BST',
  'Binary Tree': 'Binary Tree & BST',
  'Binary Search Tree': 'Binary Tree & BST',
  'Graph': 'Graph DFS/BFS',
  'Depth-First Search': 'Graph DFS/BFS',
  'Breadth-First Search': 'Graph DFS/BFS',
  'Heap (Priority Queue)': 'Heap / Priority Queue',
  'Stack': 'Stack',
  'Queue': 'Stack',
  'Linked List': 'In-place Linked List Reversal',
  'Doubly-Linked List': 'In-place Linked List Reversal',
  'Hash Table': 'Hash Maps / Hash Sets'
};

const TIER_3_CONTAINERS = {
  'Matrix': 'Matrix Traversal & Simulation',
  'Simulation': 'Matrix Traversal & Simulation',
  'Design': 'Design & Hybrid Structures',
  'Math': 'Bit Manipulation & Math'
};

function classifyByLeetCodeTags(tags) {
  if (!tags || tags.length === 0) return null;

  const tagSet = new Set(tags);
  let primary = null;
  const secondaries = [];

  // SQL / Database Questions (Highest Priority for Database)
  if (tagSet.has('Database') || tagSet.has('SQL')) {
    return { primary: 'SQL', secondary: ['Database'] };
  }

  // Compound Rule 1: Design + (Hash Table | Linked List | Stack | Queue)
  if (tagSet.has('Design') && (tagSet.has('Hash Table') || tagSet.has('Linked List') || tagSet.has('Stack') || tagSet.has('Queue'))) {
    primary = 'Design & Hybrid Structures';
    if (tagSet.has('Hash Table')) secondaries.push('Hash Maps / Hash Sets');
    if (tagSet.has('Linked List') || tagSet.has('Doubly-Linked List')) secondaries.push('In-place Linked List Reversal');
    if (tagSet.has('Stack')) secondaries.push('Stack');
  }

  // Compound Rule 2: Tree + (DFS | BFS) -> Binary Tree & BST
  else if (tagSet.has('Tree') || tagSet.has('Binary Tree') || tagSet.has('Binary Search Tree')) {
    primary = 'Binary Tree & BST';
    if (tagSet.has('Depth-First Search') || tagSet.has('Breadth-First Search')) {
      secondaries.push('Graph DFS/BFS');
    }
  }

  // Compound Rule 3: Topological Sort + Graph
  else if (tagSet.has('Topological Sort')) {
    primary = 'Topological Sort';
    if (tagSet.has('Graph') || tagSet.has('Depth-First Search') || tagSet.has('Breadth-First Search')) {
      secondaries.push('Graph DFS/BFS');
    }
  }

  // Compound Rule 4: Union Find + Graph
  else if (tagSet.has('Union Find')) {
    primary = 'Union-Find / Disjoint Set (DSU)';
    if (tagSet.has('Graph') || tagSet.has('Depth-First Search') || tagSet.has('Breadth-First Search')) {
      secondaries.push('Graph DFS/BFS');
    }
  }

  // Compound Rule 5: Sliding Window + Hash Table
  else if (tagSet.has('Sliding Window')) {
    primary = 'Sliding Window';
    if (tagSet.has('Hash Table')) secondaries.push('Hash Maps / Hash Sets');
    if (tagSet.has('Two Pointers')) secondaries.push('Two Pointers');
  }

  // General Priority Hierarchy Check: Tier 1 (Algorithmic Patterns win!)
  if (!primary) {
    for (const tag of tags) {
      if (TIER_1_ALGORITHMIC[tag]) {
        primary = TIER_1_ALGORITHMIC[tag];
        break;
      }
    }
  }

  // Tier 2: Specific Data Structures
  if (!primary) {
    for (const tag of tags) {
      if (TIER_2_STRUCTURES[tag]) {
        primary = TIER_2_STRUCTURES[tag];
        break;
      }
    }
  }

  // Tier 3: Containers & Simulations
  if (!primary) {
    for (const tag of tags) {
      if (TIER_3_CONTAINERS[tag]) {
        primary = TIER_3_CONTAINERS[tag];
        break;
      }
    }
  }

  if (!primary) return null;

  // Populate secondary patterns from all remaining relevant tags
  for (const tag of tags) {
    const candidate = TIER_1_ALGORITHMIC[tag] || TIER_2_STRUCTURES[tag] || TIER_3_CONTAINERS[tag];
    if (candidate && candidate !== primary && !secondaries.includes(candidate)) {
      secondaries.push(candidate);
    }
  }

  return { primary, secondary: secondaries };
}

// ─── LEVEL 4: UNAMBIGUOUS TITLE & SLUG HEURISTICS ────────────────────────────
function inferFromTitleAndSlug(problem) {
  const slug = (problem.slug || '').toLowerCase();
  const title = (problem.title || '').toLowerCase();
  const text = `${slug} ${title}`;

  if (text.includes('lru-cache') || text.includes('lru cache')) {
    return { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'In-place Linked List Reversal'] };
  }
  if (text.includes('lfu-cache') || text.includes('lfu cache')) {
    return { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'In-place Linked List Reversal'] };
  }
  if (text.includes('trie') || text.includes('prefix tree') || text.includes('autocomplete')) {
    return { primary: 'Trie (Prefix Tree)', secondary: ['Design & Hybrid Structures'] };
  }
  if (text.includes('topological') || text.includes('course schedule') || text.includes('alien dictionary')) {
    return { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] };
  }
  if (text.includes('union find') || text.includes('disjoint set') || text.includes('connected components') || text.includes('provinces')) {
    return { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] };
  }
  if (text.includes('next greater') || text.includes('daily temperature') || text.includes('stock span')) {
    return { primary: 'Monotonic Stack & Queue', secondary: ['Stack'] };
  }
  if (text.includes('spiral matrix') || text.includes('rotate image') || text.includes('matrix zeroes')) {
    return { primary: 'Matrix Traversal & Simulation', secondary: ['Two Pointers'] };
  }
  if (text.includes('binary tree') || text.includes('bst') || text.includes('inorder') || text.includes('postorder') || text.includes('preorder')) {
    return { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] };
  }
  if (text.includes('reverse linked list') || text.includes('remove nth node') || text.includes('middle of the linked list')) {
    return { primary: 'In-place Linked List Reversal', secondary: ['Two Pointers'] };
  }
  if (text.includes('jump game') || text.includes('gas station') || text.includes('task scheduler')) {
    return { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] };
  }
  if (text.includes('counting bits') || text.includes('single number') || text.includes('bitwise')) {
    return { primary: 'Bit Manipulation & Math', secondary: ['Math'] };
  }
  if (text.includes('segment tree') || text.includes('fenwick tree') || text.includes('binary indexed tree')) {
    return { primary: 'Segment & Fenwick Trees', secondary: ['Binary Search'] };
  }

  return null;
}

// ─── EXECUTE 4-TIER ENRICHMENT ───────────────────────────────────────────────
let stats = {
  total: dataset.problems.length,
  level2ClassicCount: 0,
  level1SeedCount: 0,
  level3LeetCodeTagsCount: 0,
  level3RawTagCleaned: 0,
  level4InferredCount: 0,
  alreadyClean: 0,
  uncategorizedRemaining: 0,
  secondaryPopulated: 0
};

for (const problem of dataset.problems) {
  const extId = String(problem.externalId || problem.id);
  let assignedPrimary = null;
  let assignedSecondary = Array.isArray(problem.secondaryPatterns) ? [...problem.secondaryPatterns] : [];

  // 1. Check Level 2: FAANG Master Dictionary (Highest Precision Ground Truth)
  if (FAANG_CLASSICS[extId]) {
    assignedPrimary = FAANG_CLASSICS[extId].primary;
    assignedSecondary = Array.from(new Set([...assignedSecondary, ...FAANG_CLASSICS[extId].secondary]));
    stats.level2ClassicCount++;
  }
  // 2. Check Level 1: Curated seed.ts Roadmap
  else if (CURATED_SEED_MAP[extId]) {
    assignedPrimary = CURATED_SEED_MAP[extId];
    stats.level1SeedCount++;
  }
  // 3. Check Level 3: LeetCode Official Topic Tags + Specificity Matrix
  else if (leetcodeCache[extId] && leetcodeCache[extId].tags && leetcodeCache[extId].tags.length > 0) {
    const classified = classifyByLeetCodeTags(leetcodeCache[extId].tags);
    if (classified) {
      assignedPrimary = classified.primary;
      assignedSecondary = Array.from(new Set([...assignedSecondary, ...classified.secondary]));
      stats.level3LeetCodeTagsCount++;
    }
  }

  // 4. Check Raw Scraped Tag Normalizer (if tags not in LC cache or previously tagged)
  if (!assignedPrimary && problem.primaryPattern && problem.primaryPattern.toLowerCase() !== 'uncategorized' && problem.primaryPattern !== 'General DSA') {
    const rawNorm = normalizeKey(problem.primaryPattern);
    const cleaned = RAW_TAG_MAP[rawNorm];
    if (cleaned) {
      assignedPrimary = cleaned;
      stats.level3RawTagCleaned++;
    } else {
      assignedPrimary = problem.primaryPattern;
      stats.alreadyClean++;
    }
  }

  // 5. Level 4: Unambiguous Title & Slug Heuristics
  if (!assignedPrimary || assignedPrimary === 'General DSA' || assignedPrimary.toLowerCase() === 'uncategorized') {
    const inferred = inferFromTitleAndSlug(problem);
    if (inferred) {
      assignedPrimary = inferred.primary;
      assignedSecondary = Array.from(new Set([...assignedSecondary, ...inferred.secondary]));
      stats.level4InferredCount++;
    }
  }

  // Fallback: If still uncategorized, keep clean label "General DSA"
  if (!assignedPrimary || assignedPrimary.toLowerCase() === 'uncategorized') {
    assignedPrimary = 'General DSA';
    stats.uncategorizedRemaining++;
  }

  // Ensure strict canonical naming
  const normKey = normalizeKey(assignedPrimary);
  if (RAW_TAG_MAP[normKey]) {
    assignedPrimary = RAW_TAG_MAP[normKey];
  }

  // Attach co-occurring secondary patterns for classic patterns if secondary is empty
  if (assignedSecondary.length === 0) {
    if (assignedPrimary === 'Sliding Window') {
      assignedSecondary.push('Two Pointers');
    } else if (assignedPrimary === 'Topological Sort') {
      assignedSecondary.push('Graph DFS/BFS');
    } else if (assignedPrimary === 'Monotonic Stack & Queue') {
      assignedSecondary.push('Stack');
    } else if (assignedPrimary === 'Union-Find / Disjoint Set (DSU)') {
      assignedSecondary.push('Graph DFS/BFS');
    } else if (assignedPrimary === 'Trie (Prefix Tree)') {
      assignedSecondary.push('Design & Hybrid Structures');
    } else if (assignedPrimary === 'Design & Hybrid Structures') {
      assignedSecondary.push('Hash Maps / Hash Sets');
    }
  }

  // Update problem record
  problem.primaryPattern = assignedPrimary;
  problem.secondaryPatterns = assignedSecondary;

  if (assignedSecondary.length > 0) {
    stats.secondaryPopulated++;
  }
}

// Write back to dataset
fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2), 'utf8');

console.log('\n=== DATASET ENRICHMENT REPORT (STEP 2) ===');
console.log(`Total problems in dataset: ${stats.total}`);
console.log(`- Level 2 FAANG Classics matched: ${stats.level2ClassicCount}`);
console.log(`- Level 1 Seed.ts curated matched: ${stats.level1SeedCount}`);
console.log(`- Level 3 LeetCode Official Tags classified: ${stats.level3LeetCodeTagsCount}`);
console.log(`- Level 3 Raw scraped tags normalized: ${stats.level3RawTagCleaned}`);
console.log(`- Level 4 Unambiguous heuristics inferred: ${stats.level4InferredCount}`);
console.log(`- Already clean standard patterns: ${stats.alreadyClean}`);
console.log(`- Remaining General DSA (mostly non-DSA/SQL): ${stats.uncategorizedRemaining}`);
console.log(`- Total problems with secondary patterns: ${stats.secondaryPopulated}`);
console.log('Successfully saved to generated_dataset.json!');
