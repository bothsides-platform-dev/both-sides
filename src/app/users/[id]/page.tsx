import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { UserProfileClient } from "./UserProfileClient";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      nickname: true,
      name: true,
      _count: {
        select: {
          votes: true,
          opinions: true,
          topics: true,
        },
      },
    },
  });

  if (!user) {
    return { title: "사용자를 찾을 수 없습니다" };
  }

  const displayName = user.nickname || user.name || "사용자";
  const description = `${displayName}님의 활동: 투표 ${user._count.votes}개, 의견 ${user._count.opinions}개, 토픽 ${user._count.topics}개`;

  return {
    title: `${displayName}의 프로필`,
    description,
    openGraph: {
      title: `${displayName}의 프로필 - BothSides`,
      description,
    },
    robots: {
      index: false,
    },
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  return <UserProfileClient userId={id} />;
}
