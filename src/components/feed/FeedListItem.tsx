"use client";

import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";
import { PostListItem, type PostListItemProps } from "@/components/posts/PostListItem";

export type FeedItem =
  | { type: "topic"; data: TopicListItemProps["topic"] }
  | { type: "post"; data: PostListItemProps["post"] };

interface FeedListItemProps {
  item: FeedItem;
}

export function FeedListItem({ item }: FeedListItemProps) {
  if (item.type === "topic") {
    return <TopicListItem topic={item.data} />;
  }
  return <PostListItem post={item.data} />;
}
