export type SiteName = 'dcinside' | 'fmkorea' | 'ppomppu' | 'ruliweb' | 'theqoo' | 'instiz' | 'navercafe';

export interface CommunityTrendingPost {
  id: string;
  title: string;
  sourceUrl: string;
  sourceSite: SiteName;
  category?: string;
  author?: string;
  viewCount?: number;
  commentCount?: number;
  likeCount?: number;
  createdAt?: string;
  collectedAt: string;
  content: string;
  imageUrls?: string[];
}

export interface SiteMeta {
  displayName: string;
  color: string;
  bgColor: string;
}

export const SITE_META: Record<SiteName, SiteMeta> = {
  dcinside: {
    displayName: 'DCinside',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  fmkorea: {
    displayName: 'FM Korea',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
  ppomppu: {
    displayName: '뽐뿌',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  ruliweb: {
    displayName: '루리웹',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  theqoo: {
    displayName: '더쿠',
    color: 'text-pink-700 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
  },
  instiz: {
    displayName: '인스티즈',
    color: 'text-teal-700 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
  },
  navercafe: {
    displayName: '네이버카페',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
};
