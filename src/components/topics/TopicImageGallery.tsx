"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicImageGalleryProps {
  images: string[];
  title: string;
}

export function TopicImageGallery({ images, title }: TopicImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  // Single image — render simply
  if (images.length === 1) {
    return (
      <div className="w-full overflow-hidden rounded-xl">
        <Image
          src={images[0]}
          alt={title}
          width={1920}
          height={1080}
          className="h-auto w-full rounded-xl"
          priority
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
    );
  }

  // Multiple images — gallery with navigation
  const goTo = (index: number) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <Image
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}/${images.length}`}
          width={1920}
          height={1080}
          className="h-auto w-full rounded-xl"
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, 720px"
        />

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label="이전 이미지"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => goTo(currentIndex + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label="다음 이미지"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Counter badge */}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
              index === currentIndex
                ? "border-primary ring-1 ring-primary/30"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
            aria-label={`이미지 ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          >
            <Image
              src={url}
              alt={`${title} 썸네일 ${index + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
