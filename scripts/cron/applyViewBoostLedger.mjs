import { PrismaClient } from "@prisma/client";

/**
 * CRON script: apply "boost" view counts without schema/API changes.
 *
 * - Uses TopicView as a ledger with special visitorId values: boost:000 ~ boost:NNN
 * - Every inserted ledger row increments Topic.viewCount by 1 (idempotent via unique(topicId, visitorId))
 * - Boost increases every 30 minutes with a concave (log) curve
 * - Per-topic deterministic randomness varies both the total cap and curve speed
 *   so each topic gets a natural-looking, unique boost trajectory.
 *
 * Usage:
 *   node scripts/cron/applyViewBoostLedger.mjs
 *   node scripts/cron/applyViewBoostLedger.mjs --dry-run
 *   node scripts/cron/applyViewBoostLedger.mjs --topicId <topicId>
 */

const prisma = new PrismaClient();

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const STEPS_TOTAL = 48; // 24 hours / 30 minutes
const TARGET_BASE = 120; // base boost target
const TARGET_JITTER = 0.35; // ±35% → per-topic target ∈ [~78, ~162]
const STEP_JITTER = 3; // ±3 step offset on the curve per topic
const TARGET_MAX_POSSIBLE = Math.ceil(TARGET_BASE * (1 + TARGET_JITTER)); // 162
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

// ── Deterministic per-topic random helpers ──────────────────────────
// Uses a seeded PRNG so the same topicId always yields the same random
// values across cron runs, while different topics get different values.

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

/** Mulberry32 – single-shot deterministic random in [0, 1). */
function mulberry32(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Deterministic random [0, 1) for a (topicId, variant) pair. */
function topicRand(topicId, variant) {
  return mulberry32(hashCode(topicId + ":" + variant));
}

// ── Boost calculation ───────────────────────────────────────────────

/**
 * Per-topic target total (the cap).
 * Returns an integer in [TARGET_BASE*(1-JITTER) .. TARGET_BASE*(1+JITTER)].
 */
function topicTargetTotal(topicId) {
  const r = topicRand(topicId, "target"); // 0..1
  return Math.round(TARGET_BASE * (1 + TARGET_JITTER * (2 * r - 1)));
}

/**
 * Per-topic step offset (curve speed jitter).
 * Returns a float in [-STEP_JITTER, +STEP_JITTER].
 */
function topicStepOffset(topicId) {
  const r = topicRand(topicId, "step"); // 0..1
  return STEP_JITTER * (2 * r - 1);
}

function desiredBoostForTopic(ageMs, topicId) {
  if (ageMs <= 0) return 0;

  const targetTotal = topicTargetTotal(topicId);
  const stepOffset = topicStepOffset(topicId);

  const rawStep = ageMs / INTERVAL_MS;
  const step = clampInt(Math.floor(rawStep + stepOffset), 0, STEPS_TOTAL);
  const progress = Math.log1p(step) / Math.log1p(STEPS_TOTAL); // concave, 0..1
  const desired = Math.round(targetTotal * progress);
  return clampInt(desired, 0, targetTotal);
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
      if (Number.isInteger(n) && n >= 0 && n < TARGET_MAX_POSSIBLE) {
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

    const desiredBoost = desiredBoostForTopic(ageMs, t.id);
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

