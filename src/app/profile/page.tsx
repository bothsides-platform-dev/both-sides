"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { UserBadges } from "@/components/badges/UserBadges";
import { BadgeShowcase } from "@/components/badges/BadgeShowcase";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { getNextBadge } from "@/lib/badges";
import { fetcher } from "@/lib/fetcher";
import { Loader2, MessageSquare, Vote, Pencil, ListChecks, Heart } from "lucide-react";
import Link from "next/link";
import type { Category, Side } from "@prisma/client";
import type { EarnedBadge, BadgeProgress, UserActivityStats } from "@/lib/badges";

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

interface ProfileData {
  votesCount: number;
  opinionsCount: number;
  topicsCount: number;
  reactionsCount: number;
  joinOrder?: number | null;
  votes: VoteItem[];
  opinions: OpinionItem[];
  topics: TopicItem[];
  badges: EarnedBadge[];
  badgeProgress: BadgeProgress[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData, isLoading, mutate } = useSWR<{ data: ProfileData }>(
    session?.user ? "/api/profile" : null,
    fetcher
  );

  const handleEditSuccess = () => {
    setIsEditing(false);
    mutate(); // Refresh profile data
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  const user = session.user;
  const displayName = user.nickname || user.name || "사용자";
  const profile = profileData?.data;

  // Get next achievable badge
  const nextBadge = profile
    ? getNextBadge({
        votesCount: profile.votesCount,
        opinionsCount: profile.opinionsCount,
        topicsCount: profile.topicsCount,
        reactionsCount: profile.reactionsCount,
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            <ProfileEditForm
              onCancel={() => setIsEditing(false)}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <div className="space-y-4">
              {/* Profile Info */}
              <div className="flex items-center gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h1 className="text-xl sm:text-2xl font-bold">{displayName}</h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {profile?.joinOrder && (
                    <p className="text-sm text-muted-foreground">
                      {profile.joinOrder}번째 가입자
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-sm">
                    <span className="flex items-center gap-1">
                      <Vote className="h-4 w-4" />
                      {profile?.votesCount ?? 0}개 투표
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {profile?.opinionsCount ?? 0}개 의견
                    </span>
                    <span className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      {profile?.topicsCount ?? 0}개 토론
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {profile?.reactionsCount ?? 0}개 반응
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  aria-label="프로필 편집"
                  className="shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              {/* Badges */}
              {profile?.badges && profile.badges.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <UserBadges badges={profile.badges} maxDisplay={4} />
                    {profile.badgeProgress && (
                      <BadgeShowcase
                        stats={{
                          votesCount: profile.votesCount,
                          opinionsCount: profile.opinionsCount,
                          topicsCount: profile.topicsCount,
                          reactionsCount: profile.reactionsCount,
                        }}
                      />
                    )}
                  </div>
                  {nextBadge && (
                    <p className="text-xs text-muted-foreground">
                      💡 다음 목표: {nextBadge.name} ({nextBadge.progress.percentage}% 달성)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Tabs */}
      <Tabs defaultValue="votes">
        <TabsList>
          <TabsTrigger value="votes">내 투표</TabsTrigger>
          <TabsTrigger value="opinions">내 의견</TabsTrigger>
          <TabsTrigger value="topics">내 토론</TabsTrigger>
        </TabsList>

        <TabsContent value="votes">
          {profile?.votes?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                아직 투표한 토론이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile?.votes?.map((vote: VoteItem) => (
              <Link key={vote.id} href={`/topics/${vote.topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{vote.topic.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[vote.topic.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                        <span suppressHydrationWarning>{formatRelativeTime(vote.createdAt)}</span>
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
          {profile?.opinions?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                아직 작성한 의견이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile?.opinions?.map((opinion: OpinionItem) => (
              <Link key={opinion.id} href={`/topics/${opinion.topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-medium">{opinion.topic.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {opinion.body}
                      </p>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {formatRelativeTime(opinion.createdAt)}
                      </span>
                    </div>
                    <Badge className="ml-4 shrink-0" variant={opinion.side === "A" ? "sideA" : "sideB"}>
                      {opinion.side}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="topics">
          {profile?.topics?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                아직 만든 토론이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile?.topics?.map((topic: TopicItem) => (
              <Link key={topic.id} href={`/topics/${topic.id}`} className="block mb-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{topic.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{topic.optionA} vs {topic.optionB}</span>
                        <span suppressHydrationWarning>{formatRelativeTime(topic.createdAt)}</span>
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
      </Tabs>
    </div>
  );
}
