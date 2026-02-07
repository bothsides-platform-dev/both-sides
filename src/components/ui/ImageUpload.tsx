"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Loader2, X, ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// File validation constants
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Image compression options
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,           // 최대 1MB
  maxWidthOrHeight: 1920, // 최대 크기
  useWebWorker: true,     // Web Worker 사용 (non-blocking)
  fileType: "image/webp" as const, // WebP로 변환
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
  // GIF는 압축하지 않음 (애니메이션 손실 방지)
  if (file.type === "image/gif") return file;

  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch (error) {
    console.error("Image compression failed:", error);
    return file; // 실패 시 원본 사용
  }
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ImageUpload({ value, onChange, disabled, onUploadingChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Helper to update uploading state and notify parent
  const updateUploadingState = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  }, [onUploadingChange]);

  // Shared upload logic - Best Practice 5.7: Put Interaction Logic in Event Handlers
  const processFile = useCallback(async (file: File) => {
    // Clear previous errors on new upload attempt
    setError(null);

    // Pre-upload validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    updateUploadingState(true);

    try {
      // 이미지 압축 (GIF 제외)
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

      onChange(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      updateUploadingState(false);
    }
  }, [onChange, updateUploadingState]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);

    // Reset input for re-upload of same file
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Drag event handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Best Practice 5.9: Use Functional setState Updates
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(() => true);
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
      setIsDragging(() => false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(() => false);
    dragCounterRef.current = 0;

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [disabled, isUploading, processFile]);

  // Paste handler for clipboard image support
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled || isUploading) return;

    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          break;
        }
      }
    }
  }, [disabled, isUploading, processFile]);

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isUploading && !disabled) {
        inputRef.current?.click();
      }
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-950/40 dark:to-red-950/40">
          <Image
            src={value}
            alt="썸네일 미리보기"
            fill
            className="object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="이미지 삭제"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="이미지 업로드 영역. 클릭하거나 이미지를 드래그하여 업로드하세요."
          aria-disabled={disabled || isUploading}
          className={cn(
            "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
            // Best Practice 6.8: Explicit Conditional Rendering with ternary
            isUploading
              ? "cursor-not-allowed border-muted-foreground/25 bg-muted/50"
              : isDragging
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => !isUploading && !disabled && inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">업로드 중...</p>
            </>
          ) : isDragging ? (
            <>
              <Upload className="h-10 w-10 text-primary" />
              <p className="mt-2 text-sm font-medium text-primary">
                여기에 이미지를 놓으세요
              </p>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                이미지를 여기에 드래그하거나 클릭하여 업로드
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
        aria-hidden="true"
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
