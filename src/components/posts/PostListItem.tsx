"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, MessageSquare, FileText } from "lucide-react";
import { CATEGORY_META } from "@/lib/constants";
import type { Category } from "@prisma/client";

export interface PostListItemProps {
  post: {
    id: string;
    title: string;
    body: string;
    category: Category;
    createdAt: string | Date;
    imageUrl?: string | null;
    viewCount: number;
    _count: {
      comments: number;
    };
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 100);
}

export const PostListItem = memo(function PostListItem({ post }: PostListItemProps) {
  const meta = CATEGORY_META[post.category];
  const Icon = meta.icon;
  const preview = stripHtml(post.body);

  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <div className={`relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-md hidden md:block ${post.imageUrl ? "bg-muted/50" : "bg-muted/30"}`}>
        {post.imageUrl ? (
          <>
            <Image
              src={post.imageUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover blur-2xl scale-110 opacity-70"
              aria-hidden="true"
            />
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover z-[1]"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-2xs font-medium text-primary">
              <FileText className="h-3 w-3" aria-hidden="true" />
              자유글
            </span>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-2xs font-medium ${meta.bgColor} ${meta.color}`}>
              <Icon className="h-3 w-3" aria-hidden="true" />
              {meta.label}
            </span>
            <h4 className="min-w-0 flex-1 truncate font-medium">
              {post.title}
            </h4>
          </div>
          <span className="shrink-0 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{post.viewCount}</span>
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {preview}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 text-sm text-muted-foreground md:flex">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.viewCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {post._count.comments}
        </span>
        <span className="hidden md:block md:w-16 md:text-right" suppressHydrationWarning>
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
    </Link>
  );
});
