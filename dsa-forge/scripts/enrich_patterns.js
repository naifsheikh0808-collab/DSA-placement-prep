/**
 * Automated Dataset Enrichment & Pattern Normalizer Pipeline
 * ========================================================
 * Implements the Deterministic 4-Tier Zero-Mistake Classification Architecture:
 *   Tier 0: Golden Benchmark Ground Truth (NeetCode 150, Blind 75, Grind 75, Striver SDE, GFG Classics)
 *   Tier 1: Curated Roadmap (seed.ts) parsed cleanly via TypeScript AST across all 24 patterns
 *   Tier 2: LeetCode Official Topic Tags + Strict Precedence Specificity Matrix
 *   Tier 3: Structural Title & Slug Heuristics (fallback for untagged utilities)
 */

const fs = require('fs');
const path = require('path');

const datasetPath = path.resolve(__dirname, '../src/lib/data/generated_dataset.json');
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const leetcodeCachePath = path.resolve(__dirname, 'data/leetcode_tags_cache.json');
let cacheById = {};
const cacheBySlug = {};

function normalizeSlugKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

if (fs.existsSync(leetcodeCachePath)) {
  cacheById = JSON.parse(fs.readFileSync(leetcodeCachePath, 'utf8'));
  for (const [id, entry] of Object.entries(cacheById)) {
    if (entry && entry.slug) {
      cacheBySlug[normalizeSlugKey(entry.slug)] = entry;
    }
  }
  console.log(`[Tier 2] Loaded official LeetCode topic tags cache with ${Object.keys(cacheById).length} problems.`);
} else {
  console.warn('[Tier 2] Warning: leetcode_tags_cache.json not found!');
}

// Safely resolve LeetCode tags ONLY for genuine LeetCode problems (never collide GFG IDs with LC IDs)
function getVerifiedLeetCodeTags(problem) {
  if (problem.platform !== 'leetcode') return null;
  const extId = String(problem.externalId || problem.id);
  const dsSlugNorm = normalizeSlugKey(problem.slug);
  const dsTitleNorm = normalizeSlugKey(problem.title);

  const byId = cacheById[extId];
  if (byId && Array.isArray(byId.tags)) {
    if (
      normalizeSlugKey(byId.slug) === dsSlugNorm ||
      normalizeSlugKey(byId.title) === dsTitleNorm
    ) {
      return byId.tags;
    }
  }

  const bySlug = cacheBySlug[dsSlugNorm];
  if (bySlug && Array.isArray(bySlug.tags)) {
    return bySlug.tags;
  }

  return null;
}

// ─── CANONICAL PATTERN NAME NORMALIZATION ────────────────────────────────────
// Ensures ZERO orphan pattern labels ("Sorting & Search", "Trees", "Uncategorized") as primaries.
const CANONICAL_PRIMARY_MAP = {
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
  'intervals': 'Merge Intervals',
  'in place reversal of linked list': 'In-place Linked List Reversal',
  'in place linked list reversal': 'In-place Linked List Reversal',
  'linked list reversal': 'In-place Linked List Reversal',
  'linked list': 'In-place Linked List Reversal',
  'fast slow pointers': 'Fast & Slow Pointers',
  'fast and slow pointers': 'Fast & Slow Pointers',
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
  'trees': 'Binary Tree & BST',
  'tree': 'Binary Tree & BST',
  'binary tree bst': 'Binary Tree & BST',
  'recursion and backtracking pattern': 'Backtracking',
  'backtracking': 'Backtracking',
  'graphs': 'Graph DFS/BFS',
  'graph dfs bfs': 'Graph DFS/BFS',
  'dynamic programming': 'Dynamic Programming',
  'monotonic stack queue': 'Monotonic Stack & Queue',
  'monotonic queue': 'Monotonic Stack & Queue',
  'monotonic stack': 'Monotonic Stack & Queue',
  'trie': 'Trie (Prefix Tree)',
  'trie prefix tree': 'Trie (Prefix Tree)',
  'union find': 'Union-Find / Disjoint Set (DSU)',
  'union find disjoint set dsu': 'Union-Find / Disjoint Set (DSU)',
  'topological sort': 'Topological Sort',
  'bit manipulation': 'Bit Manipulation & Math',
  'bit manipulation math': 'Bit Manipulation & Math',
  'greedy': 'Greedy Algorithms',
  'greedy algorithms': 'Greedy Algorithms',
  'matrix': 'Matrix Traversal & Simulation',
  'matrix traversal simulation': 'Matrix Traversal & Simulation',
  'design hybrid structures': 'Design & Hybrid Structures',
  'segment fenwick trees': 'Segment & Fenwick Trees',
  'sql': 'SQL',
  'database': 'SQL',
  // Retire Sorting & Search as standalone primary pattern
  'sorting': 'General DSA',
  'sorting search': 'General DSA',
  'uncategorized': 'General DSA',
};

function canonicalizePrimary(name) {
  if (!name) return 'General DSA';
  const norm = normalizeKey(name);
  return CANONICAL_PRIMARY_MAP[norm] || name;
}

// ─── TIER 0: GOLDEN BENCHMARK GROUND TRUTH (NeetCode 150 + FAANG + GFG) ────────
// Absolute ground truth evaluated BEFORE curated duplicates & tag heuristics.
const GOLDEN_BENCHMARK_MAP = {
  // NeetCode 150 Arrays & Hashing
  '1':    { primary: 'Hash Maps / Hash Sets', secondary: ['Two Pointers'] },
  '217':  { primary: 'Hash Maps / Hash Sets', secondary: [] },
  '242':  { primary: 'Hash Maps / Hash Sets', secondary: ['Sorting & Search'] },
  '49':   { primary: 'Hash Maps / Hash Sets', secondary: ['Sorting & Search'] },
  '347':  { primary: 'Heap / Priority Queue', secondary: ['Hash Maps / Hash Sets', 'Bucket Sort'] },
  '238':  { primary: 'Prefix Sum', secondary: ['Two Pointers'] },
  '36':   { primary: 'Hash Maps / Hash Sets', secondary: ['Matrix Traversal & Simulation'] },
  '271':  { primary: 'Two Pointers', secondary: ['String Manipulation'] },
  '128':  { primary: 'Hash Maps / Hash Sets', secondary: ['Union-Find / Disjoint Set (DSU)'] },
  '169':  { primary: 'Hash Maps / Hash Sets', secondary: ['Boyer-Moore Voting'] },
  '13':   { primary: 'Hash Maps / Hash Sets', secondary: ['Greedy Algorithms'] },
  '359':  { primary: 'Hash Maps / Hash Sets', secondary: ['Design & Hybrid Structures'] },

  // NeetCode 150 Two Pointers
  '125':  { primary: 'Two Pointers', secondary: ['String Manipulation'] },
  '167':  { primary: 'Two Pointers', secondary: ['Binary Search'] },
  '15':   { primary: 'Two Pointers', secondary: ['Sorting & Search'] },
  '16':   { primary: 'Two Pointers', secondary: ['Sorting & Search'] },
  '18':   { primary: 'Two Pointers', secondary: ['Sorting & Search'] },
  '11':   { primary: 'Two Pointers', secondary: ['Greedy Algorithms'] },
  '42':   { primary: 'Two Pointers', secondary: ['Monotonic Stack & Queue', 'Dynamic Programming'] },
  '443':  { primary: 'Two Pointers', secondary: ['String Manipulation'] },
  '151':  { primary: 'Two Pointers', secondary: ['String Manipulation'] },
  '189':  { primary: 'Two Pointers', secondary: ['Bit Manipulation & Math'] },
  '8':    { primary: 'Two Pointers', secondary: ['String Manipulation'] },
  '392':  { primary: 'Two Pointers', secondary: ['Dynamic Programming'] },
  '845':  { primary: 'Two Pointers', secondary: [] },
  '838':  { primary: 'Two Pointers', secondary: [] },
  '2110': { primary: 'Two Pointers', secondary: ['Sliding Window'] },

  // NeetCode 150 Sliding Window
  '3':    { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] },
  '424':  { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] },
  '567':  { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] },
  '438':  { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] },
  '76':   { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] },
  '239':  { primary: 'Sliding Window', secondary: ['Monotonic Stack & Queue', 'Heap / Priority Queue'] },
  '209':  { primary: 'Sliding Window', secondary: ['Two Pointers', 'Binary Search'] },
  '713':  { primary: 'Sliding Window', secondary: ['Two Pointers', 'Prefix Sum'] },
  '1004': { primary: 'Sliding Window', secondary: ['Two Pointers', 'Prefix Sum'] },
  '121':  { primary: 'Dynamic Programming', secondary: ["Kadane's Algorithm", 'Two Pointers'] },

  // NeetCode 150 Stack & Monotonic Stack
  '20':   { primary: 'Stack', secondary: [] },
  '155':  { primary: 'Stack', secondary: ['Design & Hybrid Structures'] },
  '150':  { primary: 'Stack', secondary: ['Bit Manipulation & Math'] },
  '22':   { primary: 'Backtracking', secondary: ['Dynamic Programming'] },
  '341':  { primary: 'Stack', secondary: ['Design & Hybrid Structures', 'In-place Linked List Reversal'] },
  '394':  { primary: 'Stack', secondary: [] },
  '739':  { primary: 'Monotonic Stack & Queue', secondary: ['Stack'] },
  '496':  { primary: 'Monotonic Stack & Queue', secondary: ['Stack', 'Hash Maps / Hash Sets'] },
  '503':  { primary: 'Monotonic Stack & Queue', secondary: ['Stack'] },
  '901':  { primary: 'Monotonic Stack & Queue', secondary: ['Stack', 'Design & Hybrid Structures'] },
  '853':  { primary: 'Monotonic Stack & Queue', secondary: ['Sorting & Search'] },
  '84':   { primary: 'Monotonic Stack & Queue', secondary: ['Stack', 'Dynamic Programming'] },
  '85':   { primary: 'Monotonic Stack & Queue', secondary: ['Dynamic Programming', 'Matrix Traversal & Simulation', 'Stack'] },

  // NeetCode 150 Binary Search
  '704':  { primary: 'Binary Search', secondary: [] },
  '74':   { primary: 'Binary Search', secondary: ['Matrix Traversal & Simulation'] },
  '875':  { primary: 'Binary Search', secondary: ['Greedy Algorithms'] },
  '153':  { primary: 'Binary Search', secondary: [] },
  '33':   { primary: 'Binary Search', secondary: [] },
  '34':   { primary: 'Binary Search', secondary: [] },
  '981':  { primary: 'Binary Search', secondary: ['Design & Hybrid Structures', 'Hash Maps / Hash Sets'] },
  '4':    { primary: 'Binary Search', secondary: ['Divide and Conquer'] },
  '1146': { primary: 'Binary Search', secondary: ['Design & Hybrid Structures', 'Hash Maps / Hash Sets'] },
  '410':  { primary: 'Binary Search', secondary: ['Dynamic Programming', 'Greedy Algorithms', 'Prefix Sum'] },
  '2560': { primary: 'Binary Search', secondary: ['Dynamic Programming', 'Greedy Algorithms'] },
  '2616': { primary: 'Binary Search', secondary: ['Greedy Algorithms'] },
  '2439': { primary: 'Binary Search', secondary: ['Greedy Algorithms', 'Prefix Sum'] },
  '50':   { primary: 'Binary Search', secondary: ['Bit Manipulation & Math'] },

  // NeetCode 150 Linked List & Fast/Slow Pointers
  '206':  { primary: 'In-place Linked List Reversal', secondary: [] },
  '21':   { primary: 'In-place Linked List Reversal', secondary: ['Two Pointers'] },
  '141':  { primary: 'Fast & Slow Pointers', secondary: ['Hash Maps / Hash Sets'] },
  '142':  { primary: 'Fast & Slow Pointers', secondary: ['Hash Maps / Hash Sets'] },
  '202':  { primary: 'Fast & Slow Pointers', secondary: ['Hash Maps / Hash Sets'] },
  '234':  { primary: 'Fast & Slow Pointers', secondary: ['In-place Linked List Reversal'] },
  '876':  { primary: 'Fast & Slow Pointers', secondary: ['In-place Linked List Reversal'] },
  '143':  { primary: 'Fast & Slow Pointers', secondary: ['In-place Linked List Reversal', 'Two Pointers'] },
  '19':   { primary: 'In-place Linked List Reversal', secondary: ['Two Pointers'] },
  '138':  { primary: 'In-place Linked List Reversal', secondary: ['Hash Maps / Hash Sets'] },
  '2':    { primary: 'In-place Linked List Reversal', secondary: ['Bit Manipulation & Math'] },
  '287':  { primary: 'Fast & Slow Pointers', secondary: ['Binary Search', 'Bit Manipulation & Math'] },
  '23':   { primary: 'Heap / Priority Queue', secondary: ['In-place Linked List Reversal', 'Divide and Conquer'] },
  '25':   { primary: 'In-place Linked List Reversal', secondary: [] },

  // Design & Hybrid Structures
  '146':  { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'In-place Linked List Reversal'] },
  '460':  { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets', 'In-place Linked List Reversal', 'Heap / Priority Queue'] },
  '380':  { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets'] },
  '362':  { primary: 'Design & Hybrid Structures', secondary: ['Queue', 'Hash Maps / Hash Sets'] },
  '622':  { primary: 'Design & Hybrid Structures', secondary: ['In-place Linked List Reversal'] },
  '2043': { primary: 'Design & Hybrid Structures', secondary: ['Hash Maps / Hash Sets'] },

  // Trees
  '226':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '104':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '543':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS', 'Dynamic Programming'] },
  '110':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '100':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '572':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '235':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '102':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '199':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '1448': { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '98':   { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '230':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS'] },
  '105':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS', 'Hash Maps / Hash Sets'] },
  '124':  { primary: 'Binary Tree & BST', secondary: ['Graph DFS/BFS', 'Dynamic Programming'] },
  '297':  { primary: 'Binary Tree & BST', secondary: ['Design & Hybrid Structures', 'Graph DFS/BFS'] },

  // Trie
  '14':   { primary: 'Trie (Prefix Tree)', secondary: ['Two Pointers', 'String Manipulation'] },
  '208':  { primary: 'Trie (Prefix Tree)', secondary: ['Design & Hybrid Structures'] },
  '211':  { primary: 'Trie (Prefix Tree)', secondary: ['Design & Hybrid Structures', 'Backtracking'] },
  '212':  { primary: 'Trie (Prefix Tree)', secondary: ['Backtracking', 'Matrix Traversal & Simulation'] },
  '648':  { primary: 'Trie (Prefix Tree)', secondary: ['Hash Maps / Hash Sets'] },
  '421':  { primary: 'Trie (Prefix Tree)', secondary: ['Bit Manipulation & Math'] },
  '1268': { primary: 'Trie (Prefix Tree)', secondary: ['Binary Search', 'Two Pointers'] },

  // Heap / Priority Queue
  '703':  { primary: 'Heap / Priority Queue', secondary: ['Design & Hybrid Structures'] },
  '1046': { primary: 'Heap / Priority Queue', secondary: ['Greedy Algorithms'] },
  '973':  { primary: 'Heap / Priority Queue', secondary: ['Sorting & Search'] },
  '215':  { primary: 'Heap / Priority Queue', secondary: ['Quickselect', 'Divide and Conquer'] },
  '621':  { primary: 'Heap / Priority Queue', secondary: ['Greedy Algorithms', 'Hash Maps / Hash Sets'] },
  '355':  { primary: 'Heap / Priority Queue', secondary: ['Design & Hybrid Structures', 'Hash Maps / Hash Sets'] },
  '295':  { primary: 'Heap / Priority Queue', secondary: ['Design & Hybrid Structures', 'Two Pointers'] },
  '658':  { primary: 'Heap / Priority Queue', secondary: ['Binary Search', 'Two Pointers', 'Sliding Window'] },
  '378':  { primary: 'Heap / Priority Queue', secondary: ['Binary Search', 'Matrix Traversal & Simulation'] },
  '480':  { primary: 'Heap / Priority Queue', secondary: ['Sliding Window'] },
  '871':  { primary: 'Heap / Priority Queue', secondary: ['Dynamic Programming', 'Greedy Algorithms'] },
  '2402': { primary: 'Heap / Priority Queue', secondary: ['Merge Intervals'] },

  // Merge Intervals
  '56':   { primary: 'Merge Intervals', secondary: ['Sorting & Search'] },
  '57':   { primary: 'Merge Intervals', secondary: ['Binary Search'] },
  '252':  { primary: 'Merge Intervals', secondary: ['Sorting & Search'] },
  '253':  { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue', 'Two Pointers'] },
  '435':  { primary: 'Merge Intervals', secondary: ['Greedy Algorithms'] },
  '1851': { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue', 'Binary Search'] },
  '2406': { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue', 'Two Pointers'] },
  '3169': { primary: 'Merge Intervals', secondary: ['Sorting & Search'] },
  '2580': { primary: 'Merge Intervals', secondary: ['Sorting & Search'] },

  // Backtracking
  '78':   { primary: 'Backtracking', secondary: ['Bit Manipulation & Math'] },
  '39':   { primary: 'Backtracking', secondary: ['Dynamic Programming'] },
  '40':   { primary: 'Backtracking', secondary: ['Dynamic Programming'] },
  '46':   { primary: 'Backtracking', secondary: [] },
  '47':   { primary: 'Backtracking', secondary: [] },
  '90':   { primary: 'Backtracking', secondary: [] },
  '79':   { primary: 'Backtracking', secondary: ['Matrix Traversal & Simulation', 'Graph DFS/BFS'] },
  '131':  { primary: 'Backtracking', secondary: ['Dynamic Programming', 'Two Pointers'] },
  '17':   { primary: 'Backtracking', secondary: [] },
  '51':   { primary: 'Backtracking', secondary: [] },

  // Graphs, Topological Sort, Union-Find
  '200':  { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)', 'Matrix Traversal & Simulation'] },
  '695':  { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)', 'Matrix Traversal & Simulation'] },
  '133':  { primary: 'Graph DFS/BFS', secondary: ['Hash Maps / Hash Sets'] },
  '417':  { primary: 'Graph DFS/BFS', secondary: ['Matrix Traversal & Simulation'] },
  '130':  { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)', 'Matrix Traversal & Simulation'] },
  '994':  { primary: 'Graph DFS/BFS', secondary: ['Matrix Traversal & Simulation'] },
  '127':  { primary: 'Graph DFS/BFS', secondary: ['Hash Maps / Hash Sets', 'Shortest Path'] },
  '785':  { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)'] },
  '815':  { primary: 'Graph DFS/BFS', secondary: ['Hash Maps / Hash Sets'] },
  '332':  { primary: 'Graph DFS/BFS', secondary: ['Backtracking', 'Eulerian Path'] },
  '743':  { primary: 'Graph DFS/BFS', secondary: ['Heap / Priority Queue', 'Shortest Path'] },
  '778':  { primary: 'Graph DFS/BFS', secondary: ['Heap / Priority Queue', 'Binary Search'] },
  '787':  { primary: 'Graph DFS/BFS', secondary: ['Dynamic Programming', 'Shortest Path'] },
  '207':  { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] },
  '210':  { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] },
  '269':  { primary: 'Topological Sort', secondary: ['Graph DFS/BFS', 'Trie (Prefix Tree)'] },
  '310':  { primary: 'Topological Sort', secondary: ['Graph DFS/BFS', 'Binary Tree & BST'] },
  '802':  { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] },
  '547':  { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] },
  '684':  { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] },
  '721':  { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Hash Maps / Hash Sets', 'Graph DFS/BFS'] },
  '323':  { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS'] },
  '1584': { primary: 'Union-Find / Disjoint Set (DSU)', secondary: ['Graph DFS/BFS', 'Greedy Algorithms'] },

  // Dynamic Programming, Prefix Sum & Kadane's
  '53':   { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming', 'Divide and Conquer'] },
  '918':  { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming'] },
  '152':  { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming'] },
  '1186': { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming'] },
  '1749': { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming'] },
  '70':   { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '746':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '198':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '213':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '5':    { primary: 'Dynamic Programming', secondary: ['Two Pointers'] },
  '647':  { primary: 'Dynamic Programming', secondary: ['Two Pointers'] },
  '91':   { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '322':  { primary: 'Dynamic Programming', secondary: ['Graph DFS/BFS'] },
  '139':  { primary: 'Dynamic Programming', secondary: ['Trie (Prefix Tree)'] },
  '140':  { primary: 'Dynamic Programming', secondary: ['Backtracking', 'Trie (Prefix Tree)'] },
  '472':  { primary: 'Dynamic Programming', secondary: ['Trie (Prefix Tree)'] },
  '2977': { primary: 'Dynamic Programming', secondary: ['Graph DFS/BFS', 'Trie (Prefix Tree)'] },
  '300':  { primary: 'Dynamic Programming', secondary: ['Binary Search'] },
  '416':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '1143': { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '72':   { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '309':  { primary: 'Dynamic Programming', secondary: ['Greedy Algorithms'] },
  '518':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '494':  { primary: 'Dynamic Programming', secondary: ['Backtracking'] },
  '97':   { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '329':  { primary: 'Dynamic Programming', secondary: ['Graph DFS/BFS', 'Topological Sort'] },
  '115':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '312':  { primary: 'Dynamic Programming', secondary: ['Memoization / Tabulation'] },
  '10':   { primary: 'Dynamic Programming', secondary: ['Backtracking'] },
  '1696': { primary: 'Dynamic Programming', secondary: ['Monotonic Stack & Queue', 'Heap / Priority Queue'] },
  '862':  { primary: 'Prefix Sum', secondary: ['Monotonic Stack & Queue', 'Sliding Window', 'Heap / Priority Queue'] },
  '1094': { primary: 'Prefix Sum', secondary: ['Heap / Priority Queue'] },
  '1109': { primary: 'Prefix Sum', secondary: [] },
  '327':  { primary: 'Segment & Fenwick Trees', secondary: ['Prefix Sum', 'Binary Search', 'Divide and Conquer'] },

  // Greedy Algorithms
  '55':   { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] },
  '45':   { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] },
  '122':  { primary: 'Greedy Algorithms', secondary: ['Dynamic Programming'] },
  '134':  { primary: 'Greedy Algorithms', secondary: ['Two Pointers'] },
  '763':  { primary: 'Greedy Algorithms', secondary: ['Two Pointers', 'Hash Maps / Hash Sets'] },
  '1899': { primary: 'Greedy Algorithms', secondary: [] }, // Merge Triplets to Form Target Triplet
  '678':  { primary: 'Greedy Algorithms', secondary: ['Stack', 'Dynamic Programming'] },
  '68':   { primary: 'Greedy Algorithms', secondary: ['Two Pointers', 'String Manipulation'] },
  '12':   { primary: 'Greedy Algorithms', secondary: ['Hash Maps / Hash Sets'] },
  '179':  { primary: 'Greedy Algorithms', secondary: ['Sorting & Search'] },

  // Matrix & Simulation
  '54':   { primary: 'Matrix Traversal & Simulation', secondary: ['Two Pointers'] },
  '59':   { primary: 'Matrix Traversal & Simulation', secondary: ['Two Pointers'] },
  '73':   { primary: 'Matrix Traversal & Simulation', secondary: ['Hash Maps / Hash Sets'] },
  '48':   { primary: 'Matrix Traversal & Simulation', secondary: ['Bit Manipulation & Math'] },
  '289':  { primary: 'Matrix Traversal & Simulation', secondary: ['Bit Manipulation & Math'] },
  '6':    { primary: 'Matrix Traversal & Simulation', secondary: ['String Manipulation'] },

  // Bit Manipulation & Math
  '136':  { primary: 'Bit Manipulation & Math', secondary: [] },
  '137':  { primary: 'Bit Manipulation & Math', secondary: [] },
  '260':  { primary: 'Bit Manipulation & Math', secondary: [] },
  '191':  { primary: 'Bit Manipulation & Math', secondary: [] },
  '338':  { primary: 'Bit Manipulation & Math', secondary: ['Dynamic Programming'] },
  '190':  { primary: 'Bit Manipulation & Math', secondary: [] },
  '268':  { primary: 'Bit Manipulation & Math', secondary: ['Hash Maps / Hash Sets', 'Binary Search'] },
  '371':  { primary: 'Bit Manipulation & Math', secondary: [] },
  '7':    { primary: 'Bit Manipulation & Math', secondary: [] },

  // GFG & Non-LeetCode Curated Problems (explicit so zero bogus LC cache collisions)
  '3977': { primary: 'Two Pointers', secondary: ['Sorting & Search'] },
  '3978': { primary: 'Sliding Window', secondary: ['Hash Maps / Hash Sets'] },
  '3979': { primary: "Kadane's Algorithm", secondary: ['Dynamic Programming'] },
  '3980': { primary: 'Merge Intervals', secondary: ['Sorting & Search'] },
  '3981': { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue'] },
  '3982': { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue'] },
  '3983': { primary: 'Merge Intervals', secondary: ['Heap / Priority Queue'] },
  '3984': { primary: 'Stack', secondary: [] },
  '3985': { primary: 'Binary Search', secondary: [] },
  '3986': { primary: 'Binary Search', secondary: [] },
  '3987': { primary: 'Binary Search', secondary: [] },
  '3988': { primary: 'Binary Search', secondary: [] },
  '3989': { primary: 'Binary Search', secondary: ['Greedy Algorithms'] },
  '3990': { primary: 'Binary Search', secondary: ['Greedy Algorithms'] },
  '3991': { primary: 'Heap / Priority Queue', secondary: ['Quickselect'] },
  '3992': { primary: 'Heap / Priority Queue', secondary: ['Divide and Conquer'] },
  '3993': { primary: 'Backtracking', secondary: ['Two Pointers'] },
  '3994': { primary: 'Backtracking', secondary: [] },
  '3995': { primary: 'Backtracking', secondary: [] },
  '3996': { primary: 'Backtracking', secondary: [] },
  '3997': { primary: 'Graph DFS/BFS', secondary: [] },
  '3998': { primary: 'Graph DFS/BFS', secondary: [] },
  '3999': { primary: 'Graph DFS/BFS', secondary: [] },
  '4000': { primary: 'Graph DFS/BFS', secondary: ['Union-Find / Disjoint Set (DSU)'] },
  '4001': { primary: 'Graph DFS/BFS', secondary: ['Topological Sort'] },
  '4002': { primary: 'Topological Sort', secondary: ['Graph DFS/BFS'] },
  '4003': { primary: 'Graph DFS/BFS', secondary: ['Shortest Path'] },
  '4004': { primary: 'Graph DFS/BFS', secondary: ['Heap / Priority Queue', 'Shortest Path'] },
};

// ─── TIER 1: EXTRACT SEED.TS CURATED QUESTIONS (Full 24-Pattern Parser) ───────
const seedPath = path.resolve(__dirname, '../src/lib/data/seed.ts');
const seedContent = fs.readFileSync(seedPath, 'utf8');

// Map externalId -> array of canonical pattern names in seed.ts (preserving order)
const CURATED_SEED_ALL = {};

function extractSeedPatterns() {
  try {
    const ts = require('typescript');
    const transpiled = ts.transpileModule(seedContent, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      }
    });
    const moduleObj = { exports: {} };
    const requireStub = (mod) => {
      if (mod.includes('generated_dataset')) {
        return { __esModule: true, default: { companies: [], problems: [] }, companies: [], problems: [] };
      }
      return {};
    };
    const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', transpiled.outputText);
    fn(moduleObj, moduleObj.exports, requireStub, __dirname, __filename);

    const PATTERNS = moduleObj.exports.PATTERNS || (moduleObj.exports.default && moduleObj.exports.default.PATTERNS);
    if (PATTERNS && Array.isArray(PATTERNS) && PATTERNS.length >= 24) {
      for (const pattern of PATTERNS) {
        const canonName = canonicalizePrimary(pattern.name);
        for (const q of (pattern.questions || [])) {
          if (q.externalId) {
            const extId = String(q.externalId);
            if (!CURATED_SEED_ALL[extId]) CURATED_SEED_ALL[extId] = [];
            if (!CURATED_SEED_ALL[extId].includes(canonName)) {
              CURATED_SEED_ALL[extId].push(canonName);
            }
          }
        }
      }
      console.log(`[Tier 1] Extracted ${Object.keys(CURATED_SEED_ALL).length} unique curated questions across ${PATTERNS.length} patterns via TypeScript AST.`);
      return;
    }
    throw new Error('PATTERNS count < 24');
  } catch (err) {
    // Handles both unquoted (id: "...") and JSON-quoted ("id": "...") pattern blocks safely
    console.warn(`[Tier 1] TypeScript AST unavailable (${err.message}), using brace-balanced multi-format parser.`);
    const lines = seedContent.split('\n');
    let currentPatternName = null;
    let inQuestionsArray = false;
    let arrayDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!inQuestionsArray && /^"?id"?\s*:/.test(trimmed)) {
        const sameLine = line.match(/"?name"?\s*:\s*["']([^"']+)["']/);
        if (sameLine) {
          currentPatternName = canonicalizePrimary(sameLine[1]);
        } else {
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const nm = lines[j].match(/"?name"?\s*:\s*["']([^"']+)["']/);
            if (nm) {
              currentPatternName = canonicalizePrimary(nm[1]);
              break;
            }
          }
        }
      }

      if (!inQuestionsArray && /^"?questions"?\s*:/.test(trimmed) && trimmed.includes('[')) {
        inQuestionsArray = true;
        arrayDepth = 1;
        for (const ch of trimmed.slice(trimmed.indexOf('[') + 1)) {
          if (ch === '[') arrayDepth++;
          else if (ch === ']') { arrayDepth--; if (arrayDepth <= 0) { inQuestionsArray = false; break; } }
        }
        continue;
      }

      if (inQuestionsArray) {
        const extMatch = trimmed.match(/"?externalId"?\s*:\s*["']([^"']+)["']/);
        if (extMatch && currentPatternName) {
          const extId = String(extMatch[1]);
          if (!CURATED_SEED_ALL[extId]) CURATED_SEED_ALL[extId] = [];
          if (!CURATED_SEED_ALL[extId].includes(currentPatternName)) {
            CURATED_SEED_ALL[extId].push(currentPatternName);
          }
        }
        for (const ch of trimmed) {
          if (ch === '[') arrayDepth++;
          else if (ch === ']') { arrayDepth--; if (arrayDepth <= 0) { inQuestionsArray = false; break; } }
        }
      }
    }
    console.log(`[Tier 1] Extracted ${Object.keys(CURATED_SEED_ALL).length} unique curated questions via brace-balanced fallback.`);
  }
}

extractSeedPatterns();

// ─── TIER 2: SPECIFICITY MATRIX CLASSIFIER (Strict Precedence Order) ─────────
// Maps secondary tag labels cleanly without ever overriding primary specificity.
const TAG_TO_SECONDARY = {
  'Sliding Window': 'Sliding Window',
  'Two Pointers': 'Two Pointers',
  'Binary Search': 'Binary Search',
  'Topological Sort': 'Topological Sort',
  'Union-Find': 'Union-Find / Disjoint Set (DSU)',
  'Trie': 'Trie (Prefix Tree)',
  'Monotonic Stack': 'Monotonic Stack & Queue',
  'Monotonic Queue': 'Monotonic Stack & Queue',
  'Bit Manipulation': 'Bit Manipulation & Math',
  'Bitmask': 'Bit Manipulation & Math',
  'Prefix Sum': 'Prefix Sum',
  'Backtracking': 'Backtracking',
  'Dynamic Programming': 'Dynamic Programming',
  'Greedy': 'Greedy Algorithms',
  'Segment Tree': 'Segment & Fenwick Trees',
  'Binary Indexed Tree': 'Segment & Fenwick Trees',
  'Tree': 'Binary Tree & BST',
  'Binary Tree': 'Binary Tree & BST',
  'Binary Search Tree': 'Binary Tree & BST',
  'Graph Theory': 'Graph DFS/BFS',
  'Depth-First Search': 'Graph DFS/BFS',
  'Breadth-First Search': 'Graph DFS/BFS',
  'Shortest Path': 'Graph DFS/BFS',
  'Heap (Priority Queue)': 'Heap / Priority Queue',
  'Stack': 'Stack',
  'Linked List': 'In-place Linked List Reversal',
  'Doubly-Linked List': 'In-place Linked List Reversal',
  'Hash Table': 'Hash Maps / Hash Sets',
  'Matrix': 'Matrix Traversal & Simulation',
  'Design': 'Design & Hybrid Structures',
  'Sorting': 'Sorting & Search',
  'Divide and Conquer': 'Divide and Conquer',
  'Math': 'Bit Manipulation & Math',
};

const INTERVAL_TITLE_RE = /\b(intervals?|meeting rooms?|calendar|non-overlapping|overlapping ranges)\b/i;

function classifyByLeetCodeTags(tags, problem) {
  if (!tags || tags.length === 0) return null;

  const tagSet = new Set(tags);
  const title = problem.title || '';
  let primary = null;
  const secondaries = [];

  const hasAny = (...list) => list.some((t) => tagSet.has(t));

  // 1. SQL / Database (Absolute separation)
  if (hasAny('Database', 'SQL')) {
    return { primary: 'SQL', secondary: ['Database'] };
  }

  // 2. Segment Tree / Fenwick Tree / RMQ (Highest structural specificity)
  if (hasAny('Segment Tree', 'Binary Indexed Tree', 'Range Minimum/Maximum Query', 'Sparse Table', 'Sqrt Decomposition')) {
    primary = 'Segment & Fenwick Trees';
  }
  // 3. Hybrid Design Structures (Design + Container/Stream/Iterator)
  else if (
    tagSet.has('Design') &&
    hasAny('Hash Table', 'Linked List', 'Doubly-Linked List', 'Stack', 'Queue', 'Heap (Priority Queue)', 'Data Stream', 'Iterator')
  ) {
    primary = 'Design & Hybrid Structures';
  }
  // 4. Trie (Prefix Tree) — unless DP is the primary core (like Word Break variants)
  else if (hasAny('Trie', 'Aho–Corasick Algorithm') && !tagSet.has('Dynamic Programming')) {
    primary = 'Trie (Prefix Tree)';
  }
  // 5. Topological Sort (for DAG problems; tree diameter/coin problems stay Binary Tree & BST)
  else if (tagSet.has('Topological Sort') && !hasAny('Tree', 'Binary Tree')) {
    primary = 'Topological Sort';
  }
  // 6. Union-Find / Disjoint Set (FIXED HYPHEN: 'Union-Find')
  else if (tagSet.has('Union-Find')) {
    primary = 'Union-Find / Disjoint Set (DSU)';
  }
  // 7. Fast & Slow Pointers (Floyd's Cycle Finding)
  else if (tagSet.has("Floyd's Cycle Finding Algorithm")) {
    primary = 'Fast & Slow Pointers';
  }
  // 8. Monotonic Stack & Queue
  else if (
    tagSet.has('Monotonic Stack') ||
    (tagSet.has('Monotonic Queue') && !hasAny('Dynamic Programming', 'Prefix Sum', 'Sliding Window'))
  ) {
    primary = 'Monotonic Stack & Queue';
  }
  // 9. Sliding Window
  else if (tagSet.has('Sliding Window')) {
    primary = 'Sliding Window';
  }
  // 10. Binary Tree & BST (captures Tree DFS/BFS/DP-on-Trees/BST cleanly)
  else if (hasAny('Tree', 'Binary Tree', 'Binary Search Tree')) {
    primary = 'Binary Tree & BST';
  }
  // 11. Prefix Sum (unless DP uses prefix sum solely as transition speedup)
  else if (tagSet.has('Prefix Sum') && !tagSet.has('Dynamic Programming')) {
    primary = 'Prefix Sum';
  }
  // 12. Merge Intervals (Sweep Line / interval problems not owned by DP/Tree/Math)
  else if (
    (tagSet.has('Sweep Line') || INTERVAL_TITLE_RE.test(title)) &&
    !hasAny('Dynamic Programming', 'Tree', 'Binary Tree', 'Binary Search', 'Math')
  ) {
    primary = 'Merge Intervals';
  }
  // 13. Backtracking
  else if (tagSet.has('Backtracking')) {
    primary = 'Backtracking';
  }
  // 14. Dynamic Programming (ranks above generic Two Pointers, Binary Search, Greedy)
  else if (
    hasAny(
      'Dynamic Programming',
      'Knapsack Problem',
      '0-1 Knapsack',
      'Complete Knapsack',
      'Multiple Knapsack',
      'Mixed Knapsack',
      'Memoization'
    )
  ) {
    primary = 'Dynamic Programming';
  }
  // 15. Binary Search
  else if (hasAny('Binary Search', 'Ternary Search')) {
    primary = 'Binary Search';
  }
  // 16. Heap / Priority Queue (ranks above Two Pointers, Greedy, Hash Table, Sorting)
  else if (hasAny('Heap (Priority Queue)', 'Quickselect', 'Data Stream')) {
    primary = 'Heap / Priority Queue';
  }
  // 17. Two Pointers
  else if (tagSet.has('Two Pointers')) {
    primary = 'Two Pointers';
  }
  // 18. Greedy Algorithms
  else if (hasAny('Greedy', 'Boyer–Moore Majority Vote Algorithm')) {
    primary = 'Greedy Algorithms';
  }
  // 19. Linked List (placed before DFS so Flatten Multilevel Doubly Linked List stays Linked List)
  else if (hasAny('Linked List', 'Doubly-Linked List') && !hasAny('Graph Theory', 'Shortest Path')) {
    primary = 'In-place Linked List Reversal';
  }
  // 20. Graph DFS / BFS
  else if (
    hasAny(
      'Graph Theory',
      'Shortest Path',
      "Dijkstra's Algorithm",
      'Bellman–Ford Algorithm',
      'Floyd–Warshall Algorithm',
      'Directed Acyclic Graph',
      'Bipartite Graph',
      'Graph Coloring',
      'Bidirectional Search',
      'Eulerian Circuit',
      'Eulerian Path',
      '0-1 BFS',
      'Strongly Connected Component',
      'Depth-First Search',
      'Breadth-First Search'
    )
  ) {
    primary = 'Graph DFS/BFS';
  }
  // 21. Stack (and Bracket Sequences)
  else if (hasAny('Stack', 'Bracket Sequences')) {
    primary = 'Stack';
  }
  // 22. Bit Manipulation
  else if (hasAny('Bit Manipulation', 'Bitmask')) {
    primary = 'Bit Manipulation & Math';
  }
  // 23. Hash Maps / Hash Sets (ranks above Queue, Matrix, Math, Sorting!)
  else if (hasAny('Hash Table', 'Hash Function', 'Rolling Hash')) {
    primary = 'Hash Maps / Hash Sets';
  }
  // 24. Queue (standalone queue simulations -> Stack)
  else if (tagSet.has('Queue')) {
    primary = 'Stack';
  }
  // 25. Matrix (ONLY when Matrix is actually present; non-matrix Simulation does not belong here)
  else if (tagSet.has('Matrix')) {
    primary = 'Matrix Traversal & Simulation';
  }
  // 26. Standalone Design
  else if (hasAny('Design', 'Iterator')) {
    primary = 'Design & Hybrid Structures';
  }
  // 27. Pure Math / Number Theory / Combinatorics / Geometry
  else if (
    hasAny(
      'Math',
      'Number Theory',
      'Combinatorics',
      'Geometry',
      'Greatest Common Divisor',
      'Euclidean Algorithm',
      'Prime Factorization',
      'Primality Test',
      'Sieve Theory',
      'Prime Number Sieve',
      'Randomized',
      'Game Theory'
    )
  ) {
    primary = 'Bit Manipulation & Math';
  }
  // 28. Remaining generic fundamentals (Array, String, Sorting, Simulation without Matrix, Concurrency, Shell)
  else {
    primary = 'General DSA';
  }

  for (const tag of tags) {
    const candidate = TAG_TO_SECONDARY[tag];
    if (candidate && candidate !== primary && !secondaries.includes(candidate)) {
      secondaries.push(candidate);
    }
  }

  return { primary, secondary: secondaries };
}

// ─── TIER 3: TITLE & SLUG HEURISTICS (For Untagged Problems Only) ───────────────
function inferFromTitleAndSlug(problem) {
  const slug = (problem.slug || '').toLowerCase();
  const title = (problem.title || '').toLowerCase();
  const text = `${slug} ${title}`;

  if (text.includes('interval') || text.includes('meeting room') || text.includes('calendar')) {
    return { primary: 'Merge Intervals', secondary: ['Sorting & Search'] };
  }
  if (text.includes('lru-cache') || text.includes('lru cache') || text.includes('lfu-cache') || text.includes('lfu cache')) {
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
  if (text.includes('segment tree') || text.includes('fenwick tree') || text.includes('binary indexed tree')) {
    return { primary: 'Segment & Fenwick Trees', secondary: ['Binary Search'] };
  }

  return null;
}

// ─── EXECUTE DETERMINISTIC 4-TIER ENRICHMENT ──────────────────────────────────
const stats = {
  total: dataset.problems.length,
  tier0GoldenCount: 0,
  tier1SeedCount: 0,
  tier2LeetCodeTagsCount: 0,
  tier3InferredCount: 0,
  generalDSACount: 0,
  secondaryPopulated: 0,
};

for (const problem of dataset.problems) {
  const extId = String(problem.externalId || problem.id);
  let assignedPrimary = null;
  let assignedSecondary = []; // Always recompute cleanly — never preserve stale buggy tags

  const lcTags = getVerifiedLeetCodeTags(problem);
  const seedPatterns = CURATED_SEED_ALL[extId] || [];

  // Tier 0: Golden Benchmark Ground Truth
  if (GOLDEN_BENCHMARK_MAP[extId]) {
    assignedPrimary = GOLDEN_BENCHMARK_MAP[extId].primary;
    assignedSecondary = [...GOLDEN_BENCHMARK_MAP[extId].secondary];
    stats.tier0GoldenCount++;
  }
  // Tier 1: Curated seed.ts Roadmap (canonicalized, non-conflicting)
  else if (seedPatterns.length > 0) {
    assignedPrimary = seedPatterns[0];
    if (lcTags) {
      const tagRes = classifyByLeetCodeTags(lcTags, problem);
      if (tagRes) {
        assignedSecondary.push(...tagRes.secondary);
        if (tagRes.primary !== assignedPrimary) assignedSecondary.push(tagRes.primary);
      }
    }
    stats.tier1SeedCount++;
  }
  // Tier 2: LeetCode Official Topic Tags + Strict Specificity Matrix
  else if (lcTags && lcTags.length > 0) {
    const classified = classifyByLeetCodeTags(lcTags, problem);
    if (classified) {
      assignedPrimary = classified.primary;
      assignedSecondary = [...classified.secondary];
      stats.tier2LeetCodeTagsCount++;
    }
  }
  // Tier 3: Structural Title & Slug Heuristics (only if still unclassified)
  if (!assignedPrimary) {
    const inferred = inferFromTitleAndSlug(problem);
    if (inferred) {
      assignedPrimary = inferred.primary;
      assignedSecondary = [...inferred.secondary];
      stats.tier3InferredCount++;
    }
  }

  // Fallback for JS utilities, Pandas DataFrame, Concurrency, Shell, etc.
  if (!assignedPrimary) {
    assignedPrimary = 'General DSA';
  }

  // Strictly canonicalize primary pattern (zero "Sorting & Search", "Trees", "Uncategorized")
  assignedPrimary = canonicalizePrimary(assignedPrimary);

  // Merge any secondary seed.ts pattern memberships cleanly
  for (const sp of seedPatterns) {
    if (sp !== assignedPrimary && !assignedSecondary.includes(sp)) {
      assignedSecondary.push(sp);
    }
  }

  // Deduplicate & ensure primary is never repeated in secondary
  assignedSecondary = Array.from(new Set(assignedSecondary)).filter((s) => s && s !== assignedPrimary);

  // Attach default co-occurring secondary patterns when helpful
  if (assignedSecondary.length === 0) {
    if (assignedPrimary === 'Sliding Window') assignedSecondary.push('Two Pointers');
    else if (assignedPrimary === 'Topological Sort') assignedSecondary.push('Graph DFS/BFS');
    else if (assignedPrimary === 'Monotonic Stack & Queue') assignedSecondary.push('Stack');
    else if (assignedPrimary === 'Union-Find / Disjoint Set (DSU)') assignedSecondary.push('Graph DFS/BFS');
    else if (assignedPrimary === 'Trie (Prefix Tree)') assignedSecondary.push('Design & Hybrid Structures');
    else if (assignedPrimary === 'Design & Hybrid Structures') assignedSecondary.push('Hash Maps / Hash Sets');
  }

  problem.primaryPattern = assignedPrimary;
  problem.secondaryPatterns = assignedSecondary;

  if (assignedPrimary === 'General DSA') stats.generalDSACount++;
  if (assignedSecondary.length > 0) stats.secondaryPopulated++;
}

fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2), 'utf8');

console.log('\n=== DETERMINISTIC PATTERN ENRICHMENT REPORT ===');
console.log(`Total problems processed: ${stats.total}`);
console.log(`- Tier 0 Golden Benchmark matches: ${stats.tier0GoldenCount}`);
console.log(`- Tier 1 Curated seed.ts matches:  ${stats.tier1SeedCount}`);
console.log(`- Tier 2 Official LC Tags matrix:  ${stats.tier2LeetCodeTagsCount}`);
console.log(`- Tier 3 Title/Slug heuristics:    ${stats.tier3InferredCount}`);
console.log(`- General DSA (JS/Pandas/Array):   ${stats.generalDSACount}`);
console.log(`- Problems with secondary tags:    ${stats.secondaryPopulated}`);
console.log('Successfully regenerated generated_dataset.json!');
