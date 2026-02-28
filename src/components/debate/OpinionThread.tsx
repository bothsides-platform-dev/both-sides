"use client";

import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useTopicSSE } from "@/hooks/useTopicSSE";
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
  userVoteSide?: "A" | "B";
  highlightReplyId?: string;
  expandedAncestorIds?: string[];
  allVisibleOpinions?: Opinion[];
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
  userVoteSide,
  highlightReplyId,
  expandedAncestorIds,
  allVisibleOpinions = [],
}: OpinionThreadProps) {
  // Check if this opinion should be auto-expanded (is in the ancestor chain)
  const shouldAutoExpand = expandedAncestorIds?.includes(opinion.id) ?? false;

  const [showReplies, setShowReplies] = useState(shouldAutoExpand);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const repliesCount = opinion._count?.replies || 0;
  const hasReplies = repliesCount > 0;

  // Fetch replies when expanded
  const shouldFetch = showReplies && hasReplies;

  const mutateRepliesRef = useRef<() => void>(() => {});

  const { isConnected: sseConnected } = useTopicSSE(
    useCallback((event: { type: string }) => {
      if (event.type === "opinion:reply") {
        mutateRepliesRef.current();
      }
    }, [])
  );

  const { data: repliesData, mutate: mutateReplies } = useSWR<{ data: { opinions: Opinion[] } }>(
    shouldFetch ? `/api/topics/${opinion.topicId}/opinions?parentId=${opinion.id}&sort=latest&limit=100` : null,
    fetcher,
    {
      refreshInterval: shouldFetch && !sseConnected ? 15000 : 0,
      dedupingInterval: 10000,
      isPaused: () => typeof document !== 'undefined' && document.hidden,
      revalidateOnFocus: false,  // 탭 포커스시 불필요한 동시 요청 방지
    }
  );

  mutateRepliesRef.current = mutateReplies;

  const replies = repliesData?.data?.opinions || [];

  // Combine current opinion, its replies, and parent context for guest label generation
  // Use a Map to deduplicate by opinion ID to prevent duplicate entries
  const combinedOpinions = useMemo(() => {
    const opinionMap = new Map<string, Opinion>();
    
    // Add all opinions from parent context
    allVisibleOpinions.forEach(op => opinionMap.set(op.id, op));
    
    // Add current opinion
    opinionMap.set(opinion.id, opinion);
    
    // Add replies
    replies.forEach(reply => opinionMap.set(reply.id, reply));
    
    return Array.from(opinionMap.values());
  }, [allVisibleOpinions, opinion, replies]);

  // Auto-expand when ancestor data changes
  useEffect(() => {
    if (shouldAutoExpand && !showReplies) {
      setShowReplies(true);
    }
  }, [shouldAutoExpand, showReplies]);

  // Stop loading once data is fetched (moved from render-phase to useEffect)
  useEffect(() => {
    if (loadingReplies && repliesData) {
      setLoadingReplies(false);
    }
  }, [loadingReplies, repliesData]);

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
        userVoteSide={userVoteSide}
        onToggleReplies={handleToggleReplies}
        showRepliesExpanded={showReplies}
        loadingReplies={loadingReplies}
        hasReplies={hasReplies}
        isHighlighted={highlightReplyId === opinion.id}
        allVisibleOpinions={combinedOpinions}
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
              userVoteSide={userVoteSide}
              highlightReplyId={highlightReplyId}
              expandedAncestorIds={expandedAncestorIds}
              allVisibleOpinions={combinedOpinions}
            />
          ))}
        </div>
      )}
    </div>
  );
});
