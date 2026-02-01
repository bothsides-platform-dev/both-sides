import { Category, Side, FeedbackCategory, FeedbackStatus } from "@prisma/client";

export const CATEGORY_LABELS: Record<Category, string> = {
  DAILY: "일상",
  POLITICS: "정치",
  SOCIAL: "사회",
  RELATIONSHIP: "연애/관계",
  HISTORY: "역사",
  GAME: "게임",
  TECH: "기술",
};

export const SIDE_LABELS: Record<Side, string> = {
  A: "A",
  B: "B",
};

export const SIDE_COLORS: Record<Side, { bg: string; text: string; border: string }> = {
  A: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500",
  },
  B: {
    bg: "bg-red-500",
    text: "text-red-500",
    border: "border-red-500",
  },
};

// 블라인드 처리 기준 (신고 누적 수)
export const BLIND_THRESHOLD = 3;

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

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
