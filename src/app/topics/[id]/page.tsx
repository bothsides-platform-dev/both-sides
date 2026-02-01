import { cache } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { VoteSection } from "@/components/debate/VoteSection";
import { OpinionSection } from "@/components/debate/OpinionSection";
import { TopicShareButton } from "@/components/topics/TopicShareButton";
import { TopicAuthorSection } from "@/components/topics/TopicAuthorSection";
import { ViewCountTracker } from "@/components/topics/ViewCountTracker";
import { InAppBrowserRedirect } from "@/components/InAppBrowserRedirect";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ReferenceLinksCollapsible } from "@/components/topics/ReferenceLinksCollapsible";

interface ReferenceLink {
  url: string;
  title?: string;
}

interface TopicDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ highlightReply?: string }>;
}

// Use React.cache() to deduplicate getTopic calls between generateMetadata and page component
const getTopic = cache(async (id: string) => {
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
          isBlacklisted: true,
        },
      },
    },
  });

  return topic;
});

export async function generateMetadata({ params }: TopicDetailPageProps) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return { title: "토론을 찾을 수 없습니다" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";
  const canonicalUrl = new URL(`/topics/${id}`, siteUrl);

  // SEO 필드 우선, 없으면 기존 로직 fallback
  const title = topic.metaTitle || topic.title;
  const description = topic.metaDescription || (topic.description?.trim()
    ? `${CATEGORY_LABELS[topic.category]} · ${topic.optionA} vs ${topic.optionB} · ${topic.description.trim()}`
    : `${CATEGORY_LABELS[topic.category]} · ${topic.optionA} vs ${topic.optionB} · 당신의 선택은?`);

  // 커스텀 OG 이미지 URL이 있으면 사용, 없으면 자동 생성 URL
  const ogImageUrl = topic.ogImageUrl
    ? new URL(topic.ogImageUrl)
    : new URL(`/topics/${id}/opengraph-image`, siteUrl);
  const twitterImageUrl = topic.ogImageUrl
    ? new URL(topic.ogImageUrl)
    : new URL(`/topics/${id}/twitter-image`, siteUrl);

  const authorName = topic.author.nickname || topic.author.name || "익명";

  return {
    title,
    description,
    keywords: [
      topic.optionA,
      topic.optionB,
      CATEGORY_LABELS[topic.category],
      "토론",
      "양자택일",
      "찬반",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "BothSides",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: topic.title,
        },
      ],
      type: "article",
      publishedTime: topic.createdAt.toISOString(),
      modifiedTime: topic.updatedAt.toISOString(),
      authors: topic.isAnonymous ? undefined : [authorName],
      section: CATEGORY_LABELS[topic.category],
      tags: [topic.optionA, topic.optionB, CATEGORY_LABELS[topic.category]],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImageUrl],
    },
  };
}

export default async function TopicDetailPage({ params, searchParams }: TopicDetailPageProps) {
  const { id } = await params;
  const { highlightReply } = await searchParams;
  const topic = await getTopic(id);

  if (!topic) {
    notFound();
  }

  const authorName = topic.isAnonymous 
    ? "익명" 
    : (topic.author.nickname || topic.author.name || "익명");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";
  const canonicalUrl = new URL(`/topics/${topic.id}`, siteUrl).toString();

  // JSON-LD 구조화 데이터: SEO 필드 우선 적용
  const jsonLdDescription = topic.metaDescription || topic.description || `${topic.optionA} vs ${topic.optionB}`;
  const jsonLdImage = topic.ogImageUrl || `${siteUrl}/topics/${topic.id}/opengraph-image`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: topic.metaTitle || topic.title,
    description: jsonLdDescription,
    datePublished: topic.createdAt.toISOString(),
    dateModified: topic.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    image: jsonLdImage,
    inLanguage: "ko",
    keywords: [topic.optionA, topic.optionB, CATEGORY_LABELS[topic.category]].join(", "),
    articleSection: CATEGORY_LABELS[topic.category],
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ViewAction",
      userInteractionCount: topic.viewCount,
    },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <InAppBrowserRedirect />
      <ViewCountTracker topicId={topic.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Topic Header */}
      <div className="space-y-6 border-b border-border pb-8">
        <div className="space-y-3">
          <Badge variant="secondary">{CATEGORY_LABELS[topic.category]}</Badge>
          <h1 className="text-2xl font-bold md:text-4xl">{topic.title}</h1>
        </div>

        {/* Author & Share - 제목 바로 아래 */}
        <TopicAuthorSection
          topicId={topic.id}
          authorId={topic.author.id}
          authorName={authorName}
          authorImage={topic.author.image}
          isAnonymous={topic.isAnonymous}
          isBlacklisted={topic.author.isBlacklisted}
          createdAt={topic.createdAt}
          viewCount={topic.viewCount}
          shareButton={
            <TopicShareButton
              topicId={topic.id}
              title={topic.title}
              optionA={topic.optionA}
              optionB={topic.optionB}
              imageUrl={topic.imageUrl}
            />
          }
        />

        {/* Hero Image */}
        {topic.imageUrl && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
            <Image
              src={topic.imageUrl}
              alt={topic.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Description - 더 눈에 띄는 색상 */}
        {topic.description && (
          <p className="text-lg leading-relaxed text-foreground/80">{topic.description}</p>
        )}
      </div>

      {/* Vote Section */}
      <VoteSection
        topicId={topic.id}
        optionA={topic.optionA}
        optionB={topic.optionB}
        deadline={topic.deadline}
      />

      {/* Reference Links */}
      {topic.referenceLinks && Array.isArray(topic.referenceLinks) && (topic.referenceLinks as unknown as ReferenceLink[]).length > 0 && (
        <ReferenceLinksCollapsible
          links={topic.referenceLinks as unknown as ReferenceLink[]}
        />
      )}

      {/* Opinions Section */}
      <OpinionSection
        topicId={topic.id}
        optionA={topic.optionA}
        optionB={topic.optionB}
        highlightReplyId={highlightReply}
      />
    </div>
  );
}
