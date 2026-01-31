"use client";

import { TrendingTicker } from "@/components/TrendingTicker";
import { FeaturedSection } from "@/components/topics/FeaturedSection";
import { RecommendedSection } from "@/components/topics/RecommendedSection";
import { CommunitySection } from "@/components/topics/CommunitySection";

export function HomePageClient() {
  return (
    <>
      {/* Trending Ticker - Header style, main page only */}
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -mt-6">
        <TrendingTicker />
      </div>

      <div className="space-y-10 mt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-500">A</span> vs{" "}
            <span className="text-red-500">B</span>, 당신의 선택은?
          </h1>
          <p className="text-muted-foreground">
            양자택일 토론에 참여하고 의견을 나눠보세요
          </p>
        </div>

        {/* Section 1: Featured Topics */}
        <FeaturedSection />

        {/* Section 2: Recommended Topics */}
        <RecommendedSection />

        {/* Section 3: Community Topics */}
        <CommunitySection />
      </div>
    </>
  );
}
