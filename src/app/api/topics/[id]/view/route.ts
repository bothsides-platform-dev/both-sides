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

    const result = await incrementViewCount(topicId);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
