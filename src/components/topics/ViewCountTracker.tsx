"use client";

import { useEffect, useRef } from "react";

interface ViewCountTrackerProps {
  topicId: string;
}

export function ViewCountTracker({ topicId }: ViewCountTrackerProps) {
  useEffect(() => {
    fetch(`/api/topics/${topicId}/view`, {
      method: "POST",
    }).catch(() => {
      // 에러 무시 - 조회수 트래킹 실패해도 페이지 동작에 영향 없음
    });
    // 방문마다 전송하여 조회수 증가
  }, [topicId]);

  return null;
}
