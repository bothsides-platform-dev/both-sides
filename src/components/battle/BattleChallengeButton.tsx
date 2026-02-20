"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChallengeDialog } from "./ChallengeDialog";

interface BattleChallengeButtonProps {
  opinionId: string;
  opinionUserId: string;
  topicId: string;
  currentUserId?: string;
}

export function BattleChallengeButton({
  opinionId,
  opinionUserId,
  topicId,
  currentUserId,
}: BattleChallengeButtonProps) {
  const [open, setOpen] = useState(false);

  // Don't show for own opinions or if not logged in
  if (!currentUserId || currentUserId === opinionUserId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-all",
          "md:min-h-[36px] md:min-w-[36px] md:px-1.5 md:py-0.5 md:rounded",
          "text-muted-foreground hover:text-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
        )}
        aria-label="맞짱 신청"
      >
        <Swords className="h-4 w-4 md:h-3 md:w-3" />
        <span className="font-medium">맞짱</span>
      </button>

      <ChallengeDialog
        open={open}
        onOpenChange={setOpen}
        topicId={topicId}
        challengedId={opinionUserId}
        challengedOpinionId={opinionId}
      />
    </>
  );
}
