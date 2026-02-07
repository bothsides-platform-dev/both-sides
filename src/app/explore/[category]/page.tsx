import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CATEGORY_META, CATEGORY_SLUG_MAP, CATEGORY_TO_SLUG } from "@/lib/constants";
import { CategoryTopicList } from "@/components/explore/CategoryTopicList";
import type { Category } from "@prisma/client";

interface PageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_SLUG_MAP).map((slug) => ({
    category: slug,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const categoryEnum = CATEGORY_SLUG_MAP[params.category];
  if (!categoryEnum) return {};

  const meta = CATEGORY_META[categoryEnum];
  return {
    title: `${meta.label} - 카테고리별 토론`,
    description: meta.description,
  };
}

export default function CategoryPage({ params }: PageProps) {
  const categoryEnum = CATEGORY_SLUG_MAP[params.category] as Category | undefined;

  if (!categoryEnum) {
    notFound();
  }

  const meta = CATEGORY_META[categoryEnum];
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        전체 카테고리
      </Link>

      {/* Hero banner */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${meta.gradient} p-6 text-white`}>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{meta.label}</h1>
            <p className="text-white/80 mt-1">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Topic list */}
      <CategoryTopicList category={categoryEnum} />
    </div>
  );
}
