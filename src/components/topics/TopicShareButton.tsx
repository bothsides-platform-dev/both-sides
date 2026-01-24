"use client";

import { ShareButton } from "@/components/ui/ShareButton";

interface TopicShareButtonProps {
  topicId: string;
  title: string;
  optionA: string;
  optionB: string;
}

export function TopicShareButton({
  topicId,
  title,
  optionA,
  optionB,
}: TopicShareButtonProps) {
  return (
    <ShareButton
      url={`/topics/${topicId}`}
      title={title}
      description={`${optionA} vs ${optionB}`}
      imageUrl={`/api/og?topicId=${topicId}`}
      variant="button"
    />
  );
}
