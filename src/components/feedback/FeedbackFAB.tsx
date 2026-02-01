"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEEDBACK_CATEGORY_LABELS } from "@/lib/constants";
import { MessageSquareText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { FeedbackCategory } from "@prisma/client";

export function FeedbackFAB() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("SUGGESTION");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");

  const resetForm = () => {
    setCategory("SUGGESTION");
    setContent("");
    setEmail("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (content.length < 10) {
      showToast("내용은 10자 이상이어야 합니다.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          content,
          email: email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "피드백 전송에 실패했습니다.");
      }

      showToast("소중한 의견 감사합니다!", "success");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "피드백 전송에 실패했습니다.",
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

  return (
    <>
      {/* FAB 버튼 */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg z-40 hover:scale-105 transition-transform"
        size="icon"
        aria-label="의견 보내기"
      >
        <MessageSquareText className="h-6 w-6" />
      </Button>

      {/* 모달 */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>의견 보내기</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <Label htmlFor="category">유형</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as FeedbackCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 내용 입력 */}
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="의견을 입력해주세요 (10자 이상)"
                className="min-h-[120px] resize-none"
                maxLength={2000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length}/2000
              </p>
            </div>

            {/* 이메일 입력 (비로그인 시만) */}
            {!session && (
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-muted-foreground">(선택)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="답변받을 이메일 주소"
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  "보내기"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
