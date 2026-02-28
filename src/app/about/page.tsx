import type { Metadata } from "next";
import Link from "next/link";
import type { Category } from "@prisma/client";
import {
  Vote,
  MessageSquare,
  Award,
  Users,
  Swords,
  Target,
  Trophy,
  Zap,
  TrendingUp,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "BothSides는 A vs B 양자택일 토론 플랫폼입니다. 다양한 주제로 투표하고, 의견을 나누고, 맞짱 배틀에 도전해보세요.",
  openGraph: {
    title: "서비스 소개 - BothSides",
    description:
      "A vs B, 당신의 선택은? 양자택일 토론에 투표하고, 의견을 나누고, 1:1 맞짱 배틀에 도전하세요.",
  },
};

const features = [
  {
    icon: Vote,
    title: "양자택일 투표",
    description:
      "A와 B, 두 가지 선택지 중 하나를 골라 투표하세요. 실시간으로 다른 사람들의 선택을 확인할 수 있습니다.",
    accent: "sideA" as const,
  },
  {
    icon: MessageSquare,
    title: "의견 나누기",
    description:
      "투표 후 자신의 선택 이유를 의견으로 남기고, 다른 사람들의 생각에 공감하거나 답글을 달아보세요.",
    accent: "sideB" as const,
  },
  {
    icon: Award,
    title: "뱃지 시스템",
    description:
      "투표, 의견 작성, 토론 참여 등 활동에 따라 다양한 뱃지를 획득할 수 있습니다.",
    accent: "sideA" as const,
  },
  {
    icon: Users,
    title: "누구나 참여",
    description:
      "카카오 로그인으로 간편하게 가입하고, 직접 토론 주제를 만들어 다른 사람들의 의견을 들어보세요.",
    accent: "sideB" as const,
  },
];

const battleSteps = [
  {
    icon: Target,
    step: 1,
    title: "도전 신청",
    description: "토론 주제에서 반대 의견을 가진 상대에게 맞짱을 걸 수 있습니다",
  },
  {
    icon: Zap,
    step: 2,
    title: "실시간 배틀",
    description: "턴제로 근거를 주고받으며 상대의 HP를 깎는 실시간 토론 대결",
  },
  {
    icon: Trophy,
    step: 3,
    title: "AI 판정",
    description: "AI가 근거의 타당성을 평가하고 승패를 판정합니다",
  },
];

async function getStats() {
  const [topics, votes, opinions, users] = await Promise.all([
    prisma.topic.count(),
    prisma.vote.count(),
    prisma.opinion.count(),
    prisma.user.count(),
  ]);
  return { topics, votes, opinions, users };
}

const stats = [
  { icon: Vote, label: "투표", accent: "sideA" as const },
  { icon: MessageSquare, label: "의견", accent: "sideB" as const },
  { icon: TrendingUp, label: "토론 주제", accent: "sideA" as const },
  { icon: Users, label: "참여자", accent: "sideB" as const },
];

export default async function AboutPage() {
  const data = await getStats();
  const statValues = [data.votes, data.opinions, data.topics, data.users];

  return (
    <div className="mx-auto max-w-5xl space-y-16 sm:space-y-20 py-8 sm:py-12">
      {/* Hero */}
      <section className="text-center space-y-5">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-sideA">Both</span>
          <span className="text-sideB">Sides</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          <span className="text-sideA font-semibold">A</span>
          {" vs "}
          <span className="text-sideB font-semibold">B</span>
          , 당신의 선택은?
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto">
          세상의 모든 양자택일, 투표하고 토론하는 플랫폼
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge variant="sideA">A</Badge>
          <span className="text-sm font-bold text-muted-foreground">vs</span>
          <Badge variant="sideB">B</Badge>
        </div>
      </section>

      {/* Live Stats */}
      <section className="rounded-xl bg-muted/50 p-6 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  stat.accent === "sideA" ? "bg-sideA/10" : "bg-sideB/10"
                )}
              >
                <stat.icon
                  className={cn(
                    "h-5 w-5",
                    stat.accent === "sideA" ? "text-sideA" : "text-sideB"
                  )}
                />
              </div>
              <span className="text-2xl font-bold tabular-nums">
                {statValues[i].toLocaleString("ko-KR")}
              </span>
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* What is BothSides */}
      <section className="space-y-6 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold">
          양자택일 토론이란?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          &quot;짜장면 vs 짬뽕&quot;, &quot;아침형 vs 저녁형&quot; 같은
          일상적인 질문부터 사회적 이슈까지, 두 가지 선택지 중 하나를 고르고
          서로의 이유를 나누는 토론 방식입니다. BothSides에서 다양한 사람들의
          생각을 만나보세요.
        </p>
        <div className="mx-auto max-w-sm rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            <div className="bg-sideA/10 p-4 text-center">
              <span className="font-bold text-sideA">짜장면</span>
            </div>
            <div className="px-3 font-bold text-sm text-muted-foreground">
              VS
            </div>
            <div className="bg-sideB/10 p-4 text-center">
              <span className="font-bold text-sideB">짬뽕</span>
            </div>
          </div>
        </div>
      </section>

      {/* 맞짱 배틀 */}
      <section className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Swords className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl sm:text-2xl font-semibold">맞짱 배틀</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto text-center leading-relaxed">
          의견이 다른 상대에게 직접 맞짱을 신청하세요! 1:1 실시간 토론 배틀로
          자신의 주장을 펼치고, AI 심판의 판정을 받아보세요.
        </p>
        <div className="rounded-xl border border-orange-200/50 dark:border-orange-800/30 bg-orange-50/30 dark:bg-orange-950/10 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {battleSteps.map((step) => (
              <Card key={step.step} className="text-center">
                <CardContent className="p-5 pt-5 space-y-3">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <step.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    STEP {step.step}
                  </Badge>
                  <h3 className="font-semibold text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-center">
          주요 기능
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6 pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      feature.accent === "sideA"
                        ? "bg-sideA/10"
                        : "bg-sideB/10"
                    )}
                  >
                    <feature.icon
                      className={cn(
                        "h-5 w-5",
                        feature.accent === "sideA"
                          ? "text-sideA"
                          : "text-sideB"
                      )}
                    />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-6 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold">다양한 카테고리</h2>
        <p className="text-muted-foreground">
          관심 있는 분야의 토론에 참여해보세요
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {(Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][]).map(
            ([key, meta]) => {
              const Icon = meta.icon;
              return (
                <Link
                  key={key}
                  href={`/explore?category=${CATEGORY_TO_SLUG[key]}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-shadow hover:shadow-md cursor-pointer",
                    meta.bgColor,
                    meta.color
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </Link>
              );
            }
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6 pb-8">
        <div className="mx-auto max-w-2xl rounded-xl border p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-semibold">
            지금 토론에 참여해보세요
          </h2>
          <p className="mt-2 text-muted-foreground">
            당신의 한 표가 토론의 방향을 바꿉니다
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" variant="sideA">
              <Link href="/" className="inline-flex items-center gap-2">
                <Vote className="h-4 w-4" />
                투표하러 가기
              </Link>
            </Button>
            <Button asChild size="lg" variant="sideBOutline">
              <Link
                href="/topics/new"
                className="inline-flex items-center gap-2"
              >
                <PenSquare className="h-4 w-4" />
                토론 만들기
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
