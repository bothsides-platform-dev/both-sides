import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/errors";
import type { Side } from "@prisma/client";

interface AncestorResult {
  id: string;
  parentId: string | null;
  side: Side;
  topicId: string;
  depth: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opinionId } = await params;

    // Use recursive CTE to fetch all ancestors in a single query
    // This avoids N+1 queries when traversing up the parent chain
    const ancestors = await prisma.$queryRaw<AncestorResult[]>`
      WITH RECURSIVE ancestors AS (
        -- Base case: start with the target opinion
        SELECT id, "parentId", side, "topicId", 0 as depth
        FROM "Opinion"
        WHERE id = ${opinionId}

        UNION ALL

        -- Recursive case: get parent of current opinion
        SELECT o.id, o."parentId", o.side, o."topicId", a.depth + 1
        FROM "Opinion" o
        INNER JOIN ancestors a ON o.id = a."parentId"
      )
      SELECT id, "parentId" as "parentId", side, "topicId" as "topicId", depth
      FROM ancestors
      ORDER BY depth ASC
    `;

    if (ancestors.length === 0) {
      return Response.json(
        { error: "의견을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // First result is the opinion itself (depth 0)
    const opinion = ancestors[0];

    // Remaining results are ancestors in order from nearest to farthest parent
    const ancestorIds = ancestors.slice(1).map(a => a.id);

    // The top-level opinion is the last one in the ancestor chain, or this opinion itself if no parent
    const topLevelOpinionId = ancestorIds.length > 0
      ? ancestorIds[ancestorIds.length - 1]
      : opinion.id;

    return Response.json({
      data: {
        ancestorIds,
        topLevelOpinionId,
        side: opinion.side,
        topicId: opinion.topicId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
