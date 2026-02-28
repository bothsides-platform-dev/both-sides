"use client";

import { createContext, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { useSSE, type SSEConnectionStatus } from "@/hooks/useSSE";

type TopicSSEMessage = { type: string; data: unknown };
type MessageHandler = (event: TopicSSEMessage) => void;

interface TopicSSEContextValue {
  connectionStatus: SSEConnectionStatus;
  isConnected: boolean;
  subscribe: (handler: MessageHandler) => () => void;
}

const TopicSSEContext = createContext<TopicSSEContextValue | null>(null);

const TOPIC_EVENT_TYPES = ["opinion:new", "opinion:reply", "battle:active"];

export function TopicSSEProvider({
  topicId,
  children,
}: {
  topicId: string;
  children: React.ReactNode;
}) {
  const handlersRef = useRef<Set<MessageHandler>>(new Set());

  const handleMessage = useCallback((event: TopicSSEMessage) => {
    for (const handler of handlersRef.current) {
      handler(event);
    }
  }, []);

  const { connectionStatus, isConnected } = useSSE({
    url: `/api/topics/${topicId}/stream`,
    eventTypes: TOPIC_EVENT_TYPES,
    enabled: true,
    onMessage: handleMessage,
  });

  const subscribe = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  const value = useMemo(
    () => ({ connectionStatus, isConnected, subscribe }),
    [connectionStatus, isConnected, subscribe]
  );

  return (
    <TopicSSEContext.Provider value={value}>
      {children}
    </TopicSSEContext.Provider>
  );
}

export function useTopicSSE(onMessage?: MessageHandler) {
  const context = useContext(TopicSSEContext);

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!context || !onMessageRef.current) return;

    const handler: MessageHandler = (event) => {
      onMessageRef.current?.(event);
    };

    return context.subscribe(handler);
  }, [context]);

  return {
    connectionStatus: context?.connectionStatus ?? "disconnected" as SSEConnectionStatus,
    isConnected: context?.isConnected ?? false,
  };
}
