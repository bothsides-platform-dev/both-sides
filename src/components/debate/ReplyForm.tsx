"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

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
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; error: string | null }>({
    isSubmitting: false,
    error: null,
  });
  const { showRateLimitError } = useToast();

  const handleSubmit = async () => {
    if (!body.trim()) return;

    setSubmitState({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/opinions/${parentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isAnonymous: isLoggedIn ? isAnonymous : true }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        showRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
        setSubmitState({ isSubmitting: false, error: null });
        return;
      }

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
    <div className="mt-2 ml-6 p-2.5 bg-muted/30 rounded-lg border border-border/50">
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

      <div className="space-y-1.5">
        <div className="flex gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (!submitState.isSubmitting && body.trim()) {
                  handleSubmit();
                }
              } else if (e.key === "Escape") {
                onCancel();
              }
            }}
            placeholder="답글을 입력하세요"
            className="min-h-[60px] md:min-h-[80px] resize-none text-sm md:text-base"
            maxLength={1000}
          />
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              className="h-10 w-10 md:h-8 md:w-8 shrink-0"
              onClick={handleSubmit}
              disabled={submitState.isSubmitting || !body.trim()}
              aria-label="답글 전송"
            >
              {submitState.isSubmitting ? (
                <Loader2 className="h-4 w-4 md:h-3.5 md:w-3.5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 md:h-3.5 md:w-3.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 md:h-8 md:w-8 shrink-0"
              onClick={onCancel}
              aria-label="답글 취소"
            >
              <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {isLoggedIn ? (
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
          ) : (
            <span className="text-xs text-muted-foreground/80">손님으로 작성됩니다</span>
          )}
          <span className="text-xs text-muted-foreground">
            {body.length} / 1000
          </span>
        </div>
      </div>
    </div>
  );
}
