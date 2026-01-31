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
import { formatDDay } from "@/lib/utils";
import { ReferenceLinksCollapsible } from "@/components/topics/ReferenceLinksCollapsible";
import { Clock } from "lucide-react";

interface ReferenceLink {
  url: string;
  title?: string;
}

interface TopicDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ highlightReply?: string }>;
}

async function getTopic(id: string) {
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
}

export async function generateMetadata({ params }: TopicDetailPageProps) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return { title: "토론을 찾을 수 없습니다" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";
  const canonicalUrl = new URL(`/topics/${id}`, siteUrl);

  const title = topic.title;
  const description = topic.description?.trim()
    ? `${CATEGORY_LABELS[topic.category]} · ${topic.optionA} vs ${topic.optionB} · ${topic.description.trim()}`
    : `${CATEGORY_LABELS[topic.category]} · ${topic.optionA} vs ${topic.optionB} · 당신의 선택은?`;

  const ogImageUrl = new URL(`/topics/${id}/opengraph-image`, siteUrl);
  const twitterImageUrl = new URL(`/topics/${id}/twitter-image`, siteUrl);

  return {
    title,
    description,
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

  const dDay = formatDDay(topic.deadline ?? null);

  const authorName = topic.isAnonymous 
    ? "익명" 
    : (topic.author.nickname || topic.author.name || "익명");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";
  const canonicalUrl = new URL(`/topics/${topic.id}`, siteUrl).toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: topic.title,
    description: topic.description ?? undefined,
    datePublished: topic.createdAt.toISOString(),
    dateModified: topic.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <InAppBrowserRedirect />
      <ViewCountTracker topicId={topic.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Topic Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{CATEGORY_LABELS[topic.category]}</Badge>
              {dDay && (
                <Badge variant={dDay === "마감" ? "secondary" : "default"} className="shrink-0">
                  <Clock className="mr-1 h-3 w-3" />
                  {dDay}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">{topic.title}</h1>
          </div>
          <TopicShareButton
            topicId={topic.id}
            title={topic.title}
            optionA={topic.optionA}
            optionB={topic.optionB}
            imageUrl={topic.imageUrl}
          />
        </div>

        {topic.description && (
          <p className="text-muted-foreground">{topic.description}</p>
        )}

        {/* Reference Links */}
        {topic.referenceLinks && Array.isArray(topic.referenceLinks) && (topic.referenceLinks as unknown as ReferenceLink[]).length > 0 && (
          <ReferenceLinksCollapsible
            links={topic.referenceLinks as unknown as ReferenceLink[]}
          />
        )}

        <TopicAuthorSection
          topicId={topic.id}
          authorId={topic.author.id}
          authorName={authorName}
          authorImage={topic.author.image}
          isAnonymous={topic.isAnonymous}
          isBlacklisted={topic.author.isBlacklisted}
          createdAt={topic.createdAt}
          viewCount={topic.viewCount}
        />

        {/* Options Display */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex-1 rounded-xl bg-blue-50 p-6 text-center">
            <span className="text-xs font-medium text-blue-500">A</span>
            <p className="mt-1 text-lg font-bold text-blue-700">{topic.optionA}</p>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          <div className="flex-1 rounded-xl bg-red-50 p-6 text-center">
            <span className="text-xs font-medium text-red-500">B</span>
            <p className="mt-1 text-lg font-bold text-red-700">{topic.optionB}</p>
          </div>
        </div>

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
      </div>

      {/* Vote Section */}
      <VoteSection
        topicId={topic.id}
        optionA={topic.optionA}
        optionB={topic.optionB}
        deadline={topic.deadline}
      />

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
