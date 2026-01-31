import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export async function GET() {
  // 로고 이미지를 base64로 인코딩
  const logoPath = join(process.cwd(), "src/app/logo-og.png");
  const logoData = readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

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
          background: "#F5F5F5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo Image */}
        <img
          src={logoBase64}
          width={280}
          height={280}
          style={{
            marginBottom: 32,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))",
          }}
        />

        {/* Brand Name */}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            marginBottom: 16,
            textShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <span style={{ color: "#3B82F6" }}>Both</span>
          <span style={{ color: "#EF4444" }}>Sides</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#757575",
            textAlign: "center",
          }}
        >
          양자택일 토론 플랫폼
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
