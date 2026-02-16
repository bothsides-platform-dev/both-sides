/**
 * 자동 LLM 작업 트리거 모듈
 * Automatic LLM task triggering after opinion creation
 */

import { prisma } from "@/lib/db";
import type { Side } from "@prisma/client";
import {
  triggerTopicSummary,
  triggerGroundsSummary,
  triggerOpinionClassification
} from "./service";
import { LLM_MIN_OPINIONS_SUMMARY, LLM_MIN_OPINIONS_GROUNDS } from "@/lib/constants";

export async function autoTriggerLlmTasks(params: {
  topicId: string;
  opinionId: string;
  side: Side;
}): Promise<void> {
  const { topicId, opinionId, side } = params;

  try {
    // Batch queries for efficiency (parallel execution)
    const [opinionCount, existingSummary] = await Promise.all([
      prisma.opinion.count({
        where: { topicId, parentId: null } // Only count top-level opinions
      }),
      prisma.topicSummary.findUnique({
        where: { topicId },
        select: { id: true }
      }),
    ]);

    // 1. 토픽 요약 자동 생성 (3개 이상, 한 번만)
    // Auto-generate topic summary (≥3 opinions, once only)
    if (opinionCount >= LLM_MIN_OPINIONS_SUMMARY && !existingSummary) {
      triggerTopicSummary(topicId).catch(err =>
        console.error("[LLM] Auto topic summary failed:", {
          topicId,
          opinionCount,
          error: err instanceof Error ? err.message : String(err)
        })
      );
    }

    // 2. 논거 요약 자동 생성 (10개 이상, 50% 성장 시 재생성)
    // Auto-generate grounds summary (≥10 opinions, smart 50% growth regeneration)
    if (opinionCount >= LLM_MIN_OPINIONS_GROUNDS) {
      triggerGroundsSummary(topicId).catch(err =>
        console.error("[LLM] Auto grounds summary failed:", {
          topicId,
          opinionCount,
          error: err instanceof Error ? err.message : String(err)
        })
      );

      // 3. 의견 분류 자동 실행 (논거가 존재할 때만)
      // Auto-classify opinion (only if grounds exist)
      // Note: Function internally checks for grounds existence
      triggerOpinionClassification(opinionId, topicId, side).catch(err =>
        console.error("[LLM] Auto opinion classification failed:", {
          opinionId,
          topicId,
          side,
          error: err instanceof Error ? err.message : String(err)
        })
      );
    }
  } catch (err) {
    console.error("[LLM] Auto-trigger pipeline failed:", {
      topicId,
      opinionId,
      side,
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
