"use client";

import { notFound } from "next/navigation";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { Loader2, MessageSquare, Vote, Heart, ListChecks } from "lucide-react";
import Link from "next/link";
import type { Category, Side, ReactionType } from "@prisma/client";

interface VoteItem {
  id: string;
  side: Side;
  createdAt: string;
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
    category: Category;
  };
}

interface OpinionItem {
  id: string;
  side: Side;
  body: string;
  createdAt: string;
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
  };
}

interface TopicItem {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  category: Category;
  createdAt: string;
}

interface ReactionItem {
  id: string;
  type: ReactionType;
  createdAt: string;
  opinion: {
    id: string;
    body: string;
    side: Side;
    createdAt: string;
    topic: {
      id: string;
      title: string;
      optionA: string;
      optionB: string;
    };
  };
}

interface PublicProfileData {
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
    image?: string | null;
  };
  votes: VoteItem[];
  opinions: OpinionItem[];
  topics: TopicItem[];
  reactions: ReactionItem[];
  votesCount: number;
  opinionsCount: number;
  topicsCount: number;
  reactionsCount: number;
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useSWR<{ data: PublicProfileData }>(
    `/api/users/${params.id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.data) {
    notFound();
  }

  const profile = data.data;
  const displayName = profile.user.nickname || profile.user.name || "사용자";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <div className="flex items-center gap-4 pt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Vote className="h-4 w-4" />
                  {profile.votesCount}개 투표
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {profile.opinionsCount}개 의견
                </span>
                <span className="flex items-center gap-1">
                  <ListChecks className="h-4 w-4" />
                  {profile.topicsCount}개 토픽
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {profile.reactionsCount}개 반응
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Tabs */}
      <Tabs defaultValue="votes">
        <TabsList>
          <TabsTrigger value="votes">투표</TabsTrigger>
          <TabsTrigger value="opinions">의견</TabsTrigger>
          <TabsTrigger value="topics">토픽</TabsTrigger>
          <TabsTrigger value="reactions">반응</TabsTrigger>
        </TabsList>

        <TabsContent value="votes">
          {profile.votes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                공개된 투표가 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile.votes.map((vote: VoteItem) => (
              <Link key={vote.id} href={`/topics/${vote.topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{vote.topic.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[vote.topic.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                        <span>{formatRelativeTime(vote.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant={vote.side === "A" ? "sideA" : "sideB"}>
                      {vote.side === "A" ? vote.topic.optionA : vote.topic.optionB}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="opinions">
          {profile.opinions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                공개된 의견이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile.opinions.map((opinion: OpinionItem) => (
              <Link key={opinion.id} href={`/topics/${opinion.topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-medium">{opinion.topic.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {opinion.body}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(opinion.createdAt)}
                      </span>
                    </div>
                    <Badge className="ml-4 shrink-0" variant={opinion.side === "A" ? "sideA" : "sideB"}>
                      {opinion.side === "A" ? opinion.topic.optionA : opinion.topic.optionB}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="topics">
          {profile.topics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                공개된 토픽이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile.topics.map((topic: TopicItem) => (
              <Link key={topic.id} href={`/topics/${topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{topic.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{topic.optionA} vs {topic.optionB}</span>
                        <span>{formatRelativeTime(topic.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[topic.category as keyof typeof CATEGORY_LABELS]}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="reactions">
          {profile.reactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                공개된 반응이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile.reactions.map((reaction: ReactionItem) => (
              <Link key={reaction.id} href={`/topics/${reaction.opinion.topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-medium">{reaction.opinion.topic.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={reaction.opinion.side === "A" ? "sideA" : "sideB"} className="text-xs">
                          {reaction.opinion.side === "A" ? reaction.opinion.topic.optionA : reaction.opinion.topic.optionB}
                        </Badge>
                        <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                          {reaction.opinion.body}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(reaction.createdAt)}
                      </span>
                    </div>
                    <Badge className="ml-4 shrink-0" variant={reaction.type === "LIKE" ? "default" : "destructive"}>
                      {reaction.type === "LIKE" ? "좋아요" : "싫어요"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
