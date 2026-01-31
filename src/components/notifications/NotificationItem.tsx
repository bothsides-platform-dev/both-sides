"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    actor: {
      id: string;
      nickname: string | null;
      name: string | null;
      image: string | null;
    } | null;
    opinion: {
      id: string;
      body: string;
    } | null;
    reply: {
      id: string;
      body: string;
    } | null;
    topic: {
      id: string;
      title: string;
    } | null;
  };
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const actorName = notification.actor?.nickname || notification.actor?.name || "알 수 없는 사용자";
  const topicTitle = notification.topic?.title || "삭제된 토론";
  const replyPreview = notification.reply?.body
    ? notification.reply.body.length > 50
      ? notification.reply.body.slice(0, 50) + "..."
      : notification.reply.body
    : "";

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
  };

  // Build URL with highlightReply parameter if reply exists
  const href = notification.topic
    ? notification.reply
      ? `/topics/${notification.topic.id}?highlightReply=${notification.reply.id}`
      : `/topics/${notification.topic.id}`
    : "#";

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className={cn(
          "p-2 rounded-full",
          notification.isRead ? "bg-muted" : "bg-blue-100 dark:bg-blue-900"
        )}>
          <MessageSquare className={cn(
            "h-4 w-4",
            notification.isRead ? "text-muted-foreground" : "text-blue-600 dark:text-blue-400"
          )} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          !notification.isRead && "font-medium"
        )}>
          <span className="font-semibold">{actorName}</span>
          님이 회원님의 의견에 답글을 남겼습니다
        </p>
        {replyPreview && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            &quot;{replyPreview}&quot;
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
          {topicTitle} · {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
      )}
    </Link>
  );
}
