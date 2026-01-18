import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";
  const sitemapUrl = new URL("/sitemap.xml", siteUrl);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/profile/", "/api/", "/topics/new"],
      },
    ],
    sitemap: sitemapUrl.toString(),
  };
}


