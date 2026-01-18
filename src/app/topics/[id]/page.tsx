import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteSection } from "@/components/debate/VoteSection";
import { OpinionSection } from "@/components/debate/OpinionSection";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface TopicDetailPageProps {
  params: Promise<{ id: string }>;
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

  return {
    title: `${topic.title} - BothSides`,
    description: `${topic.optionA} vs ${topic.optionB} - ${topic.description || "양자택일 토론에 참여해보세요"}`,
  };
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    notFound();
  }

  const authorName = topic.author.nickname || topic.author.name || "익명";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Topic Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary">{CATEGORY_LABELS[topic.category]}</Badge>
            <h1 className="text-2xl font-bold md:text-3xl">{topic.title}</h1>
          </div>
        </div>

        {topic.description && (
          <p className="text-muted-foreground">{topic.description}</p>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={topic.author.image || undefined} />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
          <span>·</span>
          <span>{formatDate(topic.createdAt)}</span>
        </div>

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
      </div>

      {/* Vote Section */}
      <VoteSection
        topicId={topic.id}
        optionA={topic.optionA}
        optionB={topic.optionB}
      />

      {/* Opinions Section */}
      <OpinionSection
        topicId={topic.id}
        optionA={topic.optionA}
        optionB={topic.optionB}
      />
    </div>
  );
}
