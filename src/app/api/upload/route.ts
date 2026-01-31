import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MIME_TO_EXT: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};
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

    // 1. MIME 타입 검증
    const allowedExts = MIME_TO_EXT[file.type];
    if (!allowedExts) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (jpg, png, webp, gif만 가능)" },
        { status: 400 }
      );
    }

    // 2. 확장자 추출 및 검증
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 확장자입니다." },
        { status: 400 }
      );
    }

    // 3. MIME 타입과 확장자 일치 검증
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "파일 형식과 확장자가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 4. 파일 크기 검증
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 5. 안전한 파일명 생성 (검증된 확장자 사용)
    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const blob = await put(safeFilename, file, {
      access: "public",
      contentType: file.type,
      token,
    });

    return NextResponse.json({ data: { url: blob.url } });
  } catch (error) {
    return handleApiError(error);
  }
}
