import { prisma } from "@/lib/db";
import { AUTHOR_SELECT_PUBLIC } from "@/lib/prisma-selects";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/errors";
import {
  MAX_ACTIVE_BATTLES_PER_USER,
  CHALLENGE_EXPIRY_HOURS,
  ABANDON_TIMEOUT_MINUTES,
  INVALID_GROUND_PENALTY_PERCENT,
  COUNTER_GROUND_PENALTY_PERCENT,
} from "./constants";
import { calculateElapsedDrain, calculatePenalty } from "./timer";
import { evaluateGround, generateOpeningMessage, generateVictoryMessage } from "./host";
import { broadcastToBattle } from "./sse";
import type { CreateChallengeInput, GetBattlesInput, BattleCommentInput } from "./schema";
import type { BattleStats } from "./types";

const BATTLE_INCLUDE = {
  challenger: { select: AUTHOR_SELECT_PUBLIC },
  challenged: { select: AUTHOR_SELECT_PUBLIC },
  winner: { select: AUTHOR_SELECT_PUBLIC },
  topic: {
    select: {
      id: true,
      title: true,
      optionA: true,
      optionB: true,
    },
  },
} as const;

const MESSAGE_INCLUDE = {
  user: { select: AUTHOR_SELECT_PUBLIC },
} as const;

const COMMENT_INCLUDE = {
  user: { select: AUTHOR_SELECT_PUBLIC },
} as const;

// ── Challenge Flow ──

export async function createChallenge(challengerId: string, input: CreateChallengeInput) {
  const { topicId, challengedId, challengerOpinionId, challengedOpinionId, challengeMessage } = input;

  // Self-challenge guard
  if (challengerId === challengedId) {
    throw new ConflictError("자기 자신에게 맞짱을 신청할 수 없습니다.");
  }

  // Check max active battles
  const activeBattles = await prisma.battle.count({
    where: {
      OR: [{ challengerId }, { challengedId: challengerId }],
      status: { in: ["PENDING", "SETUP", "ACTIVE"] },
    },
  });
  if (activeBattles >= MAX_ACTIVE_BATTLES_PER_USER) {
    throw new ConflictError("이미 진행 중인 맞짱이 있습니다.");
  }

  // Verify topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true },
  });
  if (!topic) throw new NotFoundError("토론을 찾을 수 없습니다.");

  // Determine sides from opinions or votes
  let challengerSide: "A" | "B" = "A";
  let challengedSide: "A" | "B" = "B";

  if (challengerOpinionId) {
    const opinion = await prisma.opinion.findUnique({
      where: { id: challengerOpinionId },
      select: { side: true },
    });
    if (opinion) challengerSide = opinion.side;
  } else {
    const vote = await prisma.vote.findFirst({
      where: { topicId, userId: challengerId },
      select: { side: true },
    });
    if (vote) challengerSide = vote.side;
  }

  if (challengedOpinionId) {
    const opinion = await prisma.opinion.findUnique({
      where: { id: challengedOpinionId },
      select: { side: true },
    });
    if (opinion) challengedSide = opinion.side;
  } else {
    const vote = await prisma.vote.findFirst({
      where: { topicId, userId: challengedId },
      select: { side: true },
    });
    if (vote) challengedSide = vote.side;
  }

  const battle = await prisma.battle.create({
    data: {
      topicId,
      challengerId,
      challengedId,
      challengerSide,
      challengedSide,
      challengerOpinionId,
      challengedOpinionId,
      challengeMessage,
      status: "PENDING",
    },
    include: BATTLE_INCLUDE,
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: challengedId,
      actorId: challengerId,
      type: "BATTLE_CHALLENGE",
      topicId,
      battleId: battle.id,
    },
  });

  return battle;
}

export async function respondToChallenge(
  battleId: string,
  userId: string,
  accept: boolean
) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: BATTLE_INCLUDE,
  });

  if (!battle) throw new NotFoundError("맞짱을 찾을 수 없습니다.");
  if (battle.challengedId !== userId) {
    throw new ForbiddenError("이 맞짱에 응답할 권한이 없습니다.");
  }
  if (battle.status !== "PENDING") {
    throw new ConflictError("이미 응답된 맞짱입니다.");
  }

  if (!accept) {
    const declined = await prisma.battle.update({
      where: { id: battleId },
      data: { status: "DECLINED" },
      include: BATTLE_INCLUDE,
    });

    await prisma.notification.create({
      data: {
        userId: battle.challengerId,
        actorId: userId,
        type: "BATTLE_DECLINED",
        topicId: battle.topicId,
        battleId: battle.id,
      },
    });

    return declined;
  }

  // Check if the challenged user already has active battles
  const activeBattles = await prisma.battle.count({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
      status: { in: ["SETUP", "ACTIVE"] },
    },
  });
  if (activeBattles >= MAX_ACTIVE_BATTLES_PER_USER) {
    throw new ConflictError("이미 진행 중인 맞짱이 있습니다.");
  }

  const accepted = await prisma.battle.update({
    where: { id: battleId },
    data: {
      status: "SETUP",
      acceptedAt: new Date(),
      lastActivityAt: new Date(),
    },
    include: BATTLE_INCLUDE,
  });

  await prisma.notification.create({
    data: {
      userId: battle.challengerId,
      actorId: userId,
      type: "BATTLE_ACCEPTED",
      topicId: battle.topicId,
      battleId: battle.id,
    },
  });

  return accepted;
}

export async function setupBattle(
  battleId: string,
  userId: string,
  durationSeconds: number
) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
  });

  if (!battle) throw new NotFoundError("맞짱을 찾을 수 없습니다.");
  if (battle.status !== "SETUP") {
    throw new ConflictError("설정 단계가 아닙니다.");
  }
  if (battle.challengerId !== userId && battle.challengedId !== userId) {
    throw new ForbiddenError("이 맞짱의 참가자가 아닙니다.");
  }

  // Start battle with agreed duration
  const hp = durationSeconds;

  const updated = await prisma.battle.update({
    where: { id: battleId },
    data: {
      durationSeconds,
      challengerHp: hp,
      challengedHp: hp,
      status: "ACTIVE",
      currentTurn: battle.challengerId,
      turnStartedAt: new Date(),
      startedAt: new Date(),
      lastActivityAt: new Date(),
    },
    include: BATTLE_INCLUDE,
  });

  // Generate opening message
  const openingMessage = await generateOpeningMessage(updated).catch(
    () => "⚔️ 맞짱이 시작됩니다! 양측 모두 근거를 제시해주세요."
  );

  await prisma.battleMessage.create({
    data: {
      battleId,
      role: "HOST",
      content: openingMessage,
    },
  });

  // First turn prompt
  const turnPrompt = await prisma.battleMessage.create({
    data: {
      battleId,
      role: "HOST",
      content: `${updated.challenger.nickname || updated.challenger.name}님, 근거를 제시해주세요.`,
    },
    include: MESSAGE_INCLUDE,
  });

  // Notify both users
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: battle.challengerId,
        type: "BATTLE_STARTED",
        topicId: battle.topicId,
        battleId: battle.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: battle.challengedId,
        type: "BATTLE_STARTED",
        topicId: battle.topicId,
        battleId: battle.id,
      },
    }),
  ]);

  // Broadcast via SSE
  broadcastToBattle(battleId, { type: "battle:state", data: updated });
  broadcastToBattle(battleId, { type: "battle:message", data: turnPrompt });

  return updated;
}

// ── Ground Submission ──

export async function submitGround(
  battleId: string,
  userId: string,
  content: string
) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      ...BATTLE_INCLUDE,
      messages: {
        where: {
          role: { in: ["CHALLENGER", "CHALLENGED"] },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          userId: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!battle) throw new NotFoundError("맞짱을 찾을 수 없습니다.");
  if (battle.status !== "ACTIVE") {
    throw new ConflictError("진행 중인 맞짱이 아닙니다.");
  }
  if (battle.currentTurn !== userId) {
    throw new ForbiddenError("지금은 상대방의 차례입니다.");
  }

  const isChallenger = userId === battle.challengerId;
  const role = isChallenger ? "CHALLENGER" : "CHALLENGED";
  const opponentId = isChallenger ? battle.challengedId : battle.challengerId;

  // Calculate HP drain from elapsed turn time
  const now = new Date();
  const elapsed = battle.turnStartedAt
    ? calculateElapsedDrain(battle.turnStartedAt, now)
    : 0;

  let currentHp = isChallenger
    ? (battle.challengerHp ?? 0) - elapsed
    : (battle.challengedHp ?? 0) - elapsed;
  currentHp = Math.max(0, currentHp);

  // If HP already 0 from time drain, end battle
  if (currentHp <= 0) {
    return endBattle(battleId, opponentId, "hp_zero");
  }

  // Save the user's ground message
  const userMessage = await prisma.battleMessage.create({
    data: {
      battleId,
      role,
      userId,
      content,
    },
    include: MESSAGE_INCLUDE,
  });
  broadcastToBattle(battleId, { type: "battle:message", data: userMessage });

  // Evaluate with LLM host
  const previousGrounds = battle.messages.map((m) => ({
    role: m.role,
    content: m.content,
    userId: m.userId,
  }));

  const evaluation = await evaluateGround(
    {
      topic: battle.topic,
      challengerSide: battle.challengerSide,
      challengedSide: battle.challengedSide,
      previousGrounds,
      currentSide: isChallenger ? battle.challengerSide : battle.challengedSide,
    },
    content
  ).catch((err) => {
    console.error("[Battle] LLM evaluation failed:", err);
    return {
      validity: "valid" as const,
      countersGroundIndex: null,
      explanation: "⚙️ 평가 시스템에 일시적인 문제가 발생하여 근거가 자동 수락되었습니다.",
      penaltyReason: null,
    };
  });

  const maxHp = battle.durationSeconds ?? 600;
  let hpChange = 0;
  let opponentHpChange = 0;
  let targetUserId: string | null = null;

  if (evaluation.validity === "invalid") {
    // Invalid ground: penalty to submitter
    const penalty = calculatePenalty(maxHp, INVALID_GROUND_PENALTY_PERCENT);
    hpChange = -penalty;
    targetUserId = userId;
    currentHp = Math.max(0, currentHp - penalty);
  } else if (evaluation.validity === "valid" && evaluation.countersGroundIndex !== null) {
    // Valid counter: penalty to opponent
    const penalty = calculatePenalty(maxHp, COUNTER_GROUND_PENALTY_PERCENT);
    opponentHpChange = -penalty;
    targetUserId = opponentId;
  }

  // Create host evaluation message
  const hostMessage = await prisma.battleMessage.create({
    data: {
      battleId,
      role: "HOST",
      content: evaluation.explanation,
      hpChange: hpChange || opponentHpChange || null,
      targetUserId,
      metadata: JSON.parse(JSON.stringify(evaluation)),
    },
    include: MESSAGE_INCLUDE,
  });
  broadcastToBattle(battleId, { type: "battle:message", data: hostMessage });

  // Update HP values
  const updateData: Record<string, unknown> = {
    lastActivityAt: now,
  };

  if (isChallenger) {
    updateData.challengerHp = currentHp + hpChange;
    if (opponentHpChange) {
      updateData.challengedHp = Math.max(0, (battle.challengedHp ?? 0) + opponentHpChange);
    }
  } else {
    updateData.challengedHp = currentHp + hpChange;
    if (opponentHpChange) {
      updateData.challengerHp = Math.max(0, (battle.challengerHp ?? 0) + opponentHpChange);
    }
  }

  // Check win conditions
  const newChallengerHp = (updateData.challengerHp as number) ?? battle.challengerHp ?? 0;
  const newChallengedHp = (updateData.challengedHp as number) ?? battle.challengedHp ?? 0;

  if (newChallengerHp <= 0 || newChallengedHp <= 0) {
    const winnerId = newChallengerHp <= 0 ? battle.challengedId : battle.challengerId;
    return endBattle(battleId, winnerId, "hp_zero", {
      challengerHp: Math.max(0, newChallengerHp),
      challengedHp: Math.max(0, newChallengedHp),
    });
  }

  // Switch turn (skip if ambiguous — clock keeps running)
  if (evaluation.validity !== "ambiguous") {
    updateData.currentTurn = opponentId;
    updateData.turnStartedAt = now;
  }

  const updated = await prisma.battle.update({
    where: { id: battleId },
    data: updateData,
    include: BATTLE_INCLUDE,
  });

  broadcastToBattle(battleId, {
    type: "battle:hp",
    data: {
      challengerHp: updated.challengerHp,
      challengedHp: updated.challengedHp,
    },
  });
  broadcastToBattle(battleId, {
    type: "battle:turn",
    data: { currentTurn: updated.currentTurn, turnStartedAt: updated.turnStartedAt },
  });

  // Notify opponent it's their turn
  if (evaluation.validity !== "ambiguous") {
    await prisma.notification.create({
      data: {
        userId: opponentId,
        type: "BATTLE_YOUR_TURN",
        topicId: battle.topicId,
        battleId: battle.id,
      },
    });
  }

  return updated;
}

// ── Battle End ──

async function endBattle(
  battleId: string,
  winnerId: string,
  endReason: string,
  hpOverride?: { challengerHp: number; challengedHp: number }
) {
  const updateData: Record<string, unknown> = {
    status: "COMPLETED",
    winnerId,
    endReason,
    endedAt: new Date(),
    currentTurn: null,
    turnStartedAt: null,
    lastActivityAt: new Date(),
  };

  if (hpOverride) {
    updateData.challengerHp = hpOverride.challengerHp;
    updateData.challengedHp = hpOverride.challengedHp;
  }

  const battle = await prisma.battle.update({
    where: { id: battleId },
    data: updateData,
    include: BATTLE_INCLUDE,
  });

  // Generate victory message
  const victoryMsg = await generateVictoryMessage(battle, winnerId).catch(
    () => "🏆 맞짱이 종료되었습니다!"
  );

  await prisma.battleMessage.create({
    data: {
      battleId,
      role: "HOST",
      content: victoryMsg,
    },
  });

  // Notify both participants
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: battle.challengerId,
        type: "BATTLE_ENDED",
        topicId: battle.topicId,
        battleId: battle.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: battle.challengedId,
        type: "BATTLE_ENDED",
        topicId: battle.topicId,
        battleId: battle.id,
      },
    }),
  ]);

  broadcastToBattle(battleId, { type: "battle:end", data: battle });

  return battle;
}

export async function resignBattle(battleId: string, userId: string) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
  });

  if (!battle) throw new NotFoundError("맞짱을 찾을 수 없습니다.");
  if (battle.status !== "ACTIVE") {
    throw new ConflictError("진행 중인 맞짱이 아닙니다.");
  }
  if (battle.challengerId !== userId && battle.challengedId !== userId) {
    throw new ForbiddenError("이 맞짱의 참가자가 아닙니다.");
  }

  const winnerId =
    userId === battle.challengerId ? battle.challengedId : battle.challengerId;

  return endBattle(battleId, winnerId, "resigned");
}

// ── Queries ──

export async function getBattle(battleId: string) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: BATTLE_INCLUDE,
  });

  if (!battle) throw new NotFoundError("맞짱을 찾을 수 없습니다.");
  return battle;
}

export async function getBattles(input: GetBattlesInput) {
  const { topicId, status, page, limit } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (topicId) where.topicId = topicId;
  if (status) where.status = status;

  const [battles, total] = await Promise.all([
    prisma.battle.findMany({
      where,
      include: BATTLE_INCLUDE,
      orderBy: { challengedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.battle.count({ where }),
  ]);

  return {
    battles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getActiveBattlesForTopic(topicId: string) {
  return prisma.battle.findMany({
    where: {
      topicId,
      status: { in: ["ACTIVE", "SETUP"] },
    },
    include: BATTLE_INCLUDE,
    orderBy: { startedAt: "desc" },
  });
}

export async function getUserActiveBattle(userId: string) {
  return prisma.battle.findFirst({
    where: {
      OR: [{ challengerId: userId }, { challengedId: userId }],
      status: { in: ["PENDING", "SETUP", "ACTIVE"] },
    },
    include: BATTLE_INCLUDE,
  });
}

export async function getBattleMessages(battleId: string) {
  return prisma.battleMessage.findMany({
    where: { battleId },
    include: MESSAGE_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
}

export async function getBattleComments(
  battleId: string,
  page = 1,
  limit = 50
) {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.battleComment.findMany({
      where: { battleId },
      include: COMMENT_INCLUDE,
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    prisma.battleComment.count({ where: { battleId } }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function addBattleComment(
  battleId: string,
  userId: string,
  input: BattleCommentInput
) {
  // Verify battle exists and is active or completed
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    select: { status: true },
  });

  if (!battle) throw new NotFoundError("맞짱을 찾을 수 없습니다.");

  const comment = await prisma.battleComment.create({
    data: {
      battleId,
      userId,
      content: input.content,
    },
    include: COMMENT_INCLUDE,
  });

  broadcastToBattle(battleId, { type: "battle:comment", data: comment });

  return comment;
}

// ── Stats ──

export async function getUserBattleStats(userId: string): Promise<BattleStats> {
  const [wins, total] = await Promise.all([
    prisma.battle.count({
      where: {
        winnerId: userId,
        status: { in: ["COMPLETED", "RESIGNED"] },
      },
    }),
    prisma.battle.count({
      where: {
        OR: [{ challengerId: userId }, { challengedId: userId }],
        status: { in: ["COMPLETED", "RESIGNED"] },
      },
    }),
  ]);

  return {
    wins,
    losses: total - wins,
    total,
  };
}

// ── Lazy Cleanup ──

export function runLazyCleanup() {
  Promise.all([expirePendingChallenges(), checkAbandonedBattles()]).catch(
    (err) => console.error("[Battle] Lazy cleanup failed:", err)
  );
}

// ── Cron Tasks ──

export async function expirePendingChallenges() {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() - CHALLENGE_EXPIRY_HOURS);

  const expired = await prisma.battle.updateMany({
    where: {
      status: "PENDING",
      challengedAt: { lt: expiryDate },
    },
    data: { status: "EXPIRED" },
  });

  if (expired.count > 0) {
    console.log(`[Battle Cron] Expired ${expired.count} pending challenges`);
  }

  return expired.count;
}

export async function checkAbandonedBattles() {
  const abandonTime = new Date();
  abandonTime.setMinutes(abandonTime.getMinutes() - ABANDON_TIMEOUT_MINUTES);

  const abandonedBattles = await prisma.battle.findMany({
    where: {
      status: "ACTIVE",
      lastActivityAt: { lt: abandonTime },
    },
    select: {
      id: true,
      currentTurn: true,
      challengerId: true,
      challengedId: true,
    },
  });

  let abandonedCount = 0;
  for (const battle of abandonedBattles) {
    // The person whose turn it was loses
    const winnerId =
      battle.currentTurn === battle.challengerId
        ? battle.challengedId
        : battle.challengerId;

    await endBattle(battle.id, winnerId, "abandoned");
    abandonedCount++;
  }

  if (abandonedCount > 0) {
    console.log(`[Battle Cron] Ended ${abandonedCount} abandoned battles`);
  }

  return abandonedCount;
}
