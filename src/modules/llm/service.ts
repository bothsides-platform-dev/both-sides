import { prisma } from "@/lib/db";
import { generateUniqueNickname } from "@/lib/nickname";
import { getLlmCore } from "./singleton";
import type { Side } from "@prisma/client";

// ─── Topic Summary ───────────────────────────────────────────────────────────

export async function triggerTopicSummary(topicId: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        title: true,
        description: true,
        _count: { select: { opinions: true } },
      },
    });
    if (!topic) return;

    // Enforce minimum threshold
    if (topic._count.opinions < 3) {
      throw new Error(
        `Topic needs at least 3 opinions for summary (current: ${topic._count.opinions})`
      );
    }

    const llmCore = await getLlmCore();
    const result = await llmCore.summarize({
      title: topic.title,
      body: topic.description ?? "",
    });

    await prisma.topicSummary.upsert({
      where: { topicId },
      create: {
        topicId,
        summary: result.summary,
        model: result.model,
      },
      update: {
        summary: result.summary,
        model: result.model,
      },
    });
  } catch (err) {
    console.error("[LLM] triggerTopicSummary failed:", err);
    throw err; // Re-throw to show error in UI
  }
}

export async function getTopicSummary(topicId: string) {
  return prisma.topicSummary.findUnique({ where: { topicId } });
}

// ─── Grounds Summary ─────────────────────────────────────────────────────────

export async function triggerGroundsSummary(topicId: string, options?: { force?: boolean }) {
  try {
    const opinionCount = await prisma.opinion.count({
      where: { topicId, parentId: null },
    });

    if (opinionCount < 10) return;

    // Check if existing grounds are still fresh enough (skip when force=true)
    if (!options?.force) {
      const existingA = await prisma.groundsSummary.findUnique({
        where: { topicId_side: { topicId, side: "A" } },
      });
      const existingB = await prisma.groundsSummary.findUnique({
        where: { topicId_side: { topicId, side: "B" } },
      });

      // Skip if both exist and opinion count hasn't grown by 50%+
      if (existingA && existingB) {
        const prevCount = Math.max(
          existingA.opinionCountAtGeneration,
          existingB.opinionCountAtGeneration
        );
        if (opinionCount < prevCount * 1.5) return;
      }
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { title: true, description: true, optionA: true, optionB: true },
    });
    if (!topic) return;

    const topicInput = {
      title: topic.title,
      body: topic.description ?? "",
      optionA: topic.optionA,
      optionB: topic.optionB,
    };

    // Process each side
    for (const side of ["A", "B"] as const) {
      const opinions = await prisma.opinion.findMany({
        where: { topicId, side, parentId: null },
        select: { id: true, body: true, side: true },
        take: 500,
        orderBy: { createdAt: "desc" },
      });

      if (opinions.length < 3) continue;

      const llmCore = await getLlmCore();
      const result = await llmCore.summarizeOpinions({
        topic: topicInput,
        targetSide: side,
        opinions: opinions.map((o) => ({ side: o.side, body: o.body })),
      });

      const sideResult = side === "A" ? result.sideA : result.sideB;

      const groundsJson = sideResult.grounds.map((g, idx) => ({
        id: idx + 1,
        title: g.title,
        points: g.points,
      }));

      await prisma.groundsSummary.upsert({
        where: { topicId_side: { topicId, side } },
        create: {
          topicId,
          side,
          groundsJson,
          summaryText: sideResult.summary,
          opinionCountAtGeneration: opinionCount,
          model: result.model,
        },
        update: {
          groundsJson,
          summaryText: sideResult.summary,
          opinionCountAtGeneration: opinionCount,
          isHidden: false,
          model: result.model,
        },
      });
    }
  } catch (err) {
    console.error("[LLM] triggerGroundsSummary failed:", err);
  }
}

export async function checkAndHideGrounds(topicId: string) {
  const opinionCount = await prisma.opinion.count({
    where: { topicId, parentId: null },
  });

  if (opinionCount < 10) {
    await prisma.groundsSummary.updateMany({
      where: { topicId },
      data: { isHidden: true },
    });
  }
}

export async function getGroundsSummary(topicId: string) {
  const [sideA, sideB] = await Promise.all([
    prisma.groundsSummary.findUnique({
      where: { topicId_side: { topicId, side: "A" } },
    }),
    prisma.groundsSummary.findUnique({
      where: { topicId_side: { topicId, side: "B" } },
    }),
  ]);

  const formatSide = (record: typeof sideA) => {
    if (!record || record.isHidden) return null;
    const grounds = record.groundsJson as Array<{
      id: number;
      title: string;
      points: string[];
    }>;
    return {
      summaryText: record.summaryText,
      grounds: grounds.slice(0, 5),
    };
  };

  return {
    sideA: formatSide(sideA),
    sideB: formatSide(sideB),
  };
}

// ─── Opinion Classification ──────────────────────────────────────────────────

export async function triggerOpinionClassification(
  opinionId: string,
  topicId: string,
  side: Side
) {
  try {
    const groundsSummary = await prisma.groundsSummary.findUnique({
      where: { topicId_side: { topicId, side } },
    });
    if (!groundsSummary || groundsSummary.isHidden) return;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { title: true, description: true, optionA: true, optionB: true },
    });
    if (!topic) return;

    const opinion = await prisma.opinion.findUnique({
      where: { id: opinionId },
      select: { body: true, side: true },
    });
    if (!opinion) return;

    // Build opinionSummary from stored grounds
    const sideAGrounds = await prisma.groundsSummary.findUnique({
      where: { topicId_side: { topicId, side: "A" } },
    });
    const sideBGrounds = await prisma.groundsSummary.findUnique({
      where: { topicId_side: { topicId, side: "B" } },
    });

    const toSideSummary = (
      record: typeof sideAGrounds,
      label: string
    ) => {
      if (!record) {
        return { label, summary: "No opinions provided.", grounds: [] };
      }
      const grounds = record.groundsJson as Array<{
        id: number;
        title: string;
        points: string[];
      }>;
      return {
        label,
        summary: record.summaryText,
        grounds: grounds.map((g) => ({ title: g.title, points: g.points })),
      };
    };

    const opinionSummary = {
      sideA: toSideSummary(sideAGrounds, topic.optionA),
      sideB: toSideSummary(sideBGrounds, topic.optionB),
    };

    const llmCore = await getLlmCore();
    const result = await llmCore.addOpinion({
      topic: {
        title: topic.title,
        body: topic.description ?? "",
        optionA: topic.optionA,
        optionB: topic.optionB,
      },
      opinionSummary,
      opinion: { side: opinion.side, body: opinion.body },
    });

    // Find matching ground ID
    const sideGrounds = (
      side === "A" ? sideAGrounds : sideBGrounds
    )?.groundsJson as Array<{ id: number; title: string; points: string[] }> | undefined;

    let groundId = 0;
    if (sideGrounds) {
      const match = sideGrounds.find((g) => g.title === result.category);
      groundId = match?.id ?? 0;
    }

    await prisma.opinionGround.upsert({
      where: { opinionId },
      create: {
        opinionId,
        topicId,
        side,
        groundTitle: result.category,
        groundId,
        confidence: result.confidence,
        model: result.model,
      },
      update: {
        groundTitle: result.category,
        groundId,
        confidence: result.confidence,
        model: result.model,
      },
    });
  } catch (err) {
    console.error("[LLM] triggerOpinionClassification failed:", err);
  }
}

// ─── Bot Opinion Generation (Admin) ──────────────────────────────────────────

export async function generateBotOpinions({
  topicId,
  countA,
  countB,
  anonymousProbability = 60,
}: {
  topicId: string;
  countA: number;
  countB: number;
  anonymousProbability?: number;
}) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true, title: true, description: true, optionA: true, optionB: true },
  });
  if (!topic) throw new Error("Topic not found");

  const topicInput = {
    title: topic.title,
    body: topic.description ?? "",
    optionA: topic.optionA,
    optionB: topic.optionB,
  };

  const botUsers = await prisma.user.findMany({
    where: { isBot: true },
    select: { id: true },
  });

  if (botUsers.length === 0) {
    throw new Error("No bot accounts available. Seed bot accounts first.");
  }

  const errors: string[] = [];
  let generatedA = 0;
  let generatedB = 0;

  const generateForSide = async (side: Side, count: number) => {
    for (let i = 0; i < count; i++) {
      try {
        const botUser = botUsers[Math.floor(Math.random() * botUsers.length)];

        // Create or update vote for this bot user
        await prisma.vote.upsert({
          where: {
            vote_topic_user: { topicId: topic.id, userId: botUser.id },
          },
          create: {
            topicId: topic.id,
            userId: botUser.id,
            side,
          },
          update: { side },
        });

        const llmCore = await getLlmCore();
        const result = await llmCore.generate({
          topic: topicInput,
          side,
        });

        // Use probabilistic anonymity based on configured percentage
        const isAnonymous = Math.random() * 100 < anonymousProbability;

        await prisma.opinion.create({
          data: {
            topicId: topic.id,
            userId: botUser.id,
            side,
            body: result.text,
            isAnonymous,
          },
        });

        if (side === "A") generatedA++;
        else generatedB++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`[${side}#${i + 1}] ${msg}`);
      }
    }
  };

  await generateForSide("A", countA);
  await generateForSide("B", countB);

  return { generatedA, generatedB, errors };
}

// ─── Bot Account Management (Admin) ──────────────────────────────────────────

export async function ensureBotAccounts(count: number) {
  const created: string[] = [];

  for (let i = 0; i < count; i++) {
    const nickname = await generateUniqueNickname();
    const user = await prisma.user.create({
      data: {
        nickname,
        isBot: true,
        name: `Bot ${nickname}`,
      },
    });
    created.push(user.id);
  }

  return created;
}

export async function getBotAccounts() {
  const [bots, total] = await Promise.all([
    prisma.user.findMany({
      where: { isBot: true },
      select: { id: true, nickname: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.count({ where: { isBot: true } }),
  ]);

  return { bots, total };
}
