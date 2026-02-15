"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { BADGE_DEFINITIONS, BadgeTier } from "@/lib/badges";
import { cn } from "@/lib/utils";

const badgeRingClasses: Record<BadgeTier, string> = {
  [BadgeTier.PLATINUM]: "ring-cyan-400/80",
  [BadgeTier.GOLD]: "ring-amber-400/90",
  [BadgeTier.SILVER]: "ring-slate-300/90",
  [BadgeTier.BRONZE]: "ring-orange-400/90",
};

type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  badgeId?: string | null;
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, badgeId, ...props }, ref) => {
  const badge = badgeId ? BADGE_DEFINITIONS.find((item) => item.id === badgeId) : null;
  const ringClass = badge ? badgeRingClasses[badge.tier] : "";

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        badge && "ring-2 ring-offset-2 ring-offset-background",
        ringClass,
        className
      )}
      {...props}
    >
      {badge && (
        <div className="pointer-events-none absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background shadow-sm">
          <span className="text-xs leading-none">{badge.icon}</span>
        </div>
      )}
      {props.children}
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
