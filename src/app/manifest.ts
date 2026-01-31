import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BothSides - 양자택일 토론 플랫폼",
    short_name: "BothSides",
    description: "A vs B, 당신의 선택은? 양자택일 토론 플랫폼에서 의견을 나눠보세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F5",
    theme_color: "#3B82F6",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    lang: "ko",
    categories: ["social", "news", "entertainment"],
  };
}
