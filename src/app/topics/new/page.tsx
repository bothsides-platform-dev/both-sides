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
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { ReferenceLinkInput, type ReferenceLink } from "@/components/ui/ReferenceLinkInput";
import { CATEGORY_META, CATEGORY_SLUG_MAP } from "@/lib/constants";
import { trackTopicCreate } from "@/lib/analytics";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

type TopicType = "BINARY" | "MULTIPLE" | "NUMERIC";

const TOPIC_TYPE_CONFIG = {
  BINARY: { label: "양자택일 (A vs B)", description: "A와 B 중 하나를 선택하는 토론" },
  MULTIPLE: { label: "다중 선택", description: "3~6개 옵션 중 하나를 선택하는 토론" },
  NUMERIC: { label: "숫자 입력", description: "정수 값을 직접 입력하는 토론" },
} as const;

function NewTopicForm() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const categoryParam = searchParams.get("category");
  const initialCategory = categoryParam ? CATEGORY_SLUG_MAP[categoryParam] ?? undefined : undefined;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(initialCategory);
  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [topicType, setTopicType] = useState<TopicType>("BINARY");

  // MULTIPLE state
  const [multipleOptions, setMultipleOptions] = useState<string[]>(["", "", ""]);

  // NUMERIC state
  const [numericUnit, setNumericUnit] = useState("");
  const [numericMin, setNumericMin] = useState("");
  const [numericMax, setNumericMax] = useState("");

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

  const handleAddOption = () => {
    if (multipleOptions.length < 6) {
      setMultipleOptions([...multipleOptions, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (multipleOptions.length > 3) {
      setMultipleOptions(multipleOptions.filter((_, i) => i !== index));
    }
  };

  const handleMoveOption = (index: number, direction: "up" | "down") => {
    const newOptions = [...multipleOptions];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOptions.length) return;
    [newOptions[index], newOptions[swapIndex]] = [newOptions[swapIndex], newOptions[index]];
    setMultipleOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const deadlineValue = formData.get("deadline") as string;

    const validReferenceLinks = referenceLinks.filter((link) => link.url.trim());

    const data: Record<string, unknown> = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      topicType,
      category: formData.get("category"),
      images: images.length > 0 ? images : undefined,
      deadline: deadlineValue ? new Date(deadlineValue).toISOString() : undefined,
      referenceLinks: validReferenceLinks.length > 0 ? validReferenceLinks : undefined,
      isAnonymous,
    };

    if (topicType === "BINARY") {
      data.optionA = formData.get("optionA");
      data.optionB = formData.get("optionB");
    } else if (topicType === "MULTIPLE") {
      const validOptions = multipleOptions.filter((o) => o.trim());
      if (validOptions.length < 3) {
        setError("다중 선택은 최소 3개 옵션이 필요합니다.");
        setIsSubmitting(false);
        return;
      }
      data.options = validOptions.map((label) => ({ label }));
    } else if (topicType === "NUMERIC") {
      if (!numericUnit.trim()) {
        setError("단위를 입력해주세요.");
        setIsSubmitting(false);
        return;
      }
      data.numericUnit = numericUnit;
      if (numericMin) data.numericMin = parseInt(numericMin);
      if (numericMax) data.numericMax = parseInt(numericMax);
    }

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
            토론을 만들어 다양한 의견을 들어보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Topic Type Selector */}
            <div className="space-y-2">
              <Label>토론 유형</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(TOPIC_TYPE_CONFIG) as [TopicType, typeof TOPIC_TYPE_CONFIG[TopicType]][]).map(
                  ([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTopicType(type)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all text-sm",
                        topicType === type
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                        {config.description}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">토론 제목 *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={keyword || ""}
                placeholder={
                  topicType === "BINARY"
                    ? "예: 짜장면 vs 짬뽕, 당신의 선택은?"
                    : topicType === "MULTIPLE"
                    ? "예: 최고의 프로그래밍 언어는?"
                    : "예: 적당한 축의금은 얼마?"
                }
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
                maxLength={1000}
                rows={8}
                className="min-h-[200px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
            </div>

            {/* BINARY options */}
            {topicType === "BINARY" && (
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
            )}

            {/* MULTIPLE options */}
            {topicType === "MULTIPLE" && (
              <div className="space-y-3">
                <Label>선택지 (3~6개) *</Label>
                {multipleOptions.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-6 shrink-0">
                      {index + 1}.
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...multipleOptions];
                        next[index] = e.target.value;
                        setMultipleOptions(next);
                      }}
                      placeholder={`옵션 ${index + 1}`}
                      maxLength={30}
                      className="flex-1"
                    />
                    <div className="flex gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveOption(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveOption(index, "down")}
                        disabled={index === multipleOptions.length - 1}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveOption(index)}
                        disabled={multipleOptions.length <= 3}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {multipleOptions.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    옵션 추가
                  </Button>
                )}
              </div>
            )}

            {/* NUMERIC settings */}
            {topicType === "NUMERIC" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numericUnit">단위 *</Label>
                  <Input
                    id="numericUnit"
                    placeholder='예: 원, 만원, 세, 개'
                    value={numericUnit}
                    onChange={(e) => setNumericUnit(e.target.value)}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="numericMin">최소값 (선택)</Label>
                    <Input
                      id="numericMin"
                      type="number"
                      placeholder="제한 없음"
                      value={numericMin}
                      onChange={(e) => setNumericMin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numericMax">최대값 (선택)</Label>
                    <Input
                      id="numericMax"
                      type="number"
                      placeholder="제한 없음"
                      value={numericMax}
                      onChange={(e) => setNumericMax(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  참여자들이 숫자를 직접 입력합니다.
                  {numericUnit && ` (단위: ${numericUnit})`}
                </p>
              </div>
            )}

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
              <Label>이미지 (선택, 최대 5개)</Label>
              <MultiImageUpload
                value={images}
                onChange={setImages}
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
