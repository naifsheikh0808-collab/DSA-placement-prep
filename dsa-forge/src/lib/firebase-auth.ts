// Shared Firebase ID token verification utility

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<{ uid: string; email: string | null } | null> {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub) return null;
    if (payload.aud !== projectId) return null;
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (payload.exp < now - 300) return null;
    if (payload.iat > now + 300) return null;

    const jwksRes = await fetch(
      "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
      { next: { revalidate: 3600 } }
    );
    if (!jwksRes.ok) return null;

    const jwks: { keys: (JsonWebKey & { kid?: string })[] } = await jwksRes.json();
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;

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

    if (!valid) return null;
    return { uid: payload.sub as string, email: (payload.email as string) ?? null };
  } catch {
    return null;
  }
}