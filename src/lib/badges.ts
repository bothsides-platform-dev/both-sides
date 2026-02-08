/**
 * Badge System for BothSides
 * Computes badges based on user activity counts (votes, opinions, topics, reactions)
 */

export enum BadgeTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export enum BadgeCategory {
  VOTING = "VOTING",
  OPINION = "OPINION",
  TOPIC = "TOPIC",
  ENGAGEMENT = "ENGAGEMENT",
  ALL_AROUND = "ALL_AROUND",
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: BadgeCategory;
  tier: BadgeTier;
  requirement: (stats: UserActivityStats) => boolean;
  progress: (stats: UserActivityStats) => { current: number; target: number };
}

export interface UserActivityStats {
  votesCount: number;
  opinionsCount: number;
  topicsCount: number;
  reactionsCount: number;
}

export interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
}

export interface BadgeProgress extends EarnedBadge {
  earned: boolean;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
}

/**
 * All badge definitions
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Voting Badges
  {
    id: "first-vote",
    name: "첫 투표",
    description: "첫 번째 투표를 완료했습니다",
    icon: "🗳️",
    category: BadgeCategory.VOTING,
    tier: BadgeTier.BRONZE,
    requirement: (stats) => stats.votesCount >= 1,
    progress: (stats) => ({ current: stats.votesCount, target: 1 }),
  },
  {
    id: "voter",
    name: "투표러",
    description: "10개 이상의 토론에 투표했습니다",
    icon: "✅",
    category: BadgeCategory.VOTING,
    tier: BadgeTier.SILVER,
    requirement: (stats) => stats.votesCount >= 10,
    progress: (stats) => ({ current: stats.votesCount, target: 10 }),
  },
  {
    id: "vote-enthusiast",
    name: "투표 매니아",
    description: "50개 이상의 토론에 투표했습니다",
    icon: "🎯",
    category: BadgeCategory.VOTING,
    tier: BadgeTier.GOLD,
    requirement: (stats) => stats.votesCount >= 50,
    progress: (stats) => ({ current: stats.votesCount, target: 50 }),
  },
  {
    id: "vote-master",
    name: "투표왕",
    description: "100개 이상의 토론에 투표했습니다",
    icon: "👑",
    category: BadgeCategory.VOTING,
    tier: BadgeTier.PLATINUM,
    requirement: (stats) => stats.votesCount >= 100,
    progress: (stats) => ({ current: stats.votesCount, target: 100 }),
  },

  // Opinion Badges
  {
    id: "first-opinion",
    name: "첫 한마디",
    description: "첫 번째 의견을 작성했습니다",
    icon: "💬",
    category: BadgeCategory.OPINION,
    tier: BadgeTier.BRONZE,
    requirement: (stats) => stats.opinionsCount >= 1,
    progress: (stats) => ({ current: stats.opinionsCount, target: 1 }),
  },
  {
    id: "debater",
    name: "논객",
    description: "10개 이상의 의견을 작성했습니다",
    icon: "🎤",
    category: BadgeCategory.OPINION,
    tier: BadgeTier.SILVER,
    requirement: (stats) => stats.opinionsCount >= 10,
    progress: (stats) => ({ current: stats.opinionsCount, target: 10 }),
  },
  {
    id: "debate-master",
    name: "토론왕",
    description: "50개 이상의 의견을 작성했습니다",
    icon: "🏆",
    category: BadgeCategory.OPINION,
    tier: BadgeTier.GOLD,
    requirement: (stats) => stats.opinionsCount >= 50,
    progress: (stats) => ({ current: stats.opinionsCount, target: 50 }),
  },
  {
    id: "persuasion-master",
    name: "설득의 달인",
    description: "100개 이상의 의견을 작성했습니다",
    icon: "🎓",
    category: BadgeCategory.OPINION,
    tier: BadgeTier.PLATINUM,
    requirement: (stats) => stats.opinionsCount >= 100,
    progress: (stats) => ({ current: stats.opinionsCount, target: 100 }),
  },

  // Topic Badges
  {
    id: "first-topic",
    name: "첫 토론 개설",
    description: "첫 번째 토론을 만들었습니다",
    icon: "📝",
    category: BadgeCategory.TOPIC,
    tier: BadgeTier.BRONZE,
    requirement: (stats) => stats.topicsCount >= 1,
    progress: (stats) => ({ current: stats.topicsCount, target: 1 }),
  },
  {
    id: "issue-maker",
    name: "이슈 메이커",
    description: "5개 이상의 토론을 만들었습니다",
    icon: "📢",
    category: BadgeCategory.TOPIC,
    tier: BadgeTier.SILVER,
    requirement: (stats) => stats.topicsCount >= 5,
    progress: (stats) => ({ current: stats.topicsCount, target: 5 }),
  },
  {
    id: "trendsetter",
    name: "트렌드세터",
    description: "20개 이상의 토론을 만들었습니다",
    icon: "🌟",
    category: BadgeCategory.TOPIC,
    tier: BadgeTier.GOLD,
    requirement: (stats) => stats.topicsCount >= 20,
    progress: (stats) => ({ current: stats.topicsCount, target: 20 }),
  },

  // Engagement Badges
  {
    id: "reaction-fairy",
    name: "리액션 요정",
    description: "10개 이상의 리액션을 남겼습니다",
    icon: "✨",
    category: BadgeCategory.ENGAGEMENT,
    tier: BadgeTier.SILVER,
    requirement: (stats) => stats.reactionsCount >= 10,
    progress: (stats) => ({ current: stats.reactionsCount, target: 10 }),
  },
  {
    id: "empathy-master",
    name: "공감왕",
    description: "50개 이상의 리액션을 남겼습니다",
    icon: "❤️",
    category: BadgeCategory.ENGAGEMENT,
    tier: BadgeTier.GOLD,
    requirement: (stats) => stats.reactionsCount >= 50,
    progress: (stats) => ({ current: stats.reactionsCount, target: 50 }),
  },

  // All-Around Badge
  {
    id: "all-rounder",
    name: "올라운더",
    description: "모든 활동을 경험한 만능 플레이어",
    icon: "🎖️",
    category: BadgeCategory.ALL_AROUND,
    tier: BadgeTier.GOLD,
    requirement: (stats) =>
      stats.votesCount >= 1 &&
      stats.opinionsCount >= 1 &&
      stats.topicsCount >= 1 &&
      stats.reactionsCount >= 1,
    progress: (stats) => {
      const completed = [
        stats.votesCount >= 1,
        stats.opinionsCount >= 1,
        stats.topicsCount >= 1,
        stats.reactionsCount >= 1,
      ].filter(Boolean).length;
      return { current: completed, target: 4 };
    },
  },
];

/**
 * Compute earned badges from user activity stats
 */
export function computeBadges(stats: UserActivityStats): EarnedBadge[] {
  return BADGE_DEFINITIONS.filter((badge) => badge.requirement(stats)).map(
    (badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      tier: badge.tier,
    })
  );
}

/**
 * Compute badge progress for all badges (earned and unearned)
 */
export function computeBadgeProgress(
  stats: UserActivityStats
): BadgeProgress[] {
  return BADGE_DEFINITIONS.map((badge) => {
    const earned = badge.requirement(stats);
    const progressData = badge.progress(stats);
    const percentage = Math.min(
      100,
      Math.floor((progressData.current / progressData.target) * 100)
    );

    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      tier: badge.tier,
      earned,
      progress: {
        current: progressData.current,
        target: progressData.target,
        percentage,
      },
    };
  });
}

/**
 * Get the next achievable badge (closest to completion)
 */
export function getNextBadge(stats: UserActivityStats): BadgeProgress | null {
  const unearned = computeBadgeProgress(stats).filter((badge) => !badge.earned);

  if (unearned.length === 0) return null;

  // Sort by progress percentage descending
  unearned.sort((a, b) => b.progress.percentage - a.progress.percentage);

  return unearned[0];
}

/**
 * Get tier color classes for Tailwind
 */
export function getBadgeTierColors(tier: BadgeTier): {
  bg: string;
  text: string;
  border: string;
} {
  switch (tier) {
    case BadgeTier.PLATINUM:
      return {
        bg: "bg-gradient-to-r from-cyan-500 to-blue-500",
        text: "text-white",
        border: "border-cyan-400",
      };
    case BadgeTier.GOLD:
      return {
        bg: "bg-gradient-to-r from-amber-400 to-yellow-500",
        text: "text-amber-900 dark:text-amber-950",
        border: "border-amber-400",
      };
    case BadgeTier.SILVER:
      return {
        bg: "bg-gradient-to-r from-slate-300 to-slate-400",
        text: "text-slate-900 dark:text-slate-100",
        border: "border-slate-400",
      };
    case BadgeTier.BRONZE:
      return {
        bg: "bg-gradient-to-r from-orange-500 to-orange-600",
        text: "text-white",
        border: "border-orange-500",
      };
    default:
      return {
        bg: "bg-gradient-to-r from-zinc-400 to-zinc-500",
        text: "text-white",
        border: "border-zinc-400",
      };
  }
}
