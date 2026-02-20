/**
 * Calculate HP after accounting for elapsed turn time.
 * HP drains 1 per second during the active player's turn.
 */
export function calculateCurrentHp(
  baseHp: number,
  turnStartedAt: Date | null,
  now: Date = new Date()
): number {
  if (!turnStartedAt) return baseHp;

  const elapsedMs = now.getTime() - turnStartedAt.getTime();
  const elapsedSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
  return Math.max(0, baseHp - elapsedSeconds);
}

/**
 * Calculate HP drain from an elapsed turn period.
 * Returns the number of HP points drained.
 */
export function calculateElapsedDrain(
  turnStartedAt: Date,
  now: Date = new Date()
): number {
  const elapsedMs = now.getTime() - turnStartedAt.getTime();
  return Math.floor(Math.max(0, elapsedMs) / 1000);
}

/**
 * Apply a penalty as a percentage of max HP.
 */
export function calculatePenalty(
  maxHp: number,
  penaltyPercent: number
): number {
  return Math.floor(maxHp * (penaltyPercent / 100));
}
