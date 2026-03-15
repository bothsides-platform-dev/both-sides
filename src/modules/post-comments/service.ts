import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { AUTHOR_SELECT_PUBLIC, POST_COMMENT_REACTION_SELECT } from "@/lib/prisma-selects";
import type { CreatePostCommentInput, GetPostCommentsInput } from "./schema";
import { createPostCommentReplyNotification } from "@/modules/notifications/service";

export type PostCommentAuthor =
  | { type: "user"; userId: string }
  | { type: "guest"; visitorId: string; ipAddress?: string };

export async function createPostComment(
  author: PostCommentAuthor,
  postId: string,
  input: CreatePostCommentInput
) {
  let parentComment = null;

  if (input.parentId) {
    parentComment = await prisma.postComment.findUnique({
      where: { id: input.parentId },
      select: { id: true, postId: true, userId: true },
    });

    if (!parentComment) {
      throw new NotFoundError("답글을 달 댓글을 찾을 수 없습니다.");
    }
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      userId: author.type === "user" ? author.userId : null,
      visitorId: author.type === "guest" ? author.visitorId : null,
      ipAddress: author.type === "guest" ? author.ipAddress : null,
      body: input.body,
      isAnonymous: author.type === "guest" ? true : (input.isAnonymous ?? false),
      parentId: input.parentId || null,
    },
    include: {
      user: { select: AUTHOR_SELECT_PUBLIC },
      _count: { select: { reactions: true, replies: true } },
    },
  });

  // Create notification for parent comment author if this is a reply
  if (parentComment && parentComment.userId) {
    const actorId = author.type === "user" ? author.userId : null;
    if (actorId) {
      await createPostCommentReplyNotification({
        userId: parentComment.userId,
        actorId,
        postCommentId: parentComment.id,
        postCommentReplyId: comment.id,
        postId,
      });
    }
  }

  return comment;
}

export async function getPostComments(postId: string, input: GetPostCommentsInput) {
  const { sort, page, limit, parentId } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { postId };

  if (parentId !== undefined) {
    where.parentId = parentId;
  }

  const orderBy =
    sort === "hot"
      ? { reactions: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const [comments, total] = await Promise.all([
    prisma.postComment.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        postId: true,
        userId: true,
        visitorId: true,
        body: true,
        isBlinded: true,
        isAnonymous: true,
        parentId: true,
        battleId: true,
        createdAt: true,
        updatedAt: true,
        user: { select: AUTHOR_SELECT_PUBLIC },
        reactions: { select: POST_COMMENT_REACTION_SELECT },
        battle: {
          select: {
            id: true,
            status: true,
            battleTitle: true,
            customOptionA: true,
            customOptionB: true,
            challengerSide: true,
            challengedSide: true,
            challengerHp: true,
            challengedHp: true,
            durationSeconds: true,
            endReason: true,
            winnerId: true,
            challenger: { select: AUTHOR_SELECT_PUBLIC },
            challenged: { select: AUTHOR_SELECT_PUBLIC },
            winner: { select: AUTHOR_SELECT_PUBLIC },
          },
        },
        _count: { select: { reactions: true, replies: true } },
      },
    }),
    prisma.postComment.count({ where }),
  ]);

  const processedComments = comments.map((comment) => {
    let likes = 0;
    let dislikes = 0;
    for (const r of comment.reactions) {
      if (r.type === "LIKE") likes++;
      else if (r.type === "DISLIKE") dislikes++;
    }
    return {
      ...comment,
      reactionSummary: { likes, dislikes },
    };
  });

  return {
    comments: processedComments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
