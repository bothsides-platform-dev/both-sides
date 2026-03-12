"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { VideoUrlInput } from "@/components/posts/VideoUrlInput";
import { CATEGORY_META } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];

function NewPostForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

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

    const data = {
      title,
      body,
      category: selectedCategory,
      images: images.length > 0 ? images : undefined,
      videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      isAnonymous,
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "게시글 생성에 실패했습니다.");
      }

      router.push(`/posts/${result.data.id}`);
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
          <CardTitle>자유글 작성</CardTitle>
          <CardDescription>
            자유롭게 생각을 나누고, 이미지와 동영상도 함께 공유하세요
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
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
                minLength={2}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
            </div>

            <div className="space-y-2">
              <Label>카테고리 *</Label>
              <Select
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
            </div>

            <div className="space-y-2">
              <Label>내용 *</Label>
              <RichTextEditor
                content={body}
                onChange={setBody}
                placeholder="자유롭게 작성하세요..."
              />
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
              <Label>동영상 URL (선택)</Label>
              <VideoUrlInput
                value={videoUrls}
                onChange={setVideoUrls}
                disabled={isSubmitting}
              />
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
                익명으로 작성 (내 이름을 숨깁니다)
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isImageUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  작성 중...
                </>
              ) : (
                "자유글 작성"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewPostForm />
    </Suspense>
  );
}
