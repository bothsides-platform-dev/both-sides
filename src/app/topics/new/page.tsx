"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ReferenceLinkInput, type ReferenceLink } from "@/components/ui/ReferenceLinkInput";
import { CATEGORY_META, CATEGORY_SLUG_MAP } from "@/lib/constants";
import { trackTopicCreate } from "@/lib/analytics";
import { Loader2 } from "lucide-react";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

function NewTopicForm() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const categoryParam = searchParams.get("category");
  const initialCategory = categoryParam ? CATEGORY_SLUG_MAP[categoryParam] ?? undefined : undefined;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(initialCategory);
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/signin");
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
      imageUrl: imageUrl || undefined,
      deadline: deadlineValue ? new Date(deadlineValue).toISOString() : undefined,
      referenceLinks: validReferenceLinks.length > 0 ? validReferenceLinks : undefined,
      isAnonymous,
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

      // Track topic creation event
      const category = formData.get("category") as string;
      if (category) {
        trackTopicCreate(category);
      }

      router.push(`/topics/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>새 토론 만들기</CardTitle>
          <CardDescription>
            A vs B 양자택일 토론을 만들어 다양한 의견을 들어보세요
          </CardDescription>
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
                defaultValue={keyword || ""}
                placeholder="예: 짜장면 vs 짬뽕, 당신의 선택은?"
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="토론에 대한 추가 설명을 입력하세요"
                maxLength={500}
                rows={8}
                className="min-h-[200px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="optionA" className="text-sideA">
                  A 옵션 *
                </Label>
                <Input
                  id="optionA"
                  name="optionA"
                  placeholder="예: 짜장면"
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
                  placeholder="예: 짬뽕"
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
              <Label>썸네일 이미지 (선택)</Label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                disabled={isSubmitting}
                onUploadingChange={setIsImageUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">마감 기한 (선택)</Label>
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
                익명으로 작성 (내 이름을 숨깁니다)
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isImageUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                "토론 만들기"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewTopicForm />
    </Suspense>
  );
}
