"use client";

import { TrendingTicker } from "@/components/TrendingTicker";
import { FeaturedSection } from "@/components/topics/FeaturedSection";
import { CommunitySection } from "@/components/topics/CommunitySection";

export function HomePageClient() {
  return (
    <>
      {/* Trending Ticker - Header style, main page only */}
      <div className="-mx-4 sm:-mx-6 -mt-4 md:-mt-6">
        <TrendingTicker />
      </div>

      <div className="space-y-6 md:space-y-10 mt-6 max-w-5xl mx-auto">
        {/* Section 1: Featured Topics */}
        <FeaturedSection />

        {/* Section 2: Community Topics */}
        <CommunitySection />
      </div>
    </>
  );
}
