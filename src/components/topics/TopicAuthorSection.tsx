"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, User, MoreVertical, Flag, Ban, Share2, Link2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { ReportDialog } from "@/components/debate/ReportDialog";
import { useKakao } from "@/components/providers/KakaoProvider";
import { useToast } from "@/components/ui/toast";
import { trackShare, addUTMParams } from "@/lib/analytics";

interface TopicAuthorSectionProps {
  topicId: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  authorBadgeId?: string | null;
  isAnonymous: boolean;
  isBlacklisted?: boolean;
  createdAt: Date;
  viewCount: number;
  shareButton?: React.ReactNode;
  shareUrl?: string;
  shareTitle?: string;
  shareDescription?: string;
  shareImageUrl?: string;
}

export function TopicAuthorSection({
  topicId,
  authorId,
  authorName,
  authorImage,
  authorBadgeId,
  isAnonymous: initialIsAnonymous,
  isBlacklisted,
  createdAt,
  viewCount,
  shareButton,
  shareUrl,
  shareTitle,
  shareDescription,
  shareImageUrl,
}: TopicAuthorSectionProps) {
  const { data: session } = useSession();
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { shareKakao } = useKakao();
  const { showToast } = useToast();

  const isOwner = session?.user?.id === authorId;
  const isLoggedIn = !!session?.user;

  const handleToggleAnonymity = async () => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/topics/${topicId}/anonymity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: !isAnonymous }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "익명 상태 변경에 실패했습니다.");
      }

      setIsAnonymous(!isAnonymous);
    } catch (error) {
      console.error("Failed to toggle anonymity:", error);
      showToast(error instanceof Error ? error.message : "익명 상태 변경에 실패했습니다.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getFullUrl = () => {
    if (!shareUrl) return "";
    return typeof window !== "undefined" ? `${window.location.origin}${shareUrl}` : shareUrl;
  };

  const getFullImageUrl = () => {
    if (!shareImageUrl) return undefined;
    if (typeof window === "undefined") return shareImageUrl;
    if (shareImageUrl.startsWith("http://") || shareImageUrl.startsWith("https://")) return shareImageUrl;
    return `${window.location.origin}${shareImageUrl}`;
  };

  const handleCopyLink = async () => {
    const fullUrl = getFullUrl();
    if (!fullUrl) return;
    try {
      const urlWithUTM = addUTMParams(fullUrl, "link", topicId);
      await navigator.clipboard.writeText(urlWithUTM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("링크가 복사되었습니다", "success", 2000);
      trackShare("link", topicId);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("링크 복사에 실패했습니다", "error", 2000);
    }
  };

  const handleKakaoShare = () => {
    const fullUrl = getFullUrl();
    if (!fullUrl) return;
    const urlWithUTM = addUTMParams(fullUrl, "kakao", topicId);
    const result = shareKakao({
      title: shareTitle || "",
      description: shareDescription,
      imageUrl: getFullImageUrl(),
      url: urlWithUTM,
    });
    if (!result.success && result.fallbackMessage) {
      showToast(result.fallbackMessage, "warning");
    }
    trackShare("kakao", topicId);
  };

  const handleInstagramShare = async () => {
    const fullUrl = getFullUrl();
    if (!fullUrl) return;
    try {
      const urlWithUTM = addUTMParams(fullUrl, "instagram", topicId);
      await navigator.clipboard.writeText(urlWithUTM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        showToast("링크가 복사되었습니다. 인스타그램 스토리나 DM에 붙여넣기 해주세요!", "success", 3000);
        window.location.href = "instagram://app";
      } else {
        showToast("링크가 복사되었습니다. 인스타그램에서 붙여넣기 해주세요!", "success", 3000);
      }
      trackShare("instagram", topicId);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("링크 복사에 실패했습니다", "error", 2000);
    }
  };

  const handleTwitterShare = () => {
    const fullUrl = getFullUrl();
    if (!fullUrl) return;
    const urlWithUTM = addUTMParams(fullUrl, "twitter", topicId);
    const text = `${shareTitle || ""}${shareDescription ? ` - ${shareDescription}` : ""}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(urlWithUTM)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    trackShare("twitter", topicId);
  };

  const handleFacebookShare = () => {
    const fullUrl = getFullUrl();
    if (!fullUrl) return;
    const urlWithUTM = addUTMParams(fullUrl, "facebook", topicId);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlWithUTM)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
    trackShare("facebook", topicId);
  };

  return (
    <div className="flex items-center justify-between">
      {/* 좌측: 작성자 정보 */}
      <div className="flex items-center gap-3">
        {isAnonymous ? (
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Link href={`/users/${authorId}`} className="hover:opacity-80 transition-opacity">
            <Avatar className="h-10 w-10" badgeId={authorBadgeId}>
              <AvatarImage src={authorImage || undefined} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {isAnonymous ? (
              <span className="font-medium text-foreground">{authorName}</span>
            ) : (
              <Link href={`/users/${authorId}`} className="font-medium text-foreground hover:underline">
                {authorName}
              </Link>
            )}
            {isBlacklisted && (
              <Badge variant="outline" className="text-2xs px-1.5 py-0 text-destructive border-destructive/50">
                <Ban className="h-2.5 w-2.5 mr-0.5" />
                차단된 사용자
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span suppressHydrationWarning>{formatDate(createdAt)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 우측: 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 공유 버튼: 데스크톱에서만 표시 */}
        <div className="hidden sm:block">
          {shareButton}
        </div>

        {/* 더보기 메뉴: 모바일에서는 항상, 데스크톱에서는 로그인 시만 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 text-muted-foreground hover:text-foreground",
                !isLoggedIn && "sm:hidden"
              )}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">더보기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* 모바일 전용 공유 서브메뉴 */}
            {shareUrl && (
              <div className="sm:hidden">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Share2 className="h-4 w-4 mr-2" />
                    공유하기
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
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
                    <DropdownMenuItem onClick={handleKakaoShare} className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3c-5.52 0-10 3.59-10 8 0 2.82 1.88 5.3 4.7 6.7-.2.73-.72 2.63-.82 3.04-.13.5.18.5.38.36.16-.1 2.5-1.7 3.53-2.39.71.11 1.45.17 2.21.17 5.52 0 10-3.59 10-8s-4.48-8-10-8z" />
                      </svg>
                      카카오톡
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleInstagramShare} className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      인스타그램
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X (Twitter)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {isLoggedIn && <DropdownMenuSeparator />}
              </div>
            )}
            {isOwner && (
              <DropdownMenuItem
                onClick={handleToggleAnonymity}
                disabled={isUpdating}
                className="cursor-pointer"
              >
                {isAnonymous ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    공개로 전환
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    익명으로 전환
                  </>
                )}
              </DropdownMenuItem>
            )}
            {isLoggedIn && (
              <DropdownMenuItem
                onClick={() => setIsReportDialogOpen(true)}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <Flag className="h-4 w-4 mr-2" />
                토론 신고하기
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        targetId={topicId}
        targetType="topic"
      />
    </div>
  );
}
