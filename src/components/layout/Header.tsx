"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PlusCircle } from "lucide-react";
import logo from "@/app/logo.png";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Hide default header on admin pages (admin has its own layout)
  const isAdmin = pathname.startsWith("/admin");

  // On desktop with sidebar, the header only needs search + user actions
  // On mobile, compact header with logo + icons only (nav is in bottom bar)
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 md:px-8 lg:px-12 flex h-14 md:h-16 items-center justify-between border-b">
        {/* Mobile: Logo (always visible) */}
        {/* Desktop with sidebar: hidden since sidebar has logo */}
        <Link
          href="/"
          className="flex items-center space-x-2.5 lg:hidden"
        >
          <Image
            src={logo}
            alt="BothSides"
            width={24}
            height={24}
            priority
            className="h-6 w-6"
          />
          <span className="text-xl sm:text-2xl font-bold">
            <span className="text-[#3B82F6]">Both</span>
            <span className="text-[#EF4444]">Sides</span>
          </span>
        </Link>

        {/* Desktop with sidebar: Spacer to push actions right */}
        <div className="hidden lg:block" />

        {/* Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {session?.user && !isAdmin && (
            <>
              {/* Create button: hidden on mobile (bottom nav handles it) */}
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link href="/topics/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  토론 만들기
                </Link>
              </Button>
              {/* Notification bell: hidden on mobile (bottom nav handles it) */}
              <div className="hidden md:block">
                <NotificationBell />
              </div>
            </>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
