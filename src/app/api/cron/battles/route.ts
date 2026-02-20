import { NextRequest } from "next/server";
import { expirePendingChallenges, checkAbandonedBattles } from "@/modules/battles/service";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [expired, abandoned] = await Promise.all([
      expirePendingChallenges(),
      checkAbandonedBattles(),
    ]);

    return Response.json({
      data: {
        expiredChallenges: expired,
        abandonedBattles: abandoned,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Battle Cron] Error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
