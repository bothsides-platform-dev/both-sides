"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostChallengeDialog } from "./PostChallengeDialog";

interface PostChallengeButtonProps {
  postId: string;
  commentId: string;
  commentUserId: string;
  commentUserName: string;
  onSuccess: () => void;
}

export function PostChallengeButton({
  postId,
  commentId,
  commentUserId,
  commentUserName,
  onSuccess,
}: PostChallengeButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
        onClick={() => setShowDialog(true)}
        title="맞짱 도전"
      >
        <Swords className="h-3 w-3" />
      </Button>

      {showDialog && (
        <PostChallengeDialog
          postId={postId}
          challengedId={commentUserId}
          challengedName={commentUserName}
          sourceCommentId={commentId}
          onClose={() => setShowDialog(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
