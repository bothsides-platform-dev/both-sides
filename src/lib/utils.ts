import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return formatDate(d);
}

export function formatDDay(date: Date | string | null): string | null {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // Reset time to midnight for accurate day calculation
  const deadlineDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffInDays = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "마감";
  if (diffInDays === 0) return "D-Day";
  return `D-${diffInDays}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

/**
 * Generate a consistent guest label for anonymous users based on their visitorId.
 * Returns labels like "손님1", "손님2", etc. within a given set of opinions.
 * @param visitorId - The visitor ID of the anonymous user
 * @param allOpinions - All opinions in the current context (to ensure consistent numbering)
 * @returns A label string like "손님1", "손님2", etc.
 */
export function getGuestLabel(
  visitorId: string | null | undefined, 
  allOpinions: Array<{ visitorId?: string | null; user?: { id: string; nickname?: string | null; name?: string | null } | null }>
): string {
  if (!visitorId) return "손님";

  // Get unique guest visitor IDs in order of first appearance
  const uniqueGuestIds: string[] = [];
  const seenIds = new Set<string>();

  for (const opinion of allOpinions) {
    // Only consider opinions from guests (no user)
    if (!opinion.user && opinion.visitorId) {
      if (!seenIds.has(opinion.visitorId)) {
        seenIds.add(opinion.visitorId);
        uniqueGuestIds.push(opinion.visitorId);
      }
    }
  }

  // Find the index of this visitorId
  const index = uniqueGuestIds.indexOf(visitorId);
  
  // If not found, return generic label (e.g., current opinion not yet in allOpinions array)
  if (index === -1) return "손님";

  // Return label like "손님1", "손님2", etc.
  return `손님${index + 1}`;
}
