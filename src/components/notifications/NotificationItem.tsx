"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, Swords } from "lucide-react";
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
    battleId: string | null;
  };
  onRead: (id: string) => void;
}

const BATTLE_NOTIFICATION_MESSAGES: Record<string, (actorName: string) => string> = {
  BATTLE_CHALLENGE: (name) => `${name}님이 맞짱을 신청했습니다!`,
  BATTLE_ACCEPTED: (name) => `${name}님이 맞짱을 수락했습니다!`,
  BATTLE_DECLINED: (name) => `${name}님이 맞짱을 거절했습니다.`,
  BATTLE_STARTED: () => "맞짱이 시작되었습니다!",
  BATTLE_YOUR_TURN: () => "맞짱에서 당신의 차례입니다!",
  BATTLE_ENDED: () => "맞짱이 종료되었습니다.",
  BATTLE_COUNTER_PROPOSAL: (name) => `${name}님이 배틀 시간 변경을 제안했습니다.`,
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const actorName = notification.actor?.nickname || notification.actor?.name || "알 수 없는 사용자";
  const topicTitle = notification.topic?.title || "삭제된 토론";
  const replyPreview = notification.reply?.body
    ? notification.reply.body.length > 50
      ? notification.reply.body.slice(0, 50) + "..."
      : notification.reply.body
    : "";

  const isBattleNotification = notification.type.startsWith("BATTLE_");

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
  };

  // Build URL based on notification type
  let href = "#";
  if (isBattleNotification && notification.battleId) {
    href = `/battles/${notification.battleId}`;
  } else if (notification.topic) {
    href = notification.reply
      ? `/topics/${notification.topic.id}?highlightReply=${notification.reply.id}`
      : `/topics/${notification.topic.id}`;
  }

  const getMessage = () => {
    if (isBattleNotification) {
      const msgFn = BATTLE_NOTIFICATION_MESSAGES[notification.type];
      return msgFn ? msgFn(actorName) : "새 알림이 있습니다.";
    }
    return (
      <>
        <span className="font-semibold">{actorName}</span>
        님이 회원님의 의견에 답글을 남겼습니다
      </>
    );
  };

  const Icon = isBattleNotification ? Swords : MessageSquare;
  const iconColor = isBattleNotification ? "text-orange-500" : "text-sideA";
  const iconBg = isBattleNotification
    ? notification.isRead ? "bg-muted" : "bg-orange-100 dark:bg-orange-950/30"
    : notification.isRead ? "bg-muted" : "bg-sideA/20 dark:bg-sideA/30";

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0",
        !notification.isRead && "bg-sideA/5 dark:bg-sideA/10"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className={cn("p-2 rounded-full", iconBg)}>
          <Icon className={cn(
            "h-4 w-4",
            notification.isRead ? "text-muted-foreground" : iconColor
          )} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          !notification.isRead && "font-medium"
        )}>
          {getMessage()}
        </p>
        {!isBattleNotification && replyPreview && (
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
          <div className="h-2 w-2 rounded-full bg-sideA" />
        </div>
      )}
    </Link>
  );
}
