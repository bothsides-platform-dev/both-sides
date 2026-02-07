"use client";

import { EarnedBadge, getBadgeTierColors } from "@/lib/badges";
import { cn } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";

interface UserBadgesProps {
  badges: EarnedBadge[];
  maxDisplay?: number;
  compact?: boolean;
  className?: string;
}

/**
 * Display user's earned badges as colorful pills
 * Compact mode for profile headers, full mode for detail views
 */
export function UserBadges({
  badges,
  maxDisplay = 4,
  compact = true,
  className,
}: UserBadgesProps) {
  if (badges.length === 0) {
    return null;
  }

  const displayedBadges = compact ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = badges.length - maxDisplay;

  return (
    <Tooltip.Provider>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {displayedBadges.map((badge) => {
          const colors = getBadgeTierColors(badge.tier);

          return (
            <Tooltip.Root key={badge.id}>
              <Tooltip.Trigger asChild>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105",
                    colors.bg,
                    colors.text,
                    colors.border
                  )}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  sideOffset={5}
                >
                  {badge.description}
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}

        {compact && remainingCount > 0 && (
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            +{remainingCount}
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}
