"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightSidebar } from "./DesktopRightSidebar";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

/** Routes where the shell layout (sidebars, bottom nav) should be hidden */
const EXCLUDED_ROUTES = ["/admin", "/auth"];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  const isExcluded = EXCLUDED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Desktop Right Sidebar */}
      <DesktopRightSidebar />

      {/* Main Content - offset for sidebars */}
      <div
        className={cn(
          "xl:pr-[280px] transition-[padding-left] duration-300 ease-in-out overflow-x-hidden",
          collapsed ? "lg:pl-[64px]" : "lg:pl-[220px]"
        )}
      >
        {children}
      </div>
    </>
  );
}
