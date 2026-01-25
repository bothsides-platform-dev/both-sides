"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TopicAuthorSectionProps {
  topicId: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  viewCount: number;
}

export function TopicAuthorSection({
  topicId,
  authorId,
  authorName,
  authorImage,
  isAnonymous: initialIsAnonymous,
  createdAt,
  viewCount,
}: TopicAuthorSectionProps) {
  const { data: session } = useSession();
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = session?.user?.id === authorId;

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
        </Link>
      )}
      {isOwner && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleToggleAnonymity}
          disabled={isUpdating}
        >
          {isAnonymous ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              익명
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              공개
            </>
          )}
        </Button>
      )}
      <span>·</span>
      <span>{formatDate(createdAt)}</span>
      <span>·</span>
      <span className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        {viewCount.toLocaleString()}
      </span>
    </div>
  );
}
