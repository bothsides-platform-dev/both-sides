"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "업로드에 실패했습니다.");
      }

      onChange(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={value}
            alt="썸네일 미리보기"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isUploading
              ? "cursor-not-allowed border-muted-foreground/25 bg-muted/50"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
          )}
          onClick={() => !isUploading && !disabled && inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">업로드 중...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                클릭하여 이미지 업로드
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF (최대 5MB)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading || disabled}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
