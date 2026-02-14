"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { incrementPageViews, shouldShowNPSPrompt, recordSubmission } from "@/lib/nps";
import { cn } from "@/lib/utils";

export function NPSPrompt() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const isFirstRender = useRef(true);
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track page navigation
  useEffect(() => {
    if (!mounted) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    incrementPageViews();
    if (shouldShowNPSPrompt()) {
      setIsOpen(true);
    }
  }, [pathname, mounted]);

  const resetForm = () => {
    setScore(null);
    setComment("");
  };

  const handleSubmit = async () => {
    if (score === null) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/site-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          comment: comment || undefined,
          pathname,
        }),
      });

      if (!response.ok) {
        throw new Error("리뷰 전송에 실패했습니다.");
      }

      recordSubmission();
      showToast("소중한 의견 감사합니다!", "success");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "리뷰 전송에 실패했습니다.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getScoreLabel = (value: number) => {
    if (value <= 6) return "개선이 필요해요";
    if (value <= 8) return "괜찮아요";
    return "추천해요!";
  };

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>BothSides를 친구에게 추천하시겠어요?</DialogTitle>
          <DialogDescription>
            0점(전혀 아니다)부터 10점(매우 그렇다)까지 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Score buttons */}
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <Button
                key={i}
                type="button"
                variant={score === i ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-10 w-full p-0 text-sm font-medium",
                  score === i && i <= 6 && "bg-red-500 hover:bg-red-600 border-red-500",
                  score === i && i >= 7 && i <= 8 && "bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-black",
                  score === i && i >= 9 && "bg-green-500 hover:bg-green-600 border-green-500"
                )}
                onClick={() => setScore(i)}
              >
                {i}
              </Button>
            ))}
          </div>

          {/* Score label */}
          {score !== null && (
            <p className="text-center text-sm text-muted-foreground">
              {score}점 - {getScoreLabel(score)}
            </p>
          )}

          {/* Optional comment */}
          {score !== null && (
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <Label htmlFor="nps-comment">
                추가 의견 <span className="text-muted-foreground">(선택)</span>
              </Label>
              <Textarea
                id="nps-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="더 나은 서비스를 위한 의견을 남겨주세요"
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/500
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            다음에
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={score === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                전송 중...
              </>
            ) : (
              "제출"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
