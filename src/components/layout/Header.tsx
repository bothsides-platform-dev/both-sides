"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PlusCircle } from "lucide-react";
import logo from "@/app/logo.png";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 md:px-8 lg:px-12 flex h-16 items-center justify-between border-b">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src={logo}
            alt="BothSides"
            width={32}
            height={32}
            priority
            className="h-8 w-8"
          />
          <span className="text-xl sm:text-2xl font-bold">
            <span className="text-[#3B82F6]">Both</span>
            <span className="text-[#EF4444]">Sides</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {session?.user && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/topics/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  토론 만들기
                </Link>
              </Button>
              <NotificationBell />
            </>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
