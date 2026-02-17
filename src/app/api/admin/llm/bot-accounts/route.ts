import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { seedBotAccountsSchema } from "@/modules/llm/schema";
import { ensureBotAccounts, getBotAccounts } from "@/modules/llm/service";

export async function GET() {
  try {
    await requireAdmin();
    const result = await getBotAccounts();
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = await validateRequest(seedBotAccountsSchema, body);
    const ids = await ensureBotAccounts(input.count);
    return Response.json({ data: { created: ids.length } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
