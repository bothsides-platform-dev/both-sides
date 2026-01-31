import { prisma } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/constants";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";

  const topics = await prisma.topic.findMany({
    where: {
      isHidden: false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      optionA: true,
      optionB: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BothSides - 양자택일 토론 플랫폼</title>
    <link>${siteUrl}</link>
    <description>A vs B, 당신의 선택은? 양자택일 토론 플랫폼에서 의견을 나눠보세요.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${topics
      .map(
        (topic) => `
    <item>
      <title>${escapeXml(topic.title)}</title>
      <link>${siteUrl}/topics/${topic.id}</link>
      <guid isPermaLink="true">${siteUrl}/topics/${topic.id}</guid>
      <pubDate>${topic.createdAt.toUTCString()}</pubDate>
      <description>${escapeXml(
        topic.description || `${topic.optionA} vs ${topic.optionB}`
      )}</description>
      <category>${escapeXml(CATEGORY_LABELS[topic.category])}</category>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
