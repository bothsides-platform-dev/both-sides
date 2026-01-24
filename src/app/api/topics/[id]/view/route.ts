import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { incrementViewCount } from "@/modules/topics/service";

const VISITOR_ID_COOKIE = "visitor_id";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const session = await getSession();

    let visitorId: string;

    if (session?.user?.id) {
      // 로그인 사용자: userId 사용
      visitorId = `user:${session.user.id}`;
    } else {
      // 비로그인 사용자: 쿠키 기반 visitor_id 사용
      const cookieStore = await cookies();
      let cookieVisitorId = cookieStore.get(VISITOR_ID_COOKIE)?.value;

      if (!cookieVisitorId) {
        // 새로운 visitor_id 생성
        cookieVisitorId = `anon:${crypto.randomUUID()}`;
      }

      visitorId = cookieVisitorId;

      // 응답에 쿠키 설정
      const response = NextResponse.json({
        data: await incrementViewCount(topicId, visitorId),
      });

      response.cookies.set(VISITOR_ID_COOKIE, cookieVisitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1년
        path: "/",
      });

      return response;
    }

    const result = await incrementViewCount(topicId, visitorId);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
