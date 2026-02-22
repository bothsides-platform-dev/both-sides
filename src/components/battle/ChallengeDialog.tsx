"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Swords, Loader2 } from "lucide-react";

interface ChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  challengedId: string;
  challengedOpinionId?: string;
  challengerOpinionId?: string;
}

export function ChallengeDialog({
  open,
  onOpenChange,
  topicId,
  challengedId,
  challengedOpinionId,
  challengerOpinionId,
}: ChallengeDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/battles/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          challengedId,
          challengedOpinionId,
          challengerOpinionId,
          challengeMessage: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "맞짱 신청에 실패했습니다.");
      }

      showToast("맞짱 신청 완료! 상대방이 수락하면 배틀이 시작됩니다.", "success");
      onOpenChange(false);
      setMessage("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "맞짱 신청에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-orange-500" />
            맞짱 신청
          </DialogTitle>
          <DialogDescription>
            상대방에게 1:1 토론 배틀을 신청합니다. 상대방이 수락하면 AI 호스트가 진행하는 실시간 배틀이 시작됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              도발 메시지 (선택)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="상대방에게 한마디..."
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Swords className="h-4 w-4 mr-2" />
            )}
            맞짱 신청
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
