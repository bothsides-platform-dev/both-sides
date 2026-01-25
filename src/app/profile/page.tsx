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
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { Loader2, MessageSquare, Vote, Pencil } from "lucide-react";
import Link from "next/link";
import type { Category, Side } from "@prisma/client";

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
  votes: VoteItem[];
  opinions: OpinionItem[];
  topics: TopicItem[];
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
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-4 pt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Vote className="h-4 w-4" />
                    {profile?.votesCount ?? 0}개 투표
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {profile?.opinionsCount ?? 0}개 의견
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                aria-label="프로필 편집"
              >
                <Pencil className="h-4 w-4" />
              </Button>
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

        <TabsContent value="votes" className="space-y-5">
          {profile?.votes?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                아직 투표한 토론이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile?.votes?.map((vote: VoteItem) => (
              <Link key={vote.id} href={`/topics/${vote.topic.id}`}>
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

        <TabsContent value="opinions" className="space-y-5">
          {profile?.opinions?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                아직 작성한 의견이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile?.opinions?.map((opinion: OpinionItem) => (
              <Link key={opinion.id} href={`/topics/${opinion.topic.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{opinion.topic.title}</h3>
                      <Badge variant={opinion.side === "A" ? "sideA" : "sideB"}>
                        {opinion.side}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {opinion.body}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(opinion.createdAt)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="topics" className="space-y-5">
          {profile?.topics?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                아직 만든 토론이 없습니다.
              </CardContent>
            </Card>
          ) : (
            profile?.topics?.map((topic: TopicItem) => (
              <Link key={topic.id} href={`/topics/${topic.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{topic.title}</h3>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[topic.category as keyof typeof CATEGORY_LABELS]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{topic.optionA} vs {topic.optionB}</span>
                      <span>{formatRelativeTime(topic.createdAt)}</span>
                    </div>
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
