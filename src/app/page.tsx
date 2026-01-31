import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "BothSides - 양자택일 토론 플랫폼 | A vs B 당신의 선택은?",
  description:
    "사회 이슈, 정치, 일상 논쟁에 대한 양자택일 토론. 투표하고 의견을 나눠보세요. 가장 뜨거운 토론 주제들이 모여있는 곳.",
  keywords: ["토론", "양자택일", "찬반", "투표", "의견", "사회이슈", "BothSides"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BothSides - 양자택일 토론 플랫폼",
    description:
      "A vs B, 당신의 선택은? 사회 이슈부터 일상 논쟁까지, 양자택일 토론에 참여하세요.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
