"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "./NotificationList";
import { CheckCheck, Loader2 } from "lucide-react";

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

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onRead: (id: string) => void;
  onReadAll: () => void;
  unreadCount: number;
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onRead,
  onReadAll,
  unreadCount,
}: NotificationDropdownProps) {
  return (
    <DropdownMenuContent
      className="w-[calc(100vw-2rem)] sm:w-80 max-sm:translate-x-[24px]"
      align="end"
      sideOffset={8}
      forceMount
    >
      <div className="flex items-center justify-between px-2">
        <DropdownMenuLabel className="font-normal">
          <span className="font-semibold">알림</span>
        </DropdownMenuLabel>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReadAll();
            }}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            모두 읽음
          </Button>
        )}
      </div>
      <DropdownMenuSeparator />
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          <NotificationList notifications={notifications} onRead={onRead} />
        </div>
      )}
    </DropdownMenuContent>
  );
}
