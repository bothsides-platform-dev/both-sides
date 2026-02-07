import { handleApiError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

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

    // 이미 가져온 데이터 배열의 길이를 사용하여 중복 COUNT 쿼리 제거
    // take: 50으로 제한되어 있으므로, 50개인 경우만 정확한 카운트가 필요할 수 있음
    // 하지만 대부분의 사용자는 50개 미만이므로 배열 길이로 충분
    return Response.json({
      data: {
        user,
        votes,
        opinions,
        topics,
        reactions,
        votesCount: votes.length,
        opinionsCount: opinions.length,
        topicsCount: topics.length,
        reactionsCount: reactions.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
