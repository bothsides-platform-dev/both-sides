import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const [votes, opinions, topics, votesCount, opinionsCount] = await Promise.all([
      prisma.vote.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              optionA: true,
              optionB: true,
              category: true,
            },
          },
        },
      }),
      prisma.opinion.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.topic.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.vote.count({ where: { userId: user.id } }),
      prisma.opinion.count({ where: { userId: user.id } }),
    ]);

    return Response.json({
      data: {
        votes,
        opinions,
        topics,
        votesCount,
        opinionsCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
