"use client";

import { useEffect } from "react";

interface PostViewCountTrackerProps {
  postId: string;
}

export function PostViewCountTracker({ postId }: PostViewCountTrackerProps) {
  useEffect(() => {
    fetch(`/api/posts/${postId}/view`, {
      method: "POST",
    }).catch(() => {});
  }, [postId]);

  return null;
}
