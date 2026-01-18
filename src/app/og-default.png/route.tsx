import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: 24,
              background: "rgba(255,255,255,0.2)",
              fontSize: 64,
              fontWeight: 800,
            }}
          >
            <span style={{ color: "#3b82f6" }}>A</span>
            <span style={{ color: "white", margin: "0 8px", fontSize: 48 }}>vs</span>
            <span style={{ color: "#ef4444" }}>B</span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
            textShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          BothSides
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
          }}
        >
          양자택일 토론 플랫폼
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            padding: "16px 32px",
            background: "white",
            borderRadius: 12,
            fontSize: 24,
            fontWeight: 600,
            color: "#667eea",
          }}
        >
          당신의 선택은?
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
