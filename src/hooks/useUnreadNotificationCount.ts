import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const POLL_INTERVAL = 30000; // 30 seconds

export function useUnreadNotificationCount(enabled: boolean = true) {
  const { data } = useSWR<{ data: { unreadCount: number } }>(
    enabled ? "/api/notifications/unread-count" : null,
    fetcher,
    {
      refreshInterval: POLL_INTERVAL,
      dedupingInterval: 10000,
      isPaused: () =>
        typeof document !== "undefined" && document.hidden,
      revalidateOnFocus: true,
    }
  );

  return data?.data?.unreadCount ?? 0;
}
