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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import type { Category } from "@prisma/client";
import { FeedbackFAB } from "@/components/feedback/FeedbackFAB";
import { useSidebar } from "./SidebarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/topics/new", icon: PlusCircle, label: "토론 만들기" },
  { href: "/profile", icon: User, label: "프로필" },
] as const;

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

function SidebarTooltip({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  if (!collapsed) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { collapsed, toggle } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:bg-background lg:pt-16 lg:pb-4 transition-[width] duration-300 ease-in-out",
          collapsed ? "lg:w-[64px]" : "lg:w-[220px]"
        )}
      >
        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const currentCategorySlug = pathname === "/explore" ? searchParams.get("category") : null;
            let href: string;
            if (!session?.user && (item.href === "/profile" || item.href === "/topics/new")) {
              href = `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`;
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

            return (
              <SidebarTooltip key={item.href} label={item.label} collapsed={collapsed}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </SidebarTooltip>
            );
          })}

          {/* Admin link for admin users */}
          {session?.user?.role === "ADMIN" && (
            <SidebarTooltip label="관리자" collapsed={collapsed}>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  pathname.startsWith("/admin")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">관리자</span>}
              </Link>
            </SidebarTooltip>
          )}

          {/* Category Filter */}
          <div className="pt-3 mt-3 border-t">
            {!collapsed && (
              <Link
                href="/explore"
                className="flex items-center justify-between px-3 mb-2 group"
              >
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                  카테고리
                </span>
                <span className="text-xs text-muted-foreground/0 group-hover:text-muted-foreground transition-colors">
                  전체
                </span>
              </Link>
            )}
            {categories.map(([value, meta]) => {
              const slug = CATEGORY_TO_SLUG[value];
              const href = `/explore?category=${slug}`;
              const isActive = pathname === "/explore" && searchParams.get("category") === slug;
              const Icon = meta.icon;

              return (
                <SidebarTooltip key={value} label={meta.label} collapsed={collapsed}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      collapsed && "justify-center px-0",
                      isActive
                        ? cn(meta.bgColor, "font-medium")
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isActive ? meta.color : "text-muted-foreground")} />
                    {!collapsed && <span className={cn("truncate", isActive ? "text-foreground" : "text-muted-foreground")}>{meta.label}</span>}
                  </Link>
                </SidebarTooltip>
              );
            })}
          </div>
        </nav>

        {/* Theme Toggle & Feedback */}
        <div className="px-3 pt-4 border-t mt-2 space-y-1">
          {mounted && (
            <SidebarTooltip
              label={resolvedTheme === "dark" ? "라이트 모드" : "다크 모드"}
              collapsed={collapsed}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className={cn(
                  "w-full gap-3 text-muted-foreground",
                  collapsed ? "justify-center px-0" : "justify-start"
                )}
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <Sun className="h-5 w-5 shrink-0" />
                    {!collapsed && "라이트 모드"}
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 shrink-0" />
                    {!collapsed && "다크 모드"}
                  </>
                )}
              </Button>
            </SidebarTooltip>
          )}
          {collapsed ? (
            <SidebarTooltip label="의견 보내기" collapsed={collapsed}>
              <div>
                <FeedbackFAB inline iconOnly />
              </div>
            </SidebarTooltip>
          ) : (
            <FeedbackFAB inline />
          )}
        </div>

        {/* Toggle Button */}
        <div className="px-3 pt-2 border-t mt-2">
          <SidebarTooltip label={collapsed ? "사이드바 펼치기" : "사이드바 접기"} collapsed={collapsed}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className={cn(
                "w-full gap-3 text-muted-foreground",
                collapsed ? "justify-center px-0" : "justify-start"
              )}
              aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5 shrink-0" />
              ) : (
                <>
                  <ChevronsLeft className="h-5 w-5 shrink-0" />
                  사이드바 접기
                </>
              )}
            </Button>
          </SidebarTooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
