"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Loader2, X, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOPIC_MAX_IMAGES } from "@/lib/constants";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)";
  }
  if (file.size > MAX_SIZE) {
    return `파일 크기가 너무 큽니다. (최대 5MB, 현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    return file;
  }
}

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
  maxImages?: number;
}

export function MultiImageUpload({
  value,
  onChange,
  disabled,
  onUploadingChange,
  maxImages = TOPIC_MAX_IMAGES,
}: MultiImageUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const isUploading = uploadingCount > 0;
  const canAddMore = value.length < maxImages;

  const updateUploadingCount = useCallback((delta: number) => {
    setUploadingCount((prev) => {
      const next = prev + delta;
      onUploadingChange?.(next > 0);
      return next;
    });
  }, [onUploadingChange]);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    updateUploadingCount(1);
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "업로드에 실패했습니다.");
      }
      return result.data.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
      return null;
    } finally {
      updateUploadingCount(-1);
    }
  }, [updateUploadingCount]);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const remaining = maxImages - value.length;

    if (fileArray.length > remaining) {
      setError(`이미지는 최대 ${maxImages}개까지 업로드할 수 있습니다. (${remaining}개 추가 가능)`);
      return;
    }

    const results = await Promise.all(fileArray.map(uploadFile));
    const newUrls = results.filter((url): url is string => url !== null);
    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
  }, [value, maxImages, uploadFile, onChange]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setError(null);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled || isUploading) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [disabled, isUploading, processFiles]);

  // No images yet — show full drop zone
  if (value.length === 0 && !isUploading) {
    return (
      <div className="space-y-2">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="이미지 업로드 영역"
          aria-disabled={disabled}
          className={cn(
            "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging ? (
            <>
              <Upload className="h-10 w-10 text-primary" />
              <p className="mt-2 text-sm font-medium text-primary">여기에 이미지를 놓으세요</p>
            </>
          ) : (
            <>
              <Plus className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">이미지를 드래그하거나 클릭하여 업로드</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF (최대 5MB, {maxImages}개까지)</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={disabled}
          aria-hidden="true"
        />
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </div>
    );
  }

  // Has images — show grid
  return (
    <div className="space-y-2">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value.map((url, index) => (
          <div key={url} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <Image src={url} alt={`이미지 ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => handleRemove(index)}
              disabled={disabled || isUploading}
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {isUploading && (
          <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {canAddMore && !isUploading && (
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn(
              "flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            aria-label="이미지 추가"
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="mt-1 text-xs text-muted-foreground">{value.length}/{maxImages}</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading || disabled}
        aria-hidden="true"
      />

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
