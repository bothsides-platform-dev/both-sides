"use client";

import { ShareButton } from "@/components/ui/ShareButton";

interface TopicShareButtonProps {
  topicId: string;
  title: string;
  optionA: string;
  optionB: string;
  imageUrl?: string | null;
}

export function TopicShareButton({
  topicId,
  title,
  optionA,
  optionB,
  imageUrl,
}: TopicShareButtonProps) {
  const shareImageUrl = imageUrl || `/topics/${topicId}/opengraph-image`;

  return (
    <ShareButton
      url={`/topics/${topicId}`}
      title={title}
      description={`${optionA} vs ${optionB}`}
      imageUrl={shareImageUrl}
      variant="button"
      topicId={topicId}
    />
  );
}
