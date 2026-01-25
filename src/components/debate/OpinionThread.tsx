"use client";

import { memo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { OpinionItem } from "./OpinionItem";
import type { Opinion } from "./types";
import type { ReactionType } from "@prisma/client";

interface OpinionThreadProps {
  opinion: Opinion;
  optionA: string;
  optionB: string;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
  onReplySuccess?: () => void;
  depth?: number;
  maxDepth?: number;
}

const MAX_DEPTH = 4;

export const OpinionThread = memo(function OpinionThread({
  opinion,
  optionA,
  optionB,
  currentUserId,
  onReaction,
  onReplySuccess,
  depth = 0,
  maxDepth = MAX_DEPTH,
}: OpinionThreadProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const repliesCount = opinion._count?.replies || 0;
  const hasReplies = repliesCount > 0;

  // Fetch replies when expanded
  const shouldFetch = showReplies && hasReplies;
  const { data: repliesData, mutate: mutateReplies } = useSWR<{ data: { opinions: Opinion[] } }>(
    shouldFetch ? `/api/topics/${opinion.topicId}/opinions?parentId=${opinion.id}&sort=latest&limit=100` : null,
    fetcher
  );

  const replies = repliesData?.data?.opinions || [];

  const handleToggleReplies = () => {
    if (!showReplies && hasReplies) {
      setLoadingReplies(true);
    }
    setShowReplies(!showReplies);
  };

  const handleReplySuccess = () => {
    mutateReplies();
    if (onReplySuccess) {
      onReplySuccess();
    }
  };

  // Stop loading once data is fetched
  if (loadingReplies && repliesData) {
    setLoadingReplies(false);
  }

  return (
    <div className="relative">
      {/* Main Opinion */}
      <OpinionItem
        opinion={opinion}
        optionA={optionA}
        optionB={optionB}
        currentUserId={currentUserId}
        onReaction={onReaction}
        depth={depth}
        onReplySuccess={handleReplySuccess}
        showRepliesCount={hasReplies}
        onToggleReplies={handleToggleReplies}
        showRepliesExpanded={showReplies}
        loadingReplies={loadingReplies}
        hasReplies={hasReplies}
      />

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-0">
          {replies.map((reply) => (
            <OpinionThread
              key={reply.id}
              opinion={reply}
              optionA={optionA}
              optionB={optionB}
              currentUserId={currentUserId}
              onReaction={onReaction}
              onReplySuccess={handleReplySuccess}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
});
