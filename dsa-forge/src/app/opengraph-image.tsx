import { ImageResponse } from "next/og";

export const alt =
  "LeetPrime — Beyond LeetCode Pro | Company-Wise DSA & Recency Engine";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(79, 70, 229, 0.25), transparent 45%), #09090b",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
          border: "1px solid rgba(139, 92, 246, 0.25)",
        }}
      >
        {/* Top Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            L
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            LeetPrime
          </div>
          <div
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(139, 92, 246, 0.16)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              color: "#c4b5fd",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Beyond LeetCode Pro
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Company-Wise DSA &amp; Real-Time Recency Engine
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              lineHeight: 1.4,
            }}
          >
            Master coding interviews using frequency, 30d/3m/6m recency signals,
            structured pattern roadmaps, and Prime AI coaching.
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "12px 22px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#a78bfa" }}>
              3,426+
            </span>
            <span style={{ fontSize: "15px", color: "#a1a1aa" }}>
              LeetCode Pro Questions
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "12px 22px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#34d399" }}>
              659
            </span>
            <span style={{ fontSize: "15px", color: "#a1a1aa" }}>
              Tech Companies
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "12px 22px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#38bdf8" }}>
              24
            </span>
            <span style={{ fontSize: "15px", color: "#a1a1aa" }}>
              DSA Pattern Roadmaps
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
