"use client";

import { useState, useEffect, useCallback } from "react";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
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
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import { FeedbackFAB } from "@/components/feedback/FeedbackFAB";
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
  const unreadCount = useUnreadNotificationCount(!!session?.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeSidebar = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[280px] sm:w-[320px] sm:max-w-sm p-0 flex flex-col [&>button]:sr-only [&>button:focus]:not-sr-only">
        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const currentCategorySlug = pathname === "/explore" ? searchParams.get("category") : null;
            let href: string;
            if (item.requiresAuth && !session?.user) {
              href = `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`;
            } else if (!session?.user && item.href === "/profile") {
              href = "/auth/signin";
            } else if (item.href === "/topics/new" && currentCategorySlug) {
              href = `/topics/new?category=${currentCategorySlug}`;
            } else {
              href = item.href;
            }

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
                onClick={closeSidebar}
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
                    <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sideB text-2xs font-medium text-sideB-foreground">
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
              onClick={closeSidebar}
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
            <div className="px-3 py-1 mb-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                카테고리
              </span>
            </div>
            <div className="space-y-0.5">
            <Link
              href="/explore"
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                pathname === "/explore" && !searchParams.get("category")
                  ? "bg-accent font-medium"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <LayoutGrid className={cn("h-5 w-5 shrink-0", pathname === "/explore" && !searchParams.get("category") ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("truncate", pathname === "/explore" && !searchParams.get("category") ? "text-foreground" : "text-muted-foreground")}>전체</span>
            </Link>
            {categories.map(([value, meta]) => {
              const slug = CATEGORY_TO_SLUG[value];
              const href = `/explore?category=${slug}`;
              const isActive = pathname === "/explore" && searchParams.get("category") === slug;
              const Icon = meta.icon;

              return (
                <Link
                  key={value}
                  href={href}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? meta.color : "text-muted-foreground")} />
                  <span className={cn("truncate", isActive ? "text-foreground" : "text-muted-foreground")}>{meta.label}</span>
                </Link>
              );
            })}
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t mt-auto space-y-2">
          {/* Feedback Button */}
          <FeedbackFAB inline onDialogOpen={() => onOpenChange(false)} />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mounted && setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-full justify-start gap-3 text-muted-foreground"
            aria-label={mounted ? (resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환") : "테마 전환"}
          >
            {mounted && resolvedTheme === "dark" ? (
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
