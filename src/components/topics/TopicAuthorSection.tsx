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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, User, MoreVertical, Flag, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ReportDialog } from "@/components/debate/ReportDialog";

interface TopicAuthorSectionProps {
  topicId: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  isAnonymous: boolean;
  isBlacklisted?: boolean;
  createdAt: Date;
  viewCount: number;
}

export function TopicAuthorSection({
  topicId,
  authorId,
  authorName,
  authorImage,
  isAnonymous: initialIsAnonymous,
  isBlacklisted,
  createdAt,
  viewCount,
}: TopicAuthorSectionProps) {
  const { data: session } = useSession();
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

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
      alert(error instanceof Error ? error.message : "익명 상태 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      {isAnonymous ? (
        <>
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
        </>
      ) : (
        <Link href={`/users/${authorId}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-6 w-6">
            <AvatarImage src={authorImage || undefined} />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
          {isBlacklisted && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-destructive border-destructive/50">
              <Ban className="h-2.5 w-2.5 mr-0.5" />
              차단된 사용자
            </Badge>
          )}
        </Link>
      )}
      <span>·</span>
      <span>{formatDate(createdAt)}</span>
      <span>·</span>
      <span className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        {viewCount.toLocaleString()}
      </span>
      {isLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">더보기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
            <DropdownMenuItem
              onClick={() => setIsReportDialogOpen(true)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Flag className="h-4 w-4 mr-2" />
              토론 신고하기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        targetId={topicId}
        targetType="topic"
      />
    </div>
  );
}
