"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CATEGORY_LABELS } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_LABELS) as [Category, string][];

interface Topic {
  id: string;
  title: string;
  description: string | null;
  optionA: string;
  optionB: string;
  category: Category;
  imageUrl: string | null;
  deadline: string | null;
  isHidden: boolean;
  isFeatured: boolean;
  isAnonymous?: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
}

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function AdminTopicEditPage({ params }: PageParams) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);

  const { data, isLoading } = useSWR<{ data: Topic }>(
    session?.user?.role === "ADMIN" ? `/api/admin/topics/${id}` : null,
    fetcher
  );

  const topic = data?.data;

  useEffect(() => {
    if (topic?.imageUrl) {
      setImageUrl(topic.imageUrl);
    }
    if (topic?.isAnonymous !== undefined) {
      setIsAnonymous(topic.isAnonymous);
    }
    // SEO 필드: 저장된 값이 있으면 사용, 없으면 자동 생성 기본값 사용
    if (topic) {
      const defaultMetaTitle = topic.title;
      const defaultMetaDescription = topic.description?.trim()
        ? `${CATEGORY_LABELS[topic.category]} · ${topic.optionA} vs ${topic.optionB} · ${topic.description.trim()}`
        : `${CATEGORY_LABELS[topic.category]} · ${topic.optionA} vs ${topic.optionB} · 당신의 선택은?`;

      setMetaTitle(topic.metaTitle || defaultMetaTitle);
      setMetaDescription(topic.metaDescription || defaultMetaDescription);
      setOgImageUrl(topic.ogImageUrl || "");
    }
  }, [topic]);

  if (sessionStatus === "loading" || isLoading) {
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

  if (!topic) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        토론을 찾을 수 없습니다.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const deadlineValue = formData.get("deadline") as string;

    const updateData = {
      title: formData.get("title"),
      description: formData.get("description") || null,
      optionA: formData.get("optionA"),
      optionB: formData.get("optionB"),
      category: formData.get("category"),
      imageUrl: imageUrl || null,
      deadline: deadlineValue ? new Date(deadlineValue).toISOString() : null,
      isAnonymous,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      ogImageUrl: ogImageUrl || null,
    };

    try {
      const res = await fetch(`/api/admin/topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "토론 수정에 실패했습니다.");
      }

      router.push("/admin/topics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDatetimeLocal = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
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
          <CardTitle>토론 수정</CardTitle>
          <CardDescription>토론 정보를 수정합니다.</CardDescription>
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
                defaultValue={topic.title}
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={topic.description || ""}
                maxLength={500}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="optionA" className="text-blue-600">
                  A 옵션 *
                </Label>
                <Input
                  id="optionA"
                  name="optionA"
                  defaultValue={topic.optionA}
                  required
                  maxLength={50}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionB" className="text-red-600">
                  B 옵션 *
                </Label>
                <Input
                  id="optionB"
                  name="optionB"
                  defaultValue={topic.optionB}
                  required
                  maxLength={50}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select name="category" defaultValue={topic.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
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
              <Label>썸네일 이미지</Label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
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
                defaultValue={formatDatetimeLocal(topic.deadline)}
              />
              <p className="text-xs text-muted-foreground">
                비워두면 무기한 토론이 됩니다
              </p>
            </div>

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

            {/* SEO 설정 섹션 */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">SEO 설정</h3>
              <p className="text-xs text-muted-foreground">
                검색엔진 최적화를 위한 메타 정보를 설정합니다. 비워두면 자동으로 생성됩니다.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaTitle">메타 타이틀</Label>
                  <span className={`text-xs ${metaTitle.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                    {metaTitle.length}/60
                  </span>
                </div>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={60}
                  placeholder="검색 결과에 표시될 제목"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaDescription">메타 설명</Label>
                  <span className={`text-xs ${metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                    {metaDescription.length}/160
                  </span>
                </div>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  placeholder="검색 결과에 표시될 설명"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImageUrl">OG 이미지 URL</Label>
                <Input
                  id="ogImageUrl"
                  type="url"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {ogImageUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImageUrl}
                      alt="OG 이미지 미리보기"
                      className="h-auto w-full max-h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  소셜 미디어 공유 시 표시되는 이미지입니다. 비워두면 자동 생성됩니다.
                </p>
              </div>
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
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
