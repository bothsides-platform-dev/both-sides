import type { Side, ReactionType } from "@prisma/client";

export interface Opinion {
  id: string;
  side: Side;
  body: string;
  isBlinded: boolean;
  isAnonymous?: boolean;
  createdAt: string;
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
    image?: string | null;
  };
  reactions: Array<{
    id: string;
    userId: string;
    type: ReactionType;
  }>;
  reactionSummary: {
    likes: number;
    dislikes: number;
  };
}
