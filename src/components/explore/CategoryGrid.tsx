"use client";

import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "@prisma/client";

const categories = Object.keys(CATEGORY_META) as Category[];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category}
          slug={CATEGORY_TO_SLUG[category]}
          meta={CATEGORY_META[category]}
        />
      ))}
    </div>
  );
}
