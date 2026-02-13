"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PlusCircle, Menu } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";
import logo from "@/app/logo.png";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide default header on admin pages (admin has its own layout)
  const isAdmin = pathname.startsWith("/admin");
  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="w-full px-4 sm:px-6 flex h-14 md:h-16 items-center justify-between border-b">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link
            href="/"
            className="flex items-center space-x-2.5"
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
              <span className="text-sideA">Both</span>
              <span className="text-sideB">Sides</span>
            </span>
          </Link>
        </div>


        {/* Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {session?.user && !isAdmin && (
            <>
              {/* Create button: Icon on mobile, full button on desktop */}
              <Button asChild variant="outline" size="sm" className="lg:inline-flex">
                <Link href="/topics/new" className="flex items-center">
                  <PlusCircle className="h-5 w-5 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline">토론 만들기</span>
                  <span className="sr-only lg:hidden">토론 만들기</span>
                </Link>
              </Button>
              {/* Notification bell: Always visible */}
              <NotificationBell />
            </>
          )}
          <UserMenu />
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </header>
  );
}
