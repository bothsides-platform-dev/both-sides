import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { generateBotOpinionsSchema } from "@/modules/llm/schema";
import { generateBotOpinions } from "@/modules/llm/service";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = await validateRequest(generateBotOpinionsSchema, body);
    const result = await generateBotOpinions(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
