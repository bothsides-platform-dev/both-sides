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

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  variant?: "icon" | "button";
}

export function ShareButton({
  url,
  title,
  description,
  imageUrl,
  className,
  variant = "button",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { shareKakao } = useKakao();

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
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTwitterShare = () => {
    const text = `${title}${description ? ` - ${description}` : ""}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
  };

  const handleKakaoShare = () => {
    shareKakao({
      title,
      description,
      imageUrl: fullImageUrl,
      url: fullUrl,
    });
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
        <DropdownMenuItem onClick={handleKakaoShare}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-5.52 0-10 3.59-10 8 0 2.82 1.88 5.3 4.7 6.7-.2.73-.72 2.63-.82 3.04-.13.5.18.5.38.36.16-.1 2.5-1.7 3.53-2.39.71.11 1.45.17 2.21.17 5.52 0 10-3.59 10-8s-4.48-8-10-8z" />
          </svg>
          카카오톡
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
