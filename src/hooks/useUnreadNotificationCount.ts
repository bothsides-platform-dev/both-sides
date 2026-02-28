"use client";

import { useCallback, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useSSE } from "@/hooks/useSSE";

const POLL_INTERVAL = 30000; // 30 seconds

const NOTIFICATION_EVENT_TYPES = ["notification:new"];

export function useUnreadNotificationCount(enabled: boolean = true) {
  const mutateRef = useRef<() => void>(() => {});

  const handleSSEMessage = useCallback(() => {
    mutateRef.current();
  }, []);

  const { isConnected } = useSSE({
    url: "/api/notifications/stream",
    eventTypes: NOTIFICATION_EVENT_TYPES,
    enabled,
    onMessage: handleSSEMessage,
  });

  const { data, mutate } = useSWR<{ data: { unreadCount: number } }>(
    enabled ? "/api/notifications/unread-count" : null,
    fetcher,
    {
      refreshInterval: isConnected ? 0 : POLL_INTERVAL,
      dedupingInterval: 10000,
      isPaused: () =>
        typeof document !== "undefined" && document.hidden,
      revalidateOnFocus: true,
    }
  );

  mutateRef.current = mutate;

  return data?.data?.unreadCount ?? 0;
}
