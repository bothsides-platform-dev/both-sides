import type { Prisma } from "@prisma/client";

/** User fields for author display (includes blacklist check) */
export const AUTHOR_SELECT = {
  id: true,
  nickname: true,
  name: true,
  image: true,
  isBlacklisted: true,
} as const satisfies Prisma.UserSelectScalar;

/** User fields for public display (no blacklist info) */
export const AUTHOR_SELECT_PUBLIC = {
  id: true,
  nickname: true,
  name: true,
  image: true,
} as const satisfies Prisma.UserSelectScalar;

/** Topic relation counts */
export const TOPIC_COUNT_SELECT = {
  votes: true,
  opinions: true,
} as const;

/** Opinion relation counts */
export const OPINION_COUNT_SELECT = {
  reactions: true,
  reports: true,
  replies: true,
} as const;

/** Reaction fields for inline display */
export const REACTION_SELECT = {
  id: true,
  userId: true,
  type: true,
} as const satisfies Prisma.ReactionSelectScalar;
