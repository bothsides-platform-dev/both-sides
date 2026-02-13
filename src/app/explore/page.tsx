import type { Metadata } from "next";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";

export const metadata: Metadata = {
  title: "탐색 - 카테고리별 토론",
  description: "관심 있는 카테고리를 선택하고 다양한 토론에 참여해보세요.",
};

export default function ExplorePage() {
  return <ExplorePageClient />;
}
