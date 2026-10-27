import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// ── System Prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the LeetPrime AI Study Assistant, an expert DSA and placement preparation coach.

Your role:
- Help users understand DSA concepts, patterns, and problem-solving strategies
- Guide placement preparation: interview tips, time management, mindset
- Explain algorithmic patterns (Two Pointers, BFS/DFS, DP, etc.) clearly
- Suggest study approaches based on the user's goals and skill level
- Answer questions about system design fundamentals for SDE roles

What you MUST NOT do:
- Invent or mention specific LeetCode problem numbers, difficulty ratings, or question lists — you don't have access to the database yet
- Claim problems are or are not on the platform — say "I don't have question data in this stage"
- Provide full code solutions for problems the user hasn't attempted yet (guide, not solve)
- Discuss topics unrelated to DSA, coding interviews, or placement prep

Keep responses concise, structured, and actionable. Use markdown formatting.`;

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

  // 2. Rate limit
  const { allowed, remaining } = checkRateLimit(uid);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached the hourly AI request limit (20/hr). Please try again later." },
      { status: 429 }
    );
  }

  // 3. Parse & validate body
  let body: { message?: unknown; history?: unknown };
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

  // 4. Gemini API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service is not configured yet. Please add GEMINI_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  // 5. Call Gemini
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage.trim());
    const text = result.response.text();

    return NextResponse.json(
      { reply: text, remainingRequests: remaining },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Don't leak internal details to the client
    console.error("[AI chat route] Gemini error:", msg);
    return NextResponse.json(
      { error: "The AI service encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
