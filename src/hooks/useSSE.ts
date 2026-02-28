"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type SSEConnectionStatus = "connecting" | "connected" | "disconnected" | "polling";

type SSEOptions = {
  url: string;
  eventTypes: string[];
  enabled?: boolean;
  onMessage?: (event: { type: string; data: unknown }) => void;
};

export function useSSE({
  url,
  eventTypes,
  enabled = true,
  onMessage,
}: SSEOptions) {
  const [connectionStatus, setConnectionStatus] = useState<SSEConnectionStatus>("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;
      setConnectionStatus("connecting");

      es.addEventListener("heartbeat", () => {
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      });

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
          setConnectionStatus("polling");
          return;
        }

        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 16000);
        setConnectionStatus("disconnected");
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    } catch {
      setConnectionStatus("polling");
    }
  }, [url, enabled, eventTypes]);

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

  const isConnected = connectionStatus === "connected" || connectionStatus === "connecting";

  return {
    connectionStatus,
    isConnected,
  };
}
