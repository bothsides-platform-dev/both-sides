"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, PlusCircle, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  accent?: boolean;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/topics/new", icon: PlusCircle, label: "만들기", accent: true },
  { href: "/notifications", icon: Bell, label: "알림", requiresAuth: true },
  { href: "/profile", icon: User, label: "프로필" },
];

const POLL_INTERVAL = 30000;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    let interval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
        startPolling();
      } else {
        stopPolling();
      }
    };

    fetchUnreadCount();
    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session?.user, fetchUnreadCount]);

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          // Redirect to sign-in if requires auth and not logged in
          const href =
            item.requiresAuth && !session?.user
              ? `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`
              : !session?.user && item.href === "/profile"
                ? "/auth/signin"
                : item.href;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;
          const showBadge = item.href === "/notifications" && session?.user && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[48px]",
                item.accent
                  ? "text-primary"
                  : isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    item.accent && "h-6 w-6"
                  )}
                  strokeWidth={isActive || item.accent ? 2.5 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area inset for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
