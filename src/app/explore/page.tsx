import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";

export const metadata: Metadata = {
  title: "탐색 - 카테고리별 토론",
  description: "관심 있는 카테고리를 선택하고 다양한 토론에 참여해보세요.",
};

export default function ExplorePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">탐색</h1>
        </div>
        <p className="text-muted-foreground">
          관심 있는 카테고리를 선택하고 다양한 토론에 참여해보세요.
        </p>
      </div>
      <ExplorePageClient />
    </div>
  );
}
