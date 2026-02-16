"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BADGE_DEFINITIONS, getBadgeTierColors } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface AvatarWithSkinProps {
  src?: string | null;
  fallback: React.ReactNode;
  selectedBadgeId?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  linkHref?: string;
}

const sizeConfig = {
  xs: { avatar: "h-6 w-6", ring: "ring-1", overlay: null, overlaySize: "", iconSize: "" },
  sm: { avatar: "h-8 w-8", ring: "ring-2", overlay: "h-[14px] w-[14px]", overlaySize: "text-[8px]", iconSize: "-bottom-0.5 -right-0.5" },
  md: { avatar: "h-10 w-10", ring: "ring-2", overlay: "h-4 w-4", overlaySize: "text-[9px]", iconSize: "-bottom-0.5 -right-0.5" },
  lg: { avatar: "h-16 w-16", ring: "ring-[3px]", overlay: "h-[18px] w-[18px]", overlaySize: "text-[10px]", iconSize: "-bottom-0.5 -right-0.5" },
  xl: { avatar: "h-16 w-16 sm:h-20 sm:w-20", ring: "ring-[3px]", overlay: "h-[22px] w-[22px]", overlaySize: "text-xs", iconSize: "-bottom-0.5 -right-0.5" },
};

function getRingColorClass(badgeId: string): string {
  const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
  if (!badge) return "";
  const colors = getBadgeTierColors(badge.tier);
  // Use the border color for ring: convert border-X to ring-X
  return colors.border.replace("border-", "ring-");
}

export function AvatarWithSkin({
  src,
  fallback,
  selectedBadgeId,
  size = "md",
  className,
  linkHref,
}: AvatarWithSkinProps) {
  const config = sizeConfig[size];
  const badge = selectedBadgeId
    ? BADGE_DEFINITIONS.find((b) => b.id === selectedBadgeId)
    : null;

  const ringClass = badge ? getRingColorClass(selectedBadgeId!) : "";

  const avatarContent = (
    <div className={cn("relative inline-flex", className)}>
      <Avatar
        className={cn(
          config.avatar,
          badge && `${config.ring} ${ringClass}`,
          linkHref && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
      >
        <AvatarImage src={src || undefined} />
        <AvatarFallback className={size === "xl" ? "text-xl sm:text-2xl" : size === "lg" ? "text-lg" : size === "xs" ? "text-[10px]" : "text-xs"}>
          {fallback}
        </AvatarFallback>
      </Avatar>
      {badge && config.overlay && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-background shadow-sm border border-border",
            config.overlay,
            config.iconSize,
            config.overlaySize,
            "leading-none"
          )}
        >
          {badge.icon}
        </span>
      )}
    </div>
  );

  if (linkHref) {
    return <Link href={linkHref}>{avatarContent}</Link>;
  }

  return avatarContent;
}
