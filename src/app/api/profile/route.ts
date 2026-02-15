import { requireAuth } from "@/lib/auth";
import { handleApiError, ValidationError, ConflictError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { validateRequest, nicknameSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { BADGE_DEFINITIONS, computeBadges, computeBadgeProgress } from "@/lib/badges";
import { z } from "zod";

const updateProfileSchema = z.object({
  nickname: nicknameSchema.optional(),
  image: z.string().url("유효한 이미지 URL이어야 합니다.").optional(),
  selectedBadgeId: z
    .string()
    .min(1, "대표 뱃지를 선택하세요.")
    .optional()
    .nullable()
    .refine(
      (val) =>
        val === null ||
        val === undefined ||
        BADGE_DEFINITIONS.some((badge) => badge.id === val),
      "유효한 뱃지 아이디가 아닙니다."
    ),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const [votes, opinions, topics, votesCount, opinionsCount, topicsCount, reactionsCount, userInfo] = await Promise.all([
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
    ]);

    // Compute badges
    const stats = {
      votesCount,
      opinionsCount,
      topicsCount,
      reactionsCount,
    };
    const badges = computeBadges(stats);
    const badgeProgress = computeBadgeProgress(stats);

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
        selectedBadgeId: userInfo?.selectedBadgeId,
        badges,
        badgeProgress,
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

    const wantsBadgeUpdate = data.selectedBadgeId !== undefined;
    // Check if there's anything to update
    if (!data.nickname && !data.image && !wantsBadgeUpdate) {
      throw new ValidationError("변경할 내용이 없습니다.");
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

    let selectedBadgeIdToUpdate: string | null | undefined = undefined;
    if (wantsBadgeUpdate) {
      if (data.selectedBadgeId === null) {
        selectedBadgeIdToUpdate = null;
      } else {
        const [votesCount, opinionsCount, topicsCount, reactionsCount] = await Promise.all([
          prisma.vote.count({ where: { userId: user.id } }),
          prisma.opinion.count({ where: { userId: user.id } }),
          prisma.topic.count({ where: { authorId: user.id } }),
          prisma.reaction.count({ where: { userId: user.id } }),
        ]);

        const earnedBadges = computeBadges({
          votesCount,
          opinionsCount,
          topicsCount,
          reactionsCount,
        });

        const hasBadge = earnedBadges.some((badge) => badge.id === data.selectedBadgeId);
        if (!hasBadge) {
          throw new ValidationError("획득한 뱃지만 대표 뱃지로 설정할 수 있습니다.");
        }
        selectedBadgeIdToUpdate = data.selectedBadgeId;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.nickname && { nickname: data.nickname }),
        ...(data.image && { image: data.image }),
        ...(selectedBadgeIdToUpdate !== undefined && { selectedBadgeId: selectedBadgeIdToUpdate }),
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
