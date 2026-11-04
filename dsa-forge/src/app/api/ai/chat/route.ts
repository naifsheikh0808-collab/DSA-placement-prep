import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from "@google/generative-ai";
import {
  searchQuestions,
  QuestionSearchParams,
  ProposedPlannerConfig,
  validateProposedPlannerConfig,
} from "@/lib/question-search";
import { getUserApiKey } from "@/app/api/ai/config/route";

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 1000; // chars per user message
const MAX_HISTORY_MESSAGES = 20; // total history items sent per request
const MAX_REQUESTS_PER_WINDOW = 20; // per user, per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limit store. Resets when the server process restarts.
// For production, replace with Redis or a database-backed counter.
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(uid: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(uid);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitStore.set(uid, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

// ── Firebase ID Token Verification ────────────────────────────────────────────
// Verifies Firebase ID tokens using Google's JWK endpoint so that
// crypto.subtle.importKey receives a proper JWK object.
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

    // ── Claims validation ──────────────────────────────────────────────────
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
      console.warn(`[AI auth] 'iss' mismatch: token has '${payload.iss}', expected 'https://securetoken.google.com/${projectId}'`);
      return null;
    }

    // Allow 5-minute clock skew tolerance on both expiration and issue time
    if (payload.exp < now - 300) {
      console.warn(`[AI auth] Token expired (exp: ${payload.exp}, now: ${now})`);
      return null;
    }

    if (payload.iat > now + 300) {
      console.warn(`[AI auth] Token issued in future (iat: ${payload.iat}, now: ${now})`);
      return null;
    }

    // ── Fetch Google's JWKs for Firebase tokens ────────────────────────────
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

    // ── Import the matching JWK and verify signature ───────────────────────
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

// ── Tool Declaration ─────────────────────────────────────────────────────────
// ── Tool Declarations ────────────────────────────────────────────────────────
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

// ── System Prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the LeetPrime AI Placement Coach, an elite DSA mentor and career strategist integrated directly into the LeetPrime platform.

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
   - Keep answers structured, inspiring, and formatted with clean markdown.`;

// ── Message type ───────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// ── Route Handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth check
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to use the AI assistant." },
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

  // 2. Check for user custom BYOK key vs Platform Free Tier
  const userApiKey = getUserApiKey(uid);
  const isByok = !!userApiKey;

  // Rate limit: only applies to default free tier users. Custom BYOK users use their own Google Gemini quota!
  let remaining: number | null = null;
  if (!isByok) {
    const rateCheck = checkRateLimit(uid);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "You've reached the free tier limit (20 req/hr). Add your own free Gemini API Key (BYOK) for unlimited requests, or try again in an hour.",
          tier: "free",
        },
        { status: 429 }
      );
    }
    remaining = rateCheck.remaining;
  }

  // 3. Parse & validate body
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

  let body: {
    message?: unknown;
    history?: unknown;
    context?: ClientContext;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userMessage = body.message;
  if (
    typeof userMessage !== "string" ||
    userMessage.trim().length === 0 ||
    userMessage.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      {
        error: `Message must be a non-empty string up to ${MAX_MESSAGE_LENGTH} characters.`,
      },
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

  // Development mock mode - returns deterministic responses without live AI calls
  if (process.env.AI_MOCK_MODE === "true" && process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        reply: "**[Simulated Response]** This is a mock AI response for development testing. The mock provider does not make live API calls. In production, the AI would provide personalized coaching based on your profile and progress.",
        remainingRequests: 999,
        proposedPlan: undefined,
      },
      { status: 200 }
    );
  }

  // 4. Get API key (user BYOK first, then env default)
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service is not configured. Add GEMINI_API_KEY to .env.local or configure your personal API key in BYOK settings." },
      { status: 503 }
    );
  }

  // 5. Call Gemini with Placement Coach Tool Calling
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
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

    // Synthesize user context into prompt
    let promptWithContext = userMessage.trim();
    if (body.context) {
      const ctx = body.context;
      const sections: string[] = [];

      if (ctx.problem) {
        const prob = ctx.problem;
        const probItems: string[] = [];
        if (prob.title) probItems.push(`Problem: ${prob.title} (${prob.difficulty || "Unknown Difficulty"})`);
        if (prob.primaryPattern) probItems.push(`Primary Pattern: ${prob.primaryPattern}`);
        if (prob.secondaryPatterns && prob.secondaryPatterns.length > 0) {
          probItems.push(`Secondary Patterns: ${prob.secondaryPatterns.join(", ")}`);
        }
        if (prob.companies && prob.companies.length > 0) {
          probItems.push(`Frequently Asked At: ${prob.companies.slice(0, 8).join(", ")}`);
        }
        if (prob.userStatus) probItems.push(`User's Current Tracker Status: ${prob.userStatus}`);
        if (prob.userNotes) probItems.push(`User's Existing Notes on this Problem:\n"${prob.userNotes}"`);
        if (prob.canonicalUrl) probItems.push(`Problem URL: ${prob.canonicalUrl}`);
        if (probItems.length > 0) {
          sections.push(`[Active Problem Currently Being Solved]:\n${probItems.map((i) => `- ${i}`).join("\n")}`);
        }
      }

      if (ctx.profile) {
        const p = ctx.profile;
        const pItems: string[] = [];
        if (p.role) pItems.push(`Target Role: ${p.role.toUpperCase()}`);
        if (p.level) pItems.push(`Skill Level: ${p.level}`);
        if (p.stage) pItems.push(`Career Stage: ${p.stage}`);
        if (p.targetCompanies && p.targetCompanies.length > 0) {
          pItems.push(`Target Companies: ${p.targetCompanies.join(", ")}`);
        }
        if (p.dailyHours) pItems.push(`Daily Available Time: ${p.dailyHours} hours/day`);
        if (p.durationDays) pItems.push(`Preparation Timeline: ${p.durationDays} days`);
        if (p.preferredLanguage) pItems.push(`Preferred Language: ${p.preferredLanguage}`);
        if (pItems.length > 0) {
          sections.push(`[Active User Profile]:\n${pItems.map((i) => `- ${i}`).join("\n")}`);
        }
      }

      if (ctx.progress) {
        const pr = ctx.progress;
        const prItems: string[] = [];
        const solved = pr.stats?.solved ?? pr.solvedProblemIds?.length ?? 0;
        const attempted = pr.stats?.attempted ?? pr.attemptedProblemIds?.length ?? 0;
        const revise = pr.stats?.revise ?? pr.revisionProblemIds?.length ?? 0;

        prItems.push(`Progress Stats: ${solved} Solved, ${attempted} Attempted, ${revise} Marked for Revision`);
        if (pr.weakPatterns && pr.weakPatterns.length > 0) {
          prItems.push(`Lowest Mastery Patterns (<50% solved): ${pr.weakPatterns.join(", ")}`);
        }
        if (pr.strongPatterns && pr.strongPatterns.length > 0) {
          prItems.push(`Highest Mastery Patterns (>=50% solved): ${pr.strongPatterns.join(", ")}`);
        }
        if (pr.revisionProblemIds && pr.revisionProblemIds.length > 0) {
          prItems.push(`Question IDs Marked for Revision: ${pr.revisionProblemIds.slice(0, 10).join(", ")}`);
        }
        if (pr.solvedProblemIds && pr.solvedProblemIds.length > 0) {
          prItems.push(`Total Solved Question IDs count: ${pr.solvedProblemIds.length}`);
        }
        sections.push(`[Active User Progress Tracker]:\n${prItems.map((i) => `- ${i}`).join("\n")}`);
      }

      if (sections.length > 0) {
        promptWithContext += `\n\n--- USER CONTEXT (Already Known) ---\n${sections.join(
          "\n\n"
        )}\n--- END USER CONTEXT ---`;
      }
    }

    let result = await chat.sendMessage(promptWithContext);
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

        // Auto-fill excludeIds if asking for next/unsolved problems and user has solved IDs
        if (
          !searchArgs.excludeIds &&
          body.context?.progress?.solvedProblemIds &&
          body.context.progress.solvedProblemIds.length > 0
        ) {
          // If query is looking for next problem or recommendations, pass excludeIds
          const msgLower = userMessage.toLowerCase();
          if (
            msgLower.includes("next") ||
            msgLower.includes("unsolved") ||
            msgLower.includes("new problem")
          ) {
            searchArgs.excludeIds = body.context.progress.solvedProblemIds;
          }
        }

        // Auto-fill onlyIds if user asks for revision and has revision problem IDs
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

    return NextResponse.json(
      {
        reply: text,
        remainingRequests: remaining,
        isByok,
        proposedPlan,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[AI chat route] Gemini error:", msg);
    
    // Provide more specific error messages for common issues
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        { error: "AI rate limit reached. The free tier allows 20 requests per day. Please try again later or upgrade your API plan." },
        { status: 429 }
      );
    }
    
    if (msg.includes("401") || msg.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "AI service authentication failed. Please check your API key configuration." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "The AI service encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
