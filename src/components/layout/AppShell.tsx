"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "./MobileBottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightSidebar } from "./DesktopRightSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

/** Routes where the shell layout (sidebars, bottom nav) should be hidden */
const EXCLUDED_ROUTES = ["/admin", "/auth"];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

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
      <div className="lg:pl-[220px] xl:pr-[280px] lg:pt-16">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </>
  );
}
