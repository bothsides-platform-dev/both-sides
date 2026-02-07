"use client";

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

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
              <Icon
                className={cn(
                  "h-5 w-5",
                  item.accent && "h-6 w-6"
                )}
                strokeWidth={isActive || item.accent ? 2.5 : 2}
              />
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
