"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Temporary verification harness — exercises the real fixed modules. */
const seed_1 = require("@/lib/data/seed");
const pattern_map_1 = require("@/lib/pattern-map");
const db_1 = require("@/lib/db");
let failures = 0;
function check(label, cond, detail = "") {
    if (!cond) {
        failures++;
        console.log(`  FAIL  ${label} ${detail}`);
    }
    else {
        console.log(`  ok    ${label} ${detail}`);
    }
}
console.log("=== 1. Pattern filter must return results for every curated pattern ===");
for (const pattern of seed_1.PATTERNS) {
    const hits = seed_1.TOP_PROBLEMS.filter((p) => (0, pattern_map_1.matchesPatternValue)(p, pattern.name));
    check(`filter "${pattern.name}"`, hits.length > 0, `-> ${hits.length} problems`);
}
console.log("\n=== 2. Previously broken filters ===");
const broken = [
    ["Hash Maps / Hash Sets", "hash map"],
    ["Trees", "binary tree"],
    ["Graph DFS/BFS", "graph"],
    ["In-place Linked List Reversal", "in-place"],
];
for (const [patternName, expect] of broken) {
    const hits = seed_1.TOP_PROBLEMS.filter((p) => (0, pattern_map_1.matchesPatternValue)(p, patternName));
    check(`"${patternName}"`, hits.length > 0, `-> ${hits.length} problems (expect >0)`);
    const sample = hits[0];
    if (sample) {
        const label = (sample.primaryPattern || "").toLowerCase();
        const curated = (0, pattern_map_1.getPatternProblems)((0, pattern_map_1.getPatternByNameOrSlug)(patternName)).some((p) => p.id === sample.id);
        check(`  "${patternName}" sample belongs to pattern`, label.includes(expect) || curated, `-> "${sample.primaryPattern}" (curated member: ${curated})`);
    }
}
console.log("\n=== 3. Every dataset pattern is reachable via the filter ===");
const datasetLabels = Array.from(new Set(seed_1.TOP_PROBLEMS.map((p) => p.primaryPattern).filter(Boolean)));
for (const label of datasetLabels) {
    const hits = seed_1.TOP_PROBLEMS.filter((p) => (0, pattern_map_1.matchesPatternValue)(p, label));
    if (hits.length === 0) {
        failures++;
        console.log(`  FAIL  label "${label}" -> 0 problems`);
    }
}
console.log(`  ok    all ${datasetLabels.length} dataset labels reachable`);
console.log("\n=== 4. Pattern membership + mastery denominators ===");
for (const pattern of seed_1.PATTERNS) {
    const members = (0, pattern_map_1.getPatternProblems)(pattern);
    check(`members "${pattern.name}"`, members.length > 0, `-> ${members.length} problems`);
    const mastery = (0, db_1.getPatternMastery)({}).find((m) => m.pattern.slug === pattern.slug);
    check(`  mastery total "${pattern.name}"`, mastery.total === members.length, `-> ${mastery.total}`);
}
console.log("\n=== 5. Progress key unification (legacy curated id -> canonical id) ===");
const twoPointers = seed_1.PATTERNS.find((p) => p.slug === "two-pointers");
const legacyId = twoPointers.questions[0].id; // "tp-1"
const canonical = (0, pattern_map_1.resolveProblemId)(legacyId);
check("legacy curated id resolves", canonical !== legacyId && seed_1.TOP_PROBLEMS.some((p) => p.id === canonical), `-> "${legacyId}" becomes "${canonical}"`);
const bySlug = (0, pattern_map_1.resolveProblemId)(twoPointers.questions[0].slug);
check("slug resolves to same id", bySlug === canonical, `-> "${bySlug}"`);
const byExt = (0, pattern_map_1.resolveProblemId)(twoPointers.questions[0].externalId);
check("externalId resolves to same id", byExt === canonical, `-> "${byExt}"`);
check("pattern lookup by name", (0, pattern_map_1.getPatternByNameOrSlug)("Hash Maps / Hash Sets")?.slug === "hash-maps");
check("pattern lookup by slug", (0, pattern_map_1.getPatternByNameOrSlug)("hash-maps")?.slug === "hash-maps");
console.log("\n=== 6. Mastery reacts to solving a problem ===");
const solvedId = (0, pattern_map_1.getPatternProblems)(twoPointers)[0].id;
const progress = {
    [solvedId]: {
        problemId: solvedId,
        status: "solved",
        revisionCount: 0,
        solvedAt: new Date().toISOString(),
    },
};
const mastery = (0, db_1.getPatternMastery)(progress);
const tp = mastery.find((m) => m.pattern.slug === "two-pointers");
check("two-pointers solved count = 1", tp.solved === 1, `-> ${tp.solved}/${tp.total} (${tp.pct}%)`);
check("other patterns unaffected", mastery.filter((m) => m.pattern.slug !== "two-pointers").every((m) => m.solved === 0));
console.log("\n=== 7. Solved list helpers ===");
const solved = (0, db_1.getSolvedProblems)(progress);
check("getSolvedProblems", solved.length === 1, `-> ${solved.length}`);
const easy = (0, db_1.getSolvedProblemsByDifficulty)(progress, "Easy");
const medium = (0, db_1.getSolvedProblemsByDifficulty)(progress, "Medium");
const hard = (0, db_1.getSolvedProblemsByDifficulty)(progress, "Hard");
check("difficulty buckets partition solved", easy.length + medium.length + hard.length === solved.length, `-> easy ${easy.length}, medium ${medium.length}, hard ${hard.length}, total ${solved.length}`);
console.log("\n=== 7b. Solving from the pattern page updates the breakdown ===");
const curatedTp = twoPointers.questions[0];
const canonicalTp = (0, pattern_map_1.resolveProblemId)(curatedTp.id);
const progress2 = {
    [canonicalTp]: {
        problemId: canonicalTp,
        status: "solved",
        revisionCount: 0,
        solvedAt: new Date().toISOString(),
    },
};
const mastery2 = (0, db_1.getPatternMastery)(progress2);
const tp2 = mastery2.find((m) => m.pattern.slug === "two-pointers");
check("curated-id solve counted in mastery", tp2.solved === 1, `-> ${tp2.solved}/${tp2.total} (${tp2.pct}%)`);
check("curated-id solve counted in solved list", (0, db_1.getSolvedProblems)(progress2).length === 1, `-> ${(0, db_1.getSolvedProblems)(progress2).length}`);
check("curated-id solve counted in difficulty bucket", (0, db_1.getSolvedProblemsByDifficulty)(progress2, curatedTp.difficulty).length === 1, `-> ${curatedTp.difficulty}`);
console.log("\n=== 8. Extra (non-curated) dataset patterns exposed ===");
const extras = (0, pattern_map_1.getExtraDatasetPatterns)();
check("extras exist", extras.length > 0, `-> ${extras.join(", ")}`);
console.log(failures === 0
    ? "\n*** ALL CHECKS PASSED ***"
    : `\n*** ${failures} CHECK(S) FAILED ***`);
process.exit(failures === 0 ? 0 : 1);
