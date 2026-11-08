import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from "@google/generative-ai";
import {
  searchQuestions,
  QuestionSearchParams,
  ProposedPlannerConfig,
  validateProposedPlannerConfig,
} from "@/lib/question-search";
import {
  getGeminiApiKey,
  getGroqApiKey,
  setGeminiApiKey,
  setGroqApiKey,
} from "@/lib/ai-keystore";

// ━━ Constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MAX_MESSAGE_LENGTH = 1000; // chars per user message
const MAX_HISTORY_MESSAGES = 20; // total history items sent per request
const MAX_FREE_PER_MODEL = 10; // per model per user per hour
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ━━ Per-model rate limit stores ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const geminiRateLimitStore = new Map<string, { count: number; windowStart: number }>();
const groqRateLimitStore = new Map<string, { count: number; windowStart: number }>();

function checkModelRateLimit(
  store: Map<string, { count: number; windowStart: number }>,
  uid: string
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(uid);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    store.set(uid, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_FREE_PER_MODEL - 1 };
  }

  if (entry.count >= MAX_FREE_PER_MODEL) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_FREE_PER_MODEL - entry.count };
}

function getRemainingForStore(
  store: Map<string, { count: number; windowStart: number }>,
  uid: string
): number {
  const now = Date.now();
  const entry = store.get(uid);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) return MAX_FREE_PER_MODEL;
  return Math.max(0, MAX_FREE_PER_MODEL - entry.count);
}

// ━━ Firebase ID Token Verification ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function verifyFirebaseIdToken(
  idToken: string
): Promise<{ uid: string; email: string | null } | null> {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      console.warn("[AI auth] Token format invalid: expected 3 parts, got", parts.length);
      return null;
    }
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub) {
      console.warn("[AI auth] Token payload missing 'sub'");
      return null;
    }

    if (payload.aud !== projectId) {
      console.warn(`[AI auth] 'aud' mismatch: token has '${payload.aud}', expected '${projectId}'`);
      return null;
    }

    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      console.warn(`[AI auth] 'iss' mismatch`);
      return null;
    }

    if (payload.exp < now - 300) {
      console.warn(`[AI auth] Token expired`);
      return null;
    }

    if (payload.iat > now + 300) {
      console.warn(`[AI auth] Token issued in future`);
      return null;
    }

    const jwksRes = await fetch(
      "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
      { next: { revalidate: 3600 } }
    );
    if (!jwksRes.ok) {
      console.warn("[AI auth] Failed to fetch Google JWKs, status:", jwksRes.status);
      return null;
    }

    const jwks: { keys: (JsonWebKey & { kid?: string })[] } = await jwksRes.json();
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      console.warn("[AI auth] Key ID not found in Google JWKs:", header.kid);
      return null;
    }

    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signingInput = `${headerB64}.${payloadB64}`;
    const signature = Buffer.from(signatureB64, "base64url");

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signature,
      new TextEncoder().encode(signingInput)
    );

    if (!valid) {
      console.warn("[AI auth] Signature verification failed");
      return null;
    }

    return { uid: payload.sub as string, email: (payload.email as string) ?? null };
  } catch (err) {
    console.error("[AI auth] Exception during token verification:", err);
    return null;
  }
}

// ━━ Tool Declarations ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SEARCH_QUESTIONS_TOOL: FunctionDeclaration = {
  name: "search_questions",
  description:
    "Search the official LeetPrime DSA dataset (over 3,300 real curated interview problems) across 650+ companies, 25+ algorithmic patterns, difficulty levels, and timeframes.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      company: {
        type: SchemaType.STRING,
        description:
          "Target company or group name (e.g., 'google', 'amazon', 'meta', 'facebook', 'apple', 'netflix', 'faang', 'microsoft', 'uber', 'goldman sachs'). For FAANG, pass 'faang'.",
      },
      pattern: {
        type: SchemaType.STRING,
        description:
          "Algorithmic pattern or topic (e.g., 'Sliding Window', 'Two Pointers', 'Dynamic Programming', 'Binary Tree', 'Graph', 'Binary Search', 'Heap / Priority Queue', 'Backtracking').",
      },
      difficulty: {
        type: SchemaType.STRING,
        description: "Problem difficulty: 'Easy', 'Medium', or 'Hard'.",
      },
      timeframe: {
        type: SchemaType.STRING,
        description:
          "Recency / timeframe of interview questions: '30d' (last 30 days), '3m' (last 3 months), '6m' (last 6 months), '6m+', or 'all'.",
      },
      keywords: {
        type: SchemaType.STRING,
        description:
          "Keywords to match in question titles (e.g., 'LRU Cache', 'island', 'stock', 'subarray').",
      },
      excludeIds: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Problem IDs to exclude from search (e.g. problems the user has already solved).",
      },
      onlyIds: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Specific problem IDs to restrict search to (e.g. user revision items).",
      },
      limit: {
        type: SchemaType.INTEGER,
        description:
          "Number of questions requested by the user (default is 5, max 25).",
      },
    },
  },
};

const PROPOSE_PLANNER_TOOL: FunctionDeclaration = {
  name: "propose_planner_configuration",
  description:
    "Propose a structured Smart Planner study roadmap when the user asks to create or update their preparation plan (e.g. 'Create a DSA plan for my level', 'Prepare for Amazon in 3 months', etc.). This renders an interactive preview card that the user can review and apply to their Smart Planner.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      role: {
        type: SchemaType.STRING,
        description: "Target role: 'intern', 'sde1', 'sde2', or 'quant'.",
      },
      level: {
        type: SchemaType.STRING,
        description: "User skill level: 'beginner', 'basics', 'intermediate', or 'advanced'.",
      },
      durationDays: {
        type: SchemaType.INTEGER,
        description: "Preparation timeline in days: 15, 30, 60, or 90.",
      },
      dailyHours: {
        type: SchemaType.INTEGER,
        description: "Available daily study time in hours: 1, 2, 4, or 6.",
      },
      targetCompanies: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Target company names (e.g. ['Amazon', 'Google', 'Meta']).",
      },
      planSummary: {
        type: SchemaType.STRING,
        description: "Executive 1-2 sentence summary of this plan and how it is customized for the user.",
      },
      focusAreas: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Core algorithmic focus areas (e.g. ['Sliding Window', 'Binary Tree', 'Dynamic Programming']).",
      },
    },
    required: ["role", "level", "durationDays", "dailyHours", "planSummary"],
  },
};

// ━━ System Prompt ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SYSTEM_PROMPT = `You are Prime AI — LeetPrime's elite DSA mentor and career strategist. You are powered by state-of-the-art AI models but present yourself under the LeetPrime brand as "Prime AI".

Your mission:
Deliver rigorous, highly personalized DSA and placement preparation guidance by synthesizing:
1. The user's target role, career stage, current DSA skill level, target companies, and daily available study hours.
2. The user's actual question history (solved, attempted, and revision items from their LeetPrime tracker).
3. The specific problem being viewed when the user is asking from a question page (e.g. Two Sum, LRU Cache).
4. Real dataset queries using the 'search_questions' tool (over 3,300 curated questions across 650+ companies).
5. Direct integration with the LeetPrime Smart Planner via the 'propose_planner_configuration' tool.

COACHING BEHAVIOR & RULES:
1. QUESTION-SPECIFIC ASSISTANCE (When Problem Context is Provided):
   - When the user asks about the currently viewed problem, guide them with progressive hints, intuitive patterns, edge cases, and time/space complexity tradeoffs.
   - Socratic Method: DO NOT vomit out the complete code immediately unless explicitly requested (e.g. "show me the code", "give complete python code"). First give intuition, edge cases, and algorithmic invariant.
   - Keep code concise, clean, well-commented, and in standard Python, C++, Java, or JavaScript/TypeScript.
2. RESPECT KNOWN USER CONTEXT:
   - When User Profile or Progress Context is provided, NEVER ask the user to re-state their level, target companies, or daily hours. Use their existing data immediately.
   - If profile details are missing, proceed with helpful guidance without blocking the user.
3. DATASET-BACKED RECOMMENDATIONS:
   - WHENEVER recommending questions, company preparation sets, or practice problems, you MUST call 'search_questions'.
   - NEVER fabricate problem titles, difficulty levels, acceptance stats, or URLs.
   - Present every problem with its canonical URL as a clickable markdown link: [Problem Title](URL) along with its difficulty, primary pattern, and company associations.
4. PERSONALIZED QUERIES:
   - "Based on my progress, what should I solve next?":
     Call 'search_questions' passing 'excludeIds' with the user's solved question IDs. Pick the highest priority unsolved problem in their target patterns or target companies.
   - "I have 1 hour daily. What should I practise?":
     Recommend a manageable workload matching their exact time budget (e.g. 1 hour = 1 Medium or 2 Easy; give a concrete 60-minute breakdown: 10m problem reading/edge cases, 35m coding, 10m complexity/dry run, 5m revision notes).
   - "I want to prepare for [Company] in [Timeline]":
     Call 'search_questions' for that company. Formulate a phase-by-phase roadmap and call 'propose_planner_configuration' to offer an interactive roadmap review card.
   - "I struggle with [Pattern]":
     Explain the fundamental mental model and invariant of the pattern. Call 'search_questions' for that pattern to provide a progressive 3-step ladder (Beginner -> Core -> Advanced).
5. SMART PLANNER PROPOSALS:
   - When the user asks to create a study plan, prepare for a specific company or role, or optimize their roadmap, call 'propose_planner_configuration'.
6. REALISTIC WORKLOAD & SAFETY:
   - Use realistic time estimates (Easy: 15-25m, Medium: 35-45m, Hard: 50-70m).
   - Keep answers structured, inspiring, and formatted with clean markdown.
7. PROPORTIONAL RESPONSE LENGTH & CONCISENESS (CRITICAL):
   - Golden Rule: Match response length strictly to the question asked — NEVER unnecessarily long, and NEVER dismissively short.
   - Direct / Targeted / List Questions (e.g., "Top 5 Google questions", "What is the time complexity?", "Give me a subtle hint", "List edge cases"):
     * Jump IMMEDIATELY into the answer in sentence 1.
     * ZERO conversational fluff, pleasantries, or preamble ("Sure!", "Certainly!", "Great question! Here is the breakdown:").
     * ZERO concluding boilerplate ("I hope this helps!", "Happy coding!", "Let me know if you have more questions!").
     * Deliver high-density, scannable bullets or 1-3 focused paragraphs. No essays.
   - In-depth / Conceptual Questions (e.g., "Explain Kadane's algorithm from intuition to code", "How does Sliding Window work?"):
     * Keep it structured and balanced: 2-4 concise sections (Mental Model -> Algorithm Invariant -> Complexity -> Example/Trap).
     * Avoid repeating the same concept in multiple paragraphs.
   - Socratic Hints:
     * Never give a 1-sentence cryptic non-answer (e.g., "Use two pointers"). Provide the key mental bridge or invariant the user needs to progress.
     * Never dump full solution code unless explicitly asked ("give me the code", "show full solution").
   - Code Snippets:
     * Keep code minimal, clean, and focused solely on the algorithm. Avoid excessive boilerplate.`;

// ━━ Message type ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// ━━ Context type ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface ClientContext {
  mode?: "planner" | "question" | "general";
  problem?: {
    id?: string;
    title?: string;
    difficulty?: string;
    primaryPattern?: string;
    secondaryPatterns?: string[];
    companies?: string[];
    acceptanceRate?: number;
    canonicalUrl?: string;
    userStatus?: string;
    userNotes?: string;
  };
  profile?: {
    role?: string;
    level?: string;
    stage?: string;
    companyPreset?: string;
    targetCompanies?: string[];
    durationDays?: number;
    dailyHours?: number;
    preferredLanguage?: string;
  };
  progress?: {
    stats?: { solved: number; attempted: number; revise: number; todo: number };
    solvedProblemIds?: string[];
    attemptedProblemIds?: string[];
    revisionProblemIds?: string[];
    weakPatterns?: string[];
    strongPatterns?: string[];
  };
}

// ━━ Build context string ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildContextString(context: ClientContext, userMessage: string): string {
  let promptWithContext = userMessage.trim();
  const sections: string[] = [];

  if (context.problem) {
    const prob = context.problem;
    const probItems: string[] = [];
    if (prob.title) probItems.push(`Problem: ${prob.title} (${prob.difficulty || "Unknown Difficulty"})`);
    if (prob.primaryPattern) probItems.push(`Primary Pattern: ${prob.primaryPattern}`);
    if (prob.secondaryPatterns && prob.secondaryPatterns.length > 0) {
      probItems.push(`Secondary Patterns: ${prob.secondaryPatterns.join(", ")}`);
    }
    if (prob.companies && prob.companies.length > 0) {
      probItems.push(`Frequently Asked At: ${prob.companies.slice(0, 8).join(", ")}`);
    }
    if (prob.canonicalUrl) probItems.push(`Canonical URL: ${prob.canonicalUrl}`);
    if (prob.acceptanceRate) probItems.push(`Acceptance Rate: ${(prob.acceptanceRate * 100).toFixed(1)}%`);
    if (prob.userStatus) probItems.push(`User's Current Tracker Status: ${prob.userStatus}`);
    if (prob.userNotes) probItems.push(`User's Notes on this Problem:\n${prob.userNotes}`);
    if (probItems.length > 0) {
      sections.push(`[Currently Viewed Problem]:\n${probItems.map((i) => `- ${i}`).join("\n")}`);
    }
  }

  if (context.profile) {
    const pr = context.profile;
    const prItems: string[] = [];
    if (pr.role) prItems.push(`Target Role: ${pr.role}`);
    if (pr.level) prItems.push(`Skill Level: ${pr.level}`);
    if (pr.stage) prItems.push(`Career Stage: ${pr.stage}`);
    if (pr.targetCompanies && pr.targetCompanies.length > 0) {
      prItems.push(`Target Companies: ${pr.targetCompanies.join(", ")}`);
    }
    if (pr.durationDays) prItems.push(`Preparation Timeline: ${pr.durationDays} days`);
    if (pr.dailyHours) prItems.push(`Daily Study Hours Available: ${pr.dailyHours}`);
    if (pr.preferredLanguage) prItems.push(`Preferred Language: ${pr.preferredLanguage}`);
    if (prItems.length > 0) {
      sections.push(`[User Profile (from Smart Planner)]:\n${prItems.map((i) => `- ${i}`).join("\n")}`);
    }
  }

  if (context.progress) {
    const pr = context.progress;
    const prItems: string[] = [];
    if (pr.stats) {
      prItems.push(
        `Progress Stats: ${pr.stats.solved} Solved, ${pr.stats.attempted} Attempted, ${pr.stats.revise} Marked for Revision, ${pr.stats.todo} Todo`
      );
    }
    if (pr.weakPatterns && pr.weakPatterns.length > 0) {
      prItems.push(`Weakest Patterns (< 50% solved): ${pr.weakPatterns.join(", ")}`);
    }
    if (pr.strongPatterns && pr.strongPatterns.length > 0) {
      prItems.push(`Highest Mastery Patterns (>= 50% solved): ${pr.strongPatterns.join(", ")}`);
    }
    if (pr.revisionProblemIds && pr.revisionProblemIds.length > 0) {
      prItems.push(`Question IDs Marked for Revision: ${pr.revisionProblemIds.slice(0, 10).join(", ")}`);
    }
    if (pr.solvedProblemIds && pr.solvedProblemIds.length > 0) {
      prItems.push(`Total Solved Question IDs count: ${pr.solvedProblemIds.length}`);
    }
    if (prItems.length > 0) {
      sections.push(`[Active User Progress Tracker]:\n${prItems.map((i) => `- ${i}`).join("\n")}`);
    }
  }

  if (sections.length > 0) {
    promptWithContext += `\n\n--- USER CONTEXT (Already Known) ---\n${sections.join("\n\n")}\n--- END USER CONTEXT ---`;
  }
  return promptWithContext;
}

// ━━ Groq handler (OpenAI-compatible REST) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function callGroq(
  apiKey: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  isPlannerMode: boolean
): Promise<{ text: string; proposedPlan?: ProposedPlannerConfig }> {
  let sys =
    systemPrompt +
    "\n\nCRITICAL CONCISENESS & LENGTH RULE FOR GROQ:\nAlways provide proportional answers matching question depth. Strictly avoid verbose intros, conversational filler, and repetitive concluding advice. Jump straight into the answer.";
  if (isPlannerMode) {
    sys += "\n\nPLANNER PROPOSAL INSTRUCTION:\nWhen recommending or generating a new study plan or roadmap adjustments, provide your coaching advice and include a JSON code block in this exact format at the very end of your response so the user can interactively apply it to their Smart Planner:\n```json-plan\n{\n  \"role\": \"sde1\",\n  \"level\": \"intermediate\",\n  \"durationDays\": 30,\n  \"dailyHours\": 2,\n  \"targetCompanies\": [\"Google\", \"Amazon\"],\n  \"planSummary\": \"1-2 sentence executive summary of this roadmap\",\n  \"focusAreas\": [\"Sliding Window\", \"Binary Tree\", \"Dynamic Programming\"]\n}\n```\nValid roles: 'intern', 'sde1', 'sde2', 'quant'. Valid levels: 'beginner', 'basics', 'intermediate', 'advanced'. Valid durationDays: 15, 30, 60, 90. Valid dailyHours: 1, 2, 4, 6.";
  }

  // Sanitize messages to guarantee non-empty content
  const rawMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: sys },
    ...history
      .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content.trim(),
      })),
    { role: "user", content: userMessage.trim() },
  ];

  // ── Strict allowlist of known Groq text-chat models (ordered by preference) ─
  // We do NOT use dynamic discovery from /v1/models because that returns speech
  // synthesis, audio, guard, and vision models that are incompatible with text chat.
  const GROQ_TEXT_MODELS = [
    "llama-3.3-70b-versatile",
    "qwen/qwen3.8-27b",          // Qwen 3.8 27B — good free-tier model
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "gemma2-9b-it",
  ];

  // 1. Validate the API key cheaply (don't use for model discovery)
  try {
    const authCheck = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (authCheck.status === 401) {
      throw new Error("Invalid Groq API key. Please check your key in ⚙️ Settings.");
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Invalid Groq API key")) {
      throw err;
    }
    // Network error — proceed and let the chat call fail naturally
  }

  // 2. Try each model; skip on 400/404 (terms not accepted, model restricted, or not on tier)
  let data: { choices?: Array<{ message?: { content?: string } }> } | undefined;
  for (const modelId of GROQ_TEXT_MODELS) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: rawMessages,
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });

    if (response.ok) {
      data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      break;
    }

    if (response.status === 401) {
      throw new Error("Invalid Groq API key. Please check your key in ⚙️ Settings.");
    }
    if (response.status === 429) {
      throw new Error("Groq rate limit reached. Please wait a moment or try again later.");
    }
    // 400, 404 = model not available, restricted, terms not accepted → try next
    const errBody = await response.text().catch(() => "");
    console.warn(`[Prime AI Groq] Model '${modelId}' unavailable (${response.status}): ${errBody.slice(0, 120)} — trying next...`);
  }

  if (!data) {
    throw new Error("All Groq models are currently unavailable. Please try Gemini or add your own Groq API key.");
  }

  const rawText = data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

  let proposedPlan: ProposedPlannerConfig | undefined;
  const planMatch = rawText.match(/```(?:json-plan|json)?\s*({[\s\S]*?"planSummary"[\s\S]*?})\s*```/);
  let cleanedText = rawText;
  if (planMatch) {
    try {
      const parsed = JSON.parse(planMatch[1]);
      const validated = validateProposedPlannerConfig(parsed);
      if (validated) {
        proposedPlan = validated;
        cleanedText = rawText.replace(planMatch[0], "").trim();
      }
    } catch {}
  }

  return { text: cleanedText, proposedPlan };
}

// ━━ Route Handler ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function POST(req: NextRequest) {
  // 1. Auth check
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to use Prime AI." },
      { status: 401 }
    );
  }

  const idToken = authHeader.slice(7);
  const verified = await verifyFirebaseIdToken(idToken);
  if (!verified) {
    return NextResponse.json(
      { error: "Invalid or expired session. Please sign in again." },
      { status: 401 }
    );
  }

  const { uid } = verified;

  // 2. Parse body
  let body: {
    message?: unknown;
    history?: unknown;
    context?: ClientContext;
    model?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const requestedModel = body.model === "groq" ? "groq" : "gemini";

  const userMessage = body.message;
  if (
    typeof userMessage !== "string" ||
    userMessage.trim().length === 0 ||
    userMessage.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { error: `Message must be a non-empty string up to ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  // Validate and truncate history
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history: ChatMessage[] = rawHistory
    .filter(
      (m): m is ChatMessage =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "model") &&
        typeof m.content === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_LENGTH),
    }));

  // 3. Check BYOK keys (supports server keystore, custom headers, or body backup)
  const headerGroqKey = req.headers.get("x-byok-groq-key")?.trim();
  const headerGeminiKey = req.headers.get("x-byok-gemini-key")?.trim();
  const bodyGroqKey = typeof (body as any)?.groqApiKey === "string" ? (body as any).groqApiKey.trim() : undefined;
  const bodyGeminiKey = typeof (body as any)?.geminiApiKey === "string" ? (body as any).geminiApiKey.trim() : undefined;

  const geminiByokKey = bodyGeminiKey || headerGeminiKey || getGeminiApiKey(uid);
  const groqByokKey = bodyGroqKey || headerGroqKey || getGroqApiKey(uid);

  if (groqByokKey && !getGroqApiKey(uid)) setGroqApiKey(uid, groqByokKey);
  if (geminiByokKey && !getGeminiApiKey(uid)) setGeminiApiKey(uid, geminiByokKey);

  let isByok = false;
  let remainingGemini: number | null = null;
  let remainingGroq: number | null = null;

  if (requestedModel === "groq") {
    isByok = !!groqByokKey;
    if (!isByok) {
      const rateCheck = checkModelRateLimit(groqRateLimitStore, uid);
      remainingGroq = rateCheck.remaining;
      remainingGemini = getRemainingForStore(geminiRateLimitStore, uid);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            error: "You've reached the free Groq tier limit (10 req/hr). Add your own Groq API key in ⚙️ Settings for unlimited access, or try again in an hour.",
            tier: "free",
            remainingGemini,
            remainingGroq: 0,
          },
          { status: 429 }
        );
      }
    }
  } else {
    // Gemini
    isByok = !!geminiByokKey;
    if (!isByok) {
      const rateCheck = checkModelRateLimit(geminiRateLimitStore, uid);
      remainingGemini = rateCheck.remaining;
      remainingGroq = getRemainingForStore(groqRateLimitStore, uid);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            error: "You've reached the free Gemini tier limit (10 req/hr). Add your own Gemini API key in ⚙️ Settings for unlimited access, or switch to Groq.",
            tier: "free",
            remainingGemini: 0,
            remainingGroq,
          },
          { status: 429 }
        );
      }
    }
  }

  // Dev mock mode
  if (process.env.AI_MOCK_MODE === "true" && process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        reply: "**[Prime AI — Simulated Response]** This is a mock response for development testing.",
        remainingGemini: 9,
        remainingGroq: 9,
        activeModel: requestedModel,
        isByok: false,
        proposedPlan: undefined,
      },
      { status: 200 }
    );
  }

  // 4. Build context-enriched prompt
  const contextString = body.context
    ? buildContextString(body.context, userMessage)
    : userMessage.trim();

  // 5. Route to appropriate AI model
  try {
    // ── GROQ ──────────────────────────────────────────────────────────────────
    if (requestedModel === "groq") {
      const apiKey = groqByokKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Groq is not configured. Add a Groq API key in ⚙️ Settings or set GROQ_API_KEY in .env.local." },
          { status: 503 }
        );
      }

      const isPlanner = body.context?.mode === "planner";
      const { text, proposedPlan } = await callGroq(apiKey, SYSTEM_PROMPT, history, contextString, isPlanner);

      // Get updated remaining for Groq (after the decrement)
      if (!isByok) {
        remainingGroq = getRemainingForStore(groqRateLimitStore, uid);
      }
      if (remainingGemini === null) {
        remainingGemini = getRemainingForStore(geminiRateLimitStore, uid);
      }

      return NextResponse.json(
        {
          reply: text,
          activeModel: "groq",
          remainingGemini,
          remainingGroq: isByok ? null : remainingGroq,
          isByok,
          proposedPlan,
        },
        { status: 200 }
      );
    }

    // ── GEMINI ────────────────────────────────────────────────────────────────
    const apiKey = geminiByokKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured. Add GEMINI_API_KEY to .env.local or configure your personal API key in ⚙️ Settings." },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1600,
      },
      tools: [
        {
          functionDeclarations: [SEARCH_QUESTIONS_TOOL, PROPOSE_PLANNER_TOOL],
        },
      ],
    });

    const chat = model.startChat({
      history: history.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

    let result = await chat.sendMessage(contextString);
    let functionCalls = result.response.functionCalls();
    let proposedPlan: ProposedPlannerConfig | undefined;

    // Tool execution loop (supports up to 4 iterative tool calls)
    let turns = 0;
    while (functionCalls && functionCalls.length > 0 && turns < 4) {
      turns++;
      const call = functionCalls[0];
      let toolData: Record<string, unknown> = {};

      if (call.name === "search_questions") {
        const searchArgs = (call.args ?? {}) as QuestionSearchParams;

        if (
          !searchArgs.excludeIds &&
          body.context?.progress?.solvedProblemIds &&
          body.context.progress.solvedProblemIds.length > 0
        ) {
          const msgLower = userMessage.toLowerCase();
          if (
            msgLower.includes("next") ||
            msgLower.includes("unsolved") ||
            msgLower.includes("new problem")
          ) {
            searchArgs.excludeIds = body.context.progress.solvedProblemIds;
          }
        }

        if (
          !searchArgs.onlyIds &&
          body.context?.progress?.revisionProblemIds &&
          body.context.progress.revisionProblemIds.length > 0
        ) {
          const msgLower = userMessage.toLowerCase();
          if (msgLower.includes("revision") || msgLower.includes("revise") || msgLower.includes("struggled with")) {
            searchArgs.onlyIds = body.context.progress.revisionProblemIds;
          }
        }

        const searchRes = searchQuestions(searchArgs);
        toolData = searchRes as unknown as Record<string, unknown>;
      } else if (call.name === "propose_planner_configuration") {
        const validated = validateProposedPlannerConfig(call.args);
        if (validated) {
          proposedPlan = validated;
          toolData = {
            success: true,
            proposedPlan: validated,
            message:
              "Proposed planner configuration created successfully. An interactive plan card will be shown to the user for review.",
          };
        } else {
          toolData = {
            success: false,
            error: "Invalid planner configuration parameters.",
          };
        }
      } else {
        toolData = { error: `Tool '${call.name}' is not recognized.` };
      }

      result = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: toolData,
          },
        },
      ]);

      functionCalls = result.response.functionCalls();
    }

    const text = result.response.text();

    // Update remaining for Gemini after decrement
    if (!isByok) {
      remainingGemini = getRemainingForStore(geminiRateLimitStore, uid);
    }
    if (remainingGroq === null) {
      remainingGroq = getRemainingForStore(groqRateLimitStore, uid);
    }

    return NextResponse.json(
      {
        reply: text,
        activeModel: "gemini",
        remainingGemini: isByok ? null : remainingGemini,
        remainingGroq,
        isByok,
        proposedPlan,
        // Legacy compat
        remainingRequests: isByok ? null : remainingGemini,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Prime AI ${requestedModel} error]:`, msg);

    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        { error: "AI rate limit reached. Add your own API key in ⚙️ Settings or try again later." },
        { status: 429 }
      );
    }

    if (msg.includes("401") || msg.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "AI service authentication failed. Please check your API key in ⚙️ Settings." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: (msg && !msg.toLowerCase().includes("unknown") ? msg : "Prime AI encountered an error. Please try again.") },
      { status: 500 }
    );
  }
}
