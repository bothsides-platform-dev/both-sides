import { handleApiError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    // Fetch user's public data (excluding anonymous content)
    const [votes, opinions, topics, reactions] = await Promise.all([
      // Votes (only for non-anonymous topics)
      prisma.vote.findMany({
        where: {
          userId,
          topic: {
            isAnonymous: false,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
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
      // Opinions (only non-anonymous opinions)
      prisma.opinion.findMany({
        where: {
          userId,
          isAnonymous: false,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              optionA: true,
              optionB: true,
            },
          },
        },
      }),
      // Topics (only non-anonymous topics)
      prisma.topic.findMany({
        where: {
          authorId: userId,
          isAnonymous: false,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      // Reactions (only on non-anonymous opinions)
      prisma.reaction.findMany({
        where: {
          userId,
          opinion: {
            isAnonymous: false,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          opinion: {
            select: {
              id: true,
              body: true,
              side: true,
              createdAt: true,
              topic: {
                select: {
                  id: true,
                  title: true,
                  optionA: true,
                  optionB: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Get counts
    const [votesCount, opinionsCount, topicsCount, reactionsCount] = await Promise.all([
      prisma.vote.count({
        where: {
          userId,
          topic: {
            isAnonymous: false,
          },
        },
      }),
      prisma.opinion.count({
        where: {
          userId,
          isAnonymous: false,
        },
      }),
      prisma.topic.count({
        where: {
          authorId: userId,
          isAnonymous: false,
        },
      }),
      prisma.reaction.count({
        where: {
          userId,
          opinion: {
            isAnonymous: false,
          },
        },
      }),
    ]);

    return Response.json({
      data: {
        user,
        votes,
        opinions,
        topics,
        reactions,
        votesCount,
        opinionsCount,
        topicsCount,
        reactionsCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
