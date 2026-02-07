"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopRightSidebar } from "./DesktopRightSidebar";

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

/** Routes where the shell layout (sidebars, bottom nav) should be hidden */
const EXCLUDED_ROUTES = ["/admin", "/auth"];

export function AppShell({ children, header }: AppShellProps) {
  const pathname = usePathname();

  const isExcluded = EXCLUDED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isExcluded) {
    return (
      <>
        {header}
        {children}
      </>
    );
  }

  return (
    <>
      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Desktop Right Sidebar */}
      <DesktopRightSidebar />

      {/* Header and Main Content - offset for sidebars */}
      <div className="lg:pl-[220px] xl:pr-[280px]">
        {header}
        {children}
      </div>
    </>
  );
}
