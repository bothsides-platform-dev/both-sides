"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { ReferenceLinkInput, type ReferenceLink } from "@/components/ui/ReferenceLinkInput";
import { CATEGORY_META } from "@/lib/constants";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

export default function AdminTopicNewPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const deadlineValue = formData.get("deadline") as string;
    const validReferenceLinks = referenceLinks.filter((link) => link.url.trim());

    const data = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      optionA: formData.get("optionA"),
      optionB: formData.get("optionB"),
      category: formData.get("category"),
      images: images.length > 0 ? images : undefined,
      deadline: deadlineValue ? new Date(deadlineValue).toISOString() : undefined,
      referenceLinks: validReferenceLinks.length > 0 ? validReferenceLinks : undefined,
      isAnonymous,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    };

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "토론 생성에 실패했습니다.");
      }

      router.push("/admin/topics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/admin/topics"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        토론 목록으로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>새 토론 만들기</CardTitle>
          <CardDescription>새 토론을 만들고 예약 발행 시각을 설정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">토론 제목 *</Label>
              <Input
                id="title"
                name="title"
                required
                minLength={5}
                maxLength={100}
                placeholder="예: 짜장면 vs 짬뽕, 당신의 선택은?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                maxLength={1000}
                rows={8}
                className="min-h-[200px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="optionA" className="text-sideA">
                  A 옵션 *
                </Label>
                <Input
                  id="optionA"
                  name="optionA"
                  required
                  maxLength={30}
                  className="border-sideA/30 focus:border-sideA"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">{optionA.length}/30</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionB" className="text-sideB">
                  B 옵션 *
                </Label>
                <Input
                  id="optionB"
                  name="optionB"
                  required
                  maxLength={30}
                  className="border-sideB/30 focus:border-sideB"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">{optionB.length}/30</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                name="category"
                required
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                          {meta.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_META[selectedCategory].description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>이미지 (최대 5개)</Label>
              <MultiImageUpload
                value={images}
                onChange={setImages}
                disabled={isSubmitting}
                onUploadingChange={setIsImageUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">마감 기한</Label>
              <Input
                id="deadline"
                name="deadline"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                비워두면 무기한 토론이 됩니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">예약 발행 시각</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                설정하면 해당 시각이 될 때 자동으로 공개됩니다. 비워두면 즉시 공개 상태입니다.
              </p>
            </div>

            <ReferenceLinkInput
              value={referenceLinks}
              onChange={setReferenceLinks}
              disabled={isSubmitting}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label
                htmlFor="isAnonymous"
                className="text-sm font-normal cursor-pointer"
              >
                익명으로 표시 (작성자 이름을 숨깁니다)
              </Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/topics")}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting || isImageUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "토론 만들기"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
