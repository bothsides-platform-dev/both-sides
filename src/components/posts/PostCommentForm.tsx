"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

interface PostCommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function PostCommentForm({ postId, parentId, onSuccess, onCancel, placeholder }: PostCommentFormProps) {
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = parentId
        ? `/api/post-comments/${parentId}/replies`
        : `/api/posts/${postId}/comments`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim(), isAnonymous }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "댓글 작성에 실패했습니다.");
      }

      setBody("");
      setIsAnonymous(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? (session?.user ? "댓글을 입력하세요..." : "비회원으로 댓글을 작성합니다...")}
        maxLength={1000}
        rows={3}
        className="resize-none"
      />

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`anonymous-${parentId || "root"}`}
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label
                htmlFor={`anonymous-${parentId || "root"}`}
                className="text-xs font-normal cursor-pointer"
              >
                익명
              </Label>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{body.length}/1000</span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting || !body.trim()}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
