import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { ReactionType } from "@prisma/client";

export async function toggleReaction(
  userId: string,
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

  // Check existing reaction
  const existingReaction = await prisma.reaction.findUnique({
    where: {
      opinionId_userId: { opinionId, userId },
    },
  });

  // If same type, remove reaction (toggle off)
  if (existingReaction?.type === type) {
    await prisma.reaction.delete({
      where: { id: existingReaction.id },
    });
    return { action: "removed", reaction: null };
  }

  // If different type or no existing, upsert
  const reaction = await prisma.reaction.upsert({
    where: {
      opinionId_userId: { opinionId, userId },
    },
    update: { type },
    create: { opinionId, userId, type },
  });

  return {
    action: existingReaction ? "changed" : "created",
    reaction,
  };
}
