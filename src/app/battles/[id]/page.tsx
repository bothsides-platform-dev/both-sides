import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BattleClient } from "./BattleClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const battle = await prisma.battle.findUnique({
    where: { id },
    include: {
      topic: { select: { title: true } },
      challenger: { select: { nickname: true, name: true } },
      challenged: { select: { nickname: true, name: true } },
    },
  });

  if (!battle || battle.isHidden) return { title: "맞짱을 찾을 수 없습니다" };

  const challengerName = battle.challenger.nickname || battle.challenger.name || "도전자";
  const challengedName = battle.challenged.nickname || battle.challenged.name || "상대";

  return {
    title: `${challengerName} vs ${challengedName} - 맞짱 | BothSides`,
    description: `${battle.topic.title} - 맞짱 배틀`,
  };
}

export default async function BattlePage({ params }: Props) {
  const { id } = await params;

  const battle = await prisma.battle.findUnique({
    where: { id },
    select: { id: true, isHidden: true },
  });

  if (!battle || battle.isHidden) notFound();

  return <BattleClient battleId={id} />;
}
