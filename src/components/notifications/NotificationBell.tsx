"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

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
  battleId: string | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = useUnreadNotificationCount();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data.notifications);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      mutate("/api/notifications/unread-count");
    } catch {
      // Silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      mutate("/api/notifications/unread-count");
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-[44px] min-w-[44px] md:h-10 md:w-10"
          aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sideB text-xs font-medium text-sideB-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <NotificationDropdown
        notifications={notifications}
        isLoading={isLoading}
        onRead={markAsRead}
        onReadAll={markAllAsRead}
        unreadCount={unreadCount}
      />
    </DropdownMenu>
  );
}
