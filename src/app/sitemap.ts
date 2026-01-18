import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";

  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const homeLastModified = topics[0]?.updatedAt ?? topics[0]?.createdAt;

  const entries: MetadataRoute.Sitemap = [
    {
      url: new URL("/", siteUrl).toString(),
      ...(homeLastModified ? { lastModified: homeLastModified } : {}),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...topics.map((t) => ({
      url: new URL(`/topics/${t.id}`, siteUrl).toString(),
      lastModified: t.updatedAt ?? t.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return entries;
}


