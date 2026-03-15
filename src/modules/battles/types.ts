import type { BattleStatus, BattleMessageRole, Side } from "@prisma/client";

export type BattleParticipant = {
  id: string;
  nickname: string | null;
  name: string | null;
  image: string | null;
  selectedBadgeId: string | null;
};

export type Ground = {
  id: string; // "G-A1", "G-B2", etc.
  side: "A" | "B";
  content: string;
  summary: string; // LLM-generated 1-line summary
  status: "active" | "countered";
  counteredBy: string | null; // ID of ground that countered this
  reinforcedCount: number;
  createdAtTurn: number;
};

export type GroundsRegistry = { A: Ground[]; B: Ground[] };

export type GroundAction =
  | "new_ground"
  | "reinforce"
  | "counter"
  | "redundant"
  | "invalid";

export type GroundEvaluation = {
  action: GroundAction;
  explanation: string;
  targetGroundId: string | null; // counter target
  reinforcedGroundId: string | null; // reinforce target
  groundSummary: string | null; // for new_ground/counter
  updatedSummary: string | null; // for reinforce
  penaltyReason: string | null; // for redundant/invalid
};

export type BattleState = {
  id: string;
  topicId: string | null;
  postId: string | null;
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
  groundsRegistry: GroundsRegistry | null;
  battleTitle: string | null;
  customOptionA: string | null;
  customOptionB: string | null;
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
  } | null;
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

// SSE event types
export type SSEEventType =
  | "battle:state"
  | "battle:message"
  | "battle:hp"
  | "battle:turn"
  | "battle:end"
  | "battle:comment"
  | "battle:grounds"
  | "battle:ground_countered"
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
