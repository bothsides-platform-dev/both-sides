"use client";

import { useEffect, useRef } from "react";

interface ViewCountTrackerProps {
  topicId: string;
}

export function ViewCountTracker({ topicId }: ViewCountTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch(`/api/topics/${topicId}/view`, {
      method: "POST",
    }).catch(() => {
      // 에러 무시 - 조회수 트래킹 실패해도 페이지 동작에 영향 없음
    });
  }, [topicId]);

  return null;
}
