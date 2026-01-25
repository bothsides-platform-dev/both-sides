"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opinionId: string;
  onReportSuccess?: () => void;
}

export function ReportDialog({
  open,
  onOpenChange,
  opinionId,
  onReportSuccess,
}: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const characterCount = reason.length;
  const isValidLength = characterCount >= 10 && characterCount <= 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLength) {
      setError("신고 사유는 10자 이상 500자 이하로 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/opinions/${opinionId}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "신고 접수에 실패했습니다.");
      }

      // Success
      alert("신고가 접수되었습니다.");
      setReason("");
      onOpenChange(false);
      onReportSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "신고 접수에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setReason("");
        setError("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>의견 신고</DialogTitle>
          <DialogDescription>
            부적절한 의견을 신고해주세요. 신고 사유를 구체적으로 작성해주시면 검토에 도움이 됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">신고 사유</Label>
              <Textarea
                id="reason"
                placeholder="신고 사유를 입력해주세요 (10-500자)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-xs">
                <span
                  className={
                    characterCount < 10
                      ? "text-muted-foreground"
                      : isValidLength
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {characterCount}/500자
                  {characterCount > 0 && characterCount < 10 && " (최소 10자)"}
                  {characterCount > 500 && " (최대 500자 초과)"}
                </span>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isValidLength || isSubmitting}
            >
              {isSubmitting ? "신고 중..." : "신고하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
