"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useSWR from "swr";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "polling";

type BattleSSEOptions = {
  battleId: string;
  enabled?: boolean;
  onMessage?: (event: { type: string; data: unknown }) => void;
  pollIntervalMs?: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useBattleSSE({
  battleId,
  enabled = true,
  onMessage,
  pollIntervalMs = 3000,
}: BattleSSEOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [usePolling, setUsePolling] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  // SWR polling fallback
  const { data: pollingData, mutate } = useSWR(
    usePolling && enabled ? `/api/battles/${battleId}` : null,
    fetcher,
    { refreshInterval: usePolling ? pollIntervalMs : 0 }
  );

  const { data: messagesData } = useSWR(
    usePolling && enabled ? `/api/battles/${battleId}/messages` : null,
    fetcher,
    { refreshInterval: usePolling ? pollIntervalMs : 0 }
  );

  const connect = useCallback(() => {
    if (!enabled || !battleId) return;

    try {
      const es = new EventSource(`/api/battles/${battleId}/stream`);
      eventSourceRef.current = es;
      setConnectionStatus("connecting");

      es.addEventListener("heartbeat", () => {
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      });

      const eventTypes = [
        "battle:state",
        "battle:message",
        "battle:hp",
        "battle:turn",
        "battle:end",
        "battle:comment",
      ];

      for (const type of eventTypes) {
        es.addEventListener(type, (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessageRef.current?.({ type, data });
          } catch {
            // ignore parse errors
          }
        });
      }

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;

        reconnectAttempts.current++;

        if (reconnectAttempts.current > 5) {
          // Switch to polling after 5 failed attempts
          setUsePolling(true);
          setConnectionStatus("polling");
          return;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 16000);
        setConnectionStatus("disconnected");
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    } catch {
      setUsePolling(true);
      setConnectionStatus("polling");
    }
  }, [battleId, enabled]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const refreshBattle = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    connectionStatus,
    pollingData: usePolling ? pollingData : null,
    messagesData: usePolling ? messagesData : null,
    refreshBattle,
  };
}
