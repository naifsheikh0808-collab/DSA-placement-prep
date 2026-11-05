// Server-side BYOK configuration
// Keys are never returned to the browser or logged

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-auth";
import {
  getGeminiApiKey,
  getGroqApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  deleteUserKey,
  getUserKeys,
} from "@/lib/ai-keystore";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyFirebaseIdToken(authHeader.slice(7));
  if (!verified) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const body = await req.json();
  const apiKey = body?.apiKey;
  const provider = body?.provider as "gemini" | "groq" | undefined;

  if (!provider || (provider !== "gemini" && provider !== "groq")) {
    return NextResponse.json({ error: "Invalid provider. Must be 'gemini' or 'groq'." }, { status: 400 });
  }

  if (typeof apiKey !== "string" || apiKey.trim().length < 10) {
    return NextResponse.json({ error: "Invalid API key format" }, { status: 400 });
  }

  const trimmedKey = apiKey.trim();

  // Validate key with minimal connection test
  if (body?.validate === true) {
    try {
      if (provider === "gemini") {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(trimmedKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        await model.generateContent("Test connection");
        setGeminiApiKey(verified.uid, trimmedKey);
        return NextResponse.json({ success: true, valid: true, message: "Gemini API key validated and configured" });
      } else {
        // Groq validation — check against Groq's official models catalog endpoint
        const response = await fetch("https://api.groq.com/openai/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
          },
        });

        if (response.ok || response.status === 200) {
          setGroqApiKey(verified.uid, trimmedKey);
          return NextResponse.json({ success: true, valid: true, message: "Groq API key verified and configured successfully" });
        } else if (response.status === 401) {
          return NextResponse.json(
            { success: false, valid: false, error: "Invalid Groq API key. Check your key at console.groq.com/keys." },
            { status: 400 }
          );
        } else {
          const errText = await response.text().catch(() => "");
          return NextResponse.json(
            { success: false, valid: false, error: `Groq verification failed (${response.status}): ${errText.slice(0, 100)}` },
            { status: 400 }
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: msg.includes("401") || msg.includes("API key") || msg.includes("not valid")
            ? `Invalid ${provider === "gemini" ? "Google Gemini" : "Groq"} API key. Please check your key.`
            : "Connection test failed. Please verify your internet connection or key permissions.",
        },
        { status: 400 }
      );
    }
  }

  // Store without validation
  if (provider === "gemini") {
    setGeminiApiKey(verified.uid, trimmedKey);
  } else {
    setGroqApiKey(verified.uid, trimmedKey);
  }
  return NextResponse.json({ success: true, message: `${provider} API key configured` });
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyFirebaseIdToken(authHeader.slice(7));
  if (!verified) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  let provider: "gemini" | "groq" | undefined;
  try {
    const body = await req.json();
    provider = body?.provider;
  } catch {
    // no body — remove all
  }

  deleteUserKey(verified.uid, provider);
  return NextResponse.json({ success: true, message: "API key removed. Switched to Free Tier." });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyFirebaseIdToken(authHeader.slice(7));
  if (!verified) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const record = getUserKeys(verified.uid);
  const geminiConfigured = !!(record?.geminiKey);
  const groqConfigured = !!(record?.groqKey);
  const anyConfigured = geminiConfigured || groqConfigured;

  return NextResponse.json({
    geminiConfigured,
    groqConfigured,
    configured: anyConfigured,
    tier: anyConfigured ? "byok" : "free",
    modelName: "Prime AI",
  });
}

// Re-export for compatibility
export { getUserKeys, getGeminiApiKey, getGroqApiKey };
export function getUserApiKey(uid: string): string | undefined {
  return getGeminiApiKey(uid);
}
