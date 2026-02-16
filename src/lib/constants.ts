import { Category, Side, FeedbackCategory, FeedbackStatus } from "@prisma/client";
import {
  Coffee,
  Landmark,
  Users,
  Heart,
  BookOpen,
  Gamepad2,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_LABELS: Record<Category, string> = {
  DAILY: "일상",
  POLITICS: "정치",
  SOCIAL: "사회",
  RELATIONSHIP: "연애/관계",
  HISTORY: "역사",
  GAME: "게임",
  TECH: "기술",
};

export interface CategoryMeta {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  gradient: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  DAILY: {
    icon: Coffee,
    label: "일상",
    description: "매일의 소소한 선택부터 라이프스타일 논쟁까지",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    gradient: "from-amber-500 to-orange-500",
  },
  POLITICS: {
    icon: Landmark,
    label: "정치",
    description: "정치 이슈와 정책에 대한 다양한 시각",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "from-blue-500 to-indigo-500",
  },
  SOCIAL: {
    icon: Users,
    label: "사회",
    description: "사회 현상과 트렌드에 대한 토론",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    gradient: "from-green-500 to-emerald-500",
  },
  RELATIONSHIP: {
    icon: Heart,
    label: "연애/관계",
    description: "연애, 우정, 가족 관계의 고민",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    gradient: "from-pink-500 to-rose-500",
  },
  HISTORY: {
    icon: BookOpen,
    label: "역사",
    description: "역사적 사건과 인물에 대한 토론",
    color: "text-stone-600 dark:text-stone-400",
    bgColor: "bg-stone-100 dark:bg-stone-800/30",
    gradient: "from-stone-500 to-stone-600",
  },
  GAME: {
    icon: Gamepad2,
    label: "게임",
    description: "게임 세계의 끝없는 논쟁",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    gradient: "from-purple-500 to-violet-500",
  },
  TECH: {
    icon: Cpu,
    label: "기술",
    description: "최신 기술 트렌드와 IT 이슈",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    gradient: "from-cyan-500 to-teal-500",
  },
};

export const CATEGORY_SLUG_MAP: Record<string, Category> = {
  daily: "DAILY",
  politics: "POLITICS",
  social: "SOCIAL",
  relationship: "RELATIONSHIP",
  history: "HISTORY",
  game: "GAME",
  tech: "TECH",
};

export const CATEGORY_TO_SLUG: Record<Category, string> = {
  DAILY: "daily",
  POLITICS: "politics",
  SOCIAL: "social",
  RELATIONSHIP: "relationship",
  HISTORY: "history",
  GAME: "game",
  TECH: "tech",
};

export const SIDE_LABELS: Record<Side, string> = {
  A: "A",
  B: "B",
};

export const SIDE_COLORS: Record<Side, { bg: string; text: string; border: string }> = {
  A: {
    bg: "bg-sideA",
    text: "text-sideA",
    border: "border-sideA",
  },
  B: {
    bg: "bg-sideB",
    text: "text-sideB",
    border: "border-sideB",
  },
};

/** CSS custom property references for category colors. Theme-aware via globals.css. */
export const CATEGORY_CSS_VAR: Record<Category, string> = {
  DAILY: "var(--category-daily)",
  POLITICS: "var(--category-politics)",
  SOCIAL: "var(--category-social)",
  RELATIONSHIP: "var(--category-relationship)",
  HISTORY: "var(--category-history)",
  GAME: "var(--category-game)",
  TECH: "var(--category-tech)",
};

// 블라인드 처리 기준 (신고 누적 수)
export const BLIND_THRESHOLD = 3;

// LLM 자동 트리거 임계값
export const LLM_MIN_OPINIONS_SUMMARY = 3;
export const LLM_MIN_OPINIONS_GROUNDS = 10;

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 업로드 설정
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_MIME_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};

// 의견 카테고리 라벨
export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  BUG: "버그 신고",
  SUGGESTION: "기능 제안",
  QUESTION: "문의",
  OTHER: "기타",
};

// 의견 상태 라벨
export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: "대기 중",
  REVIEWED: "검토 완료",
  RESOLVED: "해결 완료",
};
