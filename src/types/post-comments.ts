export interface PostCommentBattle {
  id: string;
  status: string;
  battleTitle: string | null;
  customOptionA: string | null;
  customOptionB: string | null;
  challengerSide: string;
  challengedSide: string;
  challengerHp: number | null;
  challengedHp: number | null;
  durationSeconds: number | null;
  endReason: string | null;
  winnerId: string | null;
  challenger: { id: string; nickname: string | null; name: string | null; image: string | null; selectedBadgeId: string | null };
  challenged: { id: string; nickname: string | null; name: string | null; image: string | null; selectedBadgeId: string | null };
  winner?: { nickname: string | null; name: string | null } | null;
}

export interface PostCommentData {
  id: string;
  postId: string;
  userId: string | null;
  visitorId: string | null;
  body: string;
  isBlinded: boolean;
  isAnonymous: boolean;
  parentId: string | null;
  battleId?: string | null;
  battle?: PostCommentBattle | null;
  createdAt: string;
  user: {
    id: string;
    nickname: string | null;
    name: string | null;
    image: string | null;
    selectedBadgeId: string | null;
  } | null;
  reactionSummary: { likes: number; dislikes: number };
  _count: { reactions: number; replies: number };
}
