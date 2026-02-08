"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Home,
  PlusCircle,
  User,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import type { Category } from "@prisma/client";
import { FeedbackFAB } from "@/components/feedback/FeedbackFAB";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/topics/new", icon: PlusCircle, label: "토론 만들기" },
  { href: "/profile", icon: User, label: "프로필" },
] as const;

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

export function DesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="hidden lg:flex lg:w-[220px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:bg-background lg:pt-16 lg:pb-4">
      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href =
            !session?.user && (item.href === "/profile" || item.href === "/topics/new")
              ? `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`
              : item.href;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
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

      {/* Theme Toggle & Feedback */}
      <div className="px-3 pt-4 border-t mt-2 space-y-1">
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
        <FeedbackFAB inline />
      </div>
    </aside>
  );
}
