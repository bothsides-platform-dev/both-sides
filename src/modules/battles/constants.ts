export const DURATION_OPTIONS = [300, 600, 900, 1800] as const; // 5/10/15/30 min

export const CHALLENGE_EXPIRY_HOURS = 24;
export const ABANDON_TIMEOUT_MINUTES = 5;
export const INVALID_GROUND_PENALTY_PERCENT = 20;
export const COUNTER_GROUND_PENALTY_PERCENT = 15;
export const MAX_ACTIVE_BATTLES_PER_USER = 1;
export const MAX_COMMENT_LENGTH = 200;

export const DURATION_LABELS: Record<number, string> = {
  300: "5분",
  600: "10분",
  900: "15분",
  1800: "30분",
};
