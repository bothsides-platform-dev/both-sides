"use client";

import { NotificationItem } from "./NotificationItem";

interface Notification {
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
}

interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: string) => void;
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        알림이 없습니다
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
        />
      ))}
    </div>
  );
}
