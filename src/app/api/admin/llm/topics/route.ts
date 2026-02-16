import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/options";
import { getTopicsForLlmAdmin } from "@/modules/topics/service";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const filter = (searchParams.get("filter") || "all") as
    | "all"
    | "needs_summary"
    | "needs_grounds"
    | "complete";
  const search = searchParams.get("search") || undefined;

  const result = await getTopicsForLlmAdmin({ page, limit, filter, search });

  return NextResponse.json({ data: result });
}
