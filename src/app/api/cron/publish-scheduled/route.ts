import { NextRequest } from "next/server";
import { publishScheduledTopics } from "@/modules/topics/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishScheduledTopics();
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to publish scheduled topics:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
