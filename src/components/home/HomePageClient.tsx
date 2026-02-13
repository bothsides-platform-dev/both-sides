"use client";

import { TrendingTicker } from "@/components/TrendingTicker";
import { FeaturedSection } from "@/components/topics/FeaturedSection";
import { RecommendedSection } from "@/components/topics/RecommendedSection";
import { CommunitySection } from "@/components/topics/CommunitySection";

export function HomePageClient() {
  return (
    <>
      {/* Trending Ticker - Header style, main page only */}
      <div className="-mx-4 md:-mx-8 lg:-mx-6 -mt-4 md:-mt-6">
        <TrendingTicker />
      </div>

      <div className="space-y-6 md:space-y-10 mt-6 max-w-5xl mx-auto">
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
