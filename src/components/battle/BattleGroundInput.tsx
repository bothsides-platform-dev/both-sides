"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface BattleGroundInputProps {
  battleId: string;
  isMyTurn: boolean;
  isActive: boolean;
}

export function BattleGroundInput({
  battleId,
  isMyTurn,
  isActive,
}: BattleGroundInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isActive) return null;

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/battles/${battleId}/grounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "근거 제출에 실패했습니다.");
      }

      setContent("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "근거 제출에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isMyTurn) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t p-3">
      {isMyTurn ? (
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="근거를 입력하세요... (Shift+Enter로 줄바꿈)"
            maxLength={2000}
            rows={2}
            className="resize-none flex-1"
            disabled={isSubmitting}
          />
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            size="icon"
            className="shrink-0 self-end"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-2">
          상대방의 차례입니다. 잠시만 기다려주세요...
        </p>
      )}
    </div>
  );
}
