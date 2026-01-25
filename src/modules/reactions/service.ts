import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { ReactionType } from "@prisma/client";

interface ReactionIdentifier {
  userId?: string;
  visitorId?: string;
  ipAddress?: string;
}

export async function toggleReaction(
  identifier: ReactionIdentifier,
  opinionId: string,
  type: ReactionType
) {
  // Check if opinion exists
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
  });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  const { userId, visitorId, ipAddress } = identifier;

  // Determine if this is a logged-in user or guest
  const isLoggedIn = !!userId;

  // Find existing reaction
  let existingReaction;
  if (isLoggedIn) {
    // For logged-in users, search by userId
    existingReaction = await prisma.reaction.findUnique({
      where: {
        reaction_opinion_user: { opinionId, userId: userId! },
      },
    });
  } else {
    // For guests, search by visitorId + ipAddress
    existingReaction = await prisma.reaction.findFirst({
      where: {
        opinionId,
        visitorId,
        ipAddress,
      },
    });
  }

  // If same type, remove reaction (toggle off)
  if (existingReaction?.type === type) {
    await prisma.reaction.delete({
      where: { id: existingReaction.id },
    });
    return { action: "removed", reaction: null };
  }

  // If different type or no existing reaction
  if (existingReaction) {
    // Update existing reaction to new type
    const reaction = await prisma.reaction.update({
      where: { id: existingReaction.id },
      data: { type },
    });
    return { action: "changed", reaction };
  } else {
    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        opinionId,
        userId,
        visitorId,
        ipAddress,
        type,
      },
    });
    return { action: "created", reaction };
  }
}
