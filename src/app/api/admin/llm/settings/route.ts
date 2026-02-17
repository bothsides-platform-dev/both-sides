import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/options";
import { validateRequest } from "@/lib/validation";
import {
  getLlmSettingsForDisplay,
  updateLlmSettings,
} from "@/modules/llm-settings/service";
import { updateLlmSettingsSchema } from "@/modules/llm-settings/schema";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const settings = await getLlmSettingsForDisplay();
  return NextResponse.json({ data: settings });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const input = await validateRequest(updateLlmSettingsSchema, body);
    const result = await updateLlmSettings(input, session.user.id);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[API] Failed to update LLM settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 400 }
    );
  }
}
