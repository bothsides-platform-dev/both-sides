import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      optionA: true,
      optionB: true,
      category: true,
    },
  });

  const width = 1200;
  const height = 630;

  if (!topic) {
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
            color: "white",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800 }}>BothSides</div>
          <div style={{ marginTop: 16, fontSize: 28, opacity: 0.9 }}>
            토론을 찾을 수 없습니다
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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)",
          fontFamily: "system-ui, sans-serif",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>BothSides</div>
          <div
            style={{
              fontSize: 24,
              padding: "10px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
            }}
          >
            {categoryLabel}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.12 }}>
            {topic.title}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px 22px",
                borderRadius: 18,
                background: "rgba(59,130,246,0.28)",
                border: "1px solid rgba(191,219,254,0.5)",
                fontWeight: 800,
              }}
            >
              A: {topic.optionA}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, opacity: 0.95 }}>VS</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px 22px",
                borderRadius: 18,
                background: "rgba(239,68,68,0.24)",
                border: "1px solid rgba(254,202,202,0.55)",
                fontWeight: 800,
              }}
            >
              B: {topic.optionB}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              fontSize: 22,
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.14)",
            }}
          >
            당신의 선택은?
          </div>
        </div>
      </div>
    ),
    { width, height }
  );
}


