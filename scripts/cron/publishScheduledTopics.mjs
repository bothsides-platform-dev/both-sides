import { PrismaClient } from "@prisma/client";

/**
 * CRON script: 예약 발행된 토픽을 공개 처리합니다.
 *
 * - scheduledAt이 현재 시각 이전인 토픽의 scheduledAt을 null로 초기화합니다.
 * - scheduledAt이 null이 되면 공개 API에서 해당 토픽이 노출됩니다.
 *
 * Usage:
 *   node scripts/cron/publishScheduledTopics.mjs
 *   node scripts/cron/publishScheduledTopics.mjs --dry-run
 */

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
  }
  return args;
}

async function main() {
  const { dryRun } = parseArgs(process.argv);
  const now = new Date();

  console.log(`[publishScheduledTopics] 실행 시각: ${now.toISOString()} (dry-run: ${dryRun})`);

  const topics = await prisma.topic.findMany({
    where: { scheduledAt: { lte: now } },
    select: { id: true, title: true, scheduledAt: true },
  });

  if (topics.length === 0) {
    console.log("[publishScheduledTopics] 발행할 예약 토픽이 없습니다.");
    return;
  }

  console.log(`[publishScheduledTopics] 발행 대상 토픽 ${topics.length}개:`);
  for (const t of topics) {
    console.log(`  - [${t.id}] "${t.title}" (scheduledAt: ${t.scheduledAt?.toISOString()})`);
  }

  if (!dryRun) {
    const result = await prisma.topic.updateMany({
      where: { scheduledAt: { lte: now } },
      data: { scheduledAt: null },
    });
    console.log(`[publishScheduledTopics] 완료: ${result.count}개 토픽 발행됨`);
  } else {
    console.log("[publishScheduledTopics] dry-run 모드: DB 변경 없음");
  }
}

main()
  .catch((e) => {
    console.error("[publishScheduledTopics] 오류:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
