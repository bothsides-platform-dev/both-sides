import type { Side, ReactionType } from "@prisma/client";

export interface Opinion {
  id: string;
  topicId?: string;
  side: Side;
  body: string;
  isBlinded: boolean;
  isAnonymous?: boolean;
  parentId?: string | null;
  createdAt: string;
  visitorId?: string | null;
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
    image?: string | null;
    isBlacklisted?: boolean;
    selectedBadgeId?: string | null;
  } | null;
  reactions?: Array<{
    id: string;
    userId: string;
    type: ReactionType;
  }>;
  reactionSummary: {
    likes: number;
    dislikes: number;
  };
  replies?: Opinion[];
  _count?: {
    reactions: number;
    reports: number;
    replies: number;
  };
}
