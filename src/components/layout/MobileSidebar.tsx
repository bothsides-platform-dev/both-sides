"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Home,
  PlusCircle,
  Bell,
  User,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import type { Category } from "@prisma/client";

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/topics/new", icon: PlusCircle, label: "토론 만들기", requiresAuth: true },
  { href: "/notifications", icon: Bell, label: "알림", requiresAuth: true },
  { href: "/profile", icon: User, label: "프로필" },
];

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

const POLL_INTERVAL = 30000;

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch unread notifications count
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

  // Auto-close sidebar on route change
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-3/4 sm:max-w-sm p-0 flex flex-col">
        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 shrink-0" />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}

          {/* Admin link for admin users */}
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              관리자
            </Link>
          )}

          {/* Category Filter */}
          <div className="pt-3 mt-3 border-t">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              카테고리
            </p>
            {categories.map(([value, meta]) => {
              const slug = CATEGORY_TO_SLUG[value];
              const href = `/explore?category=${slug}`;
              const isActive = pathname === "/explore" && searchParams.get("category") === slug;
              const Icon = meta.icon;

              return (
                <Link
                  key={value}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {meta.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Theme Toggle */}
        <div className="px-3 py-4 border-t mt-auto">
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-full justify-start gap-3 text-muted-foreground"
            >
              {resolvedTheme === "dark" ? (
                <>
                  <Sun className="h-5 w-5" />
                  라이트 모드
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  다크 모드
                </>
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
