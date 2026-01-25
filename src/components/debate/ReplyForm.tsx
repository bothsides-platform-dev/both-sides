"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplyFormProps {
  parentId: string;
  topicId: string;
  onSuccess: () => void;
  onCancel: () => void;
  userVoteSide?: "A" | "B";
  optionA: string;
  optionB: string;
}

export function ReplyForm({
  parentId,
  onSuccess,
  onCancel,
  userVoteSide,
  optionA,
  optionB,
}: ReplyFormProps) {
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; error: string | null }>({
    isSubmitting: false,
    error: null,
  });

  const handleSubmit = async () => {
    if (!body.trim() || body.length < 10) return;

    setSubmitState({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/opinions/${parentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isAnonymous }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error);
      }

      setBody("");
      setIsAnonymous(false);
      setSubmitState({ isSubmitting: false, error: null });
      onSuccess();
    } catch (err) {
      setSubmitState({
        isSubmitting: false,
        error: err instanceof Error ? err.message : "답글 작성에 실패했습니다.",
      });
    }
  };

  return (
    <div className="mt-3 ml-8 p-3 bg-muted/30 rounded-lg border border-border/50">
      {submitState.error && (
        <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive mb-2">
          {submitState.error}
        </div>
      )}
      
      {userVoteSide && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className={cn(
            "px-2 py-0.5 rounded-md font-medium",
            userVoteSide === "A" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
          )}>
            {userVoteSide === "A" ? optionA : optionB}
          </span>
          측으로 답글을 작성합니다
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="답글을 입력하세요 (최소 10자)"
            className="min-h-[60px] resize-none text-sm"
            maxLength={1000}
          />
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleSubmit}
              disabled={submitState.isSubmitting || body.length < 10}
            >
              {submitState.isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={onCancel}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`reply-anonymous-${parentId}`}
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <Label
              htmlFor={`reply-anonymous-${parentId}`}
              className="text-xs font-normal cursor-pointer text-muted-foreground"
            >
              익명으로 작성
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {body.length} / 1000
          </span>
        </div>
      </div>
    </div>
  );
}
