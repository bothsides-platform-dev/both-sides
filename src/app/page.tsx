"use client";

import { FeaturedSection } from "@/components/topics/FeaturedSection";
import { RecommendedSection } from "@/components/topics/RecommendedSection";
import { CommunitySection } from "@/components/topics/CommunitySection";
import { TrendingTopics, TrendingTopicsCollapsible } from "@/components/TrendingTopics";

export default function HomePage() {
  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-500">A</span> vs{" "}
            <span className="text-red-500">B</span>, 당신의 선택은?
          </h1>
          <p className="text-muted-foreground">
            양자택일 토론에 참여하고 의견을 나눠보세요
          </p>
        </div>

        {/* Mobile: Collapsible Trending Topics */}
        <div className="lg:hidden">
          <TrendingTopicsCollapsible />
        </div>

        {/* Section 1: Featured Topics */}
        <FeaturedSection />

        {/* Section 2: Recommended Topics */}
        <RecommendedSection />

        {/* Section 3: Community Topics */}
        <CommunitySection />
      </div>

      {/* Desktop Sidebar: Trending Topics */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-6">
          <TrendingTopics limit={10} />
        </div>
      </aside>
    </div>
  );
}
