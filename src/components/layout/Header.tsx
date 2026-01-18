"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { PlusCircle } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 md:px-8 lg:px-12 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            <span className="text-blue-500">Both</span>
            <span className="text-red-500">Sides</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user && (
            <Button asChild variant="outline" size="sm">
              <Link href="/topics/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                토론 만들기
              </Link>
            </Button>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
