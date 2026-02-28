import { requireAuth } from "@/lib/auth";
import { handleApiError, ValidationError, ConflictError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { validateRequest, nicknameSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { computeBadges, computeBadgeProgress, getDefaultBadgeId } from "@/lib/badges";
import { getUserBattleStats } from "@/modules/battles/service";
import { z } from "zod";

const updateProfileSchema = z.object({
  nickname: nicknameSchema.optional(),
  image: z.string().url("유효한 이미지 URL이어야 합니다.").optional(),
  selectedBadgeId: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const [votes, opinions, topics, votesCount, opinionsCount, topicsCount, reactionsCount, userInfo, battleStats] = await Promise.all([
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
      prisma.topic.count({ where: { authorId: user.id } }),
      prisma.reaction.count({ where: { userId: user.id } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { joinOrder: true, selectedBadgeId: true } }),
      getUserBattleStats(user.id),
    ]);

    // Compute badges
    const stats = {
      votesCount,
      opinionsCount,
      topicsCount,
      reactionsCount,
      battlesTotal: battleStats.total,
      battlesWins: battleStats.wins,
    };
    const badges = computeBadges(stats);
    const badgeProgress = computeBadgeProgress(stats);

    // Resolve selectedBadgeId: null → auto-default, "none" → no skin, specific ID → as-is
    const rawSelectedBadgeId = userInfo?.selectedBadgeId;
    const resolvedBadgeId = rawSelectedBadgeId === "none"
      ? null
      : (rawSelectedBadgeId ?? getDefaultBadgeId(badges));

    return Response.json({
      data: {
        votes,
        opinions,
        topics,
        votesCount,
        opinionsCount,
        topicsCount,
        reactionsCount,
        joinOrder: userInfo?.joinOrder,
        selectedBadgeId: resolvedBadgeId,
        isAutoDefaultBadge: !rawSelectedBadgeId,
        badges,
        badgeProgress,
        battleStats,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const data = await validateRequest(updateProfileSchema, body);

    // Check if there's anything to update
    if (!data.nickname && !data.image && data.selectedBadgeId === undefined) {
      throw new ValidationError("변경할 내용이 없습니다.");
    }

    // Validate selectedBadgeId if provided (skip for "none" and null)
    if (data.selectedBadgeId !== undefined && data.selectedBadgeId !== null && data.selectedBadgeId !== "none") {
      const [uVotesCount, uOpinionsCount, uTopicsCount, uReactionsCount, uBattleStats] = await Promise.all([
        prisma.vote.count({ where: { userId: user.id } }),
        prisma.opinion.count({ where: { userId: user.id } }),
        prisma.topic.count({ where: { authorId: user.id } }),
        prisma.reaction.count({ where: { userId: user.id } }),
        getUserBattleStats(user.id),
      ]);
      const earnedBadges = computeBadges({
        votesCount: uVotesCount,
        opinionsCount: uOpinionsCount,
        topicsCount: uTopicsCount,
        reactionsCount: uReactionsCount,
        battlesTotal: uBattleStats.total,
        battlesWins: uBattleStats.wins,
      });
      const hasEarned = earnedBadges.some((b) => b.id === data.selectedBadgeId);
      if (!hasEarned) {
        throw new ValidationError("획득하지 않은 배지는 선택할 수 없습니다.");
      }
    }

    // Validate nickname if provided
    if (data.nickname) {
      // Check for profanity
      if (containsProfanity(data.nickname)) {
        throw new ValidationError("닉네임에 부적절한 단어가 포함되어 있습니다.");
      }

      // Check for duplicates (excluding current user)
      const existingUser = await prisma.user.findFirst({
        where: {
          nickname: data.nickname,
          NOT: {
            id: user.id,
          },
        },
      });

      if (existingUser) {
        throw new ConflictError("이미 사용 중인 닉네임입니다.");
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.nickname && { nickname: data.nickname }),
        ...(data.image && { image: data.image }),
        ...(data.selectedBadgeId !== undefined && { selectedBadgeId: data.selectedBadgeId }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        image: true,
        role: true,
        selectedBadgeId: true,
      },
    });

    return Response.json({
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
