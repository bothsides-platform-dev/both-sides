"use client";

import Link from "next/link";
import type { CategoryMeta } from "@/lib/constants";

interface CategoryCardProps {
  slug: string;
  meta: CategoryMeta;
}

export function CategoryCard({ slug, meta }: CategoryCardProps) {
  const Icon = meta.icon;

  return (
    <Link
      href={`/explore/${slug}`}
      className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className={`h-2 bg-gradient-to-r ${meta.gradient}`} />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.bgColor}`}>
            <Icon className={`h-5 w-5 ${meta.color}`} />
          </div>
          <h3 className="font-semibold text-lg">{meta.label}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {meta.description}
        </p>
      </div>
    </Link>
  );
}
