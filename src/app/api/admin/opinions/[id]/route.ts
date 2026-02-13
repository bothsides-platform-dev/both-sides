import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/api-helpers";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import type { RouteParams } from "@/types/api";

export const DELETE = withAdmin(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;

  const opinion = await prisma.opinion.findUnique({ where: { id } });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  await prisma.opinion.delete({ where: { id } });

  return Response.json({ data: { success: true } });
});
