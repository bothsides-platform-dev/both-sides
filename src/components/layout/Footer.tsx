"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    // Hidden on mobile (bottom nav replaces footer), visible on desktop
    // On lg+ with sidebar, theme toggle is in sidebar, so footer is simpler
    <footer className="hidden md:block border-t py-6">
      <div className="w-full px-4 md:px-8 lg:px-12 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          {/* Theme toggle: hidden on lg+ (sidebar has it) */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="h-8 w-8 lg:hidden"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BothSides. All rights reserved.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          A vs B, 당신의 선택은?
        </p>
      </div>
    </footer>
  );
}
