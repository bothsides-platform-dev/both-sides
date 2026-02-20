"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { MAX_COMMENT_LENGTH } from "@/modules/battles/constants";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    nickname: string | null;
    name: string | null;
    image: string | null;
  };
};

interface BattleObserverCommentsProps {
  battleId: string;
  comments: Comment[];
  isLoggedIn: boolean;
  onCommentAdded?: () => void;
}

export function BattleObserverComments({
  battleId,
  comments,
  isLoggedIn,
  onCommentAdded,
}: BattleObserverCommentsProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/battles/${battleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "댓글 작성에 실패했습니다.");
      }

      setContent("");
      onCommentAdded?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t">
      <h4 className="text-sm font-medium px-3 py-2 border-b">관전 댓글</h4>

      <div className="max-h-[200px] overflow-y-auto p-3 space-y-2">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            아직 댓글이 없습니다.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback className="text-[10px]">
                  {(comment.user.nickname || comment.user.name || "?")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium">
                  {comment.user.nickname || comment.user.name}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5" suppressHydrationWarning>
                  {new Date(comment.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoggedIn && (
        <div className="flex gap-2 p-3 border-t">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="응원 댓글을 남겨보세요..."
            maxLength={MAX_COMMENT_LENGTH}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
