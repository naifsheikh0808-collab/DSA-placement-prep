// Server-side BYOK configuration (temporary in-memory storage for development)
// Keys are never returned to the browser or logged

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-auth";

// In-memory store: uid -> apiKey (server-side only, resets on restart)
const keyStore = new Map<string, string>();

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

  if (typeof apiKey !== "string" || apiKey.trim().length < 10) {
    return NextResponse.json({ error: "Invalid API key format" }, { status: 400 });
  }

  const trimmedKey = apiKey.trim();

  // Validate key with minimal connection test
  if (body?.validate === true) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent("Test connection");
      // Successfully validated - store in keyStore
      keyStore.set(verified.uid, trimmedKey);
      return NextResponse.json({ success: true, valid: true, message: "API key validated and configured" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: msg.includes("401") || msg.includes("API key") || msg.includes("not valid")
            ? "Invalid Google Gemini API key. Please check your key in Google AI Studio."
            : "Connection test failed. Please verify your internet connection or key permissions.",
        },
        { status: 400 }
      );
    }
  }

  keyStore.set(verified.uid, trimmedKey);
  return NextResponse.json({ success: true, message: "API key configured" });
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

  keyStore.delete(verified.uid);
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

  // Return only whether a key is configured, never the key itself
  const hasKey = keyStore.has(verified.uid);
  return NextResponse.json({
    configured: hasKey,
    modelName: "Gemini 2.5 Flash",
    tier: hasKey ? "byok" : "free",
  });
}

// Export for use by chat route
export function getUserApiKey(uid: string): string | undefined {
  return keyStore.get(uid);
}
