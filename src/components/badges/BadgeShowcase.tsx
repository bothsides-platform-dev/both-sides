"use client";

import { useState } from "react";
import {
  BadgeProgress,
  BadgeCategory,
  getBadgeTierColors,
  UserActivityStats,
  computeBadgeProgress,
} from "@/lib/badges";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BadgeShowcaseProps {
  stats: UserActivityStats;
  trigger?: React.ReactNode;
}

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  [BadgeCategory.VOTING]: "투표 활동",
  [BadgeCategory.OPINION]: "의견 작성",
  [BadgeCategory.TOPIC]: "토론 개설",
  [BadgeCategory.ENGAGEMENT]: "커뮤니티 참여",
  [BadgeCategory.ALL_AROUND]: "종합 활동",
};

/**
 * Full badge showcase with progress tracking
 * Shows all badges (earned and locked) with motivation text
 */
export function BadgeShowcase({ stats, trigger }: BadgeShowcaseProps) {
  const [open, setOpen] = useState(false);
  const allBadges = computeBadgeProgress(stats);

  // Group badges by category
  const badgesByCategory = allBadges.reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    },
    {} as Record<BadgeCategory, BadgeProgress[]>
  );

  const getMotivationText = (badge: BadgeProgress): string => {
    if (badge.earned) return "";

    const remaining = badge.progress.target - badge.progress.current;

    switch (badge.category) {
      case BadgeCategory.VOTING:
        return `${remaining}개 더 투표하면 획득`;
      case BadgeCategory.OPINION:
        return `${remaining}개 더 의견을 작성하면 획득`;
      case BadgeCategory.TOPIC:
        return `${remaining}개 더 토론을 만들면 획득`;
      case BadgeCategory.ENGAGEMENT:
        return `${remaining}개 더 리액션을 남기면 획득`;
      case BadgeCategory.ALL_AROUND:
        return `${remaining}개 활동을 더 경험하면 획득`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-xs">
            전체 뱃지 보기 →
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>나의 뱃지 컬렉션</DialogTitle>
          <DialogDescription>
            활동을 통해 다양한 뱃지를 획득하고 성장해보세요!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(badgesByCategory).map(([category, badges]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {CATEGORY_LABELS[category as BadgeCategory]}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {badges.map((badge) => {
                  const colors = getBadgeTierColors(badge.tier);
                  const motivationText = getMotivationText(badge);

                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        "relative rounded-lg border p-4 transition-all",
                        badge.earned
                          ? "border-border bg-card hover:shadow-md"
                          : "border-dashed border-muted-foreground/30 bg-muted/30"
                      )}
                    >
                      {/* Badge Header */}
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl",
                            badge.earned
                              ? colors.bg
                              : "bg-muted grayscale opacity-40"
                          )}
                        >
                          {badge.earned ? (
                            badge.icon
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                "font-semibold",
                                badge.earned
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {badge.name}
                            </h4>
                            {badge.earned && (
                              <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                            )}
                          </div>
                          <p
                            className={cn(
                              "text-xs",
                              badge.earned
                                ? "text-muted-foreground"
                                : "text-muted-foreground/60"
                            )}
                          >
                            {badge.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress for unearned badges */}
                      {!badge.earned && (
                        <div className="mt-3 space-y-2">
                          <Progress
                            value={badge.progress.percentage}
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {badge.progress.current} / {badge.progress.target}
                            </span>
                            <span className="text-primary">
                              {motivationText}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
