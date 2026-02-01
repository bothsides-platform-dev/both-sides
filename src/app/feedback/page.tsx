"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEEDBACK_CATEGORY_LABELS } from "@/lib/constants";
import { Loader2, CheckCircle } from "lucide-react";
import type { FeedbackCategory } from "@prisma/client";

const categories = Object.entries(FEEDBACK_CATEGORY_LABELS) as [
  FeedbackCategory,
  string
][];

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get("category"),
      content: formData.get("content"),
      email: formData.get("email") || undefined,
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "의견 제출에 실패했습니다.");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold">의견이 제출되었습니다</h2>
              <p className="text-muted-foreground">
                소중한 의견 감사합니다. 빠른 시일 내에 검토하겠습니다.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="mt-4"
              >
                추가 의견 작성하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>의견 보내기</CardTitle>
          <CardDescription>
            버그 신고, 기능 제안, 문의 등 무엇이든 남겨주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {session?.user && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <span className="text-muted-foreground">로그인 계정: </span>
                <span className="font-medium">
                  {session.user.nickname || session.user.name || session.user.email}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">의견 유형 *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="의견 내용을 자세히 작성해주세요 (10자 이상)"
                required
                minLength={10}
                maxLength={2000}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                10 ~ 2000자
              </p>
            </div>

            {!session?.user && (
              <div className="space-y-2">
                <Label htmlFor="email">이메일 (선택)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="회신 받으실 이메일 주소"
                />
                <p className="text-xs text-muted-foreground">
                  입력하시면 처리 결과를 안내해 드릴 수 있습니다
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  제출 중...
                </>
              ) : (
                "의견 보내기"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
