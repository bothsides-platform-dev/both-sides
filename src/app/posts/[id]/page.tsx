import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CATEGORY_TO_SLUG } from "@/lib/constants";
import { TopicImageGallery } from "@/components/topics/TopicImageGallery";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PostViewCountTracker } from "@/components/posts/PostViewCountTracker";
import { PostCommentSection } from "@/components/posts/PostCommentSection";
import { RichTextContent } from "@/components/editor/RichTextContent";
import { VideoEmbed } from "@/components/editor/VideoEmbed";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, MessageSquare, User } from "lucide-react";
import Image from "next/image";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

const getPost = cache(async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
          isBlacklisted: true,
          selectedBadgeId: true,
        },
      },
      _count: { select: { comments: true } },
    },
  });
});

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return { title: "게시글을 찾을 수 없습니다" };
  }

  // Strip HTML tags for description
  const plainText = post.body.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: post.title,
    description: plainText,
    openGraph: {
      title: post.title,
      description: plainText,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post || post.isHidden) {
    notFound();
  }

  const authorName = post.isAnonymous
    ? "익명"
    : (post.author.nickname || post.author.name || "익명");

  const galleryImages = (Array.isArray(post.images) && post.images.length > 0)
    ? (post.images as string[])
    : post.imageUrl
      ? [post.imageUrl]
      : [];

  const videoUrls = Array.isArray(post.videoUrls) ? (post.videoUrls as string[]) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-5 md:space-y-8">
      <PostViewCountTracker postId={post.id} />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: CATEGORY_LABELS[post.category], href: `/explore?category=${CATEGORY_TO_SLUG[post.category]}` },
          { label: post.title },
        ]}
      />

      {/* Post Header */}
      <div className="space-y-4 md:space-y-6 border-b border-border pb-5 md:pb-8">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">자유글</Badge>
            <Badge variant="secondary">{CATEGORY_LABELS[post.category]}</Badge>
          </div>
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold leading-tight">{post.title}</h1>
        </div>

        {/* Author Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.isAnonymous ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : post.author.image ? (
              <Image
                src={post.author.image}
                alt={authorName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <span className="text-sm font-medium">{authorName}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span suppressHydrationWarning>{formatRelativeTime(post.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post._count.comments}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {galleryImages.length > 0 && (
          <TopicImageGallery images={galleryImages} title={post.title} />
        )}

        {/* Rich Text Body */}
        <RichTextContent html={post.body} />

        {/* Video Embeds */}
        {videoUrls.length > 0 && (
          <div className="space-y-4">
            {videoUrls.map((url, i) => (
              <VideoEmbed key={i} url={url} />
            ))}
          </div>
        )}
      </div>

      {/* Comment Section */}
      <PostCommentSection postId={post.id} />
    </div>
  );
}
