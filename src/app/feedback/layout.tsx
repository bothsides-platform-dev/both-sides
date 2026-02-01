import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "의견 보내기 | BothSides",
  description: "버그 신고, 기능 제안, 문의 등 의견을 남겨주세요",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
