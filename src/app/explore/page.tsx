import type { Metadata } from "next";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { CATEGORY_LABELS, CATEGORY_SLUG_MAP } from "@/lib/constants";

interface ExplorePageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const { category: categorySlug } = await searchParams;

  if (categorySlug && categorySlug in CATEGORY_SLUG_MAP) {
    const categoryKey = CATEGORY_SLUG_MAP[categorySlug];
    const categoryLabel = CATEGORY_LABELS[categoryKey];
    return {
      title: `${categoryLabel} 토론 | 탐색`,
      description: `${categoryLabel} 카테고리의 양자택일 토론을 탐색하고 참여해보세요.`,
    };
  }

  return {
    title: "탐색 - 카테고리별 토론",
    description: "관심 있는 카테고리를 선택하고 다양한 토론에 참여해보세요.",
  };
}

export default function ExplorePage() {
  return <ExplorePageClient />;
}
