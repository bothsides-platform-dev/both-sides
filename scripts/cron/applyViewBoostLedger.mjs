import { PrismaClient } from "@prisma/client";

/**
 * CRON script: apply "boost" view counts without schema/API changes.
 *
 * - Uses TopicView as a ledger with special visitorId values: boost:000 ~ boost:119
 * - Every inserted ledger row increments Topic.viewCount by 1 (idempotent via unique(topicId, visitorId))
 * - Boost increases every 30 minutes with a concave (log) curve and saturates at +120 by ~24h
 *
 * Usage:
 *   node scripts/cron/applyViewBoostLedger.mjs
 *   node scripts/cron/applyViewBoostLedger.mjs --dry-run
 *   node scripts/cron/applyViewBoostLedger.mjs --topicId <topicId>
 */

const prisma = new PrismaClient();

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const STEPS_TOTAL = 48; // 24 hours / 30 minutes
const TARGET_TOTAL = 120; // total boost to reach by 24h
const LEDGER_PREFIX = "boost:";
const LEDGER_PAD = 3;

// Allow up to one cron interval delay for the final top-up.
const MAX_AGE_MS = 24 * 60 * 60 * 1000 + INTERVAL_MS;

function parseArgs(argv) {
  const args = {
    dryRun: false,
    topicId: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (a === "--topicId") {
      const v = argv[i + 1];
      if (!v) throw new Error("Missing value for --topicId");
      args.topicId = v;
      i += 1;
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  return args;
}

function clampInt(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function desiredBoostForAgeMs(ageMs) {
  if (ageMs <= 0) return 0;

  const step = Math.floor(ageMs / INTERVAL_MS);
  const t = clampInt(step, 0, STEPS_TOTAL);
  const progress = Math.log1p(t) / Math.log1p(STEPS_TOTAL); // concave, 0..1
  const desired = Math.round(TARGET_TOTAL * progress);
  return clampInt(desired, 0, TARGET_TOTAL);
}

function boostVisitorId(i) {
  return `${LEDGER_PREFIX}${String(i).padStart(LEDGER_PAD, "0")}`;
}

function chunk(array, size) {
  if (size <= 0) throw new Error("chunk size must be > 0");
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function main() {
  const { dryRun, topicId } = parseArgs(process.argv);
  const now = new Date();
  const cutoff = new Date(now.getTime() - MAX_AGE_MS);

  const topics = await prisma.topic.findMany({
    where: {
      ...(topicId ? { id: topicId } : {}),
      createdAt: { gte: cutoff },
    },
    select: {
      id: true,
      createdAt: true,
      viewCount: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (topics.length === 0) {
    console.log("[view-boost-ledger] no topics to process");
    return;
  }

  const topicIds = topics.map((t) => t.id);
  const existingBoostByTopic = new Map();
  for (const id of topicIds) existingBoostByTopic.set(id, new Set());

  // Fetch existing boost ledger rows in chunks to avoid huge IN clauses.
  for (const ids of chunk(topicIds, 500)) {
    const rows = await prisma.topicView.findMany({
      where: {
        topicId: { in: ids },
        visitorId: { startsWith: LEDGER_PREFIX },
      },
      select: { topicId: true, visitorId: true },
    });

    for (const r of rows) {
      const set = existingBoostByTopic.get(r.topicId);
      if (!set) continue;
      const suffix = r.visitorId.slice(LEDGER_PREFIX.length);
      const n = Number(suffix);
      if (Number.isInteger(n) && n >= 0 && n < TARGET_TOTAL) {
        set.add(n);
      }
    }
  }

  let totalInserted = 0;
  let totalTopicsUpdated = 0;

  for (const t of topics) {
    const ageMs = now.getTime() - t.createdAt.getTime();
    if (ageMs < 0) continue;
    if (ageMs > MAX_AGE_MS) continue;

    const desiredBoost = desiredBoostForAgeMs(ageMs);
    if (desiredBoost <= 0) continue;

    const existingSet = existingBoostByTopic.get(t.id) ?? new Set();
    const missing = [];
    for (let i = 0; i < desiredBoost; i += 1) {
      if (!existingSet.has(i)) {
        missing.push({ topicId: t.id, visitorId: boostVisitorId(i) });
      }
    }
    if (missing.length === 0) continue;

    if (dryRun) {
      console.log(
        `[view-boost-ledger][dry-run] topic=${t.id} ageMin=${Math.floor(ageMs / 60000)} desiredBoost=${desiredBoost} insert=${missing.length}`
      );
      continue;
    }

    const insertedCount = await prisma.$transaction(async (tx) => {
      const created = await tx.topicView.createMany({
        data: missing,
        skipDuplicates: true,
      });
      const count = created.count ?? 0;
      if (count > 0) {
        await tx.topic.update({
          where: { id: t.id },
          data: { viewCount: { increment: count } },
        });
      }
      return count;
    });

    if (insertedCount > 0) {
      totalInserted += insertedCount;
      totalTopicsUpdated += 1;
      console.log(
        `[view-boost-ledger] topic=${t.id} inserted=${insertedCount} (desiredBoost=${desiredBoost})`
      );
    }
  }

  console.log(
    `[view-boost-ledger] done topics=${topics.length} updated=${totalTopicsUpdated} totalInserted=${totalInserted}`
  );
}

main()
  .catch((err) => {
    console.error("[view-boost-ledger] failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

