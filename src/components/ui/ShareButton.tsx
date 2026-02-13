"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKakao } from "@/components/providers/KakaoProvider";
import { useToast } from "@/components/ui/toast";
import { trackShare, addUTMParams } from "@/lib/analytics";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  variant?: "icon" | "button";
  topicId?: string;
}

export function ShareButton({
  url,
  title,
  description,
  imageUrl,
  className,
  variant = "button",
  topicId,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { shareKakao } = useKakao();
  const { showToast } = useToast();

  // Extract topicId from URL if not provided
  const extractedTopicId = topicId || (() => {
    const match = url.match(/\/topics\/([^/?]+)/);
    return match ? match[1] : undefined;
  })();

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const fullImageUrl = (() => {
    if (!imageUrl) return undefined;
    if (typeof window === "undefined") return imageUrl;
    // Vercel Blob URL 등 이미 절대 URL인 경우 그대로 사용
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    return `${window.location.origin}${imageUrl}`;
  })();

  const handleCopyLink = async () => {
    try {
      const urlWithUTM = addUTMParams(fullUrl, "link", extractedTopicId);
      await navigator.clipboard.writeText(urlWithUTM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("링크가 복사되었습니다", "success", 2000);

      // Track share event
      if (extractedTopicId) {
        trackShare("link", extractedTopicId);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("링크 복사에 실패했습니다", "error", 2000);
    }
  };

  const handleTwitterShare = () => {
    const urlWithUTM = addUTMParams(fullUrl, "twitter", extractedTopicId);
    const text = `${title}${description ? ` - ${description}` : ""}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(urlWithUTM)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    
    // Track share event
    if (extractedTopicId) {
      trackShare("twitter", extractedTopicId);
    }
  };

  const handleFacebookShare = () => {
    const urlWithUTM = addUTMParams(fullUrl, "facebook", extractedTopicId);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlWithUTM)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
    
    // Track share event
    if (extractedTopicId) {
      trackShare("facebook", extractedTopicId);
    }
  };

  const handleKakaoShare = () => {
    const urlWithUTM = addUTMParams(fullUrl, "kakao", extractedTopicId);
    shareKakao({
      title,
      description,
      imageUrl: fullImageUrl,
      url: urlWithUTM,
    });
    
    // Track share event
    if (extractedTopicId) {
      trackShare("kakao", extractedTopicId);
    }
  };

  const handleInstagramShare = async () => {
    try {
      const urlWithUTM = addUTMParams(fullUrl, "instagram", extractedTopicId);
      await navigator.clipboard.writeText(urlWithUTM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        showToast("링크가 복사되었습니다. 인스타그램 스토리나 DM에 붙여넣기 해주세요!", "success", 3000);
        // 인스타그램 앱 열기 시도
        window.location.href = "instagram://app";
      } else {
        showToast("링크가 복사되었습니다. 인스타그램에서 붙여넣기 해주세요!", "success", 3000);
      }
      
      // Track share event
      if (extractedTopicId) {
        trackShare("instagram", extractedTopicId);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("링크 복사에 실패했습니다", "error", 2000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", className)}
            aria-label="공유하기"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="mr-2 h-4 w-4" />
            공유
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              복사됨!
            </>
          ) : (
            <>
              <Link2 className="mr-2 h-4 w-4" />
              링크 복사
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleKakaoShare}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-5.52 0-10 3.59-10 8 0 2.82 1.88 5.3 4.7 6.7-.2.73-.72 2.63-.82 3.04-.13.5.18.5.38.36.16-.1 2.5-1.7 3.53-2.39.71.11 1.45.17 2.21.17 5.52 0 10-3.59 10-8s-4.48-8-10-8z" />
          </svg>
          카카오톡
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInstagramShare}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          인스타그램
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
