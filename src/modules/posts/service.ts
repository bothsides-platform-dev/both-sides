import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { AUTHOR_SELECT, POST_COUNT_SELECT } from "@/lib/prisma-selects";
import type { CreatePostInput, GetPostsInput } from "./schema";

export async function createPost(authorId: string, input: CreatePostInput) {
  const { images, videoUrls, ...rest } = input;
  const imageUrl = images?.[0] ?? null;

  return prisma.post.create({
    data: {
      ...rest,
      imageUrl,
      images: images ? (images as Prisma.InputJsonValue) : undefined,
      videoUrls: videoUrls ? (videoUrls as Prisma.InputJsonValue) : undefined,
      authorId,
    },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: POST_COUNT_SELECT },
    },
  });
}

export async function getPosts(input: GetPostsInput) {
  const { page, limit, category, sort } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isHidden: false };
  if (category) where.category = category;

  const orderBy =
    sort === "popular"
      ? { viewCount: "desc" as const }
      : { createdAt: "desc" as const };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        authorId: true,
        imageUrl: true,
        images: true,
        videoUrls: true,
        isHidden: true,
        isAnonymous: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: AUTHOR_SELECT },
        _count: { select: POST_COUNT_SELECT },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: POST_COUNT_SELECT },
    },
  });

  if (!post) {
    throw new NotFoundError("게시글을 찾을 수 없습니다.");
  }

  return post;
}

export async function incrementPostViewCount(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to increment post view count", { postId, error });
    return { success: false };
  }
}

export async function updatePostHidden(id: string, isHidden: boolean) {
  return prisma.post.update({
    where: { id },
    data: {
      isHidden,
      hiddenAt: isHidden ? new Date() : null,
    },
  });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}
