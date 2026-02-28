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
import { Swords, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION_OPTIONS, DURATION_LABELS } from "@/modules/battles/constants";
import type { Side } from "@prisma/client";

interface ChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  challengedId: string;
  challengedOpinionId?: string;
  challengerOpinionId?: string;
  challengedSide: Side;
  optionA: string;
  optionB: string;
}

export function ChallengeDialog({
  open,
  onOpenChange,
  topicId,
  challengedId,
  challengedOpinionId,
  challengerOpinionId,
  challengedSide,
  optionA,
  optionB,
}: ChallengeDialogProps) {
  const [message, setMessage] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number>(DURATION_OPTIONS[1]); // default 10min
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const challengerSide: Side = challengedSide === "A" ? "B" : "A";
  const challengerOptionText = challengerSide === "A" ? optionA : optionB;

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
          durationSeconds,
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
          {/* Side display */}
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-sm font-medium mb-1">당신의 입장</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-bold px-2 py-0.5 rounded",
                challengerSide === "A"
                  ? "bg-sideA/20 text-sideA"
                  : "bg-sideB/20 text-sideB"
              )}>
                {challengerSide === "A" ? "A" : "B"}
              </span>
              <span className="text-sm">{challengerOptionText}</span>
            </div>
          </div>

          {/* Duration picker */}
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              배틀 시간
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDurationSeconds(option)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-colors",
                    durationSeconds === option
                      ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                      : "border-border hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/10"
                  )}
                >
                  {DURATION_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

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
