import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

import { prisma } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/constants";

export const runtime = "nodejs";

const width = 1200;
const height = 630;
const background = "#F5F5F5";

const logoPath = join(process.cwd(), "src/app/logo-og.png");
const logoBase64 = `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    select: {
      title: true,
      optionA: true,
      optionB: true,
      category: true,
    },
  });

  if (!topic) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "center",
            background,
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#0F172A",
          }}
        >
          <div
            style={{
              margin: "0 auto",
              width: "88%",
              maxWidth: 1080,
              height: 520,
              borderRadius: 36,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              boxShadow: "0 20px 70px rgba(15,23,42,0.12)",
              display: "flex",
              flexDirection: "column",
              padding: "48px 56px",
              gap: 28,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src={logoBase64}
                  width={64}
                  height={64}
                  style={{
                    borderRadius: 18,
                    border: "1px solid #E5E7EB",
                    padding: 10,
                    background: "#F8FAFC",
                  }}
                />
                <div style={{ display: "flex", gap: 6, fontSize: 32, fontWeight: 800 }}>
                  <span style={{ color: "#2563EB" }}>Both</span>
                  <span style={{ color: "#EF4444" }}>Sides</span>
                </div>
              </div>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "#F1F5F9",
                  color: "#475569",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                토론을 찾을 수 없습니다
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 14,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 900, color: "#0F172A" }}>요청한 토론을 찾지 못했어요</div>
              <div style={{ fontSize: 24, color: "#64748B", maxWidth: 720 }}>
                링크가 잘못되었거나 삭제된 토론일 수 있어요. 새로운 토론을 만들어보세요.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 48, height: 6, borderRadius: 999, background: "#2563EB" }} />
              <div style={{ width: 24, height: 6, borderRadius: 999, background: "#CBD5E1" }} />
            </div>
          </div>
        </div>
      ),
      { width, height }
    );
  }

  const categoryLabel = CATEGORY_LABELS[topic.category];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          background,
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#0F172A",
        }}
      >
        <div
          style={{
            width: "88%",
            maxWidth: 1080,
            height: 520,
            borderRadius: 36,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 20px 70px rgba(15,23,42,0.12)",
            display: "flex",
            flexDirection: "column",
            padding: "48px 56px",
            gap: 32,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img
                src={logoBase64}
                width={64}
                height={64}
                style={{
                  borderRadius: 18,
                  border: "1px solid #E5E7EB",
                  padding: 10,
                  background: "#F8FAFC",
                }}
              />
              <div style={{ display: "flex", gap: 6, fontSize: 32, fontWeight: 800 }}>
                <span style={{ color: "#2563EB" }}>Both</span>
                <span style={{ color: "#EF4444" }}>Sides</span>
              </div>
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                background: "#F1F5F9",
                color: "#475569",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {categoryLabel}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.16, color: "#0F172A" }}>
              {topic.title}
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 72, height: 6, borderRadius: 999, background: "#2563EB" }} />
              <div style={{ width: 36, height: 6, borderRadius: 999, background: "#CBD5E1" }} />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 22px",
                borderRadius: 18,
                background: "rgba(37,99,235,0.12)",
                border: "2px solid #2563EB",
                color: "#1D4ED8",
              }}
            >
              A: {topic.optionA}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#94A3B8" }}>vs</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 22px",
                borderRadius: 18,
                background: "rgba(239,68,68,0.12)",
                border: "2px solid #EF4444",
                color: "#B91C1C",
              }}
            >
              B: {topic.optionB}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 22, color: "#475569", fontWeight: 600 }}>
              양자택일 토론 플랫폼 · BothSides
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "#0F172A",
                color: "#E2E8F0",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              당신의 선택은?
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height }
  );
}

