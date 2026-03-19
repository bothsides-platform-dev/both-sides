"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PostCommentBattle } from "@/types/post-comments";

interface InlineChallengeActionsProps {
  battle: PostCommentBattle;
  onMutate: () => void;
}

export function InlineChallengeActions({ battle, onMutate }: InlineChallengeActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Only show for PENDING battles where current user is the challenged user
  if (battle.status !== "PENDING") return null;
  if (!session?.user || session.user.id !== battle.challenged.id) return null;

  const handleRespond = async (action: "accept" | "decline") => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/battles/${battle.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) return;

      if (action === "accept") {
        router.push(`/battles/${battle.id}`);
      } else {
        onMutate();
      }
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        size="sm"
        onClick={() => handleRespond("accept")}
        disabled={isProcessing}
        className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
      >
        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "수락"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleRespond("decline")}
        disabled={isProcessing}
        className="h-8 text-xs"
      >
        거절
      </Button>
    </div>
  );
}
