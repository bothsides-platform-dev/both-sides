import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { AUTHOR_SELECT, TOPIC_COUNT_SELECT, POST_COUNT_SELECT } from "@/lib/prisma-selects";
import type { Category } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const category = searchParams.get("category") as Category | null;
    const sort = searchParams.get("sort") || "latest";
    const type = searchParams.get("type") || "all"; // all | debate | post

    const skip = (page - 1) * limit;

    const topicWhere: Record<string, unknown> = {
      isHidden: false,
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: new Date() } },
      ],
    };
    if (category) topicWhere.category = category;

    const postWhere: Record<string, unknown> = { isHidden: false };
    if (category) postWhere.category = category;

    const orderBy = sort === "popular"
      ? { viewCount: "desc" as const }
      : { createdAt: "desc" as const };

    if (type === "debate") {
      const [topics, total] = await Promise.all([
        prisma.topic.findMany({
          where: topicWhere,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true, title: true, description: true,
            optionA: true, optionB: true, category: true,
            authorId: true, imageUrl: true, images: true,
            isAnonymous: true, viewCount: true, createdAt: true,
            author: { select: AUTHOR_SELECT },
            _count: { select: TOPIC_COUNT_SELECT },
          },
        }),
        prisma.topic.count({ where: topicWhere }),
      ]);

      return Response.json({
        data: {
          items: topics.map((t) => ({ type: "topic" as const, data: t })),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    }

    if (type === "post") {
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: postWhere,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true, title: true, body: true, category: true,
            authorId: true, imageUrl: true, images: true,
            isAnonymous: true, viewCount: true, createdAt: true,
            author: { select: AUTHOR_SELECT },
            _count: { select: POST_COUNT_SELECT },
          },
        }),
        prisma.post.count({ where: postWhere }),
      ]);

      return Response.json({
        data: {
          items: posts.map((p) => ({ type: "post" as const, data: p })),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    }

    // type === "all": Merge topics and posts
    const halfLimit = Math.ceil(limit / 2);

    const [topics, posts, totalTopics, totalPosts] = await Promise.all([
      prisma.topic.findMany({
        where: topicWhere,
        orderBy,
        skip: Math.floor(skip / 2),
        take: halfLimit,
        select: {
          id: true, title: true, description: true,
          optionA: true, optionB: true, category: true,
          authorId: true, imageUrl: true, images: true,
          isAnonymous: true, viewCount: true, createdAt: true,
          author: { select: AUTHOR_SELECT },
          _count: { select: TOPIC_COUNT_SELECT },
        },
      }),
      prisma.post.findMany({
        where: postWhere,
        orderBy,
        skip: Math.floor(skip / 2),
        take: halfLimit,
        select: {
          id: true, title: true, body: true, category: true,
          authorId: true, imageUrl: true, images: true,
          isAnonymous: true, viewCount: true, createdAt: true,
          author: { select: AUTHOR_SELECT },
          _count: { select: POST_COUNT_SELECT },
        },
      }),
      prisma.topic.count({ where: topicWhere }),
      prisma.post.count({ where: postWhere }),
    ]);

    const items = [
      ...topics.map((t) => ({ type: "topic" as const, data: t, createdAt: new Date(t.createdAt) })),
      ...posts.map((p) => ({ type: "post" as const, data: p, createdAt: new Date(p.createdAt) })),
    ];

    if (sort === "popular") {
      items.sort((a, b) => (b.data.viewCount ?? 0) - (a.data.viewCount ?? 0));
    } else {
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const total = totalTopics + totalPosts;

    return Response.json({
      data: {
        items: items.slice(0, limit).map(({ type, data }) => ({ type, data })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
