import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { ReactionType } from "@prisma/client";

interface ReactionIdentifier {
  userId?: string;
  visitorId?: string;
  ipAddress?: string;
}

export async function togglePostCommentReaction(
  identifier: ReactionIdentifier,
  postCommentId: string,
  type: ReactionType
) {
  const comment = await prisma.postComment.findUnique({
    where: { id: postCommentId },
  });

  if (!comment) {
    throw new NotFoundError("댓글을 찾을 수 없습니다.");
  }

  const { userId, visitorId, ipAddress } = identifier;
  const isLoggedIn = !!userId;

  let existingReaction;
  if (isLoggedIn) {
    existingReaction = await prisma.postCommentReaction.findUnique({
      where: {
        post_comment_reaction_user: { postCommentId, userId: userId! },
      },
    });
  } else {
    existingReaction = await prisma.postCommentReaction.findFirst({
      where: { postCommentId, visitorId, ipAddress },
    });
  }

  if (existingReaction?.type === type) {
    await prisma.postCommentReaction.delete({
      where: { id: existingReaction.id },
    });
    return { action: "removed", reaction: null };
  }

  if (existingReaction) {
    const reaction = await prisma.postCommentReaction.update({
      where: { id: existingReaction.id },
      data: { type },
    });
    return { action: "changed", reaction };
  } else {
    const reaction = await prisma.postCommentReaction.create({
      data: { postCommentId, userId, visitorId, ipAddress, type },
    });
    return { action: "created", reaction };
  }
}
