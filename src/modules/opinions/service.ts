import { prisma } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { AUTHOR_SELECT, OPINION_COUNT_SELECT, REACTION_SELECT } from "@/lib/prisma-selects";
import type { CreateOpinionInput, GetOpinionsInput, UpdateOpinionAnonymityInput, GetOpinionsAdminInput } from "./schema";
import { createReplyNotification } from "@/modules/notifications/service";
import { getVote } from "@/modules/votes/service";

type OpinionAuthor =
  | { type: "user"; userId: string }
  | { type: "guest"; visitorId: string; ipAddress?: string; fingerprint?: string };

export async function createOpinion(
  author: OpinionAuthor,
  topicId: string,
  input: CreateOpinionInput
) {
  let actualTopicId = topicId;
  let parentOpinion = null;

  // If creating a reply, get parent opinion info
  if (input.parentId) {
    parentOpinion = await prisma.opinion.findUnique({
      where: { id: input.parentId },
      select: { id: true, topicId: true, userId: true },
    });

    if (!parentOpinion) {
      throw new NotFoundError("답글을 달 의견을 찾을 수 없습니다.");
    }

    // Use parent's topicId
    actualTopicId = parentOpinion.topicId;
  }

  // Check if user/guest has voted on this topic (guests: same logic as upsertVote/getVote — fingerprint OR visitorId+ipAddress)
  const vote =
    author.type === "user"
      ? await prisma.vote.findUnique({
          where: {
            vote_topic_user: { topicId: actualTopicId, userId: author.userId },
          },
        })
      : await getVote(
          {
            visitorId: author.visitorId,
            ipAddress: author.ipAddress,
            fingerprint: author.fingerprint,
          },
          actualTopicId
        );

  if (!vote) {
    throw new ForbiddenError("투표를 먼저 해주세요. 투표한 측에서만 의견을 작성할 수 있습니다.");
  }

  const opinion = await prisma.opinion.create({
    data: {
      topicId: actualTopicId,
      userId: author.type === "user" ? author.userId : null,
      visitorId: author.type === "guest" ? author.visitorId : null,
      ipAddress: author.type === "guest" ? author.ipAddress : null,
      side: vote.side,
      body: input.body,
      isAnonymous: author.type === "guest" ? true : (input.isAnonymous ?? false),
      parentId: input.parentId || null,
    },
    include: {
      user: { select: AUTHOR_SELECT },
      _count: { select: { reactions: true, replies: true } },
    },
  });

  // Create notification for parent opinion author if this is a reply
  if (parentOpinion && parentOpinion.userId) {
    const actorId = author.type === "user" ? author.userId : null;
    // Only create notification if actor is a logged-in user (guest replies have no actorId)
    if (actorId) {
      await createReplyNotification({
        userId: parentOpinion.userId,
        actorId,
        opinionId: parentOpinion.id,
        replyId: opinion.id,
        topicId: actualTopicId,
      });
    }
  }

  return opinion;
}

export async function getOpinions(topicId: string, input: GetOpinionsInput) {
  const { side, sort, page, limit, parentId } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    topicId,
    ...(side && { side }),
  };

  // Handle parentId filtering
  if (parentId !== undefined) {
    where.parentId = parentId;
  }

  // For "hot" sort, we need to include reaction counts
  const orderBy =
    sort === "hot"
      ? { reactions: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const [opinions, total] = await Promise.all([
    prisma.opinion.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        topicId: true,
        userId: true,
        side: true,
        body: true,
        isBlinded: true,
        isAnonymous: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        user: { select: AUTHOR_SELECT },
        reactions: { select: REACTION_SELECT },
        _count: { select: OPINION_COUNT_SELECT },
      },
    }),
    prisma.opinion.count({ where }),
  ]);

  // Compute reaction summary from already-loaded reactions (no extra DB query)
  const processedOpinions = opinions.map((opinion) => {
    let likes = 0;
    let dislikes = 0;
    for (const r of opinion.reactions) {
      if (r.type === "LIKE") likes++;
      else if (r.type === "DISLIKE") dislikes++;
    }
    return {
      ...opinion,
      reactionSummary: { likes, dislikes },
    };
  });

  return {
    opinions: processedOpinions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOpinionById(id: string) {
  const opinion = await prisma.opinion.findUnique({
    where: { id },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  return opinion;
}

export async function updateOpinionAnonymity(id: string, userId: string, input: UpdateOpinionAnonymityInput) {
  const opinion = await getOpinionById(id);

  if (!opinion.userId || opinion.userId !== userId) {
    throw new ForbiddenError("본인의 의견만 수정할 수 있습니다.");
  }

  return prisma.opinion.update({
    where: { id },
    data: { isAnonymous: input.isAnonymous },
    include: {
      user: { select: AUTHOR_SELECT },
      reactions: { select: REACTION_SELECT },
      _count: { select: OPINION_COUNT_SELECT },
    },
  });
}

export async function getRecentOpinions(limit: number = 5) {
  return prisma.opinion.findMany({
    where: {
      isBlinded: false,
      parentId: null,
      topic: { isHidden: false },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      topicId: true,
      side: true,
      body: true,
      isAnonymous: true,
      createdAt: true,
      user: {
        select: {
          nickname: true,
          name: true,
          image: true,
        },
      },
      topic: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

// Admin functions
export async function getOpinionsForAdmin(input: GetOpinionsAdminInput) {
  const { page, limit, search, topicId, isBlinded } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (topicId) {
    where.topicId = topicId;
  }

  if (isBlinded !== undefined) {
    where.isBlinded = isBlinded;
  }

  if (search) {
    where.OR = [
      { body: { contains: search, mode: "insensitive" } },
      { user: { nickname: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [opinions, total] = await Promise.all([
    prisma.opinion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: AUTHOR_SELECT },
        topic: { select: { id: true, title: true } },
        _count: { select: { reactions: true, reports: true } },
      },
    }),
    prisma.opinion.count({ where }),
  ]);

  return {
    opinions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateOpinionAnonymityByAdmin(id: string, isAnonymous: boolean) {
  const opinion = await prisma.opinion.findUnique({ where: { id } });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  return prisma.opinion.update({
    where: { id },
    data: { isAnonymous },
    include: {
      user: { select: AUTHOR_SELECT },
      topic: { select: { id: true, title: true } },
      _count: { select: { reactions: true, reports: true } },
    },
  });
}
