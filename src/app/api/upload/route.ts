import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (jpg, png, webp, gif만 가능)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Vercel Blob Storage에 업로드
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      token,
    });

    return NextResponse.json({ data: { url: blob.url } });
  } catch (error) {
    return handleApiError(error);
  }
}
