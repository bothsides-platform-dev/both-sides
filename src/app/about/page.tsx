import type { Metadata } from "next";
import Link from "next/link";
import { Vote, MessageSquare, Award, Users, ArrowRight, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "BothSides는 A vs B 양자택일 토론 플랫폼입니다. 다양한 주제로 투표하고, 의견을 나누고, 뱃지를 모아보세요.",
  openGraph: {
    title: "서비스 소개 - BothSides",
    description:
      "BothSides는 A vs B 양자택일 토론 플랫폼입니다. 다양한 주제로 투표하고, 의견을 나누고, 뱃지를 모아보세요.",
  },
};

const features = [
  {
    icon: Vote,
    title: "양자택일 투표",
    description:
      "A와 B, 두 가지 선택지 중 하나를 골라 투표하세요. 실시간으로 다른 사람들의 선택을 확인할 수 있습니다.",
  },
  {
    icon: MessageSquare,
    title: "의견 나누기",
    description:
      "투표 후 자신의 선택 이유를 의견으로 남기고, 다른 사람들의 생각에 공감하거나 답글을 달아보세요.",
  },
  {
    icon: Award,
    title: "뱃지 시스템",
    description:
      "투표, 의견 작성, 토론 참여 등 활동에 따라 다양한 뱃지를 획득할 수 있습니다.",
  },
  {
    icon: Users,
    title: "누구나 참여",
    description:
      "카카오 로그인으로 간편하게 가입하고, 직접 토론 주제를 만들어 다른 사람들의 의견을 들어보세요.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-sideA">Both</span>
          <span className="text-sideB">Sides</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          A vs B, 당신의 선택은?
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto">
          세상의 모든 양자택일, 투표하고 토론하는 플랫폼
        </p>
      </section>

      {/* What is BothSides */}
      <section className="space-y-4 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold">양자택일 토론이란?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          &quot;짜장면 vs 짬뽕&quot;, &quot;아침형 vs 저녁형&quot; 같은 일상적인 질문부터
          사회적 이슈까지, 두 가지 선택지 중 하나를 고르고 서로의 이유를 나누는
          토론 방식입니다. BothSides에서 다양한 사람들의 생각을 만나보세요.
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="rounded-lg border bg-card p-4 text-center space-y-2">
            <div className="text-2xl">🎯</div>
            <h3 className="font-semibold text-sm">도전 신청</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              토론 주제에서 반대 의견을 가진 상대에게 맞짱을 걸 수 있습니다
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center space-y-2">
            <div className="text-2xl">⚔️</div>
            <h3 className="font-semibold text-sm">실시간 배틀</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              턴제로 근거를 주고받으며 상대의 HP를 깎는 실시간 토론 대결
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center space-y-2">
            <div className="text-2xl">🏆</div>
            <h3 className="font-semibold text-sm">AI 판정</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI가 근거의 타당성을 평가하고 승패를 판정합니다
            </p>
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
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 pb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          지금 토론에 참여해보세요
        </h2>
        <p className="text-muted-foreground">
          다양한 주제에 투표하고 의견을 나눠보세요
        </p>
        <Button asChild size="lg">
          <Link href="/" className="inline-flex items-center gap-2">
            토론 참여하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
