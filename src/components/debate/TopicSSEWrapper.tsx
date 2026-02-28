"use client";

import { TopicSSEProvider } from "@/hooks/useTopicSSE";

export function TopicSSEWrapper({
  topicId,
  children,
}: {
  topicId: string;
  children: React.ReactNode;
}) {
  return (
    <TopicSSEProvider topicId={topicId}>
      {children}
    </TopicSSEProvider>
  );
}
