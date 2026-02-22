import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { validateRequest } from "@/lib/validation";
import { battleCommentSchema } from "@/modules/battles/schema";
import { getBattleComments, addBattleComment } from "@/modules/battles/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await getBattleComments(id, page, limit);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(battleCommentSchema, body);

    const comment = await addBattleComment(id, user.id, input);
    return Response.json({ data: comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
