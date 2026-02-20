import type { BattleStatus, BattleMessageRole, Side } from "@prisma/client";

export type BattleParticipant = {
  id: string;
  nickname: string | null;
  name: string | null;
  image: string | null;
  selectedBadgeId: string | null;
};

export type BattleState = {
  id: string;
  topicId: string;
  status: BattleStatus;
  challenger: BattleParticipant;
  challenged: BattleParticipant;
  challengerSide: Side;
  challengedSide: Side;
  durationSeconds: number | null;
  challengerHp: number | null;
  challengedHp: number | null;
  currentTurn: string | null;
  turnStartedAt: string | null;
  challengeMessage: string | null;
  winnerId: string | null;
  endReason: string | null;
  challengedAt: string;
  acceptedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
  };
};

export type BattleMessageData = {
  id: string;
  battleId: string;
  role: BattleMessageRole;
  userId: string | null;
  content: string;
  hpChange: number | null;
  targetUserId: string | null;
  metadata: GroundEvaluation | null;
  createdAt: string;
  user: BattleParticipant | null;
};

export type BattleCommentData = {
  id: string;
  battleId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: BattleParticipant;
};

export type GroundEvaluation = {
  validity: "valid" | "invalid" | "ambiguous";
  countersGroundIndex: number | null;
  explanation: string;
  penaltyReason: string | null;
};

// SSE event types
export type SSEEventType =
  | "battle:state"
  | "battle:message"
  | "battle:hp"
  | "battle:turn"
  | "battle:end"
  | "battle:comment"
  | "heartbeat";

export type SSEEvent = {
  type: SSEEventType;
  data: unknown;
};

export type BattleStats = {
  wins: number;
  losses: number;
  total: number;
};
