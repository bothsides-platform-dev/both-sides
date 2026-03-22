import { NextRequest, NextResponse } from "next/server";
import type { CommunityTrendingPost } from "@/types/community-trending";

const GITHUB_RAW_URL = 
  "https://raw.githubusercontent.com/bothsides-platform-dev/issue-auto-collector/main/data/latest.json";

interface CollectionResult {
  collectedAt: string;
  results: {
    site: string;
    posts: CommunityTrendingPost[];
  }[];
  totalPosts: number;
}

export async function GET(request: NextRequest) {
  try {
    const headers: HeadersInit = {
      "Accept": "application/json",
    };

    // Add GitHub token if available (for private repos)
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers["Authorization"] = `token ${githubToken}`;
    }

    const response = await fetch(GITHUB_RAW_URL, {
      headers,
      next: { revalidate: 1800 }, // 30 minutes ISR cache
    });

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch community trending posts" },
        { status: response.status }
      );
    }

    const data: CollectionResult = await response.json();

    // Flatten all posts from all sites
    const allPosts: CommunityTrendingPost[] = [];
    for (const result of data.results) {
      allPosts.push(...result.posts);
    }

    // Sort by engagement (likeCount > viewCount > commentCount)
    allPosts.sort((a, b) => {
      const scoreA = (a.likeCount || 0) * 10 + (a.viewCount || 0) / 100 + (a.commentCount || 0);
      const scoreB = (b.likeCount || 0) * 10 + (b.viewCount || 0) / 100 + (b.commentCount || 0);
      return scoreB - scoreA;
    });

    // Return top 30 posts
    const topPosts = allPosts.slice(0, 30);

    return NextResponse.json({
      data: {
        posts: topPosts,
        collectedAt: data.collectedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching community trending posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
